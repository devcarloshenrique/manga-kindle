import { type Request, type Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import {
  KCC_PROFILES,
  KCC_OUTPUT_FORMATS,
  KCC_PROFILE_INFO,
  type KccProfile,
  type KccOutputFormat,
} from '../../domain/entities/kcc.js';
import {
  createConversionJob,
  getJob,
  listJobs,
  getJobProgress,
  cancelJob,
  removeJob,
} from '../../application/features/kcc/kcc.queue.js';
import {
  listConvertedFiles,
  getConvertedFile,
  getConvertedFilePath,
} from '../../application/features/kcc/kcc.library.js';
import {
  getMangaChapterPaths,
  getMangaDetails,
} from '../../application/features/library/library.service.js';
import {
  createResponse,
  createErrorResponse,
  createPaginationMeta,
} from '../types/response.js';
// New imports for naming helpers
import {
  parseMangaAndChapter,
  buildChapterName,
  buildOutputPath,
  normalizeName,
  formatChapterNumber,
  organizeMangaFolder,
  organizeDownloadsFolder,
  organizeConvertedFolder,
  getKccFlagsDocumentation,
} from '../../application/features/kcc/helpers/index.js';
import {
  KCC_PRESETS,
  PRESET_NAMES,
  type PresetName,
  getMergedOptions,
  formatFileSize,
} from '../../application/features/kcc/dto/kcc-options.dto.js';

// ========================================
// KCC Options Documentation
// ========================================

/**
 * Complete documentation of all KCC conversion options
 */
export const KCC_OPTIONS_DOCS = {
  mangaStyle: {
    description: 'Enable manga reading mode (right-to-left page order)',
    type: 'boolean',
    default: false,
    cliFlag: '-m, --manga-style',
    example: true,
  },
  hq: {
    description: 'Enable high quality mode with better image processing',
    type: 'boolean',
    default: false,
    cliFlag: '--hq',
    example: true,
  },
  twoPanel: {
    description: 'Enable two-panel mode for landscape tablet reading',
    type: 'boolean',
    default: false,
    cliFlag: '--two-panel',
    example: false,
  },
  webtoon: {
    description: 'Enable webtoon mode for vertical strip comics (splits tall images)',
    type: 'boolean',
    default: false,
    cliFlag: '-w, --webtoon',
    example: false,
  },
  upscale: {
    description: 'Upscale images to fit device resolution',
    type: 'boolean',
    default: false,
    cliFlag: '-u, --upscale',
    example: false,
  },
  stretch: {
    description: 'Stretch images to fill the screen (may distort aspect ratio)',
    type: 'boolean',
    default: false,
    cliFlag: '-s, --stretch',
    example: false,
  },
  splitter: {
    description: 'Split double-page spreads into two separate pages',
    type: 'boolean',
    default: false,
    cliFlag: '--splitter',
    example: true,
  },
  gamma: {
    description: 'Gamma correction value (0.0-5.0, 1.0 = no change)',
    type: 'number',
    default: 1.0,
    min: 0,
    max: 5,
    cliFlag: '-g, --gamma VALUE',
    example: 1.2,
  },
  cropping: {
    description: 'Enable automatic cropping of white margins',
    type: 'boolean',
    default: false,
    cliFlag: '-c, --cropping',
    example: true,
  },
  croppingPower: {
    description: 'Cropping aggressiveness (1-100, higher = more aggressive)',
    type: 'number',
    default: 1,
    min: 1,
    max: 100,
    cliFlag: '--cropping-power VALUE',
    example: 10,
  },
  interPanelCrop: {
    description: 'Crop whitespace between panels in webtoon mode',
    type: 'boolean',
    default: false,
    cliFlag: '--inter-panel-crop',
    example: false,
  },
  forceColor: {
    description: 'Force color output even for grayscale images',
    type: 'boolean',
    default: false,
    cliFlag: '--forcecolor',
    example: false,
  },
  forcePng: {
    description: 'Force PNG output format for images (larger files, no compression artifacts)',
    type: 'boolean',
    default: false,
    cliFlag: '--forcepng',
    example: false,
  },
  mozJpeg: {
    description: 'Use MozJPEG encoder for better JPEG compression',
    type: 'boolean',
    default: false,
    cliFlag: '--mozjpeg',
    example: true,
  },
  jpegQuality: {
    description: 'JPEG compression quality (0-100, higher = better quality, larger files)',
    type: 'number',
    default: 85,
    min: 0,
    max: 100,
    cliFlag: '-q, --quality VALUE',
    example: 90,
  },
  deleteSource: {
    description: 'Delete source files after successful conversion (DANGEROUS)',
    type: 'boolean',
    default: false,
    cliFlag: '-d, --delete',
    example: false,
  },
  title: {
    description: 'Set the book title in metadata',
    type: 'string',
    default: null,
    cliFlag: '-t, --title VALUE',
    example: 'One Piece Vol. 1',
  },
  author: {
    description: 'Set the book author in metadata',
    type: 'string',
    default: null,
    cliFlag: '-a, --author VALUE',
    example: 'Eiichiro Oda',
  },
  batchSplit: {
    description: 'Split batch conversion into separate output files',
    type: 'boolean',
    default: false,
    cliFlag: '--batchsplit',
    example: false,
  },
  fileFusion: {
    description: 'Merge multiple input files into a single output (for volumes)',
    type: 'boolean',
    default: false,
    cliFlag: '--filefusion',
    example: true,
  },
  targetSize: {
    description: 'Target output file size in MB (used with fileFusion)',
    type: 'number',
    default: null,
    min: 1,
    max: 2000,
    cliFlag: '--targetsize VALUE',
    example: 200,
  },
  customWidth: {
    description: 'Custom output width in pixels (overrides profile)',
    type: 'number',
    default: null,
    min: 1,
    max: 10000,
    cliFlag: '--customwidth VALUE',
    example: 1264,
  },
  customHeight: {
    description: 'Custom output height in pixels (overrides profile)',
    type: 'number',
    default: null,
    min: 1,
    max: 10000,
    cliFlag: '--customheight VALUE',
    example: 1680,
  },
};

/**
 * Profile resolutions and supported formats
 */
export const KCC_PROFILE_DETAILS: Record<KccProfile, { 
  resolution: string; 
  device: string;
  formats: string[];
}> = {
  K1: { resolution: '600x800', device: 'Kindle 1st Generation', formats: ['MOBI'] },
  K2: { resolution: '600x800', device: 'Kindle 2nd Generation', formats: ['MOBI'] },
  K11: { resolution: '1072x1448', device: 'Kindle 11th Generation (2022)', formats: ['EPUB', 'MOBI', 'KFX'] },
  K34: { resolution: '600x800', device: 'Kindle 3/4/Touch', formats: ['MOBI'] },
  K57: { resolution: '600x800', device: 'Kindle 5/6/7', formats: ['MOBI'] },
  K810: { resolution: '600x800', device: 'Kindle 8/9/10', formats: ['EPUB', 'MOBI', 'KFX'] },
  KDX: { resolution: '824x1200', device: 'Kindle DX', formats: ['MOBI'] },
  KPW: { resolution: '758x1024', device: 'Kindle Paperwhite 1/2', formats: ['MOBI'] },
  KV: { resolution: '1072x1448', device: 'Kindle Voyage', formats: ['EPUB', 'MOBI', 'KFX'] },
  KPW34: { resolution: '1072x1448', device: 'Kindle Paperwhite 3/4', formats: ['EPUB', 'MOBI', 'KFX'] },
  KPW5: { resolution: '1236x1648', device: 'Kindle Paperwhite 5 (2021+)', formats: ['EPUB', 'MOBI', 'KFX'] },
  KO: { resolution: '1072x1448', device: 'Kindle Oasis 1', formats: ['EPUB', 'MOBI', 'KFX'] },
  KCS: { resolution: '1860x2480', device: 'Kindle Scribe', formats: ['EPUB', 'MOBI', 'KFX'] },
  KS1860: { resolution: '1200x1920', device: 'Kindle Fire HD 1860', formats: ['EPUB', 'MOBI', 'CBZ'] },
  KS1920: { resolution: '1200x1920', device: 'Kindle Fire HD 1920', formats: ['EPUB', 'MOBI', 'CBZ'] },
  KS: { resolution: '1860x2480', device: 'Kindle Scribe', formats: ['EPUB', 'MOBI', 'KFX'] },
  KS3: { resolution: '1860x2480', device: 'Kindle Scribe 3', formats: ['EPUB', 'MOBI', 'KFX'] },
  KSCS: { resolution: '1264x1680', device: 'Kindle Colorsoft', formats: ['EPUB', 'MOBI', 'KFX'] },
  KoMT: { resolution: '600x800', device: 'Kobo Mini/Touch', formats: ['EPUB', 'CBZ'] },
  KoG: { resolution: '758x1024', device: 'Kobo Glo', formats: ['EPUB', 'CBZ'] },
  KoGHD: { resolution: '1072x1448', device: 'Kobo Glo HD', formats: ['EPUB', 'CBZ'] },
  KoA: { resolution: '758x1024', device: 'Kobo Aura', formats: ['EPUB', 'CBZ'] },
  KoAHD: { resolution: '1080x1440', device: 'Kobo Aura HD', formats: ['EPUB', 'CBZ'] },
  KoAH2O: { resolution: '1080x1430', device: 'Kobo Aura H2O', formats: ['EPUB', 'CBZ'] },
  KoAO: { resolution: '1404x1872', device: 'Kobo Aura ONE', formats: ['EPUB', 'CBZ'] },
  KoN: { resolution: '758x1024', device: 'Kobo Nia', formats: ['EPUB', 'CBZ'] },
  KoC: { resolution: '1072x1448', device: 'Kobo Clara HD', formats: ['EPUB', 'CBZ'] },
  KoCC: { resolution: '1264x1680', device: 'Kobo Clara Colour', formats: ['EPUB', 'CBZ'] },
  KoL: { resolution: '1264x1680', device: 'Kobo Libra H2O/2', formats: ['EPUB', 'CBZ'] },
  KoLC: { resolution: '1264x1680', device: 'Kobo Libra Colour', formats: ['EPUB', 'CBZ'] },
  KoF: { resolution: '1440x1920', device: 'Kobo Forma', formats: ['EPUB', 'CBZ'] },
  KoS: { resolution: '1440x1920', device: 'Kobo Sage', formats: ['EPUB', 'CBZ'] },
  KoE: { resolution: '1404x1872', device: 'Kobo Elipsa', formats: ['EPUB', 'CBZ'] },
  Rmk1: { resolution: '1404x1872', device: 'reMarkable 1', formats: ['EPUB', 'PDF'] },
  Rmk2: { resolution: '1404x1872', device: 'reMarkable 2', formats: ['EPUB', 'PDF'] },
  RmkPP: { resolution: '1620x2160', device: 'reMarkable Paper Pro', formats: ['EPUB', 'PDF'] },
  RmkPPMove: { resolution: '1620x2160', device: 'reMarkable Paper Pro Move', formats: ['EPUB', 'PDF'] },
  OTHER: { resolution: 'custom', device: 'Custom/Other', formats: ['EPUB', 'MOBI', 'CBZ', 'KFX', 'PDF'] },
};

// ========================================
// Validation Schemas
// ========================================

const conversionOptionsSchema = z.object({
  mangaStyle: z.boolean().optional().describe('Enable manga reading mode (right-to-left)'),
  hq: z.boolean().optional().describe('Enable high quality mode'),
  twoPanel: z.boolean().optional().describe('Two-panel mode for tablets'),
  webtoon: z.boolean().optional().describe('Webtoon mode (vertical strip)'),
  upscale: z.boolean().optional().describe('Upscale images to fit device'),
  stretch: z.boolean().optional().describe('Stretch images to fill screen'),
  splitter: z.boolean().optional().describe('Split double-page spreads'),
  gamma: z.number().min(0).max(5).optional().describe('Gamma correction (0-5)'),
  cropping: z.boolean().optional().describe('Enable automatic cropping'),
  croppingPower: z.number().min(1).max(100).optional().describe('Cropping power (1-100)'),
  interPanelCrop: z.boolean().optional().describe('Crop between panels'),
  forceColor: z.boolean().optional().describe('Force color output'),
  forcePng: z.boolean().optional().describe('Force PNG output'),
  mozJpeg: z.boolean().optional().describe('Use MozJPEG encoder'),
  jpegQuality: z.number().min(0).max(100).optional().describe('JPEG quality (0-100)'),
  deleteSource: z.boolean().optional().describe('Delete source files after conversion'),
  title: z.string().max(200).optional().describe('Book title'),
  author: z.string().max(200).optional().describe('Book author'),
  batchSplit: z.boolean().optional().describe('Split batch into separate files'),
  fileFusion: z.boolean().optional().describe('Merge files into single output'),
  targetSize: z.number().min(1).max(2000).optional().describe('Target size in MB'),
  customWidth: z.number().min(1).max(10000).optional().describe('Custom width in pixels'),
  customHeight: z.number().min(1).max(10000).optional().describe('Custom height in pixels'),
}).strict();

const conversionRequestSchema = z.object({
  chapters: z.array(z.string().min(1)).min(1).max(100)
    .describe('Array of chapter paths relative to downloads folder'),
  mergeIntoSingleVolume: z.boolean().optional().default(false)
    .describe('Merge all chapters into a single output file'),
  outputFormat: z.enum(KCC_OUTPUT_FORMATS as readonly [string, ...string[]])
    .describe('Output format: EPUB, MOBI, CBZ, or KFX'),
  profile: z.enum(KCC_PROFILES as readonly [string, ...string[]])
    .describe('Target device profile'),
  preset: z.enum(PRESET_NAMES).optional()
    .describe('Use a preset: default, manga, webtoon, highQuality, noProcessing, comic'),
  options: conversionOptionsSchema.optional()
    .describe('Additional conversion options (merged with preset if provided)'),
}).strict();

const mangaConversionRequestSchema = z.object({
  mangaSlug: z.string().min(1).max(200)
    .describe('Manga folder name (slug) from the library'),
  mergeIntoVolumes: z.boolean().optional().default(false)
    .describe('Merge chapters into volumes'),
  chaptersPerVolume: z.number().int().min(1).max(100).optional().default(10)
    .describe('Number of chapters per volume (when mergeIntoVolumes is true)'),
  singleVolume: z.boolean().optional().default(false)
    .describe('Merge ALL chapters into a single volume (overrides chaptersPerVolume)'),
  outputFormat: z.enum(KCC_OUTPUT_FORMATS as readonly [string, ...string[]])
    .describe('Output format: EPUB, MOBI, CBZ, or KFX'),
  profile: z.enum(KCC_PROFILES as readonly [string, ...string[]])
    .describe('Target device profile'),
  preset: z.enum(PRESET_NAMES).optional()
    .describe('Use a preset: default, manga, webtoon, highQuality, noProcessing, comic'),
  options: conversionOptionsSchema.optional()
    .describe('Additional conversion options'),
  startChapter: z.number().int().min(1).optional()
    .describe('Start from this chapter number (1-indexed)'),
  endChapter: z.number().int().min(1).optional()
    .describe('End at this chapter number (inclusive)'),
}).strict();

const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']).optional(),
});

// ========================================
// Profiles
// ========================================

/**
 * GET /api/kcc/profiles
 * List all available device profiles with detailed information
 */
export async function getProfiles(req: Request, res: Response): Promise<void> {
  const profiles = KCC_PROFILES.map((profile) => ({
    id: profile,
    ...KCC_PROFILE_INFO[profile],
    ...KCC_PROFILE_DETAILS[profile],
  }));

  res.json(createResponse(profiles, { total: profiles.length }));
}

/**
 * GET /api/kcc/options
 * Get documentation for all conversion options
 */
export async function getOptionsDoc(req: Request, res: Response): Promise<void> {
  const cliFlags = getKccFlagsDocumentation();
  res.json(createResponse({
    options: KCC_OPTIONS_DOCS,
    cliFlags,
  }));
}

/**
 * GET /api/kcc/presets
 * Get all available conversion presets
 */
export async function getPresets(req: Request, res: Response): Promise<void> {
  const presets = Object.entries(KCC_PRESETS).map(([name, options]) => ({
    name,
    description: getPresetDescription(name as PresetName),
    options,
  }));

  res.json(createResponse(presets, { total: presets.length }));
}

function getPresetDescription(preset: PresetName): string {
  const descriptions: Record<PresetName, string> = {
    default: 'Default settings with minimal processing',
    manga: 'Optimized for Japanese manga (RTL reading, grayscale, spread splitting)',
    webtoon: 'Optimized for Korean webtoons (vertical scroll, color, strip merging)',
    highQuality: 'Maximum quality output (8-bit color, PNG, high DPI)',
    noProcessing: 'No image processing, just packaging',
    comic: 'Optimized for Western comics (LTR, color, panel view)',
  };
  return descriptions[preset];
}

// ========================================
// Folder Organization
// ========================================

/**
 * POST /api/kcc/organize/downloads
 * Organize all manga folders in downloads directory
 */
export async function organizeDownloads(req: Request, res: Response): Promise<void> {
  try {
    const downloadsDir = path.resolve(process.cwd(), 'downloads');
    
    // Check if downloads folder exists
    try {
      await fs.access(downloadsDir);
    } catch {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Downloads folder not found'));
      return;
    }

    const results = await organizeDownloadsFolder(downloadsDir);
    
    // Convert Map to object for JSON response
    const mangaResults: Record<string, unknown> = {};
    let totalRenamed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [manga, result] of results) {
      mangaResults[manga] = {
        success: result.success,
        totalProcessed: result.totalProcessed,
        renamed: result.renamed.length,
        skipped: result.skipped.length,
        errors: result.errors.length,
      };
      totalRenamed += result.renamed.length;
      totalSkipped += result.skipped.length;
      totalErrors += result.errors.length;
    }

    res.json(createResponse({
      message: 'Downloads folder organized',
      summary: {
        mangasProcessed: results.size,
        totalRenamed,
        totalSkipped,
        totalErrors,
      },
      details: mangaResults,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('ORGANIZE_ERROR', 'Failed to organize downloads', message));
  }
}

/**
 * POST /api/kcc/organize/downloads/:slug
 * Organize a specific manga folder
 */
export async function organizeManga(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  
  try {
    const mangaPath = path.resolve(process.cwd(), 'downloads', slug);
    
    // Check if manga folder exists
    try {
      await fs.access(mangaPath);
    } catch {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Manga folder not found: ${slug}`));
      return;
    }

    const result = await organizeMangaFolder(mangaPath);

    res.json(createResponse({
      message: `Manga "${slug}" organized`,
      success: result.success,
      totalProcessed: result.totalProcessed,
      renamed: result.renamed.map(r => ({
        from: path.basename(r.oldPath),
        to: path.basename(r.newPath),
        chapter: r.chapter,
      })),
      skipped: result.skipped.map(s => path.basename(s)),
      errors: result.errors.map(e => ({
        path: path.basename(e.oldPath),
        error: e.error,
      })),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('ORGANIZE_ERROR', 'Failed to organize manga', message));
  }
}

/**
 * POST /api/kcc/organize/converted
 * Organize converted files into manga subfolders
 */
export async function organizeConverted(req: Request, res: Response): Promise<void> {
  try {
    const convertedDir = path.resolve(process.cwd(), 'converted');
    
    // Check if converted folder exists
    try {
      await fs.access(convertedDir);
    } catch {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Converted folder not found'));
      return;
    }

    const result = await organizeConvertedFolder(convertedDir);

    res.json(createResponse({
      message: 'Converted folder organized',
      success: result.success,
      totalProcessed: result.totalProcessed,
      renamed: result.renamed.map(r => ({
        from: path.basename(r.oldPath),
        to: r.newPath.replace(convertedDir, ''),
        manga: r.manga,
        chapter: r.chapter,
      })),
      skipped: result.skipped.length,
      errors: result.errors.map(e => ({
        file: path.basename(e.oldPath),
        error: e.error,
      })),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('ORGANIZE_ERROR', 'Failed to organize converted folder', message));
  }
}

/**
 * GET /api/kcc/parse/:name
 * Parse a file/folder name to extract manga and chapter info
 */
export async function parseNameEndpoint(req: Request, res: Response): Promise<void> {
  const { name } = req.params;
  
  const parsed = parseMangaAndChapter(decodeURIComponent(name));
  
  if (!parsed) {
    res.status(400).json(createErrorResponse(
      'PARSE_ERROR', 
      'Could not parse manga/chapter from name',
      { input: name }
    ));
    return;
  }

  const standardizedName = buildChapterName(parsed.manga, parsed.chapterNumber);
  const outputExample = buildOutputPath('converted', parsed.manga, parsed.chapterNumber, 'epub');

  res.json(createResponse({
    input: name,
    parsed: {
      manga: parsed.manga,
      chapter: parsed.chapter,
      chapterNumber: parsed.chapterNumber,
      raw: parsed.raw,
    },
    standardized: {
      folderName: standardizedName,
      downloadPath: `downloads/${parsed.manga}/${standardizedName}`,
      convertedPath: outputExample,
    },
  }));
}

// ========================================
// Conversion Jobs
// ========================================

/**
 * POST /api/kcc/convert
 * Create a new conversion job for specific chapters
 */
export async function createConversion(req: Request, res: Response): Promise<void> {
  const result = conversionRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_REQUEST',
      'Invalid request body',
      result.error.flatten()
    ));
    return;
  }

  try {
    const jobId = await createConversionJob({
      chapters: result.data.chapters,
      mergeIntoSingleVolume: result.data.mergeIntoSingleVolume,
      outputFormat: result.data.outputFormat as KccOutputFormat,
      profile: result.data.profile as KccProfile,
      options: result.data.options,
    });

    res.status(202).json(createResponse({
      jobId,
      message: 'Conversion job queued',
      statusUrl: `/api/kcc/jobs/${jobId}`,
      progressUrl: `/api/kcc/jobs/${jobId}/progress`,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json(createErrorResponse('CONVERSION_ERROR', 'Failed to create conversion job', message));
  }
}

/**
 * POST /api/kcc/convert/manga
 * Convert an entire manga with automatic volume generation
 */
export async function createMangaConversion(req: Request, res: Response): Promise<void> {
  const result = mangaConversionRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_REQUEST',
      'Invalid request body',
      result.error.flatten()
    ));
    return;
  }

  try {
    const { 
      mangaSlug, 
      mergeIntoVolumes, 
      chaptersPerVolume = 10,
      singleVolume,
      outputFormat, 
      profile, 
      options,
      startChapter,
      endChapter,
    } = result.data;

    // Get manga details
    const manga = await getMangaDetails(mangaSlug);
    if (!manga) {
      res.status(404).json(createErrorResponse('NOT_FOUND', `Manga not found: ${mangaSlug}`));
      return;
    }

    // Get all chapter paths
    let chapterPaths = await getMangaChapterPaths(mangaSlug);
    
    // Filter chapters by range if specified
    if (startChapter || endChapter) {
      const start = (startChapter || 1) - 1;
      const end = endChapter || chapterPaths.length;
      chapterPaths = chapterPaths.slice(start, end);
    }

    if (chapterPaths.length === 0) {
      res.status(400).json(createErrorResponse('NO_CHAPTERS', 'No chapters found for this manga'));
      return;
    }

    const jobIds: string[] = [];
    let totalVolumes = 0;

    if (singleVolume) {
      // Single volume with all chapters
      const jobId = await createConversionJob({
        chapters: chapterPaths,
        mergeIntoSingleVolume: true,
        outputFormat: outputFormat as KccOutputFormat,
        profile: profile as KccProfile,
        options: {
          ...options,
          title: options?.title || `${manga.info.title} - Complete`,
          author: options?.author || manga.info.author,
          fileFusion: true,
        },
      });
      jobIds.push(jobId);
      totalVolumes = 1;
    } else if (mergeIntoVolumes) {
      // Split into volumes
      for (let i = 0; i < chapterPaths.length; i += chaptersPerVolume) {
        const volumeChapters = chapterPaths.slice(i, i + chaptersPerVolume);
        const volumeNum = Math.floor(i / chaptersPerVolume) + 1;
        
        const jobId = await createConversionJob({
          chapters: volumeChapters,
          mergeIntoSingleVolume: true,
          outputFormat: outputFormat as KccOutputFormat,
          profile: profile as KccProfile,
          options: {
            ...options,
            title: options?.title || `${manga.info.title} - Vol. ${volumeNum}`,
            author: options?.author || manga.info.author,
            fileFusion: true,
          },
        });
        jobIds.push(jobId);
        totalVolumes++;
      }
    } else {
      // Individual chapters
      for (const chapterPath of chapterPaths) {
        const jobId = await createConversionJob({
          chapters: [chapterPath],
          mergeIntoSingleVolume: false,
          outputFormat: outputFormat as KccOutputFormat,
          profile: profile as KccProfile,
          options: {
            ...options,
            author: options?.author || manga.info.author,
          },
        });
        jobIds.push(jobId);
      }
    }

    res.status(202).json(createResponse({
      message: 'Manga conversion jobs queued',
      mangaSlug,
      mangaTitle: manga.info.title,
      totalChapters: chapterPaths.length,
      totalVolumes: totalVolumes || chapterPaths.length,
      totalJobs: jobIds.length,
      jobIds,
      mode: singleVolume ? 'single_volume' : mergeIntoVolumes ? 'volumes' : 'chapters',
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json(createErrorResponse('CONVERSION_ERROR', 'Failed to create manga conversion', message));
  }
}

/**
 * GET /api/kcc/jobs
 * List all conversion jobs with pagination and filtering
 */
export async function getJobs(req: Request, res: Response): Promise<void> {
  const queryResult = listJobsQuerySchema.safeParse(req.query);
  
  if (!queryResult.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_QUERY',
      'Invalid query parameters',
      queryResult.error.flatten()
    ));
    return;
  }

  const { page, limit, status } = queryResult.data;

  try {
    let jobs = await listJobs();
    
    // Filter by status
    if (status) {
      jobs = jobs.filter(j => j.status === status);
    }
    
    const total = jobs.length;
    
    // Paginate
    const start = (page - 1) * limit;
    const paginatedJobs = jobs.slice(start, start + limit);

    res.json(createResponse(
      paginatedJobs.map((job) => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        profile: job.profile,
        outputFormat: job.outputFormat,
        inputPaths: job.inputPaths,
        outputPath: job.outputPath,
        error: job.error,
        // Enhanced fields
        duration: job.startedAt && job.finishedAt 
          ? Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)
          : null,
        eta: job.status === 'processing' && job.progress > 0
          ? Math.round((100 - job.progress) * (Date.now() - new Date(job.startedAt!).getTime()) / job.progress / 1000)
          : null,
      })),
      createPaginationMeta(page, limit, total)
    ));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('LIST_ERROR', 'Failed to list jobs', message));
  }
}

/**
 * GET /api/kcc/jobs/:id
 * Get detailed job information
 */
export async function getJobDetails(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const job = await getJob(id);

    if (!job) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Job not found'));
      return;
    }

    // Calculate duration and ETA
    const duration = job.startedAt && job.finishedAt 
      ? Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)
      : job.startedAt
        ? Math.round((Date.now() - new Date(job.startedAt).getTime()) / 1000)
        : null;
    
    const eta = job.status === 'processing' && job.progress > 0 && job.startedAt
      ? Math.round((100 - job.progress) * (Date.now() - new Date(job.startedAt).getTime()) / job.progress / 1000)
      : null;

    res.json(createResponse({
      ...job,
      duration,
      eta,
      currentStep: job.status === 'processing' 
        ? job.progress < 10 ? 'Initializing' 
          : job.progress < 50 ? 'Processing images' 
          : job.progress < 90 ? 'Generating output' 
          : 'Finalizing'
        : null,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('GET_ERROR', 'Failed to get job details', message));
  }
}

/**
 * GET /api/kcc/jobs/:id/progress
 * Get job progress with ETA
 */
export async function getJobProgressEndpoint(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const job = await getJob(id);

    if (!job) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Job not found'));
      return;
    }

    const eta = job.status === 'processing' && job.progress > 0 && job.startedAt
      ? Math.round((100 - job.progress) * (Date.now() - new Date(job.startedAt).getTime()) / job.progress / 1000)
      : null;

    res.json(createResponse({
      jobId: id,
      status: job.status,
      progress: job.progress,
      eta,
      currentStep: job.status === 'processing' 
        ? job.progress < 10 ? 'Initializing' 
          : job.progress < 50 ? 'Processing images' 
          : job.progress < 90 ? 'Generating output' 
          : 'Finalizing'
        : null,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('GET_ERROR', 'Failed to get job progress', message));
  }
}

/**
 * POST /api/kcc/jobs/:id/cancel
 * Cancel a job
 */
export async function cancelJobEndpoint(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const cancelled = await cancelJob(id);

    if (!cancelled) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Job not found or already completed'));
      return;
    }

    res.json(createResponse({
      message: 'Job cancelled',
      jobId: id,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('CANCEL_ERROR', 'Failed to cancel job', message));
  }
}

/**
 * DELETE /api/kcc/jobs/:id
 * Remove a job from history
 */
export async function removeJobEndpoint(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    await removeJob(id);

    res.json(createResponse({
      message: 'Job removed',
      jobId: id,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('REMOVE_ERROR', 'Failed to remove job', message));
  }
}

// ========================================
// Converted Library
// ========================================

/**
 * GET /api/kcc/converted
 * List all converted files
 */
export async function getConvertedFiles(req: Request, res: Response): Promise<void> {
  try {
    const files = await listConvertedFiles();

    res.json(createResponse(
      files.map((file) => ({
        name: file.name,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        format: file.format,
        createdAt: file.createdAt,
        downloadUrl: `/api/kcc/converted/${encodeURIComponent(file.name)}/download`,
      })),
      { total: files.length }
    ));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('LIST_ERROR', 'Failed to list converted files', message));
  }
}

/**
 * GET /api/kcc/converted/:name
 * Get details of a converted file
 */
export async function getConvertedFileDetails(req: Request, res: Response): Promise<void> {
  const { name } = req.params;

  try {
    const file = await getConvertedFile(name);

    if (!file) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'File not found'));
      return;
    }

    res.json(createResponse({
      name: file.name,
      size: file.size,
      sizeFormatted: file.sizeFormatted,
      format: file.format,
      createdAt: file.createdAt,
      downloadUrl: `/api/kcc/converted/${encodeURIComponent(file.name)}/download`,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('GET_ERROR', 'Failed to get file details', message));
  }
}

/**
 * GET /api/kcc/converted/:name/download
 * Download a converted file
 */
export async function downloadConvertedFile(req: Request, res: Response): Promise<void> {
  const { name } = req.params;

  try {
    const filePath = await getConvertedFilePath(name);

    if (!filePath) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'File not found'));
      return;
    }

    res.download(filePath, name, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json(createErrorResponse('DOWNLOAD_ERROR', 'Failed to download file', err.message));
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('DOWNLOAD_ERROR', 'Failed to download file', message));
  }
}
