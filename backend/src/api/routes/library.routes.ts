import { Router } from 'express';
import {
  getStats,
  listMangasHandler,
  getMangaHandler,
  updateMangaHandler,
  deleteMangaHandler,
  getChapterHandler,
  deleteChapterHandler,
  listPagesHandler,
  getPageHandler,
} from '../controllers/library.controller.js';

const router = Router();

// ========================================
// Library Stats
// ========================================

/**
 * @openapi
 * /api/library/stats:
 *   get:
 *     tags:
 *       - Library
 *     summary: Get library statistics
 *     description: |
 *       Returns comprehensive statistics about the local manga library including
 *       total counts, storage usage, and conversion status.
 *     responses:
 *       200:
 *         description: Library statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMangas:
 *                       type: integer
 *                       example: 15
 *                     totalChapters:
 *                       type: integer
 *                       example: 1250
 *                     totalPages:
 *                       type: integer
 *                       example: 25000
 *                     totalSizeBytes:
 *                       type: integer
 *                       example: 5368709120
 *                     totalSizeMB:
 *                       type: number
 *                       example: 5120.5
 *                     convertedFiles:
 *                       type: integer
 *                       example: 45
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 totalMangas: 15
 *                 totalChapters: 1250
 *                 totalPages: 25000
 *                 totalSizeBytes: 5368709120
 *                 totalSizeMB: 5120.5
 *                 convertedFiles: 45
 *               error: null
 */
router.get('/stats', getStats);

// ========================================
// Manga Operations
// ========================================

/**
 * @openapi
 * /api/library/mangas:
 *   get:
 *     tags:
 *       - Library
 *     summary: List all downloaded mangas with filtering and pagination
 *     description: |
 *       Returns a paginated list of all mangas in the downloads folder.
 *       Supports filtering by search term, status, language, and conversion status.
 *       
 *       **Sorting Options:**
 *       - `title` - Sort alphabetically by title
 *       - `chapterCount` - Sort by number of chapters
 *       - `lastDownloaded` - Sort by most recent download
 *       - `totalSize` - Sort by storage size
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title (case-insensitive partial match)
 *         example: "vagabond"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, chapterCount, lastDownloaded, totalSize]
 *           default: title
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, completed, hiatus, unknown]
 *         description: Filter by manga status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language code (e.g., "pt-br", "en")
 *       - in: query
 *         name: hasConverted
 *         schema:
 *           type: boolean
 *         description: Filter by conversion status (true = has converted files)
 *     responses:
 *       200:
 *         description: Paginated list of mangas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LibraryManga'
 *                 meta:
 *                   allOf:
 *                     - $ref: '#/components/schemas/PaginationMeta'
 *                     - type: object
 *                       properties:
 *                         filtered:
 *                           type: integer
 *                           description: Count after applying filters
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 - slug: "vagabond"
 *                   title: "Vagabond"
 *                   chapterCount: 327
 *                   totalPages: 6540
 *                   hasConverted: true
 *                   language: "pt-br"
 *                   status: "hiatus"
 *                   lastDownloaded: "2024-01-15T10:30:00.000Z"
 *                 - slug: "one-piece"
 *                   title: "One Piece"
 *                   chapterCount: 1100
 *                   totalPages: 22000
 *                   hasConverted: false
 *                   language: "pt-br"
 *                   status: "ongoing"
 *                   lastDownloaded: "2024-01-14T08:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 15
 *                 filtered: 15
 *                 totalPages: 1
 *                 hasMore: false
 *               error: null
 */
router.get('/mangas', listMangasHandler);

/**
 * @openapi
 * /api/library/mangas/{slug}:
 *   get:
 *     tags:
 *       - Library
 *     summary: Get detailed manga information
 *     description: |
 *       Returns complete details of a specific manga including all chapters,
 *       metadata from info.json, and conversion status.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga folder name/slug
 *         example: "vagabond"
 *     responses:
 *       200:
 *         description: Manga details with chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     artist:
 *                       type: string
 *                     synopsis:
 *                       type: string
 *                     genres:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                       enum: [ongoing, completed, hiatus, unknown]
 *                     language:
 *                       type: string
 *                     coverUrl:
 *                       type: string
 *                     totalChapters:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalSizeMB:
 *                       type: number
 *                     hasConverted:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     chapters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LibraryChapter'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 slug: "vagabond"
 *                 title: "Vagabond"
 *                 author: "Takehiko Inoue"
 *                 artist: "Takehiko Inoue"
 *                 synopsis: "A história de Musashi Miyamoto..."
 *                 genres: ["Ação", "Samurai", "Drama"]
 *                 status: "hiatus"
 *                 language: "pt-br"
 *                 coverUrl: "/api/library/mangas/vagabond/cover"
 *                 totalChapters: 327
 *                 totalPages: 6540
 *                 totalSizeMB: 2150.5
 *                 hasConverted: true
 *                 createdAt: "2024-01-10T08:00:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 chapters:
 *                   - name: "Capitulo_0001"
 *                     path: "downloads/vagabond/Capitulo_0001"
 *                     pageCount: 53
 *                     converted: true
 *                     convertedFile: "vagabond-Capitulo_0001.epub"
 *               error: null
 *       404:
 *         description: Manga not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/mangas/:slug', getMangaHandler);

/**
 * @openapi
 * /api/library/mangas/{slug}:
 *   patch:
 *     tags:
 *       - Library
 *     summary: Update manga metadata
 *     description: |
 *       Updates the manga's info.json file with new metadata.
 *       Only provided fields will be updated.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Vagabond"
 *               author:
 *                 type: string
 *                 example: "Takehiko Inoue"
 *               artist:
 *                 type: string
 *                 example: "Takehiko Inoue"
 *               synopsis:
 *                 type: string
 *                 example: "The story of Musashi Miyamoto..."
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Action", "Samurai", "Drama"]
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus, unknown]
 *                 example: "hiatus"
 *               language:
 *                 type: string
 *                 example: "pt-br"
 *           example:
 *             title: "Vagabond"
 *             author: "Takehiko Inoue"
 *             status: "hiatus"
 *     responses:
 *       200:
 *         description: Manga info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     manga:
 *                       $ref: '#/components/schemas/LibraryManga'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 message: "Manga info updated successfully"
 *                 manga:
 *                   slug: "vagabond"
 *                   title: "Vagabond"
 *                   author: "Takehiko Inoue"
 *               error: null
 *       404:
 *         description: Manga not found
 */
router.patch('/mangas/:slug', updateMangaHandler);

/**
 * @openapi
 * /api/library/mangas/{slug}:
 *   delete:
 *     tags:
 *       - Library
 *     summary: Delete a manga and all its chapters
 *     description: |
 *       Permanently deletes a manga folder and all its contents.
 *       This action cannot be undone.
 *       
 *       **Warning:** This will delete all downloaded chapter images.
 *       Converted files in the /converted folder are NOT deleted.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *     responses:
 *       200:
 *         description: Manga deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     deletedChapters:
 *                       type: integer
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 message: "Manga 'vagabond' deleted successfully"
 *                 deletedChapters: 327
 *               error: null
 *       404:
 *         description: Manga not found
 */
router.delete('/mangas/:slug', deleteMangaHandler);

// ========================================
// Chapter Operations
// ========================================

/**
 * @openapi
 * /api/library/mangas/{slug}/chapters/{chapter}:
 *   get:
 *     tags:
 *       - Library
 *     summary: Get chapter details
 *     description: |
 *       Returns detailed information about a specific chapter including
 *       page list and conversion status.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *       - in: path
 *         name: chapter
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter folder name
 *         example: "Capitulo_0001"
 *     responses:
 *       200:
 *         description: Chapter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     path:
 *                       type: string
 *                     pageCount:
 *                       type: integer
 *                     pages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: integer
 *                           filename:
 *                             type: string
 *                           url:
 *                             type: string
 *                     converted:
 *                       type: boolean
 *                     convertedFile:
 *                       type: string
 *                       nullable: true
 *                     conversionProgress:
 *                       type: number
 *                       nullable: true
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 name: "Capitulo_0001"
 *                 path: "downloads/vagabond/Capitulo_0001"
 *                 pageCount: 53
 *                 pages:
 *                   - number: 1
 *                     filename: "001.jpg"
 *                     url: "/api/library/mangas/vagabond/chapters/Capitulo_0001/pages/001.jpg"
 *                   - number: 2
 *                     filename: "002.jpg"
 *                     url: "/api/library/mangas/vagabond/chapters/Capitulo_0001/pages/002.jpg"
 *                 converted: true
 *                 convertedFile: "vagabond-Capitulo_0001.epub"
 *               error: null
 *       404:
 *         description: Chapter not found
 */
router.get('/mangas/:slug/chapters/:chapter', getChapterHandler);

/**
 * @openapi
 * /api/library/mangas/{slug}/chapters/{chapter}:
 *   delete:
 *     tags:
 *       - Library
 *     summary: Delete a chapter
 *     description: |
 *       Permanently deletes a specific chapter folder and all its page images.
 *       This action cannot be undone.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *       - in: path
 *         name: chapter
 *         required: true
 *         schema:
 *           type: string
 *         example: "Capitulo_0001"
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     deletedPages:
 *                       type: integer
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 message: "Chapter 'Capitulo_0001' deleted successfully"
 *                 deletedPages: 53
 *               error: null
 *       404:
 *         description: Chapter not found
 */
router.delete('/mangas/:slug/chapters/:chapter', deleteChapterHandler);

// ========================================
// Page Operations
// ========================================

/**
 * @openapi
 * /api/library/mangas/{slug}/chapters/{chapter}/pages:
 *   get:
 *     tags:
 *       - Library
 *     summary: List chapter pages with pagination
 *     description: |
 *       Returns a paginated list of all pages in a chapter.
 *       Useful for lazy loading page thumbnails or building readers.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *       - in: path
 *         name: chapter
 *         required: true
 *         schema:
 *           type: string
 *         example: "Capitulo_0001"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 200
 *         description: Items per page (max 200)
 *     responses:
 *       200:
 *         description: Paginated list of pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       number:
 *                         type: integer
 *                       filename:
 *                         type: string
 *                       url:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 - number: 1
 *                   filename: "001.jpg"
 *                   url: "/api/library/mangas/vagabond/chapters/Capitulo_0001/pages/001.jpg"
 *                 - number: 2
 *                   filename: "002.jpg"
 *                   url: "/api/library/mangas/vagabond/chapters/Capitulo_0001/pages/002.jpg"
 *               meta:
 *                 page: 1
 *                 limit: 50
 *                 total: 53
 *                 totalPages: 2
 *                 hasMore: true
 *               error: null
 *       404:
 *         description: Chapter not found
 */
router.get('/mangas/:slug/chapters/:chapter/pages', listPagesHandler);

/**
 * @openapi
 * /api/library/mangas/{slug}/chapters/{chapter}/pages/{page}:
 *   get:
 *     tags:
 *       - Library
 *     summary: Get page image
 *     description: |
 *       Returns the actual image file for a specific page.
 *       Supports JPEG, PNG, and WebP formats.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "vagabond"
 *       - in: path
 *         name: chapter
 *         required: true
 *         schema:
 *           type: string
 *         example: "Capitulo_0001"
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: string
 *         description: Page filename (e.g., "001.jpg" or just "001")
 *         example: "001.jpg"
 *     responses:
 *       200:
 *         description: Page image file
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Page not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/mangas/:slug/chapters/:chapter/pages/:page', getPageHandler);

export default router;
