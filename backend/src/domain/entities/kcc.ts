/**
 * KCC Device Profiles
 * List of all supported Kindle/Kobo device profiles
 */
export const KCC_PROFILES = [
  'K1',
  'K2',
  'K11',
  'K34',
  'K57',
  'K810',
  'KDX',
  'KPW',
  'KV',
  'KPW34',
  'KPW5',
  'KO',
  'KCS',
  'KS1860',
  'KS1920',
  'KS',
  'KS3',
  'KSCS',
  'KoMT',
  'KoG',
  'KoGHD',
  'KoA',
  'KoAHD',
  'KoAH2O',
  'KoAO',
  'KoN',
  'KoC',
  'KoCC',
  'KoL',
  'KoLC',
  'KoF',
  'KoS',
  'KoE',
  'Rmk1',
  'Rmk2',
  'RmkPP',
  'RmkPPMove',
  'OTHER',
] as const;

export type KccProfile = (typeof KCC_PROFILES)[number];

/**
 * Output formats supported by KCC
 */
export const KCC_OUTPUT_FORMATS = ['EPUB', 'MOBI', 'CBZ', 'KFX'] as const;
export type KccOutputFormat = (typeof KCC_OUTPUT_FORMATS)[number];

/**
 * Profile descriptions for display
 */
export const KCC_PROFILE_INFO: Record<KccProfile, { name: string; description: string }> = {
  K1: { name: 'Kindle 1', description: 'Kindle 1st Generation' },
  K2: { name: 'Kindle 2', description: 'Kindle 2nd Generation' },
  K11: { name: 'Kindle 11', description: 'Kindle 11th Generation' },
  K34: { name: 'Kindle 3/4', description: 'Kindle 3rd/4th Generation' },
  K57: { name: 'Kindle 5-7', description: 'Kindle 5th-7th Generation' },
  K810: { name: 'Kindle 8-10', description: 'Kindle 8th-10th Generation' },
  KDX: { name: 'Kindle DX', description: 'Kindle DX' },
  KPW: { name: 'Kindle Paperwhite', description: 'Kindle Paperwhite 1/2' },
  KV: { name: 'Kindle Voyage', description: 'Kindle Voyage' },
  KPW34: { name: 'Kindle Paperwhite 3/4', description: 'Kindle Paperwhite 3rd/4th Gen' },
  KPW5: { name: 'Kindle Paperwhite 5', description: 'Kindle Paperwhite 5th Gen (2021+)' },
  KO: { name: 'Kindle Oasis', description: 'Kindle Oasis 1st Gen' },
  KCS: { name: 'Kindle Scribe', description: 'Kindle Scribe' },
  KS1860: { name: 'Kindle 1860', description: 'Kindle Fire HD 1860' },
  KS1920: { name: 'Kindle 1920', description: 'Kindle Fire HD 1920' },
  KS: { name: 'Kindle Scribe', description: 'Kindle Scribe' },
  KS3: { name: 'Kindle Scribe 3', description: 'Kindle Scribe 3rd Gen' },
  KSCS: { name: 'Kindle Colorsoft', description: 'Kindle Colorsoft' },
  KoMT: { name: 'Kobo Mini/Touch', description: 'Kobo Mini/Touch' },
  KoG: { name: 'Kobo Glo', description: 'Kobo Glo' },
  KoGHD: { name: 'Kobo Glo HD', description: 'Kobo Glo HD' },
  KoA: { name: 'Kobo Aura', description: 'Kobo Aura' },
  KoAHD: { name: 'Kobo Aura HD', description: 'Kobo Aura HD' },
  KoAH2O: { name: 'Kobo Aura H2O', description: 'Kobo Aura H2O' },
  KoAO: { name: 'Kobo Aura ONE', description: 'Kobo Aura ONE' },
  KoN: { name: 'Kobo Nia', description: 'Kobo Nia' },
  KoC: { name: 'Kobo Clara', description: 'Kobo Clara HD' },
  KoCC: { name: 'Kobo Clara Colour', description: 'Kobo Clara Colour' },
  KoL: { name: 'Kobo Libra', description: 'Kobo Libra H2O/2' },
  KoLC: { name: 'Kobo Libra Colour', description: 'Kobo Libra Colour' },
  KoF: { name: 'Kobo Forma', description: 'Kobo Forma' },
  KoS: { name: 'Kobo Sage', description: 'Kobo Sage' },
  KoE: { name: 'Kobo Elipsa', description: 'Kobo Elipsa' },
  Rmk1: { name: 'reMarkable 1', description: 'reMarkable 1st Gen' },
  Rmk2: { name: 'reMarkable 2', description: 'reMarkable 2nd Gen' },
  RmkPP: { name: 'reMarkable Paper Pro', description: 'reMarkable Paper Pro' },
  RmkPPMove: { name: 'reMarkable PP Move', description: 'reMarkable Paper Pro Move' },
  OTHER: { name: 'Other', description: 'Custom dimensions' },
};

/**
 * KCC Job Status
 */
export type KccJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * KCC Conversion Options
 */
export interface KccConversionOptions {
  /** Use manga reading mode (right-to-left) */
  mangaStyle?: boolean;
  /** High quality mode */
  hq?: boolean;
  /** Two panel mode for tablets */
  twoPanel?: boolean;
  /** Webtoon mode (vertical strip) */
  webtoon?: boolean;
  /** Upscale images */
  upscale?: boolean;
  /** Stretch images to fit */
  stretch?: boolean;
  /** Split double-page spreads */
  splitter?: boolean;
  /** Gamma correction value */
  gamma?: number;
  /** Enable cropping */
  cropping?: boolean;
  /** Cropping power (1-100) */
  croppingPower?: number;
  /** Crop between panels */
  interPanelCrop?: boolean;
  /** Force color output */
  forceColor?: boolean;
  /** Force PNG output */
  forcePng?: boolean;
  /** Use MozJPEG encoder */
  mozJpeg?: boolean;
  /** JPEG quality (0-100) */
  jpegQuality?: number;
  /** Delete source files after conversion */
  deleteSource?: boolean;
  /** Output format */
  format?: KccOutputFormat;
  /** Book title */
  title?: string;
  /** Book author */
  author?: string;
  /** Batch split mode */
  batchSplit?: boolean;
  /** Merge files into single volume */
  fileFusion?: boolean;
  /** Target size in MB (for file fusion) */
  targetSize?: number;
  /** Custom output width */
  customWidth?: number;
  /** Custom output height */
  customHeight?: number;
}

/**
 * KCC Conversion Request
 */
export interface KccConversionRequest {
  /** Input chapter directories */
  chapters: string[];
  /** Merge all chapters into single volume */
  mergeIntoSingleVolume?: boolean;
  /** Output format */
  outputFormat: KccOutputFormat;
  /** Target device profile */
  profile: KccProfile;
  /** Additional options */
  options?: KccConversionOptions;
}

/**
 * KCC Job entity
 */
export interface KccJob {
  id: string;
  status: KccJobStatus;
  progress: number;
  stdout: string;
  stderr: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  inputPaths: string[];
  outputPath?: string;
  profile: KccProfile;
  outputFormat: KccOutputFormat;
  options: KccConversionOptions;
  mergeIntoSingleVolume: boolean;
  error?: string;
}

/**
 * Converted file info
 */
export interface ConvertedFile {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  format: string;
  createdAt: Date;
}
