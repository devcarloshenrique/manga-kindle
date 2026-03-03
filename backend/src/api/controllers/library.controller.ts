import { type Request, type Response } from 'express';
import { z } from 'zod';
import path from 'path';
import {
  listMangas,
  getMangaDetails,
  getChapterInfo,
  listChapterPages,
  getPagePath,
  deleteManga,
  deleteChapter,
  updateMangaInfo,
  getLibraryStats,
  type ListMangasOptions,
} from '../../application/features/library/library.service.js';
import {
  createResponse,
  createErrorResponse,
  createPaginationMeta,
} from '../types/response.js';

// ========================================
// Validation Schemas
// ========================================

const listMangasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'size', 'chapters']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  status: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  hasConverted: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const listPagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const updateMangaInfoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  author: z.string().max(200).optional(),
  artist: z.string().max(200).optional(),
  synopsis: z.string().max(5000).optional(),
  genres: z.array(z.string()).max(50).optional(),
  status: z.enum(['ongoing', 'completed', 'hiatus', 'cancelled']).optional(),
  language: z.string().max(10).optional(),
  alternativeTitles: z.array(z.string()).max(20).optional(),
  lastReadChapter: z.string().max(100).optional(),
  lastReadAt: z.string().datetime().optional(),
}).strict();

// ========================================
// Library Stats
// ========================================

/**
 * GET /api/library/stats
 * Get library statistics
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getLibraryStats();
    
    res.json(createResponse({
      totalMangas: stats.totalMangas,
      totalChapters: stats.totalChapters,
      totalPages: stats.totalPages,
      totalSizeBytes: stats.totalSizeBytes,
      totalSizeMB: Math.round(stats.totalSizeBytes / 1024 / 1024 * 100) / 100,
      totalSizeGB: Math.round(stats.totalSizeBytes / 1024 / 1024 / 1024 * 100) / 100,
      totalConverted: stats.totalConverted,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('STATS_ERROR', 'Failed to get library stats', message));
  }
}

// ========================================
// Manga Operations
// ========================================

/**
 * GET /api/library/mangas
 * List all downloaded mangas with filtering and pagination
 */
export async function listMangasHandler(req: Request, res: Response): Promise<void> {
  const queryResult = listMangasQuerySchema.safeParse(req.query);
  
  if (!queryResult.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_QUERY',
      'Invalid query parameters',
      queryResult.error.flatten()
    ));
    return;
  }
  
  const { page, limit, search, sortBy, order, status, language, hasConverted } = queryResult.data;
  
  try {
    const options: ListMangasOptions = {
      page,
      limit,
      search,
      sortBy,
      order,
      status,
      language,
      hasConverted,
    };
    
    const result = await listMangas(options);
    
    res.json(createResponse(
      result.mangas.map(m => ({
        slug: m.slug,
        title: m.info.title,
        coverUrl: m.info.coverUrl,
        author: m.info.author,
        artist: m.info.artist,
        status: m.info.status,
        language: m.info.language,
        genres: m.info.genres,
        totalChapters: m.totalChapters,
        totalPages: m.totalPages,
        totalSizeBytes: m.totalSizeBytes,
        totalSizeMB: Math.round(m.totalSizeBytes / 1024 / 1024 * 100) / 100,
        hasConverted: m.hasConverted,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        lastReadChapter: m.info.lastReadChapter,
        lastReadAt: m.info.lastReadAt,
      })),
      {
        ...createPaginationMeta(page, limit, result.filtered),
        totalUnfiltered: result.total,
      }
    ));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('LIST_ERROR', 'Failed to list mangas', message));
  }
}

/**
 * GET /api/library/mangas/:slug
 * Get manga details including chapters
 */
export async function getMangaHandler(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  
  if (!slug) {
    res.status(400).json(createErrorResponse('MISSING_SLUG', 'Manga slug is required'));
    return;
  }
  
  try {
    const manga = await getMangaDetails(slug);
    
    if (!manga) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Manga not found'));
      return;
    }
    
    res.json(createResponse({
      slug: manga.slug,
      info: manga.info,
      totalChapters: manga.totalChapters,
      totalPages: manga.totalPages,
      totalSizeBytes: manga.totalSizeBytes,
      totalSizeMB: Math.round(manga.totalSizeBytes / 1024 / 1024 * 100) / 100,
      hasConverted: manga.hasConverted,
      createdAt: manga.createdAt,
      updatedAt: manga.updatedAt,
      chapters: manga.chapters.map(c => ({
        name: c.name,
        path: c.path,
        pageCount: c.pageCount,
        sizeBytes: c.sizeBytes,
        sizeMB: Math.round(c.sizeBytes / 1024 / 1024 * 100) / 100,
        downloadedAt: c.downloadedAt,
        converted: c.converted,
        convertedFile: c.convertedFile,
      })),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('GET_ERROR', 'Failed to get manga details', message));
  }
}

/**
 * PATCH /api/library/mangas/:slug
 * Update manga info
 */
export async function updateMangaHandler(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  
  if (!slug) {
    res.status(400).json(createErrorResponse('MISSING_SLUG', 'Manga slug is required'));
    return;
  }
  
  const result = updateMangaInfoSchema.safeParse(req.body);
  
  if (!result.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_BODY',
      'Invalid request body',
      result.error.flatten()
    ));
    return;
  }
  
  try {
    const updatedInfo = await updateMangaInfo(slug, result.data);
    
    if (!updatedInfo) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Manga not found'));
      return;
    }
    
    res.json(createResponse({
      message: 'Manga info updated',
      info: updatedInfo,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update manga info', message));
  }
}

/**
 * DELETE /api/library/mangas/:slug
 * Delete a manga and all its chapters
 */
export async function deleteMangaHandler(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  
  if (!slug) {
    res.status(400).json(createErrorResponse('MISSING_SLUG', 'Manga slug is required'));
    return;
  }
  
  try {
    const deleted = await deleteManga(slug);
    
    if (!deleted) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Manga not found or already deleted'));
      return;
    }
    
    res.json(createResponse({
      message: `Manga '${slug}' deleted successfully`,
      deleted: true,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete manga', message));
  }
}

// ========================================
// Chapter Operations
// ========================================

/**
 * GET /api/library/mangas/:slug/chapters/:chapter
 * Get chapter details
 */
export async function getChapterHandler(req: Request, res: Response): Promise<void> {
  const { slug, chapter } = req.params;
  
  if (!slug || !chapter) {
    res.status(400).json(createErrorResponse('MISSING_PARAMS', 'Manga slug and chapter name are required'));
    return;
  }
  
  try {
    const chapterInfo = await getChapterInfo(slug, chapter);
    
    if (!chapterInfo) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Chapter not found'));
      return;
    }
    
    const pagesResult = await listChapterPages(slug, chapter);
    
    res.json(createResponse({
      name: chapterInfo.name,
      path: chapterInfo.path,
      pageCount: chapterInfo.pageCount,
      sizeBytes: chapterInfo.sizeBytes,
      sizeMB: Math.round(chapterInfo.sizeBytes / 1024 / 1024 * 100) / 100,
      downloadedAt: chapterInfo.downloadedAt,
      converted: chapterInfo.converted,
      convertedFile: chapterInfo.convertedFile,
      conversionProgress: chapterInfo.conversionProgress,
      pages: pagesResult.pages,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('GET_ERROR', 'Failed to get chapter details', message));
  }
}

/**
 * DELETE /api/library/mangas/:slug/chapters/:chapter
 * Delete a specific chapter
 */
export async function deleteChapterHandler(req: Request, res: Response): Promise<void> {
  const { slug, chapter } = req.params;
  
  if (!slug || !chapter) {
    res.status(400).json(createErrorResponse('MISSING_PARAMS', 'Manga slug and chapter name are required'));
    return;
  }
  
  try {
    const deleted = await deleteChapter(slug, chapter);
    
    if (!deleted) {
      res.status(404).json(createErrorResponse('NOT_FOUND', 'Chapter not found or already deleted'));
      return;
    }
    
    res.json(createResponse({
      message: `Chapter '${chapter}' deleted from '${slug}'`,
      deleted: true,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete chapter', message));
  }
}

// ========================================
// Page Operations
// ========================================

/**
 * GET /api/library/mangas/:slug/chapters/:chapter/pages
 * List all pages in a chapter with optional pagination
 */
export async function listPagesHandler(req: Request, res: Response): Promise<void> {
  const { slug, chapter } = req.params;
  
  if (!slug || !chapter) {
    res.status(400).json(createErrorResponse('MISSING_PARAMS', 'Manga slug and chapter name are required'));
    return;
  }
  
  const queryResult = listPagesQuerySchema.safeParse(req.query);
  
  if (!queryResult.success) {
    res.status(400).json(createErrorResponse(
      'INVALID_QUERY',
      'Invalid query parameters',
      queryResult.error.flatten()
    ));
    return;
  }
  
  const { page, limit } = queryResult.data;
  
  try {
    const result = await listChapterPages(slug, chapter, { page, limit });
    
    if (result.total === 0) {
      const chapterInfo = await getChapterInfo(slug, chapter);
      if (!chapterInfo) {
        res.status(404).json(createErrorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }
    }
    
    const paginatedPages = result.pages.map((pageName, index) => ({
      index: page && limit ? (page - 1) * limit + index : index,
      name: pageName,
      url: `/api/library/mangas/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(chapter)}/pages/${encodeURIComponent(pageName)}`,
    }));
    
    if (page && limit) {
      res.json(createResponse(paginatedPages, createPaginationMeta(page, limit, result.total)));
    } else {
      res.json(createResponse(paginatedPages, { total: result.total }));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(createErrorResponse('LIST_ERROR', 'Failed to list pages', message));
  }
}

/**
 * GET /api/library/mangas/:slug/chapters/:chapter/pages/:page
 * Get a page image
 */
export async function getPageHandler(req: Request, res: Response): Promise<void> {
  const { slug, chapter, page } = req.params;
  
  if (!slug || !chapter || !page) {
    res.status(400).json(createErrorResponse('MISSING_PARAMS', 'Manga slug, chapter name, and page name are required'));
    return;
  }
  
  try {
    const pagePath = getPagePath(slug, chapter, page);
    
    // Determine content type based on extension
    const ext = path.extname(page).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.sendFile(pagePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json(createErrorResponse('NOT_FOUND', 'Page not found', message));
  }
}

