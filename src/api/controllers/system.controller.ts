import { Request, Response } from 'express';
import { ConnectorRegistry } from '../../infrastructure/connectors/index.js';
import { RateLimiterManager } from '../../infrastructure/rate-limiter/index.js';

/**
 * @swagger
 * /api/connectors:
 *   get:
 *     summary: Lista conectores disponíveis
 *     description: Retorna a lista de todos os conectores de sites de mangá disponíveis
 *     tags: [Connectors]
 *     responses:
 *       200:
 *         description: Lista de conectores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 connectors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Connector'
 */
export async function listConnectors(req: Request, res: Response): Promise<void> {
  const registry = ConnectorRegistry.getInstance();
  const connectors = registry.listConnectors();

  res.json({
    total: connectors.length,
    connectors
  });
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações da API
 *     description: Retorna informações básicas sobre a API e endpoints disponíveis
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Manga Downloader API
 *                 version:
 *                   type: string
 *                   example: '2.0.0'
 *                 description:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                   example: /docs
 */
export async function getApiInfo(req: Request, res: Response): Promise<void> {
  res.json({
    name: 'Manga Downloader API',
    version: '2.0.0',
    description: 'API para download de mangás com suporte a múltiplos sites',
    documentation: '/docs',
    endpoints: {
      connectors: {
        list: 'GET /api/connectors'
      },
      manga: {
        info: 'GET /api/manga/info?url=<manga-url>',
        chapterPages: 'GET /api/manga/chapter/pages?url=<chapter-url>'
      },
      downloads: {
        start: 'POST /api/downloads',
        chapter: 'POST /api/downloads/chapter',
        list: 'GET /api/downloads',
        status: 'GET /api/downloads/:id',
        cancel: 'DELETE /api/downloads/:id'
      },
      system: {
        stats: 'GET /api/system/stats'
      }
    }
  });
}

/**
 * @swagger
 * /api/system/stats:
 *   get:
 *     summary: Estatísticas do sistema
 *     description: Retorna estatísticas de rate limiting e status do sistema
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Estatísticas do sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Tempo de atividade em segundos
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: string
 *                       example: '50.5 MB'
 *                     total:
 *                       type: string
 *                       example: '128 MB'
 *                 rateLimiters:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/RateLimiterStats'
 */
export async function getSystemStats(req: Request, res: Response): Promise<void> {
  const rateLimiterManager = RateLimiterManager.getInstance();
  const stats = rateLimiterManager.getAllStats();

  const memoryUsage = process.memoryUsage();

  res.json({
    uptime: process.uptime(),
    memory: {
      used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
    },
    rateLimiters: stats,
    nodeVersion: process.version,
    platform: process.platform
  });
}
