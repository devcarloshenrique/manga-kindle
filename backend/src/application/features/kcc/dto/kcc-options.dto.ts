/**
 * KCC Options DTO
 * 
 * Complete options matching KCC GUI capabilities with Zod validation.
 * All options map directly to KCC CLI flags.
 */

import { z } from 'zod';

// ============================================
// Output Formats & Profiles
// ============================================

export const KCC_OUTPUT_FORMATS = ['EPUB', 'MOBI', 'CBZ', 'KFX', 'PDF'] as const;
export type KccOutputFormat = typeof KCC_OUTPUT_FORMATS[number];

export const KCC_PROFILES = [
  // Kindle devices
  'K1', 'K2', 'K34', 'K578', 'KDX', 'KPW', 'KPW5', 'KV', 'KO', 'KS', 'KCC', 'KHD', 'KF',
  // Kobo devices  
  'KoF', 'KoMT', 'KoG', 'KoGHD', 'KoA', 'KoAHD', 'KoAH2O', 'KoAO', 'KoC', 'KoL', 'KoLC', 'KoS', 'KoE',
  // Other devices
  'OTHER', 'RM', 'RM2', 'BNTV250', 'BNTV250HD', 'T4NT', 'T4NTL',
] as const;
export type KccProfile = typeof KCC_PROFILES[number];

// ============================================
// Enums for options
// ============================================

/** Image quality modes */
export const IMAGE_QUALITY_MODES = ['normal', 'hq', 'hq+'] as const;
export type ImageQualityMode = typeof IMAGE_QUALITY_MODES[number];

/** Cropping modes */
export const CROPPING_MODES = ['disabled', 'margins', 'margins+page'] as const;
export type CroppingMode = typeof CROPPING_MODES[number];

/** Panel view modes */
export const PANEL_VIEW_MODES = ['disabled', '2-panel', '4-panel'] as const;
export type PanelViewMode = typeof PANEL_VIEW_MODES[number];

/** Color modes */
export const COLOR_MODES = ['auto', 'color', 'grayscale'] as const;
export type ColorMode = typeof COLOR_MODES[number];

/** Splitter modes */
export const SPLITTER_MODES = ['disabled', 'rotate', 'split'] as const;
export type SplitterMode = typeof SPLITTER_MODES[number];

/** Image output formats */
export const IMAGE_OUTPUT_FORMATS = ['auto', 'jpeg', 'png', 'mozjpeg', 'webp'] as const;
export type ImageOutputFormat = typeof IMAGE_OUTPUT_FORMATS[number];

/** Batch split options */
export const BATCH_SPLIT_OPTIONS = ['none', 'size', 'chapters'] as const;
export type BatchSplitOption = typeof BATCH_SPLIT_OPTIONS[number];

// ============================================
// Presets
// ============================================

export const PRESET_NAMES = ['default', 'manga', 'webtoon', 'highQuality', 'noProcessing', 'comic'] as const;
export type PresetName = typeof PRESET_NAMES[number];

// ============================================
// Zod Schemas
// ============================================

/**
 * Complete KCC conversion options schema with all GUI options
 */
export const kccOptionsSchema = z.object({
  // === Reading Mode ===
  /** Manga mode - right to left reading */
  mangaStyle: z.boolean().default(false).describe('Manga reading mode (right-to-left)'),
  
  /** Webtoon mode - vertical scroll optimized */
  webtoonMode: z.boolean().default(false).describe('Webtoon/vertical scroll mode'),
  
  // === Image Processing ===
  /** Image quality mode */
  qualityMode: z.enum(IMAGE_QUALITY_MODES).default('normal').describe('Image quality: normal, hq (4-bit), hq+ (8-bit)'),
  
  /** Custom gamma correction (0.1 to 5.0) */
  gamma: z.number().min(0.1).max(5.0).optional().describe('Gamma correction value (0.1-5.0)'),
  
  /** Upscale small images to device resolution */
  upscale: z.boolean().default(false).describe('Upscale small images'),
  
  /** Stretch images to fill screen */
  stretch: z.boolean().default(false).describe('Stretch images to fill screen'),
  
  /** Color mode */
  colorMode: z.enum(COLOR_MODES).default('auto').describe('Color handling: auto, color, grayscale'),
  
  /** Disable all image processing */
  noProcessing: z.boolean().default(false).describe('Disable all image processing'),
  
  // === Cropping ===
  /** Cropping mode */
  croppingMode: z.enum(CROPPING_MODES).default('margins').describe('Cropping: disabled, margins, margins+page'),
  
  /** Custom crop margin percentage (0-100) */
  cropMargin: z.number().min(0).max(100).optional().describe('Custom crop margin percentage'),
  
  // === Double Page Handling ===
  /** How to handle double-page spreads */
  splitterMode: z.enum(SPLITTER_MODES).default('disabled').describe('Double spread handling: disabled, rotate, split'),
  
  /** Don't split wide images */
  noSplitDoubleSpreads: z.boolean().default(false).describe('Keep double-page spreads intact'),
  
  // === Panel View ===
  /** Panel view mode for larger devices */
  panelView: z.enum(PANEL_VIEW_MODES).default('disabled').describe('Panel view: disabled, 2-panel, 4-panel'),
  
  // === Output Options ===
  /** Image output format */
  imageFormat: z.enum(IMAGE_OUTPUT_FORMATS).default('auto').describe('Image format in output: auto, jpeg, png, mozjpeg, webp'),
  
  /** JPEG quality (1-100) */
  jpegQuality: z.number().min(1).max(100).default(85).describe('JPEG quality (1-100)'),
  
  /** Batch split mode */
  batchSplit: z.enum(BATCH_SPLIT_OPTIONS).default('none').describe('Split output: none, size, chapters'),
  
  /** Max size per file in MB when batchSplit is size */
  maxSizeMB: z.number().min(1).max(500).optional().describe('Max file size in MB for batch split'),
  
  /** Maximize strips layout (1x4 to 2x2) */
  maximizeStrips: z.boolean().default(false).describe('Optimize strips layout (1x4 → 2x2)'),
  
  // === Margins ===
  /** White/black margin handling */
  blackMargins: z.boolean().default(false).describe('Use black margins instead of white'),
  
  /** Custom border color (hex) */
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().describe('Custom border color (hex: #000000)'),
  
  // === Metadata ===
  /** Custom title for the output */
  title: z.string().optional().describe('Custom title for the ebook'),
  
  /** Custom author name */
  author: z.string().optional().describe('Custom author name'),

  // === Advanced ===
  /** Disable progress bar in output (for cleaner logs) */
  noProgressBar: z.boolean().default(true).describe('Disable progress bar in output'),
  
  /** Custom DPI */
  customDpi: z.number().min(72).max(600).optional().describe('Custom DPI (72-600)'),
}).strict();

export type KccOptions = z.infer<typeof kccOptionsSchema>;

// ============================================
// Preset Definitions
// ============================================

export const KCC_PRESETS: Record<PresetName, Partial<KccOptions>> = {
  default: {
    mangaStyle: false,
    webtoonMode: false,
    qualityMode: 'normal',
    upscale: false,
    stretch: false,
    colorMode: 'auto',
    noProcessing: false,
    croppingMode: 'margins',
    splitterMode: 'disabled',
    panelView: 'disabled',
    imageFormat: 'auto',
    jpegQuality: 85,
    batchSplit: 'none',
    maximizeStrips: false,
    blackMargins: false,
  },
  
  manga: {
    mangaStyle: true,
    webtoonMode: false,
    qualityMode: 'hq',
    upscale: true,
    stretch: false,
    colorMode: 'grayscale',
    noProcessing: false,
    croppingMode: 'margins',
    splitterMode: 'split',
    panelView: 'disabled',
    imageFormat: 'auto',
    jpegQuality: 85,
    batchSplit: 'none',
    maximizeStrips: false,
    blackMargins: false,
  },
  
  webtoon: {
    mangaStyle: false,
    webtoonMode: true,
    qualityMode: 'hq',
    upscale: true,
    stretch: false,
    colorMode: 'color',
    noProcessing: false,
    croppingMode: 'margins+page',
    splitterMode: 'disabled',
    panelView: 'disabled',
    imageFormat: 'auto',
    jpegQuality: 90,
    batchSplit: 'none',
    maximizeStrips: true,
    blackMargins: false,
  },
  
  highQuality: {
    mangaStyle: false,
    webtoonMode: false,
    qualityMode: 'hq+',
    upscale: true,
    stretch: false,
    colorMode: 'color',
    noProcessing: false,
    croppingMode: 'margins',
    splitterMode: 'disabled',
    panelView: 'disabled',
    imageFormat: 'png',
    jpegQuality: 95,
    batchSplit: 'none',
    maximizeStrips: false,
    blackMargins: false,
  },
  
  noProcessing: {
    mangaStyle: false,
    webtoonMode: false,
    qualityMode: 'normal',
    upscale: false,
    stretch: false,
    colorMode: 'auto',
    noProcessing: true,
    croppingMode: 'disabled',
    splitterMode: 'disabled',
    panelView: 'disabled',
    imageFormat: 'auto',
    jpegQuality: 85,
    batchSplit: 'none',
    maximizeStrips: false,
    blackMargins: false,
  },
  
  comic: {
    mangaStyle: false,
    webtoonMode: false,
    qualityMode: 'hq',
    upscale: true,
    stretch: false,
    colorMode: 'color',
    noProcessing: false,
    croppingMode: 'margins',
    splitterMode: 'rotate',
    panelView: '2-panel',
    imageFormat: 'auto',
    jpegQuality: 90,
    batchSplit: 'none',
    maximizeStrips: false,
    blackMargins: false,
  },
};

// ============================================
// Request Schema
// ============================================

/**
 * Full conversion request schema
 */
export const conversionRequestSchema = z.object({
  /** Chapter paths (relative to downloads folder) */
  chapters: z.array(z.string().min(1)).min(1).describe('Chapter paths relative to downloads folder'),
  
  /** Output format */
  outputFormat: z.enum(KCC_OUTPUT_FORMATS).describe('Output format: EPUB, MOBI, CBZ, KFX, PDF'),
  
  /** Target device profile */
  profile: z.enum(KCC_PROFILES).describe('Target device profile'),
  
  /** Use a preset (overrides options) */
  preset: z.enum(PRESET_NAMES).optional().describe('Use a preset: manga, webtoon, highQuality, noProcessing, comic'),
  
  /** Custom options (merged with preset if provided) */
  options: kccOptionsSchema.partial().optional().describe('Custom conversion options'),
  
  /** Merge all chapters into a single volume */
  mergeIntoSingleVolume: z.boolean().default(false).describe('Merge all chapters into one file'),
  
  /** Custom output filename (without extension) */
  customOutputName: z.string().optional().describe('Custom output filename'),
}).strict();

export type ConversionRequest = z.infer<typeof conversionRequestSchema>;

/**
 * Manga-wide conversion request schema
 */
export const mangaConversionRequestSchema = z.object({
  /** Manga slug in library */
  mangaSlug: z.string().min(1).describe('Manga slug/folder name'),
  
  /** Output format */
  outputFormat: z.enum(KCC_OUTPUT_FORMATS).describe('Output format: EPUB, MOBI, CBZ, KFX, PDF'),
  
  /** Target device profile */
  profile: z.enum(KCC_PROFILES).describe('Target device profile'),
  
  /** Use a preset */
  preset: z.enum(PRESET_NAMES).optional().describe('Use a preset'),
  
  /** Custom options */
  options: kccOptionsSchema.partial().optional().describe('Custom conversion options'),
  
  /** Merge chapters into volumes */
  mergeIntoVolumes: z.boolean().default(false).describe('Group chapters into volumes'),
  
  /** Chapters per volume (when mergeIntoVolumes is true) */
  chaptersPerVolume: z.number().min(1).max(100).default(10).describe('Chapters per volume'),
  
  /** Merge ALL chapters into single file */
  singleVolume: z.boolean().default(false).describe('Merge all into one file'),
  
  /** Chapter range filter (optional) */
  chapterRange: z.object({
    start: z.number().min(0).optional(),
    end: z.number().min(0).optional(),
  }).optional().describe('Chapter range to convert'),
}).strict();

export type MangaConversionRequest = z.infer<typeof mangaConversionRequestSchema>;

// ============================================
// Response Schemas
// ============================================

/**
 * Conversion result for a single item
 */
export interface ConversionResult {
  success: boolean;
  manga: string;
  chapter: string;
  inputPath: string;
  outputPath: string;
  fileSize: number;
  fileSizeFormatted: string;
  format: KccOutputFormat;
  profile: KccProfile;
  duration: number;
  error?: string;
}

/**
 * Batch conversion result
 */
export interface BatchConversionResult {
  success: boolean;
  totalChapters: number;
  converted: number;
  failed: number;
  results: ConversionResult[];
  totalDuration: number;
  errors: string[];
}

// ============================================
// Helpers
// ============================================

/**
 * Get merged options from preset and custom options
 */
export function getMergedOptions(
  preset?: PresetName,
  customOptions?: Partial<KccOptions>
): KccOptions {
  const baseOptions = preset ? KCC_PRESETS[preset] : KCC_PRESETS.default;
  const merged = { ...KCC_PRESETS.default, ...baseOptions, ...customOptions };
  return kccOptionsSchema.parse(merged);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
