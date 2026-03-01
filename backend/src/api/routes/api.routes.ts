import { Router } from 'express';
import { asyncHandler } from '../middleware/index.js';
import * as mangaController from '../controllers/manga.controller.js';
import * as downloadController from '../controllers/download.controller.js';
import * as systemController from '../controllers/system.controller.js';

const router = Router();

// ========================================
// Manga Routes
// ========================================

/**
 * GET /api/manga/info
 * Obtém informações de um mangá
 */
router.get('/manga/info', asyncHandler(mangaController.getMangaInfo));

/**
 * GET /api/manga/chapter/pages
 * Obtém páginas de um capítulo
 */
router.get('/manga/chapter/pages', asyncHandler(mangaController.getChapterPages));

// ========================================
// Download Routes
// ========================================

/**
 * POST /api/downloads
 * Inicia download de um mangá
 */
router.post('/downloads', asyncHandler(downloadController.startMangaDownload));

/**
 * POST /api/downloads/chapter
 * Baixa um único capítulo
 */
router.post('/downloads/chapter', asyncHandler(downloadController.downloadChapter));

/**
 * GET /api/downloads
 * Lista todos os downloads
 */
router.get('/downloads', asyncHandler(downloadController.listDownloads));

/**
 * GET /api/downloads/:id
 * Obtém status de um download
 */
router.get('/downloads/:id', asyncHandler(downloadController.getDownloadStatus));

/**
 * DELETE /api/downloads/:id
 * Cancela um download
 */
router.delete('/downloads/:id', asyncHandler(downloadController.cancelDownload));

// ========================================
// Connector Routes
// ========================================

/**
 * GET /api/connectors
 * Lista conectores disponíveis
 */
router.get('/connectors', asyncHandler(systemController.listConnectors));

/**
 * GET /api/connectors/health
 * Health check de todos os conectores
 */
router.get('/connectors/health', asyncHandler(systemController.checkConnectorsHealth));

/**
 * PUT /api/connectors/:name/language
 * Define o idioma de um conector
 */
router.put('/connectors/:name/language', asyncHandler(systemController.setConnectorLanguage));

// ========================================
// System Routes
// ========================================

/**
 * GET /api/system/stats
 * Estatísticas do sistema
 */
router.get('/system/stats', asyncHandler(systemController.getSystemStats));

export default router;
