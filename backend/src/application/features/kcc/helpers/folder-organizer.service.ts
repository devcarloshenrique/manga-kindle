/**
 * Folder Organization Service
 * 
 * Handles renaming and organizing manga chapters in downloads and converted folders
 */

import fs from 'fs/promises';
import path from 'path';
import {
  parseMangaAndChapter,
  buildChapterName,
  buildOutputPath,
  normalizeName,
  isStandardizedName,
  extractMangaSlug,
  type ParsedMangaChapter,
} from './naming.helper.js';

// ============================================
// Types
// ============================================

export interface RenameResult {
  success: boolean;
  oldPath: string;
  newPath: string;
  manga: string;
  chapter: string;
  error?: string;
}

export interface OrganizeResult {
  success: boolean;
  totalProcessed: number;
  renamed: RenameResult[];
  skipped: string[];
  errors: RenameResult[];
}

export interface ChapterInfo {
  path: string;
  manga: string;
  chapter: string;
  chapterNumber: number;
  isStandardized: boolean;
  standardizedName: string;
}

// ============================================
// Download Folder Functions
// ============================================

/**
 * Scan a manga folder and get all chapters with their info
 */
export async function scanMangaChapters(
  mangaPath: string,
  mangaSlug?: string
): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];
  
  try {
    const entries = await fs.readdir(mangaPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'info.json' || entry.name.startsWith('.')) continue;
      
      const chapterPath = path.join(mangaPath, entry.name);
      const manga = mangaSlug || extractMangaSlug(mangaPath) || path.basename(mangaPath);
      
      // Try to parse chapter info
      const parsed = parseMangaAndChapter(path.join(manga, entry.name));
      
      if (parsed) {
        const standardizedName = buildChapterName(manga, parsed.chapterNumber);
        
        chapters.push({
          path: chapterPath,
          manga: normalizeName(manga),
          chapter: parsed.chapter,
          chapterNumber: parsed.chapterNumber,
          isStandardized: isStandardizedName(entry.name),
          standardizedName,
        });
      }
    }
    
    // Sort by chapter number
    chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    
  } catch (error) {
    console.error(`Error scanning manga chapters at ${mangaPath}:`, error);
  }
  
  return chapters;
}

/**
 * Rename a single chapter folder to standardized format
 */
export async function renameChapterFolder(
  chapterPath: string,
  mangaSlug: string
): Promise<RenameResult> {
  const folderName = path.basename(chapterPath);
  const parentDir = path.dirname(chapterPath);
  
  // Parse chapter info
  const parsed = parseMangaAndChapter(path.join(mangaSlug, folderName));
  
  if (!parsed) {
    return {
      success: false,
      oldPath: chapterPath,
      newPath: chapterPath,
      manga: mangaSlug,
      chapter: 'unknown',
      error: 'Could not parse chapter number from folder name',
    };
  }
  
  const newName = buildChapterName(mangaSlug, parsed.chapterNumber);
  const newPath = path.join(parentDir, newName);
  
  // If already correct, skip
  if (folderName === newName) {
    return {
      success: true,
      oldPath: chapterPath,
      newPath: chapterPath,
      manga: mangaSlug,
      chapter: parsed.chapter,
    };
  }
  
  // Check if target already exists
  try {
    await fs.access(newPath);
    return {
      success: false,
      oldPath: chapterPath,
      newPath: newPath,
      manga: mangaSlug,
      chapter: parsed.chapter,
      error: `Target path already exists: ${newPath}`,
    };
  } catch {
    // Target doesn't exist, good to proceed
  }
  
  // Rename
  try {
    await fs.rename(chapterPath, newPath);
    return {
      success: true,
      oldPath: chapterPath,
      newPath: newPath,
      manga: mangaSlug,
      chapter: parsed.chapter,
    };
  } catch (error) {
    return {
      success: false,
      oldPath: chapterPath,
      newPath: newPath,
      manga: mangaSlug,
      chapter: parsed.chapter,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rename the manga folder itself to standardized format
 */
export async function renameMangaFolder(
  mangaPath: string
): Promise<RenameResult> {
  const folderName = path.basename(mangaPath);
  const parentDir = path.dirname(mangaPath);
  
  const normalizedName = normalizeName(folderName);
  const newPath = path.join(parentDir, normalizedName);
  
  // If already correct, skip
  if (folderName === normalizedName) {
    return {
      success: true,
      oldPath: mangaPath,
      newPath: mangaPath,
      manga: normalizedName,
      chapter: 'all',
    };
  }
  
  // Check if target already exists
  try {
    await fs.access(newPath);
    // If it exists but is different, we have a conflict
    if (mangaPath.toLowerCase() !== newPath.toLowerCase()) {
      return {
        success: false,
        oldPath: mangaPath,
        newPath: newPath,
        manga: normalizedName,
        chapter: 'all',
        error: `Target path already exists: ${newPath}`,
      };
    }
  } catch {
    // Target doesn't exist, good to proceed
  }
  
  // Rename
  try {
    await fs.rename(mangaPath, newPath);
    return {
      success: true,
      oldPath: mangaPath,
      newPath: newPath,
      manga: normalizedName,
      chapter: 'all',
    };
  } catch (error) {
    return {
      success: false,
      oldPath: mangaPath,
      newPath: newPath,
      manga: normalizedName,
      chapter: 'all',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Organize all chapters in a manga folder
 */
export async function organizeMangaFolder(
  mangaPath: string
): Promise<OrganizeResult> {
  const result: OrganizeResult = {
    success: true,
    totalProcessed: 0,
    renamed: [],
    skipped: [],
    errors: [],
  };
  
  // First, normalize the manga folder name
  const mangaRename = await renameMangaFolder(mangaPath);
  const activeMangaPath = mangaRename.success ? mangaRename.newPath : mangaPath;
  const mangaSlug = path.basename(activeMangaPath);
  
  if (!mangaRename.success && mangaRename.error) {
    result.errors.push(mangaRename);
  }
  
  // Scan all chapters
  const chapters = await scanMangaChapters(activeMangaPath, mangaSlug);
  result.totalProcessed = chapters.length;
  
  // Process each chapter
  for (const chapter of chapters) {
    if (chapter.isStandardized) {
      result.skipped.push(chapter.path);
      continue;
    }
    
    const renameResult = await renameChapterFolder(chapter.path, mangaSlug);
    
    if (renameResult.success) {
      result.renamed.push(renameResult);
    } else {
      result.errors.push(renameResult);
      result.success = false;
    }
  }
  
  return result;
}

/**
 * Organize all mangas in the downloads folder
 */
export async function organizeDownloadsFolder(
  downloadsPath: string
): Promise<Map<string, OrganizeResult>> {
  const results = new Map<string, OrganizeResult>();
  
  try {
    const entries = await fs.readdir(downloadsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;
      
      const mangaPath = path.join(downloadsPath, entry.name);
      const result = await organizeMangaFolder(mangaPath);
      results.set(entry.name, result);
    }
    
  } catch (error) {
    console.error(`Error organizing downloads folder:`, error);
  }
  
  return results;
}

// ============================================
// Converted Folder Functions
// ============================================

/**
 * Ensure the manga subfolder exists in converted directory
 */
export async function ensureConvertedMangaFolder(
  convertedBasePath: string,
  mangaSlug: string
): Promise<string> {
  const mangaFolder = path.join(convertedBasePath, normalizeName(mangaSlug));
  await fs.mkdir(mangaFolder, { recursive: true });
  return mangaFolder;
}

/**
 * Get the output path for a conversion, creating the folder if needed
 */
export async function getConversionOutputPath(
  convertedBasePath: string,
  manga: string,
  chapterNumber: number,
  format: string
): Promise<string> {
  const mangaSlug = normalizeName(manga);
  await ensureConvertedMangaFolder(convertedBasePath, mangaSlug);
  return buildOutputPath(convertedBasePath, manga, chapterNumber, format);
}

/**
 * Move an existing converted file to the organized structure
 */
export async function moveConvertedFile(
  filePath: string,
  convertedBasePath: string
): Promise<RenameResult> {
  const fileName = path.basename(filePath);
  const parsed = parseMangaAndChapter(fileName);
  
  if (!parsed) {
    return {
      success: false,
      oldPath: filePath,
      newPath: filePath,
      manga: 'unknown',
      chapter: 'unknown',
      error: 'Could not parse manga/chapter from filename',
    };
  }
  
  const ext = path.extname(fileName).slice(1);
  const newPath = buildOutputPath(
    convertedBasePath,
    parsed.manga,
    parsed.chapterNumber,
    ext
  );
  
  // Create manga folder
  await ensureConvertedMangaFolder(convertedBasePath, parsed.manga);
  
  // If already in correct location, skip
  if (path.resolve(filePath) === path.resolve(newPath)) {
    return {
      success: true,
      oldPath: filePath,
      newPath: filePath,
      manga: parsed.manga,
      chapter: parsed.chapter,
    };
  }
  
  try {
    await fs.rename(filePath, newPath);
    return {
      success: true,
      oldPath: filePath,
      newPath: newPath,
      manga: parsed.manga,
      chapter: parsed.chapter,
    };
  } catch (error) {
    return {
      success: false,
      oldPath: filePath,
      newPath: newPath,
      manga: parsed.manga,
      chapter: parsed.chapter,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Organize all files in the converted folder into manga subfolders
 */
export async function organizeConvertedFolder(
  convertedBasePath: string
): Promise<OrganizeResult> {
  const result: OrganizeResult = {
    success: true,
    totalProcessed: 0,
    renamed: [],
    skipped: [],
    errors: [],
  };
  
  try {
    const entries = await fs.readdir(convertedBasePath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip directories (already organized)
      if (entry.isDirectory()) continue;
      
      // Only process ebook files
      const ext = path.extname(entry.name).toLowerCase();
      if (!['.epub', '.mobi', '.cbz', '.kfx', '.pdf'].includes(ext)) continue;
      
      result.totalProcessed++;
      
      const filePath = path.join(convertedBasePath, entry.name);
      const moveResult = await moveConvertedFile(filePath, convertedBasePath);
      
      if (moveResult.success) {
        if (moveResult.oldPath === moveResult.newPath) {
          result.skipped.push(moveResult.oldPath);
        } else {
          result.renamed.push(moveResult);
        }
      } else {
        result.errors.push(moveResult);
        result.success = false;
      }
    }
    
  } catch (error) {
    console.error(`Error organizing converted folder:`, error);
    result.success = false;
  }
  
  return result;
}
