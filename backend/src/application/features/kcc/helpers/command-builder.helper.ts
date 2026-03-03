/**
 * KCC Command Builder
 * 
 * Builds KCC CLI commands from options DTO
 */

import path from 'path';
import {
  type KccOptions,
  type KccOutputFormat,
  type KccProfile,
  type ConversionRequest,
  getMergedOptions,
} from '../dto/kcc-options.dto.js';
import {
  buildOutputPath,
  buildVolumeOutputPath,
  parseMangaAndChapter,
  normalizeName,
} from './naming.helper.js';

// ============================================
// Types
// ============================================

export interface KccCommandConfig {
  /** Path to KCC binary */
  binaryPath: string;
  /** Input paths (chapters) */
  inputPaths: string[];
  /** Output path (will be generated if not provided) */
  outputPath?: string;
  /** Output format */
  format: KccOutputFormat;
  /** Device profile */
  profile: KccProfile;
  /** Conversion options */
  options: KccOptions;
  /** Custom output directory */
  outputDir?: string;
}

export interface KccCommand {
  /** Full command string */
  command: string;
  /** Command arguments array */
  args: string[];
  /** Binary path */
  binary: string;
  /** Expected output path */
  expectedOutputPath: string;
  /** Manga name */
  manga: string;
  /** Chapter(s) */
  chapters: string[];
}

// ============================================
// Constants
// ============================================

/** Map format to KCC flag */
const FORMAT_FLAGS: Record<KccOutputFormat, string> = {
  EPUB: 'EPUB',
  MOBI: 'MOBI',
  CBZ: 'CBZ',
  KFX: 'KFX',
  PDF: 'PDF',
};

/** Map quality mode to flag */
const QUALITY_FLAGS = {
  normal: [],
  hq: ['--hq'],
  'hq+': ['--hq', '--forcecolor'],
};

/** Map cropping mode to flag value */
const CROPPING_FLAGS = {
  disabled: '0',
  margins: '1',
  'margins+page': '2',
};

/** Map splitter mode to flags */
const SPLITTER_FLAGS = {
  disabled: [],
  rotate: ['--rotate'],
  split: ['--splitter'],
};

/** Map panel view to flags */
const PANEL_VIEW_FLAGS = {
  disabled: [],
  '2-panel': ['--two-panel'],
  '4-panel': ['--four-panel'],
};

/** Map color mode to flags */
const COLOR_MODE_FLAGS = {
  auto: [],
  color: ['--forcecolor'],
  grayscale: ['--forcegray'],
};

/** Map image format to flags */
const IMAGE_FORMAT_FLAGS = {
  auto: [],
  jpeg: [],
  png: ['--forcepng'],
  mozjpeg: ['--mozjpeg'],
  webp: ['--webp'],
};

// ============================================
// Main Functions
// ============================================

/**
 * Build KCC CLI arguments from options
 */
export function buildKccArgs(config: KccCommandConfig): string[] {
  const { inputPaths, format, profile, options, outputPath } = config;
  
  const args: string[] = [];
  
  // Profile
  args.push('-p', profile);
  
  // Output format
  args.push('-f', FORMAT_FLAGS[format]);
  
  // Output path
  if (outputPath) {
    args.push('-o', outputPath);
  }
  
  // === Reading Mode ===
  if (options.mangaStyle) {
    args.push('-m', '--manga-style');
  }
  
  if (options.webtoonMode) {
    args.push('--webtoon');
  }
  
  // === Image Processing ===
  args.push(...QUALITY_FLAGS[options.qualityMode]);
  
  if (options.gamma !== undefined) {
    args.push('-g', options.gamma.toString());
  }
  
  if (options.upscale) {
    args.push('-u', '--upscale');
  }
  
  if (options.stretch) {
    args.push('--stretch');
  }
  
  if (options.noProcessing) {
    args.push('--noprocessing');
  }
  
  // === Color ===
  args.push(...COLOR_MODE_FLAGS[options.colorMode]);
  
  // === Cropping ===
  args.push('-c', CROPPING_FLAGS[options.croppingMode]);
  
  if (options.cropMargin !== undefined) {
    args.push('--croppingpower', options.cropMargin.toString());
  }
  
  // === Double Pages ===
  args.push(...SPLITTER_FLAGS[options.splitterMode]);
  
  if (options.noSplitDoubleSpreads) {
    args.push('--nosplitrotate');
  }
  
  // === Panel View ===
  args.push(...PANEL_VIEW_FLAGS[options.panelView]);
  
  // === Output Options ===
  args.push(...IMAGE_FORMAT_FLAGS[options.imageFormat]);
  
  if (options.jpegQuality !== 85) {
    args.push('--quality', options.jpegQuality.toString());
  }
  
  if (options.batchSplit === 'size' && options.maxSizeMB) {
    args.push('--batchsplit', options.maxSizeMB.toString());
  }
  
  if (options.maximizeStrips) {
    args.push('--maximizestrips');
  }
  
  // === Margins ===
  if (options.blackMargins) {
    args.push('--blackborders');
  }
  
  if (options.borderColor) {
    args.push('--bgcolor', options.borderColor);
  }
  
  // === Metadata ===
  if (options.title) {
    args.push('-t', options.title);
  }
  
  if (options.author) {
    args.push('-a', options.author);
  }
  
  // === Advanced ===
  if (options.noProgressBar) {
    args.push('--noprogress');
  }
  
  if (options.customDpi) {
    args.push('--customwidth', options.customDpi.toString());
  }
  
  // Input paths (at the end)
  args.push(...inputPaths);
  
  return args;
}

/**
 * Build complete KCC command configuration
 */
export function buildKccCommand(
  binaryPath: string,
  request: ConversionRequest,
  downloadsDir: string,
  convertedDir: string
): KccCommand {
  // Get merged options
  const options = getMergedOptions(request.preset, request.options);
  
  // Parse manga and chapters info
  let manga = '';
  const chapters: string[] = [];
  const inputPaths: string[] = [];
  
  for (const chapter of request.chapters) {
    const fullPath = path.join(downloadsDir, chapter);
    inputPaths.push(fullPath);
    
    const parsed = parseMangaAndChapter(chapter);
    if (parsed) {
      if (!manga) manga = parsed.manga;
      chapters.push(parsed.chapter);
    }
  }
  
  // Fallback manga name from first path
  if (!manga && request.chapters[0]) {
    const parts = request.chapters[0].split(/[/\\]/);
    manga = normalizeName(parts[0] || 'unknown');
  }
  
  // Build output path
  let expectedOutputPath: string;
  
  if (request.customOutputName) {
    expectedOutputPath = path.join(
      convertedDir,
      manga,
      `${normalizeName(request.customOutputName)}.${request.outputFormat.toLowerCase()}`
    );
  } else if (request.mergeIntoSingleVolume || request.chapters.length > 1) {
    // Volume output
    const chapterNumbers = chapters.map(c => parseFloat(c)).filter(n => !isNaN(n));
    const startChapter = Math.min(...chapterNumbers);
    const endChapter = Math.max(...chapterNumbers);
    const volumeNum = 1;
    
    expectedOutputPath = buildVolumeOutputPath(
      convertedDir,
      manga,
      volumeNum,
      startChapter,
      endChapter,
      request.outputFormat
    );
  } else {
    // Single chapter output
    const chapterNum = parseFloat(chapters[0] || '1');
    expectedOutputPath = buildOutputPath(
      convertedDir,
      manga,
      chapterNum,
      request.outputFormat
    );
  }
  
  // Build command config
  const config: KccCommandConfig = {
    binaryPath,
    inputPaths,
    outputPath: path.dirname(expectedOutputPath), // KCC uses -o for output directory
    format: request.outputFormat,
    profile: request.profile,
    options,
  };
  
  const args = buildKccArgs(config);
  
  return {
    command: `"${binaryPath}" ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`,
    args,
    binary: binaryPath,
    expectedOutputPath,
    manga,
    chapters,
  };
}

/**
 * Build KCC command for a single chapter with defaults
 */
export function buildSimpleKccCommand(
  binaryPath: string,
  chapterPath: string,
  outputDir: string,
  format: KccOutputFormat,
  profile: KccProfile,
  options?: Partial<KccOptions>
): KccCommand {
  const request: ConversionRequest = {
    chapters: [chapterPath],
    outputFormat: format,
    profile: profile,
    options: options,
    mergeIntoSingleVolume: false,
  };
  
  const parentDir = path.dirname(chapterPath);
  const downloadsDir = parentDir.includes('downloads') 
    ? path.resolve(chapterPath, '..', '..') 
    : path.dirname(parentDir);
  
  return buildKccCommand(binaryPath, request, downloadsDir, outputDir);
}

/**
 * Get documentation for all CLI flags
 */
export function getKccFlagsDocumentation(): Record<string, { flag: string; description: string }> {
  return {
    mangaStyle: { flag: '-m, --manga-style', description: 'Manga reading mode (right-to-left page order)' },
    webtoonMode: { flag: '--webtoon', description: 'Webtoon mode for vertical scroll comics' },
    qualityMode: { flag: '--hq', description: 'High quality mode (4-bit for hq, 8-bit for hq+)' },
    gamma: { flag: '-g, --gamma', description: 'Apply gamma correction (0.1-5.0)' },
    upscale: { flag: '-u, --upscale', description: 'Upscale images smaller than device resolution' },
    stretch: { flag: '--stretch', description: 'Stretch images to fill screen' },
    noProcessing: { flag: '--noprocessing', description: 'Skip all image processing' },
    colorMode: { flag: '--forcecolor / --forcegray', description: 'Force color or grayscale output' },
    croppingMode: { flag: '-c, --cropping', description: 'Auto-cropping: 0=off, 1=margins, 2=margins+page' },
    cropMargin: { flag: '--croppingpower', description: 'Cropping power percentage' },
    splitterMode: { flag: '--splitter / --rotate', description: 'Handle double-page spreads' },
    noSplitDoubleSpreads: { flag: '--nosplitrotate', description: 'Keep double spreads intact' },
    panelView: { flag: '--two-panel / --four-panel', description: 'Panel view for larger screens' },
    imageFormat: { flag: '--forcepng / --mozjpeg / --webp', description: 'Output image format' },
    jpegQuality: { flag: '--quality', description: 'JPEG quality (1-100)' },
    batchSplit: { flag: '--batchsplit', description: 'Split output by size (MB)' },
    maximizeStrips: { flag: '--maximizestrips', description: 'Optimize strip layout' },
    blackMargins: { flag: '--blackborders', description: 'Use black borders instead of white' },
    borderColor: { flag: '--bgcolor', description: 'Custom border color (hex)' },
    title: { flag: '-t, --title', description: 'Custom ebook title' },
    author: { flag: '-a, --author', description: 'Custom author name' },
    noProgressBar: { flag: '--noprogress', description: 'Disable progress bar output' },
    customDpi: { flag: '--customwidth', description: 'Custom DPI/resolution' },
  };
}
