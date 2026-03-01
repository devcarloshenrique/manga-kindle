import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import { ConnectorRegistry } from '../../../infrastructure/connectors/index.js';
import type { DownloadResult, Page } from '../../../domain/entities/index.js';

/**
 * Schema de validação para a request
 */
export const DownloadChapterRequestSchema = z.object({
  url: z.string().url('URL inválida'),
  outputDir: z.string().default('./downloads')
});

export type DownloadChapterRequest = z.infer<typeof DownloadChapterRequestSchema>;

/**
 * Response do download de capítulo
 */
export interface DownloadChapterResponse extends DownloadResult {
  mangaSlug: string;
}

/**
 * Callbacks para progresso
 */
export interface ChapterDownloadCallbacks {
  onProgress?: (current: number, total: number, fileName: string) => void;
}

/**
 * Handler do caso de uso DownloadChapter
 */
export class DownloadChapterHandler {
  async execute(
    request: DownloadChapterRequest, 
    callbacks?: ChapterDownloadCallbacks
  ): Promise<DownloadChapterResponse> {
    // Valida request
    const validated = DownloadChapterRequestSchema.parse(request);

    // Encontra o conector
    const connector = ConnectorRegistry.getInstance().findByUrl(validated.url);
    if (!connector) {
      throw new Error('Nenhum conector disponível para esta URL');
    }

    // Obtém páginas do capítulo
    const content = await connector.getChapterPages(validated.url);

    if (content.pages.length === 0) {
      throw new Error(`Nenhuma página encontrada neste capítulo`);
    }

    // Cria diretório de saída
    const chapterDir = path.join(
      validated.outputDir, 
      content.mangaSlug, 
      `Capitulo_${content.chapterNumber.padStart(4, '0')}`
    );
    await fs.mkdir(chapterDir, { recursive: true });

    // Download com limite de concorrência
    const limit = pLimit(3);
    let downloaded = 0;

    const downloadPromises = content.pages.map((page: Page) => {
      return limit(async () => {
        const ext = path.extname(page.url).split('?')[0] || '.webp';
        const fileName = `${String(page.number).padStart(3, '0')}${ext}`;
        const filePath = path.join(chapterDir, fileName);

        const imageBuffer = await connector.downloadImage(page.url);
        await fs.writeFile(filePath, imageBuffer);

        downloaded++;
        callbacks?.onProgress?.(downloaded, content.pages.length, fileName);
      });
    });

    await Promise.all(downloadPromises);

    return {
      mangaSlug: content.mangaSlug,
      chapter: content.chapterNumber,
      imagesDownloaded: downloaded,
      directory: chapterDir
    };
  }
}

// Singleton do handler
let handler: DownloadChapterHandler | null = null;

export function getHandler(): DownloadChapterHandler {
  if (!handler) {
    handler = new DownloadChapterHandler();
  }
  return handler;
}
