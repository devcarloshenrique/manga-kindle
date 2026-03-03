/**
 * Naming Helper - Utilities for standardizing manga/chapter names
 * 
 * Provides consistent naming conventions across download and conversion:
 * - Download: <manga>_cap_<number>
 * - Converted: /converted/<manga>/<manga>_cap_<number>.<format>
 */

import path from 'path';

// ============================================
// Types
// ============================================

export interface ParsedMangaChapter {
  manga: string;
  chapter: string;
  chapterNumber: number;
  raw: string;
}

export interface NormalizeOptions {
  /** Replace spaces with this character (default: '-') */
  spacer?: string;
  /** Convert to lowercase (default: true) */
  lowercase?: boolean;
  /** Maximum length (default: 100) */
  maxLength?: number;
}

// ============================================
// Constants
// ============================================

/** Characters invalid in filenames across Windows/Mac/Linux */
const INVALID_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1F]/g;

/** Common chapter prefixes to detect */
const CHAPTER_PREFIXES = [
  'capitulo',
  'capitulo_',
  'cap_',
  'cap',
  'chapter',
  'chapter_',
  'ch_',
  'ch',
  'c_',
  'c',
  '#',
];

/** Regex patterns to extract chapter number */
const CHAPTER_PATTERNS = [
  // Pattern: manga_cap_001 or manga_capitulo_001
  /^(.+?)[-_]?(?:cap[iítulo]*|chapter|ch)[-_]?(\d+(?:\.\d+)?)/i,
  // Pattern: manga - 001 or manga 001
  /^(.+?)[-\s]+(\d+(?:\.\d+)?)$/,
  // Pattern: folder named like "Capitulo_001" (extract from path)
  /(?:cap[iítulo]*|chapter|ch)[-_\s]*(\d+(?:\.\d+)?)/i,
  // Pattern: just numbers at the end
  /^(.+?)[-_\s]*(\d+(?:\.\d+)?)$/,
];

// ============================================
// Core Functions
// ============================================

/**
 * Normalize a name for filesystem use
 * 
 * @param name - Original name
 * @param options - Normalization options
 * @returns Filesystem-safe name
 * 
 * @example
 * normalizeName("One Piece!") // "one-piece"
 * normalizeName("Jujutsu Kaisen #203") // "jujutsu-kaisen-203"
 */
export function normalizeName(name: string, options: NormalizeOptions = {}): string {
  const {
    spacer = '-',
    lowercase = true,
    maxLength = 100,
  } = options;

  let normalized = name
    // Remove invalid filesystem characters
    .replace(INVALID_CHARS_REGEX, '')
    // Replace multiple spaces/underscores with single spacer
    .replace(/[\s_]+/g, spacer)
    // Replace multiple dashes with single dash
    .replace(/-+/g, '-')
    // Remove leading/trailing spacers
    .replace(new RegExp(`^${escapeRegex(spacer)}+|${escapeRegex(spacer)}+$`, 'g'), '')
    // Trim
    .trim();

  if (lowercase) {
    normalized = normalized.toLowerCase();
  }

  // Truncate if too long (preserve extension if present)
  if (normalized.length > maxLength) {
    const ext = path.extname(normalized);
    const base = normalized.slice(0, maxLength - ext.length);
    normalized = base + ext;
  }

  return normalized;
}

/**
 * Parse manga name and chapter from a file/folder name
 * 
 * @param name - File or folder name (with or without path)
 * @returns Parsed manga and chapter info, or null if unparseable
 * 
 * @example
 * parseMangaAndChapter("one-piece_cap_001") 
 * // { manga: "one-piece", chapter: "001", chapterNumber: 1, raw: "one-piece_cap_001" }
 * 
 * parseMangaAndChapter("Vagabond/Capitulo_0325")
 * // { manga: "vagabond", chapter: "0325", chapterNumber: 325, raw: "Capitulo_0325" }
 */
export function parseMangaAndChapter(name: string): ParsedMangaChapter | null {
  // Get just the filename/foldername
  const baseName = path.basename(name, path.extname(name));
  const parentDir = path.dirname(name);
  const parentName = parentDir !== '.' ? path.basename(parentDir) : null;

  // Try each pattern
  for (const pattern of CHAPTER_PATTERNS) {
    const match = baseName.match(pattern);
    if (match) {
      let manga = match[1]?.trim() || '';
      const chapter = match[2]?.trim() || '';
      
      if (chapter) {
        // If manga name is empty or looks like a chapter prefix, use parent folder
        if (!manga || CHAPTER_PREFIXES.some(p => manga.toLowerCase().startsWith(p))) {
          if (parentName) {
            manga = parentName;
          }
        }
        
        const chapterNumber = parseFloat(chapter);
        
        if (manga && !isNaN(chapterNumber)) {
          return {
            manga: normalizeName(manga),
            chapter: chapter,
            chapterNumber,
            raw: baseName,
          };
        }
      }
    }
  }

  // If no chapter pattern found, try to extract from parent folder
  if (parentName) {
    // Check if baseName itself is just a chapter number
    const chapterMatch = baseName.match(/^(?:cap[iítulo]*|chapter|ch)?[-_\s]*(\d+(?:\.\d+)?)/i);
    if (chapterMatch) {
      const chapter = chapterMatch[1];
      const chapterNumber = parseFloat(chapter);
      
      return {
        manga: normalizeName(parentName),
        chapter,
        chapterNumber,
        raw: baseName,
      };
    }
  }

  return null;
}

/**
 * Format a chapter number with consistent padding
 * 
 * @param chapterNumber - Chapter number (can be decimal for .5 chapters)
 * @param padding - Minimum digits (default: 3)
 * @returns Padded chapter string
 * 
 * @example
 * formatChapterNumber(1) // "001"
 * formatChapterNumber(100) // "100"
 * formatChapterNumber(1.5) // "001.5"
 */
export function formatChapterNumber(chapterNumber: number, padding: number = 3): string {
  const intPart = Math.floor(chapterNumber);
  const decPart = chapterNumber - intPart;
  
  const paddedInt = intPart.toString().padStart(padding, '0');
  
  if (decPart > 0) {
    // Handle decimal chapters like 1.5
    const decStr = decPart.toFixed(1).slice(1); // ".5"
    return paddedInt + decStr;
  }
  
  return paddedInt;
}

/**
 * Build a standardized chapter folder/file name
 * 
 * @param manga - Manga name (will be normalized)
 * @param chapterNumber - Chapter number
 * @param extension - File extension (optional, without dot)
 * @returns Standardized name
 * 
 * @example
 * buildChapterName("One Piece", 1) // "one-piece_cap_001"
 * buildChapterName("One Piece", 1, "epub") // "one-piece_cap_001.epub"
 */
export function buildChapterName(manga: string, chapterNumber: number, extension?: string): string {
  const normalizedManga = normalizeName(manga);
  const paddedChapter = formatChapterNumber(chapterNumber);
  
  let name = `${normalizedManga}_cap_${paddedChapter}`;
  
  if (extension) {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    name += ext.toLowerCase();
  }
  
  return name;
}

/**
 * Build the output path for a converted file
 * 
 * @param basePath - Base converted directory (e.g., "converted")
 * @param manga - Manga name
 * @param chapterNumber - Chapter number
 * @param format - Output format (EPUB, MOBI, CBZ, KFX)
 * @returns Full output path
 * 
 * @example
 * buildOutputPath("converted", "One Piece", 1, "EPUB")
 * // "converted/one-piece/one-piece_cap_001.epub"
 */
export function buildOutputPath(
  basePath: string,
  manga: string,
  chapterNumber: number,
  format: string
): string {
  const normalizedManga = normalizeName(manga);
  const fileName = buildChapterName(manga, chapterNumber, format.toLowerCase());
  
  return path.join(basePath, normalizedManga, fileName);
}

/**
 * Build output path for a volume (multiple chapters merged)
 * 
 * @param basePath - Base converted directory
 * @param manga - Manga name
 * @param volumeNumber - Volume number
 * @param startChapter - First chapter in volume
 * @param endChapter - Last chapter in volume
 * @param format - Output format
 * @returns Full output path
 * 
 * @example
 * buildVolumeOutputPath("converted", "One Piece", 1, 1, 10, "EPUB")
 * // "converted/one-piece/one-piece_vol_001_cap_001-010.epub"
 */
export function buildVolumeOutputPath(
  basePath: string,
  manga: string,
  volumeNumber: number,
  startChapter: number,
  endChapter: number,
  format: string
): string {
  const normalizedManga = normalizeName(manga);
  const volNum = volumeNumber.toString().padStart(2, '0');
  const startCh = formatChapterNumber(startChapter);
  const endCh = formatChapterNumber(endChapter);
  const ext = format.toLowerCase();
  
  const fileName = `${normalizedManga}_vol_${volNum}_cap_${startCh}-${endCh}.${ext}`;
  
  return path.join(basePath, normalizedManga, fileName);
}

/**
 * Extract manga slug from a file path
 * 
 * @param filePath - Path to file or folder in downloads/converted
 * @returns Manga slug or null
 * 
 * @example
 * extractMangaSlug("downloads/one-piece/Capitulo_001")
 * // "one-piece"
 */
export function extractMangaSlug(filePath: string): string | null {
  const parts = filePath.split(/[/\\]/);
  
  // Look for common root folders
  const rootIndex = parts.findIndex(p => 
    p === 'downloads' || p === 'converted'
  );
  
  if (rootIndex !== -1 && parts[rootIndex + 1]) {
    return normalizeName(parts[rootIndex + 1]);
  }
  
  // Fallback: try to parse from the path
  const parsed = parseMangaAndChapter(filePath);
  return parsed?.manga || null;
}

/**
 * Rename a chapter folder to the standardized format
 * 
 * @param currentName - Current folder/file name
 * @param manga - Manga name (if known, otherwise will be parsed)
 * @returns New standardized name, or null if can't parse
 * 
 * @example
 * getStandardizedName("Capitulo_001", "Vagabond")
 * // "vagabond_cap_001"
 */
export function getStandardizedName(currentName: string, manga?: string): string | null {
  const parsed = parseMangaAndChapter(currentName);
  
  if (!parsed && !manga) {
    return null;
  }
  
  const mangaName = manga || parsed?.manga;
  const chapterNum = parsed?.chapterNumber;
  
  if (!mangaName || chapterNum === undefined) {
    return null;
  }
  
  return buildChapterName(mangaName, chapterNum);
}

// ============================================
// Utility Functions
// ============================================

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a name follows the standardized format
 * 
 * @param name - Name to check
 * @returns True if already standardized
 */
export function isStandardizedName(name: string): boolean {
  return /^[a-z0-9-]+_cap_\d{3,}(?:\.\d)?(?:\.[a-z]+)?$/i.test(name);
}

/**
 * Get file info from a converted file name
 * 
 * @param fileName - Converted file name
 * @returns Parsed info or null
 */
export function parseConvertedFileName(fileName: string): {
  manga: string;
  chapter?: string;
  volume?: string;
  format: string;
} | null {
  const ext = path.extname(fileName).slice(1).toUpperCase();
  const base = path.basename(fileName, path.extname(fileName));
  
  // Volume pattern: manga_vol_01_cap_001-010
  const volMatch = base.match(/^(.+?)_vol_(\d+)_cap_(\d+)-(\d+)$/);
  if (volMatch) {
    return {
      manga: volMatch[1],
      volume: volMatch[2],
      chapter: `${volMatch[3]}-${volMatch[4]}`,
      format: ext,
    };
  }
  
  // Single chapter pattern: manga_cap_001
  const capMatch = base.match(/^(.+?)_cap_(\d+(?:\.\d)?)$/);
  if (capMatch) {
    return {
      manga: capMatch[1],
      chapter: capMatch[2],
      format: ext,
    };
  }
  
  return null;
}
