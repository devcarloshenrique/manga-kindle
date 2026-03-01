import * as cheerio from 'cheerio';
import type { IMangaConnector, ConnectorConfig } from '../../domain/interfaces/index.js';
import type { Manga, ChapterContent, Chapter, Page } from '../../domain/entities/index.js';
import { HttpClient } from '../http/index.js';

/**
 * Conector base abstrato para sites de mangá
 * Fornece funcionalidades comuns e define a estrutura
 */
export abstract class BaseMangaConnector implements IMangaConnector {
  protected httpClient!: HttpClient;
  protected config: ConnectorConfig;

  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly baseUrl: string;
  abstract readonly urlPattern: RegExp;

  constructor(config: ConnectorConfig = {}) {
    this.config = {
      timeout: 30000,
      maxRequestsPerMinute: 30,
      minDelayBetweenRequests: 1000,
      ...config
    };
  }

  /**
   * Inicializa o cliente HTTP - deve ser chamado após a construção
   */
  protected initHttpClient(): void {
    this.httpClient = new HttpClient({
      source: this.name,
      baseUrl: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Referer': this.baseUrl,
        ...this.config.headers
      }
    });
  }

  supportsUrl(url: string): boolean {
    return this.urlPattern.test(url);
  }

  abstract getMangaInfo(mangaUrl: string): Promise<Manga>;
  abstract getChapterPages(chapterUrl: string): Promise<ChapterContent>;

  async downloadImage(imageUrl: string): Promise<Buffer> {
    return this.httpClient.getBuffer(imageUrl);
  }

  /**
   * Utilitário para carregar HTML com Cheerio
   */
  protected async fetchAndParse(url: string): Promise<cheerio.CheerioAPI> {
    const html = await this.httpClient.get<string>(url);
    return cheerio.load(html);
  }

  /**
   * Sanitiza nome de arquivo removendo caracteres inválidos
   */
  protected sanitizeFileName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrai número do capítulo de uma string
   */
  protected extractChapterNumber(text: string): string | null {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? match[1] : null;
  }

  /**
   * Obtém estatísticas do rate limiter
   */
  getStats() {
    return this.httpClient.getStats();
  }
}
