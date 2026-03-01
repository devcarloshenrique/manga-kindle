import { Request, Response } from 'express';
import { 
  getDownloadMangaHandler,
  getDownloadChapterHandler,
  getDownloadRepository
} from '../../application/features/download/index.js';
import { ConnectorRegistry, MangaDexConnector } from '../../infrastructure/connectors/index.js';

/**
 * @swagger
 * /api/downloads:
 *   post:
 *     summary: Inicia download de um mangá
 *     description: |
 *       Inicia o download de todos os capítulos de um mangá em background.
 *       O download é assíncrono e você pode acompanhar o progresso pelo endpoint de status.
 *       
 *       Se `endChapter` não for informado, baixa todos os capítulos a partir de `startChapter`.
 *       
 *       Para MangaDex, você pode especificar o idioma desejado com o parâmetro `language`.
 *     tags: [Download]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL da página do mangá
 *                 example: https://mangalivre.to/manga/sakamoto-days/
 *               outputDir:
 *                 type: string
 *                 description: Diretório de saída
 *                 default: ./downloads
 *               startChapter:
 *                 type: integer
 *                 description: Número do capítulo inicial
 *                 default: 1
 *                 minimum: 1
 *               endChapter:
 *                 type: integer
 *                 description: Número do capítulo final. Se não informado, baixa todos os capítulos.
 *                 minimum: 1
 *               imageFormat:
 *                 type: string
 *                 enum: [original, webp, jpeg, jpg, png]
 *                 description: Formato de saída das imagens
 *                 default: original
 *               language:
 *                 type: string
 *                 description: Idioma dos capítulos para MangaDex (pt-br, en, es, etc)
 *                 example: pt-br
 *     responses:
 *       200:
 *         description: Download iniciado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadId:
 *                   type: string
 *                   example: m1a2b3c4d
 *                 message:
 *                   type: string
 *                   example: Download iniciado
 *                 statusUrl:
 *                   type: string
 *                   example: /api/downloads/m1a2b3c4d
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function startMangaDownload(req: Request, res: Response): Promise<void> {
  const { url, outputDir, startChapter, endChapter, imageFormat, language } = req.body;

  if (!url) {
    res.status(400).json({
      error: 'Parâmetro obrigatório',
      message: 'O parâmetro "url" é obrigatório',
      example: {
        url: 'https://mangalivre.to/manga/sakamoto-days/',
        startChapter: 1,
        endChapter: 10,
        imageFormat: 'original',
        language: 'pt-br'
      }
    });
    return;
  }

  // Se for MangaDex e um idioma foi especificado, configura o conector
  if (language && url.includes('mangadex.org')) {
    const connector = ConnectorRegistry.getInstance().get('mangadex') as MangaDexConnector;
    if (connector) {
      connector.setLanguage(language);
    }
  }

  const handler = getDownloadMangaHandler();
  const result = await handler.start({
    url,
    outputDir: outputDir || './downloads',
    startChapter: startChapter || 1,
    endChapter, // undefined = baixa todos
    imageFormat: imageFormat || 'original',
    language
  });

  res.json(result);
}

/**
 * @swagger
 * /api/downloads/chapter:
 *   post:
 *     summary: Baixa um único capítulo
 *     description: Baixa todas as páginas de um capítulo específico. Este endpoint é síncrono.
 *     tags: [Download]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL do capítulo
 *                 example: https://mangalivre.to/manga/sakamoto-days/capitulo-1/
 *               outputDir:
 *                 type: string
 *                 description: Diretório de saída
 *                 default: ./downloads
 *     responses:
 *       200:
 *         description: Capítulo baixado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mangaSlug:
 *                   type: string
 *                   example: sakamoto-days
 *                 chapter:
 *                   type: string
 *                   example: '1'
 *                 imagesDownloaded:
 *                   type: integer
 *                   example: 53
 *                 directory:
 *                   type: string
 *                   example: ./downloads/sakamoto-days/Capitulo_0001
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function downloadChapter(req: Request, res: Response): Promise<void> {
  const { url, outputDir } = req.body;

  if (!url) {
    res.status(400).json({
      error: 'Parâmetro obrigatório',
      message: 'O parâmetro "url" é obrigatório',
      example: {
        url: 'https://mangalivre.to/manga/sakamoto-days/capitulo-1/'
      }
    });
    return;
  }

  const handler = getDownloadChapterHandler();
  const result = await handler.execute({
    url,
    outputDir: outputDir || './downloads'
  });

  res.json(result);
}

/**
 * @swagger
 * /api/downloads:
 *   get:
 *     summary: Lista todos os downloads
 *     description: Retorna uma lista de todos os downloads em andamento e concluídos
 *     tags: [Download]
 *     responses:
 *       200:
 *         description: Lista de downloads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 downloads:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Download'
 */
export async function listDownloads(req: Request, res: Response): Promise<void> {
  const handler = getDownloadMangaHandler();
  const downloads = await handler.listDownloads();

  res.json({
    total: downloads.length,
    downloads: downloads.map(d => ({
      id: d.id,
      mangaTitle: d.mangaTitle,
      source: d.source,
      status: d.status,
      startedAt: d.startedAt,
      completedAt: d.completedAt,
      progress: d.progress
    }))
  });
}

/**
 * @swagger
 * /api/downloads/{id}:
 *   get:
 *     summary: Obtém status de um download
 *     description: Retorna informações detalhadas sobre um download específico
 *     tags: [Download]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do download
 *         example: m1a2b3c4d
 *     responses:
 *       200:
 *         description: Status do download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Download não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function getDownloadStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const handler = getDownloadMangaHandler();
  const download = await handler.getStatus(id);

  if (!download) {
    res.status(404).json({
      error: 'Download não encontrado',
      message: `Nenhum download encontrado com o ID: ${id}`
    });
    return;
  }

  res.json(download);
}

/**
 * @swagger
 * /api/downloads/{id}:
 *   delete:
 *     summary: Cancela um download
 *     description: Cancela um download em andamento
 *     tags: [Download]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do download
 *     responses:
 *       200:
 *         description: Download cancelado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Download cancelado
 *       404:
 *         description: Download não encontrado
 */
export async function cancelDownload(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const handler = getDownloadMangaHandler();
  await handler.cancel(id);

  res.json({ message: 'Download cancelado' });
}
