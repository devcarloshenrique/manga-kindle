import { Request, Response } from 'express';
import { 
  getMangaInfoHandler, 
  getChapterPagesHandler 
} from '../../application/features/manga/index.js';

/**
 * @swagger
 * /api/manga/info:
 *   get:
 *     summary: Obtém informações de um mangá
 *     description: Retorna título, lista de capítulos e metadados de um mangá
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: URL da página do mangá
 *         example: https://mangalivre.to/manga/sakamoto-days/
 *     responses:
 *       200:
 *         description: Informações do mangá obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       400:
 *         description: URL inválida ou não suportada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function getMangaInfo(req: Request, res: Response): Promise<void> {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({
      error: 'Parâmetro obrigatório',
      message: 'O parâmetro "url" é obrigatório',
      example: '/api/manga/info?url=https://mangalivre.to/manga/sakamoto-days/'
    });
    return;
  }

  const handler = getMangaInfoHandler();
  const manga = await handler.execute({ url });
  
  res.json(manga);
}

/**
 * @swagger
 * /api/manga/chapter/pages:
 *   get:
 *     summary: Obtém as páginas de um capítulo
 *     description: Retorna as URLs de todas as imagens/páginas de um capítulo
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: URL do capítulo
 *         example: https://mangalivre.to/manga/sakamoto-days/capitulo-1/
 *     responses:
 *       200:
 *         description: Páginas do capítulo obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChapterContent'
 *       400:
 *         description: URL inválida ou não suportada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function getChapterPages(req: Request, res: Response): Promise<void> {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({
      error: 'Parâmetro obrigatório',
      message: 'O parâmetro "url" é obrigatório',
      example: '/api/manga/chapter/pages?url=https://mangalivre.to/manga/sakamoto-days/capitulo-1/'
    });
    return;
  }

  const handler = getChapterPagesHandler();
  const chapterContent = await handler.execute({ url });
  
  res.json(chapterContent);
}
