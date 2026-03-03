/**
 * KCC Helpers Index
 * 
 * Export all helper functions and types for KCC conversion
 */

// Naming helpers
export {
  normalizeName,
  parseMangaAndChapter,
  formatChapterNumber,
  buildChapterName,
  buildOutputPath,
  buildVolumeOutputPath,
  extractMangaSlug,
  getStandardizedName,
  isStandardizedName,
  parseConvertedFileName,
  type ParsedMangaChapter,
  type NormalizeOptions,
} from './naming.helper.js';

// Folder organization
export {
  scanMangaChapters,
  renameChapterFolder,
  renameMangaFolder,
  organizeMangaFolder,
  organizeDownloadsFolder,
  ensureConvertedMangaFolder,
  getConversionOutputPath,
  moveConvertedFile,
  organizeConvertedFolder,
  type RenameResult,
  type OrganizeResult,
  type ChapterInfo,
} from './folder-organizer.service.js';

// Command builder
export {
  buildKccArgs,
  buildKccCommand,
  buildSimpleKccCommand,
  getKccFlagsDocumentation,
  type KccCommandConfig,
  type KccCommand,
} from './command-builder.helper.js';
