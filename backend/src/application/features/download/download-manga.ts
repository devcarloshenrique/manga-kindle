import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import { ConnectorRegistry } from '../../../infrastructure/connectors/index.js';
import { InMemoryDownloadRepository } from '../../../infrastructure/repositories/index.js';
import { convertImage, type ImageFormat } from '../../../infrastructure/utils/index.js';
import type { Download, DownloadResult, DownloadError, Chapter, Page } from '../../../domain/entities/index.js';

/**
 * Schema de validação para a request
 */
export const DownloadMangaRequestSchema = z.object({
  url: z.string().url('URL inválida'),
  outputDir: z.string().default('./downloads'),
  startChapter: z.number().positive().default(1),
  endChapter: z.number().positive().optional(), // Se não informado, baixa todos
  imageFormat: z.enum(['original', 'webp', 'jpeg', 'jpg', 'png']).default('original'),
  language: z.string().optional() // Para conectores que suportam múltiplos idiomas (ex: MangaDex)
});

export type DownloadMangaRequest = z.infer<typeof DownloadMangaRequestSchema>;

/**
 * Response imediata do início do download
 */
export interface DownloadMangaResponse {
  downloadId: string;
  message: string;
  statusUrl: string;
}

/**
 * Callbacks para progresso
 */
export interface DownloadCallbacks {
  onChapterStart?: (chapterNumber: string, current: number, total: number) => void;
  onChapterComplete?: (chapterNumber: string, result: DownloadResult) => void;
  onProgress?: (chapterNumber: string, currentImage: number, totalImages: number) => void;
  onError?: (chapterNumber: string, error: Error) => void;
  onComplete?: (download: Download) => void;
}

/**
 * Handler do caso de uso DownloadManga
 */
export class DownloadMangaHandler {
  private repository: InMemoryDownloadRepository;

  constructor(repository?: InMemoryDownloadRepository) {
    this.repository = repository || new InMemoryDownloadRepository();
  }

  /**
   * Inicia o download de forma assíncrona e retorna o ID
   */
  async start(request: DownloadMangaRequest, callbacks?: DownloadCallbacks): Promise<DownloadMangaResponse> {
    // Valida request
    const validated = DownloadMangaRequestSchema.parse(request);

    // Encontra o conector
    const connector = ConnectorRegistry.getInstance().findByUrl(validated.url);
    if (!connector) {
      throw new Error('Nenhum conector disponível para esta URL');
    }

    // Gera ID único
    const downloadId = this.generateId();

    // Obtém informações do mangá
    const manga = await connector.getMangaInfo(validated.url);

    // Cria registro do download
    const download: Download = {
      id: downloadId,
      mangaUrl: validated.url,
      mangaTitle: manga.title,
      source: connector.name,
      status: 'pending',
      startedAt: new Date(),
      progress: {
        chaptersCompleted: 0,
        totalChapters: 0,
        currentChapter: null,
        currentChapterImages: 0,
        totalChapterImages: 0,
        percentage: 0
      },
      results: [],
      errors: [],
      outputDirectory: path.join(validated.outputDir, manga.title)
    };

    await this.repository.create(download);

    // Inicia download em background (sem await para não bloquear)
    this.executeDownload(download, manga.chapters, validated, connector, callbacks)
      .catch(error => {
        console.error(`[Download ${downloadId}] Erro fatal:`, error);
      });

    return {
      downloadId,
      message: 'Download iniciado',
      statusUrl: `/api/downloads/${downloadId}`
    };
  }

  /**
   * Executa o download de forma assíncrona
   */
  private async executeDownload(
    download: Download,
    chapters: Chapter[],
    options: z.infer<typeof DownloadMangaRequestSchema>,
    connector: ReturnType<typeof ConnectorRegistry.getInstance.prototype.findByUrl>,
    callbacks?: DownloadCallbacks
  ): Promise<void> {
    if (!connector) return;

    console.log(`[Download ${download.id}] Iniciando download de ${download.mangaTitle}`);

    try {
      // Filtra capítulos pelo range
      const chaptersToDownload = chapters.filter(ch => {
        const num = parseFloat(ch.number);
        return num >= options.startChapter && 
               (!options.endChapter || num <= options.endChapter);
      });

      console.log(`[Download ${download.id}] ${chaptersToDownload.length} capítulos para baixar`);

      download.status = 'downloading';
      download.progress.totalChapters = chaptersToDownload.length;
      await this.repository.update(download);

      // Cria diretório do mangá
      await fs.mkdir(download.outputDirectory, { recursive: true });

      // Salva info.json
      await fs.writeFile(
        path.join(download.outputDirectory, 'info.json'),
        JSON.stringify({ title: download.mangaTitle, url: download.mangaUrl, source: download.source }, null, 2)
      );

      // Download sequencial dos capítulos
      for (let i = 0; i < chaptersToDownload.length; i++) {
        const chapter = chaptersToDownload[i];
        
        console.log(`[Download ${download.id}] Baixando capítulo ${chapter.number} (${i + 1}/${chaptersToDownload.length})`);
        
        download.progress.currentChapter = chapter.number;
        await this.repository.update(download);

        callbacks?.onChapterStart?.(chapter.number, i + 1, chaptersToDownload.length);

        try {
          const result = await this.downloadChapter(
            connector,
            chapter,
            download.outputDirectory,
            options.imageFormat as ImageFormat,
            (current: number, total: number) => {
              download.progress.currentChapterImages = current;
              download.progress.totalChapterImages = total;
              this.repository.update(download); // Atualiza progresso das imagens
              callbacks?.onProgress?.(chapter.number, current, total);
            }
          );

          console.log(`[Download ${download.id}] Capítulo ${chapter.number} concluído - ${result.imagesDownloaded} imagens`);

          download.results.push(result);
          download.progress.chaptersCompleted++;
          download.progress.percentage = Math.round(
            (download.progress.chaptersCompleted / download.progress.totalChapters) * 100
          );
          await this.repository.update(download);

          callbacks?.onChapterComplete?.(chapter.number, result);

          // Delay entre capítulos
          await this.sleep(1500);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`[Download ${download.id}] Erro no capítulo ${chapter.number}:`, errorMessage);
          
          download.errors.push({
            chapter: chapter.number,
            error: errorMessage
          });
          await this.repository.update(download);

          callbacks?.onError?.(chapter.number, error instanceof Error ? error : new Error(errorMessage));
        }
      }

      // Finaliza download
      download.status = 'completed';
      download.completedAt = new Date();
      await this.repository.update(download);

      console.log(`[Download ${download.id}] Concluído! ${download.results.length} capítulos baixados.`);

      callbacks?.onComplete?.(download);

    } catch (error) {
      console.error(`[Download ${download.id}] Erro fatal:`, error);
      download.status = 'failed';
      download.completedAt = new Date();
      await this.repository.update(download);
      throw error;
    }
  }

  /**
   * Baixa um único capítulo
   */
  private async downloadChapter(
    connector: NonNullable<ReturnType<typeof ConnectorRegistry.getInstance.prototype.findByUrl>>,
    chapter: Chapter,
    outputDir: string,
    imageFormat: ImageFormat = 'original',
    onProgress?: (current: number, total: number) => void
  ): Promise<DownloadResult> {
    // Obtém páginas do capítulo
    const content = await connector.getChapterPages(chapter.url);

    if (content.pages.length === 0) {
      throw new Error(`Nenhuma página encontrada no capítulo ${chapter.number}`);
    }

    // Cria diretório do capítulo
    const chapterDir = path.join(outputDir, `Capitulo_${chapter.number.padStart(4, '0')}`);
    await fs.mkdir(chapterDir, { recursive: true });

    // Download com limite de concorrência
    const limit = pLimit(3);
    let downloaded = 0;

    const downloadPromises = content.pages.map((page: Page) => {
      return limit(async () => {
        const imageBuffer = await connector.downloadImage(page.url);
        
        // Converte a imagem se necessário
        const { buffer, extension } = await convertImage(imageBuffer, { format: imageFormat });
        
        const fileName = `${String(page.number).padStart(3, '0')}${extension}`;
        const filePath = path.join(chapterDir, fileName);

        await fs.writeFile(filePath, buffer);

        downloaded++;
        onProgress?.(downloaded, content.pages.length);
      });
    });

    await Promise.all(downloadPromises);

    return {
      chapter: chapter.number,
      imagesDownloaded: downloaded,
      directory: chapterDir
    };
  }

  /**
   * Obtém status de um download
   */
  async getStatus(downloadId: string): Promise<Download | null> {
    return this.repository.findById(downloadId);
  }

  /**
   * Lista todos os downloads
   */
  async listDownloads(): Promise<Download[]> {
    return this.repository.findAll();
  }

  /**
   * Cancela um download (não implementado completamente)
   */
  async cancel(downloadId: string): Promise<void> {
    const download = await this.repository.findById(downloadId);
    if (download && download.status === 'downloading') {
      download.status = 'cancelled';
      download.completedAt = new Date();
      await this.repository.update(download);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton com repositório compartilhado
const sharedRepository = new InMemoryDownloadRepository();
let handler: DownloadMangaHandler | null = null;

export function getHandler(): DownloadMangaHandler {
  if (!handler) {
    handler = new DownloadMangaHandler(sharedRepository);
  }
  return handler;
}

export function getRepository(): InMemoryDownloadRepository {
  return sharedRepository;
}
