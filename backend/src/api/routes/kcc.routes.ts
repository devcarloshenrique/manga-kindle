import { Router } from 'express';
import { asyncHandler } from '../middleware/index.js';
import * as kccController from '../controllers/kcc.controller.js';

const router = Router();

// ========================================
// KCC Information & Configuration
// ========================================

/**
 * @swagger
 * /api/kcc/profiles:
 *   get:
 *     summary: List available device profiles with detailed specifications
 *     description: |
 *       Returns all supported device profiles for conversion. Each profile is optimized
 *       for a specific e-reader device with appropriate resolution and format settings.
 *       
 *       **Device Categories:**
 *       - **Kindle (K prefix):** K1 to KCS (Kindle Scribe)
 *       - **Kobo (KO prefix):** Various Kobo devices
 *       - **reMarkable (RM prefix):** reMarkable tablets
 *       - **Other:** Generic profiles
 *     tags: [KCC]
 *     responses:
 *       200:
 *         description: List of profiles with specifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KccProfile'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 - id: "KPW5"
 *                   name: "Kindle Paperwhite 5"
 *                   resolution: "1236x1648"
 *                   device: "Kindle Paperwhite 5th Gen (2021)"
 *                   supportedFormats: ["EPUB", "MOBI", "KFX"]
 *                 - id: "KO"
 *                   name: "Kobo"
 *                   resolution: "1264x1680"
 *                   device: "Kobo Libra H2O / Clara HD"
 *                   supportedFormats: ["EPUB", "CBZ"]
 *               error: null
 */
router.get('/profiles', asyncHandler(kccController.getProfiles));

/**
 * @swagger
 * /api/kcc/options:
 *   get:
 *     summary: Get all available conversion options with documentation
 *     description: |
 *       Returns detailed documentation for all KCC conversion options,
 *       including CLI flag equivalents, types, defaults, and examples.
 *     tags: [KCC]
 *     responses:
 *       200:
 *         description: Conversion options documentation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/KccOptionDoc'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 mangaStyle:
 *                   description: "Use manga reading mode (right-to-left)"
 *                   type: "boolean"
 *                   default: false
 *                   cliFlag: "-m, --manga-style"
 *                   example: true
 *                 hq:
 *                   description: "High quality mode (4-bit per pixel)"
 *                   type: "boolean"
 *                   default: false
 *                   cliFlag: "--hq"
 *                   example: true
 *               error: null
 */
router.get('/options', asyncHandler(kccController.getOptionsDoc));

/**
 * @swagger
 * /api/kcc/presets:
 *   get:
 *     summary: Get all available conversion presets
 *     description: |
 *       Returns all predefined conversion presets. Each preset is a collection
 *       of optimized settings for specific use cases.
 *       
 *       **Available Presets:**
 *       - **default**: Minimal processing
 *       - **manga**: Optimized for Japanese manga (RTL, grayscale, spread splitting)
 *       - **webtoon**: Optimized for Korean webtoons (vertical scroll, color)
 *       - **highQuality**: Maximum quality (8-bit, PNG)
 *       - **noProcessing**: No image processing, just packaging
 *       - **comic**: Optimized for Western comics (LTR, color, panel view)
 *     tags: [KCC]
 *     responses:
 *       200:
 *         description: List of presets with their settings
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - name: "manga"
 *                   description: "Optimized for Japanese manga"
 *                   options:
 *                     mangaStyle: true
 *                     qualityMode: "hq"
 *                     colorMode: "grayscale"
 *                     splitterMode: "split"
 *               error: null
 */
router.get('/presets', asyncHandler(kccController.getPresets));

/**
 * @swagger
 * /api/kcc/parse/{name}:
 *   get:
 *     summary: Parse a file/folder name to extract manga and chapter info
 *     description: |
 *       Utility endpoint to test the naming parser.
 *       Returns the extracted manga slug, chapter number, and standardized names.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: File or folder name to parse
 *         example: "Vagabond/Capitulo_0325"
 *     responses:
 *       200:
 *         description: Parsed information
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 input: "Vagabond/Capitulo_0325"
 *                 parsed:
 *                   manga: "vagabond"
 *                   chapter: "0325"
 *                   chapterNumber: 325
 *                 standardized:
 *                   folderName: "vagabond_cap_325"
 *                   downloadPath: "downloads/vagabond/vagabond_cap_325"
 *                   convertedPath: "converted/vagabond/vagabond_cap_325.epub"
 *               error: null
 *       400:
 *         description: Could not parse name
 */
router.get('/parse/:name', asyncHandler(kccController.parseNameEndpoint));

// ========================================
// Folder Organization
// ========================================

/**
 * @swagger
 * /api/kcc/organize/downloads:
 *   post:
 *     summary: Organize all manga folders in downloads directory
 *     description: |
 *       Renames all chapter folders to the standardized format:
 *       `<manga-slug>_cap_<number>`
 *       
 *       Example: `Capitulo_001` → `vagabond_cap_001`
 *     tags: [KCC]
 *     responses:
 *       200:
 *         description: Organization results
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 message: "Downloads folder organized"
 *                 summary:
 *                   mangasProcessed: 5
 *                   totalRenamed: 150
 *                   totalSkipped: 50
 *                   totalErrors: 0
 *               error: null
 */
router.post('/organize/downloads', asyncHandler(kccController.organizeDownloads));

/**
 * @swagger
 * /api/kcc/organize/downloads/{slug}:
 *   post:
 *     summary: Organize a specific manga folder
 *     description: |
 *       Renames all chapter folders in the specified manga to the standardized format.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga folder name
 *         example: "vagabond"
 *     responses:
 *       200:
 *         description: Organization results for the manga
 *       404:
 *         description: Manga folder not found
 */
router.post('/organize/downloads/:slug', asyncHandler(kccController.organizeManga));

/**
 * @swagger
 * /api/kcc/organize/converted:
 *   post:
 *     summary: Organize converted files into manga subfolders
 *     description: |
 *       Moves converted files from the root of `/converted` into organized
 *       manga subfolders: `/converted/<manga-slug>/`
 *       
 *       Example: `vagabond_cap_001.epub` → `converted/vagabond/vagabond_cap_001.epub`
 *     tags: [KCC]
 *     responses:
 *       200:
 *         description: Organization results
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 message: "Converted folder organized"
 *                 success: true
 *                 totalProcessed: 25
 *                 renamed:
 *                   - from: "vagabond_cap_001.epub"
 *                     to: "/vagabond/vagabond_cap_001.epub"
 *                     manga: "vagabond"
 *                     chapter: "001"
 *               error: null
 */
router.post('/organize/converted', asyncHandler(kccController.organizeConverted));

// ========================================
// Conversion Jobs - Chapter Level
// ========================================

/**
 * @swagger
 * /api/kcc/convert:
 *   post:
 *     summary: Create a conversion job for specific chapters
 *     description: |
 *       Queue a conversion job for one or more chapters. Chapters can be converted
 *       individually or merged into a single volume.
 *       
 *       **Important Notes:**
 *       - Chapter paths must be relative to the downloads folder (e.g., "manga-slug/chapter-name")
 *       - Redis must be running for queue functionality
 *       - Use GET /api/kcc/jobs/{id}/progress to track conversion progress
 *     tags: [KCC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionRequest'
 *           examples:
 *             singleChapter:
 *               summary: Convert a single chapter
 *               value:
 *                 chapters: ["vagabond/Capitulo_0001"]
 *                 outputFormat: "EPUB"
 *                 profile: "KPW5"
 *                 options:
 *                   mangaStyle: true
 *                   hq: true
 *             multipleChapters:
 *               summary: Convert multiple chapters into one volume
 *               value:
 *                 chapters:
 *                   - "one-piece/Capitulo_0001"
 *                   - "one-piece/Capitulo_0002"
 *                   - "one-piece/Capitulo_0003"
 *                 mergeIntoSingleVolume: true
 *                 outputFormat: "MOBI"
 *                 profile: "KPW5"
 *                 options:
 *                   mangaStyle: true
 *                   webtoonMode: false
 *                   noSplitDoubleSpreads: true
 *     responses:
 *       202:
 *         description: Job queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/KccJob'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 jobId: "kcc-job-abc123"
 *                 status: "waiting"
 *                 chapters:
 *                   - "vagabond/Capitulo_0001"
 *                 outputFormat: "EPUB"
 *                 profile: "KPW5"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *               error: null
 *       400:
 *         description: Invalid request (missing required fields or invalid values)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               data: null
 *               error:
 *                 message: "Invalid conversion request"
 *                 details:
 *                   - path: ["chapters"]
 *                     message: "Array must contain at least 1 element(s)"
 *       503:
 *         description: Redis/Queue not available
 */
router.post('/convert', asyncHandler(kccController.createConversion));

/**
 * @swagger
 * /api/kcc/convert/manga:
 *   post:
 *     summary: Convert an entire manga with automatic volume splitting
 *     description: |
 *       Converts all chapters of a manga, optionally splitting them into volumes.
 *       This is useful for bulk conversion of downloaded mangas.
 *       
 *       **Volume Options:**
 *       - `mergeIntoVolumes: false` - Each chapter becomes a separate file
 *       - `mergeIntoVolumes: true` - Chapters are grouped into volumes
 *       - `singleVolume: true` - All chapters merged into one file
 *       
 *       **Output Naming:**
 *       - Single chapters: `{manga-slug}-chapter-001.epub`
 *       - Volumes: `{manga-slug}-vol-01.epub`
 *       - Single volume: `{manga-slug}-complete.epub`
 *     tags: [KCC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MangaConversionRequest'
 *           examples:
 *             individualChapters:
 *               summary: Convert each chapter separately
 *               value:
 *                 mangaSlug: "one-piece"
 *                 mergeIntoVolumes: false
 *                 outputFormat: "EPUB"
 *                 profile: "KPW5"
 *                 options:
 *                   mangaStyle: true
 *                   hq: true
 *             volumeSplit:
 *               summary: Split into 10-chapter volumes
 *               value:
 *                 mangaSlug: "naruto"
 *                 mergeIntoVolumes: true
 *                 chaptersPerVolume: 10
 *                 outputFormat: "MOBI"
 *                 profile: "K11"
 *                 options:
 *                   mangaStyle: true
 *             singleFile:
 *               summary: Merge everything into one file
 *               value:
 *                 mangaSlug: "death-note"
 *                 singleVolume: true
 *                 outputFormat: "EPUB"
 *                 profile: "KPW5"
 *     responses:
 *       202:
 *         description: Conversion jobs queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     mangaSlug:
 *                       type: string
 *                     totalChapters:
 *                       type: number
 *                     volumeCount:
 *                       type: number
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/KccJob'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 mangaSlug: "one-piece"
 *                 totalChapters: 50
 *                 volumeCount: 5
 *                 jobs:
 *                   - jobId: "kcc-job-vol1"
 *                     volumeName: "one-piece-vol-01"
 *                     chapters: ["Capitulo_0001", "Capitulo_0002"]
 *                     status: "waiting"
 *               error: null
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Manga not found
 */
router.post('/convert/manga', asyncHandler(kccController.createMangaConversion));

// ========================================
// Job Management
// ========================================

/**
 * @swagger
 * /api/kcc/jobs:
 *   get:
 *     summary: List all conversion jobs with filtering
 *     description: |
 *       Returns all conversion jobs with optional filtering by status.
 *       Jobs are sorted by creation date (newest first).
 *     tags: [KCC]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, active, completed, failed]
 *         description: Filter by job status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of jobs to return
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KccJob'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     waiting:
 *                       type: number
 *                     active:
 *                       type: number
 *                     completed:
 *                       type: number
 *                     failed:
 *                       type: number
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 - jobId: "kcc-job-abc123"
 *                   status: "completed"
 *                   progress: 100
 *                   chapters: ["vagabond/Capitulo_0001"]
 *                   outputFormat: "EPUB"
 *                   profile: "KPW5"
 *                   outputFile: "vagabond-Capitulo_0001.epub"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   completedAt: "2024-01-15T10:32:15.000Z"
 *               meta:
 *                 total: 15
 *                 waiting: 2
 *                 active: 1
 *                 completed: 10
 *                 failed: 2
 *               error: null
 */
router.get('/jobs', asyncHandler(kccController.getJobs));

/**
 * @swagger
 * /api/kcc/jobs/{id}:
 *   get:
 *     summary: Get detailed job information
 *     description: |
 *       Returns complete job details including conversion options,
 *       progress information, and output file details.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID (e.g., "kcc-job-abc123")
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/KccJobDetails'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 jobId: "kcc-job-abc123"
 *                 status: "active"
 *                 progress: 45
 *                 chapters:
 *                   - "vagabond/Capitulo_0001"
 *                   - "vagabond/Capitulo_0002"
 *                 outputFormat: "EPUB"
 *                 profile: "KPW5"
 *                 options:
 *                   mangaStyle: true
 *                   hq: true
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 startedAt: "2024-01-15T10:30:05.000Z"
 *               error: null
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/jobs/:id', asyncHandler(kccController.getJobDetails));

/**
 * @swagger
 * /api/kcc/jobs/{id}/progress:
 *   get:
 *     summary: Get real-time job progress
 *     description: |
 *       Returns the current progress of a conversion job.
 *       Poll this endpoint to track conversion progress.
 *       
 *       **Progress Values:**
 *       - 0-100: Percentage complete
 *       - Progress may jump as KCC processes each image
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [waiting, active, completed, failed]
 *                     progress:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     currentStep:
 *                       type: string
 *                     estimatedTimeRemaining:
 *                       type: number
 *                       description: Estimated seconds remaining
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 jobId: "kcc-job-abc123"
 *                 status: "active"
 *                 progress: 67
 *                 currentStep: "Processing images..."
 *                 estimatedTimeRemaining: 45
 *               error: null
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:id/progress', asyncHandler(kccController.getJobProgressEndpoint));

/**
 * @swagger
 * /api/kcc/jobs/{id}/cancel:
 *   post:
 *     summary: Cancel a running or waiting job
 *     description: |
 *       Attempts to cancel a conversion job. Only jobs in "waiting" or "active"
 *       status can be cancelled. Completed or failed jobs cannot be cancelled.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     message:
 *                       type: string
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 jobId: "kcc-job-abc123"
 *                 status: "cancelled"
 *                 message: "Job cancelled successfully"
 *               error: null
 *       400:
 *         description: Job cannot be cancelled (already completed/failed)
 *       404:
 *         description: Job not found
 */
router.post('/jobs/:id/cancel', asyncHandler(kccController.cancelJobEndpoint));

/**
 * @swagger
 * /api/kcc/jobs/{id}:
 *   delete:
 *     summary: Remove a job from history
 *     description: |
 *       Removes a job from the job history. This does NOT delete the converted
 *       output file. Use this to clean up old job records.
 *       
 *       **Note:** Active jobs should be cancelled first before removal.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job removed from history
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
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 message: "Job removed successfully"
 *               error: null
 *       404:
 *         description: Job not found
 */
router.delete('/jobs/:id', asyncHandler(kccController.removeJobEndpoint));

// ========================================
// Converted Files Library
// ========================================

/**
 * @swagger
 * /api/kcc/converted:
 *   get:
 *     summary: List all converted e-book files
 *     description: |
 *       Returns all converted files in the output directory.
 *       Files are grouped by manga and include metadata.
 *     tags: [KCC]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [EPUB, MOBI, CBZ, KFX]
 *         description: Filter by output format
 *       - in: query
 *         name: manga
 *         schema:
 *           type: string
 *         description: Filter by manga slug
 *     responses:
 *       200:
 *         description: List of converted files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConvertedFile'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     totalSize:
 *                       type: string
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 - name: "vagabond-Capitulo_0001.epub"
 *                   format: "EPUB"
 *                   size: "15.2 MB"
 *                   sizeBytes: 15938560
 *                   profile: "KPW5"
 *                   createdAt: "2024-01-15T10:32:15.000Z"
 *                   manga: "vagabond"
 *               meta:
 *                 total: 25
 *                 totalSize: "380.5 MB"
 *               error: null
 */
router.get('/converted', asyncHandler(kccController.getConvertedFiles));

/**
 * @swagger
 * /api/kcc/converted/{name}:
 *   get:
 *     summary: Get converted file details
 *     description: |
 *       Returns detailed information about a specific converted file,
 *       including file metadata and the job that created it.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename (e.g., "vagabond-Capitulo_0001.epub")
 *     responses:
 *       200:
 *         description: File details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ConvertedFileDetails'
 *                 error:
 *                   type: "null"
 *             example:
 *               data:
 *                 name: "vagabond-Capitulo_0001.epub"
 *                 format: "EPUB"
 *                 size: "15.2 MB"
 *                 sizeBytes: 15938560
 *                 profile: "KPW5"
 *                 createdAt: "2024-01-15T10:32:15.000Z"
 *                 manga: "vagabond"
 *                 chapters: ["Capitulo_0001"]
 *                 path: "/converted/vagabond-Capitulo_0001.epub"
 *               error: null
 *       404:
 *         description: File not found
 */
router.get('/converted/:name', asyncHandler(kccController.getConvertedFileDetails));

/**
 * @swagger
 * /api/kcc/converted/{name}/download:
 *   get:
 *     summary: Download a converted file
 *     description: |
 *       Downloads the converted e-book file. The file will be sent with
 *       appropriate Content-Type and Content-Disposition headers.
 *     tags: [KCC]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to download
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/epub+zip:
 *             schema:
 *               type: string
 *               format: binary
 *           application/x-mobipocket-ebook:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.comicbook+zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/converted/:name/download', asyncHandler(kccController.downloadConvertedFile));

export const kccRoutes = router;
