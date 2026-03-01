import type { Manga, ChapterContent } from '../entities/index.js';

/**
 * Interface para conectores de sites de mangá
 * Cada site deve implementar essa interface
 */
export interface IMangaConnector {
  /**
   * Identificador único do conector
   */
  readonly name: string;

  /**
   * Nome amigável para exibição
   */
  readonly displayName: string;

  /**
   * URL base do site
   */
  readonly baseUrl: string;

  /**
   * Padrão de URL para identificar se uma URL pertence a este conector
   */
  readonly urlPattern: RegExp;

  /**
   * Verifica se uma URL é suportada por este conector
   */
  supportsUrl(url: string): boolean;

  /**
   * Obtém informações completas de um mangá
   * @param mangaUrl URL da página do mangá
   */
  getMangaInfo(mangaUrl: string): Promise<Manga>;

  /**
   * Obtém as páginas (imagens) de um capítulo
   * @param chapterUrl URL do capítulo
   */
  getChapterPages(chapterUrl: string): Promise<ChapterContent>;

  /**
   * Baixa uma imagem e retorna como Buffer
   * @param imageUrl URL da imagem
   */
  downloadImage(imageUrl: string): Promise<Buffer>;
}

/**
 * Configurações para um conector
 */
export interface ConnectorConfig {
  /**
   * Headers HTTP customizados
   */
  headers?: Record<string, string>;

  /**
   * Timeout para requisições em ms
   */
  timeout?: number;

  /**
   * Máximo de requisições por minuto
   */
  maxRequestsPerMinute?: number;

  /**
   * Delay mínimo entre requisições em ms
   */
  minDelayBetweenRequests?: number;
}
