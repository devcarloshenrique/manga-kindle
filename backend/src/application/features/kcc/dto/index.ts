/**
 * KCC DTO Index
 * 
 * Export all DTOs and types for KCC conversion
 */

export {
  // Output formats and profiles
  KCC_OUTPUT_FORMATS,
  KCC_PROFILES,
  type KccOutputFormat,
  type KccProfile,
  
  // Option enums
  IMAGE_QUALITY_MODES,
  CROPPING_MODES,
  PANEL_VIEW_MODES,
  COLOR_MODES,
  SPLITTER_MODES,
  IMAGE_OUTPUT_FORMATS,
  BATCH_SPLIT_OPTIONS,
  type ImageQualityMode,
  type CroppingMode,
  type PanelViewMode,
  type ColorMode,
  type SplitterMode,
  type ImageOutputFormat,
  type BatchSplitOption,
  
  // Presets
  PRESET_NAMES,
  KCC_PRESETS,
  type PresetName,
  
  // Schemas
  kccOptionsSchema,
  conversionRequestSchema,
  mangaConversionRequestSchema,
  type KccOptions,
  type ConversionRequest,
  type MangaConversionRequest,
  
  // Response types
  type ConversionResult,
  type BatchConversionResult,
  
  // Helpers
  getMergedOptions,
  formatFileSize,
} from './kcc-options.dto.js';
