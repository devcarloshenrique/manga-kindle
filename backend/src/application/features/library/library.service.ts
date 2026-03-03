import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const DOWNLOADS_DIR = path.resolve(__dirname, '../../../../downloads');
const CONVERTED_DIR = path.resolve(__dirname, '../../../../converted');

// ========================================
// Types
// ========================================

/**
 * Manga info structure (from info.json)
 */
export interface MangaInfo {
  title: string;
  coverUrl?: string;
  author?: string;
  artist?: string;
  synopsis?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | string;
  alternativeTitles?: string[];
  source?: string;
  sourceUrl?: string;
  language?: string;
  downloadedAt?: string;
  lastReadChapter?: string;
  lastReadAt?: string;
}

/**
 * Chapter info structure
 */
export interface ChapterInfo {
  name: string;
  path: string;
  pageCount: number;
  sizeBytes: number;
  downloadedAt?: Date;
  converted?: boolean;
  convertedFile?: string;
  conversionProgress?: number;
}

/**
 * Manga with chapters
 */
export interface MangaWithChapters {
  slug: string;
  info: MangaInfo;
  chapters: ChapterInfo[];
  totalChapters: number;
  totalPages: number;
  totalSizeBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
  hasConverted: boolean;
}

/**
 * List mangas query options
 */
export interface ListMangasOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'chapters';
  order?: 'asc' | 'desc';
  status?: string;
  language?: string;
  hasConverted?: boolean;
}

/**
 * List mangas result
 */
export interface ListMangasResult {
  mangas: MangaWithChapters[];
  total: number;
  filtered: number;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Gets directory size recursively
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        totalSize += await getDirectorySize(fullPath);
      } else {
        const stat = await fs.stat(fullPath);
        totalSize += stat.size;
      }
    }
  } catch {
    // Ignore errors
  }
  
  return totalSize;
}

/**
 * Counts files in a directory (non-recursive)
 */
async function countFiles(dirPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter(e => e.isFile()).length;
  } catch {
    return 0;
  }
}

/**
 * Checks if a chapter has been converted
 */
async function checkChapterConverted(slug: string, chapterName: string): Promise<{ converted: boolean; convertedFile?: string }> {
  try {
    const convertedFiles = await fs.readdir(CONVERTED_DIR);
    const patterns = [
      `${slug}_${chapterName}`,
      `${slug}-${chapterName}`,
      chapterName,
    ];
    
    for (const file of convertedFiles) {
      const baseName = path.basename(file, path.extname(file));
      for (const pattern of patterns) {
        if (baseName.toLowerCase().includes(pattern.toLowerCase())) {
          return { converted: true, convertedFile: file };
        }
      }
    }
  } catch {
    // Converted directory doesn't exist
  }
  return { converted: false };
}

/**
 * Checks if manga has any converted files
 */
async function checkMangaHasConverted(slug: string): Promise<boolean> {
  try {
    const convertedFiles = await fs.readdir(CONVERTED_DIR);
    return convertedFiles.some(f => f.toLowerCase().includes(slug.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Lists all downloaded mangas with filtering and pagination
 */
export async function listMangas(options: ListMangasOptions = {}): Promise<ListMangasResult> {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'name',
    order = 'asc',
    status,
    language,
    hasConverted,
  } = options;
  
  let mangas: MangaWithChapters[] = [];
  
  try {
    const entries = await fs.readdir(DOWNLOADS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const manga = await getMangaDetails(entry.name);
      
      if (manga) {
        mangas.push(manga);
      }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
  
  const total = mangas.length;
  
  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    mangas = mangas.filter(m => 
      m.info.title.toLowerCase().includes(searchLower) ||
      m.slug.toLowerCase().includes(searchLower) ||
      m.info.author?.toLowerCase().includes(searchLower) ||
      m.info.alternativeTitles?.some(t => t.toLowerCase().includes(searchLower))
    );
  }
  
  if (status) {
    mangas = mangas.filter(m => m.info.status === status);
  }
  
  if (language) {
    mangas = mangas.filter(m => m.info.language === language);
  }
  
  if (hasConverted !== undefined) {
    mangas = mangas.filter(m => m.hasConverted === hasConverted);
  }
  
  const filtered = mangas.length;
  
  // Apply sorting
  mangas.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.info.title.localeCompare(b.info.title);
        break;
      case 'createdAt':
        comparison = (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        break;
      case 'updatedAt':
        comparison = (a.updatedAt?.getTime() || 0) - (b.updatedAt?.getTime() || 0);
        break;
      case 'size':
        comparison = a.totalSizeBytes - b.totalSizeBytes;
        break;
      case 'chapters':
        comparison = a.totalChapters - b.totalChapters;
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  // Apply pagination
  const start = (page - 1) * limit;
  const paginatedMangas = mangas.slice(start, start + limit);
  
  return {
    mangas: paginatedMangas,
    total,
    filtered,
  };
}

/**
 * Gets manga details including chapters
 */
export async function getMangaDetails(slug: string): Promise<MangaWithChapters | null> {
  const mangaPath = path.join(DOWNLOADS_DIR, slug);
  
  // Security check
  if (!mangaPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  let mangaStat;
  try {
    mangaStat = await fs.stat(mangaPath);
    if (!mangaStat.isDirectory()) {
      return null;
    }
  } catch {
    return null;
  }
  
  // Read manga info
  let info: MangaInfo = { title: slug };
  try {
    const infoPath = path.join(mangaPath, 'info.json');
    const infoContent = await fs.readFile(infoPath, 'utf-8');
    info = { ...info, ...JSON.parse(infoContent) };
  } catch {
    // Use default info if file doesn't exist
  }
  
  // List chapters
  const chapters: ChapterInfo[] = [];
  let totalSizeBytes = 0;
  let totalPages = 0;
  let latestChapterDate: Date | undefined;
  
  try {
    const entries = await fs.readdir(mangaPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const chapterPath = path.join(mangaPath, entry.name);
      const chapterStat = await fs.stat(chapterPath);
      const pageCount = await countFiles(chapterPath);
      const sizeBytes = await getDirectorySize(chapterPath);
      const conversionStatus = await checkChapterConverted(slug, entry.name);
      
      totalSizeBytes += sizeBytes;
      totalPages += pageCount;
      
      if (!latestChapterDate || chapterStat.mtime > latestChapterDate) {
        latestChapterDate = chapterStat.mtime;
      }
      
      chapters.push({
        name: entry.name,
        path: `${slug}/${entry.name}`,
        pageCount,
        sizeBytes,
        downloadedAt: chapterStat.birthtime,
        converted: conversionStatus.converted,
        convertedFile: conversionStatus.convertedFile,
      });
    }
  } catch {
    // Ignore errors
  }
  
  // Sort chapters naturally
  chapters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  
  const hasConverted = await checkMangaHasConverted(slug);
  
  return {
    slug,
    info,
    chapters,
    totalChapters: chapters.length,
    totalPages,
    totalSizeBytes,
    createdAt: mangaStat.birthtime,
    updatedAt: latestChapterDate || mangaStat.mtime,
    hasConverted,
  };
}

/**
 * Gets a specific chapter info
 */
export async function getChapterInfo(slug: string, chapterName: string): Promise<ChapterInfo | null> {
  const chapterPath = path.join(DOWNLOADS_DIR, slug, chapterName);
  
  // Security check
  if (!chapterPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  try {
    const stat = await fs.stat(chapterPath);
    if (!stat.isDirectory()) {
      return null;
    }
    
    const pageCount = await countFiles(chapterPath);
    const sizeBytes = await getDirectorySize(chapterPath);
    const conversionStatus = await checkChapterConverted(slug, chapterName);
    
    return {
      name: chapterName,
      path: `${slug}/${chapterName}`,
      pageCount,
      sizeBytes,
      downloadedAt: stat.birthtime,
      converted: conversionStatus.converted,
      convertedFile: conversionStatus.convertedFile,
    };
  } catch {
    return null;
  }
}

/**
 * List pages options
 */
export interface ListPagesOptions {
  page?: number;
  limit?: number;
}

/**
 * List pages result
 */
export interface ListPagesResult {
  pages: string[];
  total: number;
}

/**
 * Lists pages in a chapter with optional pagination
 */
export async function listChapterPages(
  slug: string, 
  chapterName: string,
  options: ListPagesOptions = {}
): Promise<ListPagesResult> {
  const chapterPath = path.join(DOWNLOADS_DIR, slug, chapterName);
  
  // Security check
  if (!chapterPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  try {
    const entries = await fs.readdir(chapterPath, { withFileTypes: true });
    let pages = entries
      .filter(e => e.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.name))
      .map(e => e.name);
    
    // Sort naturally
    pages.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    
    const total = pages.length;
    
    // Apply pagination if specified
    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      pages = pages.slice(start, start + options.limit);
    }
    
    return { pages, total };
  } catch {
    return { pages: [], total: 0 };
  }
}

/**
 * Gets the path to a page image
 */
export function getPagePath(slug: string, chapterName: string, pageName: string): string {
  const pagePath = path.join(DOWNLOADS_DIR, slug, chapterName, pageName);
  
  // Security check
  if (!pagePath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  return pagePath;
}

/**
 * Deletes a manga and all its chapters
 */
export async function deleteManga(slug: string): Promise<boolean> {
  const mangaPath = path.join(DOWNLOADS_DIR, slug);
  
  // Security check
  if (!mangaPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  try {
    await fs.rm(mangaPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes a specific chapter
 */
export async function deleteChapter(slug: string, chapterName: string): Promise<boolean> {
  const chapterPath = path.join(DOWNLOADS_DIR, slug, chapterName);
  
  // Security check
  if (!chapterPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  try {
    await fs.rm(chapterPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates manga info
 */
export async function updateMangaInfo(slug: string, info: Partial<MangaInfo>): Promise<MangaInfo | null> {
  const mangaPath = path.join(DOWNLOADS_DIR, slug);
  const infoPath = path.join(mangaPath, 'info.json');
  
  // Security check
  if (!mangaPath.startsWith(DOWNLOADS_DIR)) {
    throw new Error('Invalid path');
  }
  
  try {
    // Check if manga exists
    const stat = await fs.stat(mangaPath);
    if (!stat.isDirectory()) {
      return null;
    }
    
    // Read existing info
    let existingInfo: MangaInfo = { title: slug };
    try {
      const content = await fs.readFile(infoPath, 'utf-8');
      existingInfo = JSON.parse(content);
    } catch {
      // File doesn't exist, use default
    }
    
    // Merge and save
    const updatedInfo = { ...existingInfo, ...info };
    await fs.writeFile(infoPath, JSON.stringify(updatedInfo, null, 2));
    
    return updatedInfo;
  } catch {
    return null;
  }
}

/**
 * Gets total library statistics
 */
export async function getLibraryStats(): Promise<{
  totalMangas: number;
  totalChapters: number;
  totalPages: number;
  totalSizeBytes: number;
  totalConverted: number;
}> {
  const result = await listMangas({ limit: 10000 });
  
  let totalConverted = 0;
  try {
    const convertedFiles = await fs.readdir(CONVERTED_DIR);
    totalConverted = convertedFiles.length;
  } catch {
    // Directory doesn't exist
  }
  
  return {
    totalMangas: result.mangas.length,
    totalChapters: result.mangas.reduce((sum, m) => sum + m.totalChapters, 0),
    totalPages: result.mangas.reduce((sum, m) => sum + m.totalPages, 0),
    totalSizeBytes: result.mangas.reduce((sum, m) => sum + m.totalSizeBytes, 0),
    totalConverted,
  };
}

/**
 * Gets all chapter paths for a manga (for KCC conversion)
 */
export async function getMangaChapterPaths(slug: string): Promise<string[]> {
  const manga = await getMangaDetails(slug);
  if (!manga) {
    throw new Error(`Manga not found: ${slug}`);
  }
  
  return manga.chapters.map(c => c.path);
}
