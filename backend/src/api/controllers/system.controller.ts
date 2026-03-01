import { Request, Response } from 'express';
import { ConnectorRegistry, MangaDexConnector } from '../../infrastructure/connectors/index.js';
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
 *                   example: 2
 *                 connectors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Connector'
 */
export async function listConnectors(req: Request, res: Response): Promise<void> {
  const registry = ConnectorRegistry.getInstance();
  const connectors = registry.getAll().map(c => {
    const baseInfo = {
      name: c.name,
      displayName: c.displayName,
      baseUrl: c.baseUrl
    };

    // Adiciona informações extras para MangaDex
    if (c.name === 'mangadex') {
      const mangadex = c as MangaDexConnector;
      return {
        ...baseInfo,
        currentLanguage: mangadex.getLanguage(),
        supportedLanguages: mangadex.getSupportedLanguages()
      };
    }

    return baseInfo;
  });

  res.json({
    total: connectors.length,
    connectors
  });
}

/**
 * @swagger
 * /api/connectors/health:
 *   get:
 *     summary: Health check de todos os conectores
 *     description: |
 *       Testa todos os conectores para verificar se estão funcionando corretamente.
 *       Para cada conector, testa:
 *       - getMangaInfo: obtém informações de um mangá de teste
 *       - getChapterPages: obtém páginas de um capítulo de teste
 *     tags: [Connectors]
 *     responses:
 *       200:
 *         description: Status de health de todos os conectores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 connectors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [healthy, unhealthy]
 *                       endpoints:
 *                         type: object
 *                         properties:
 *                           getMangaInfo:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               responseTime:
 *                                 type: number
 *                               error:
 *                                 type: string
 *                           getChapterPages:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               responseTime:
 *                                 type: number
 *                               error:
 *                                 type: string
 */
export async function checkConnectorsHealth(req: Request, res: Response): Promise<void> {
  const registry = ConnectorRegistry.getInstance();
  const connectors = registry.getAll();

  // URLs de teste para cada conector
  const testUrls: Record<string, { manga: string; chapter: string }> = {
    mangalivre: {
      manga: 'https://mangalivre.to/manga/one-piece',
      chapter: 'https://mangalivre.to/manga/one-piece/1'
    },
    mangadex: {
      manga: 'https://mangadex.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8',
      chapter: 'https://mangadex.org/chapter/9aab37f1-faf2-4204-b90d-c005d969c42f'
    }
  };

  const results = await Promise.all(
    connectors.map(async (connector) => {
      const testUrl = testUrls[connector.name];
      if (!testUrl) {
        return {
          name: connector.name,
          displayName: connector.displayName,
          status: 'skipped',
          reason: 'No test URLs configured'
        };
      }

      const endpoints: any = {};

      // Test getMangaInfo
      try {
        const start = Date.now();
        await connector.getMangaInfo(testUrl.manga);
        const responseTime = Date.now() - start;
        endpoints.getMangaInfo = {
          status: 'healthy',
          responseTime,
          testedUrl: testUrl.manga
        };
      } catch (error: any) {
        endpoints.getMangaInfo = {
          status: 'unhealthy',
          error: error.message,
          testedUrl: testUrl.manga
        };
      }

      // Test getChapterPages
      try {
        const start = Date.now();
        await connector.getChapterPages(testUrl.chapter);
        const responseTime = Date.now() - start;
        endpoints.getChapterPages = {
          status: 'healthy',
          responseTime,
          testedUrl: testUrl.chapter
        };
      } catch (error: any) {
        endpoints.getChapterPages = {
          status: 'unhealthy',
          error: error.message,
          testedUrl: testUrl.chapter
        };
      }

      // Determine overall connector status
      const allHealthy = Object.values(endpoints).every(
        (e: any) => e.status === 'healthy'
      );
      const someHealthy = Object.values(endpoints).some(
        (e: any) => e.status === 'healthy'
      );

      return {
        name: connector.name,
        displayName: connector.displayName,
        status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
        endpoints
      };
    })
  );

  // Determine overall system status
  const allHealthy = results.every(r => r.status === 'healthy');
  const someHealthy = results.some(r => r.status === 'healthy' || r.status === 'degraded');
  const overallStatus = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy';

  res.json({
    timestamp: new Date().toISOString(),
    status: overallStatus,
    totalConnectors: results.length,
    healthyConnectors: results.filter(r => r.status === 'healthy').length,
    connectors: results
  });
}

/**
 * @swagger
 * /api/connectors/{name}/language:
 *   put:
 *     summary: Define o idioma de um conector
 *     description: Define o idioma preferido para busca de capítulos (apenas para conectores que suportam múltiplos idiomas, como MangaDex)
 *     tags: [Connectors]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do conector
 *         example: mangadex
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *             properties:
 *               language:
 *                 type: string
 *                 description: Código do idioma (ISO 639-1)
 *                 example: pt-br
 *     responses:
 *       200:
 *         description: Idioma definido com sucesso
 *       400:
 *         description: Conector não suporta múltiplos idiomas
 *       404:
 *         description: Conector não encontrado
 */
export async function setConnectorLanguage(req: Request, res: Response): Promise<void> {
  const { name } = req.params;
  const { language } = req.body;

  const registry = ConnectorRegistry.getInstance();
  const connector = registry.get(name);

  if (!connector) {
    res.status(404).json({
      error: 'Conector não encontrado',
      message: `Conector '${name}' não existe`
    });
    return;
  }

  if (connector.name === 'mangadex') {
    const mangadex = connector as MangaDexConnector;
    mangadex.setLanguage(language);
    res.json({
      message: 'Idioma definido com sucesso',
      connector: name,
      language: mangadex.getLanguage(),
      supportedLanguages: mangadex.getSupportedLanguages()
    });
    return;
  }

  res.status(400).json({
    error: 'Não suportado',
    message: `O conector '${name}' não suporta múltiplos idiomas`
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
