import { BaseMangaConnector } from './base-connector.js';
import type { Manga, ChapterContent, Chapter, Page } from '../../domain/entities/index.js';
import type { ConnectorConfig } from '../../domain/interfaces/index.js';

/**
 * Configuração específica do MangaDex
 */
export interface MangaDexConfig extends ConnectorConfig {
  /**
   * Idioma preferido para busca de capítulos
   * Códigos ISO 639-1: 'pt-br', 'en', 'es', 'ja', etc.
   * Default: 'pt-br'
   */
  language?: string;
  
  /**
   * Idiomas alternativos se o preferido não estiver disponível
   */
  fallbackLanguages?: string[];
}

/**
 * Interfaces para resposta da API MangaDex
 */
interface MangaDexMangaResponse {
  result: string;
  data: {
    id: string;
    type: string;
    attributes: {
      title: Record<string, string>;
      altTitles: Array<Record<string, string>>;
      description: Record<string, string>;
      status: string;
      year: number | null;
      tags: Array<{
        id: string;
        type: string;
        attributes: {
          name: Record<string, string>;
        };
      }>;
    };
    relationships: Array<{
      id: string;
      type: string;
      attributes?: {
        name?: string;
        fileName?: string;
      };
    }>;
  };
}

interface MangaDexChapterListResponse {
  result: string;
  data: Array<{
    id: string;
    type: string;
    attributes: {
      volume: string | null;
      chapter: string | null;
      title: string | null;
      translatedLanguage: string;
      pages: number;
      publishAt: string;
    };
    relationships: Array<{
      id: string;
      type: string;
    }>;
  }>;
  limit: number;
  offset: number;
  total: number;
}

interface MangaDexChapterPagesResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

/**
 * Conector para o site MangaDex
 * API oficial: https://api.mangadex.org
 */
export class MangaDexConnector extends BaseMangaConnector {
  readonly name = 'mangadex';
  readonly displayName = 'MangaDex';
  readonly baseUrl = 'https://mangadex.org';
  readonly apiUrl = 'https://api.mangadex.org';
  readonly urlPattern = /mangadex\.org\/(title|manga|chapter)\//;

  private language: string;
  private fallbackLanguages: string[];

  /**
   * Lista de idiomas suportados pelo MangaDex
   */
  static readonly SUPPORTED_LANGUAGES = [
    'pt-br', 'en', 'es', 'es-la', 'ja', 'ko', 'zh', 'zh-hk', 
    'fr', 'de', 'it', 'ru', 'pl', 'tr', 'ar', 'th', 'vi', 'id'
  ];

  constructor(config: MangaDexConfig = {}) {
    super({
      headers: {
        'Accept': 'application/json',
      },
      ...config
    });

    this.language = config.language || 'pt-br';
    this.fallbackLanguages = config.fallbackLanguages || ['en'];

    this.initHttpClient();
  }

  /**
   * Define o idioma para busca de capítulos
   */
  setLanguage(language: string): void {
    if (!MangaDexConnector.SUPPORTED_LANGUAGES.includes(language)) {
      console.warn(`[MangaDex] Idioma '${language}' pode não estar disponível`);
    }
    this.language = language;
  }

  /**
   * Obtém o idioma atual
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Lista idiomas suportados
   */
  getSupportedLanguages(): string[] {
    return MangaDexConnector.SUPPORTED_LANGUAGES;
  }

  /**
   * Extrai o ID do mangá da URL
   */
  private extractMangaId(url: string): string | null {
    const match = url.match(/(?:title|manga)\/([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  }

  async getMangaInfo(mangaUrl: string): Promise<Manga> {
    const mangaId = this.extractMangaId(mangaUrl);
    if (!mangaId) {
      throw new Error('ID do mangá não encontrado na URL');
    }

    // Busca informações do mangá
    const mangaResponse = await this.httpClient.get<MangaDexMangaResponse>(
      `${this.apiUrl}/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`
    );

    if (mangaResponse.result !== 'ok') {
      throw new Error('Falha ao obter informações do mangá');
    }

    const mangaData = mangaResponse.data;
    const attributes = mangaData.attributes;

    // Extrai título (preferência: idioma atual > inglês > primeiro disponível)
    const title = this.getLocalizedString(attributes.title, this.language) ||
                  this.getLocalizedString(attributes.title, 'en') ||
                  Object.values(attributes.title)[0] ||
                  'Título Desconhecido';

    // Extrai autor e artista
    const authorRel = mangaData.relationships.find(r => r.type === 'author');
    const artistRel = mangaData.relationships.find(r => r.type === 'artist');
    const author = authorRel?.attributes?.name;
    const artist = artistRel?.attributes?.name;

    // Extrai gêneros/tags
    const genres = attributes.tags
      .filter(tag => tag.attributes?.name)
      .map(tag => this.getLocalizedString(tag.attributes.name, 'en') || Object.values(tag.attributes.name)[0])
      .filter((g): g is string => !!g);

    // Extrai descrição
    const description = this.getLocalizedString(attributes.description, this.language) ||
                        this.getLocalizedString(attributes.description, 'en');

    // Mapeia status
    const statusMap: Record<string, Manga['status']> = {
      'ongoing': 'ongoing',
      'completed': 'completed',
      'hiatus': 'ongoing',
      'cancelled': 'completed'
    };
    const status = statusMap[attributes.status] || 'unknown';

    // Busca capítulos
    const chapters = await this.fetchAllChapters(mangaId);

    return {
      title: this.sanitizeFileName(title),
      slug: mangaId,
      url: mangaUrl,
      source: this.name,
      author,
      artist,
      genres: genres.length > 0 ? genres : undefined,
      status,
      description,
      totalChapters: chapters.length,
      chapters
    };
  }

  /**
   * Busca todos os capítulos do mangá
   */
  private async fetchAllChapters(mangaId: string): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    const seenChapters = new Set<string>();
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    // Constrói lista de idiomas para buscar
    const languages = [this.language, ...this.fallbackLanguages.filter(l => l !== this.language)];
    const languageParam = languages.map(l => `translatedLanguage[]=${l}`).join('&');

    while (hasMore) {
      const response = await this.httpClient.get<MangaDexChapterListResponse>(
        `${this.apiUrl}/manga/${mangaId}/feed?${languageParam}&limit=${limit}&offset=${offset}&order[chapter]=asc&includes[]=scanlation_group`
      );

      if (response.result !== 'ok' || !response.data.length) {
        hasMore = false;
        continue;
      }

      for (const chapter of response.data) {
        const chapterNum = chapter.attributes.chapter;
        if (!chapterNum) continue;

        // Prioriza idioma preferido
        const key = chapterNum;
        if (seenChapters.has(key)) {
          // Verifica se o capítulo existente é do idioma preferido
          const existing = chapters.find(c => c.number === chapterNum);
          if (existing && chapter.attributes.translatedLanguage === this.language) {
            // Substitui pelo idioma preferido
            const index = chapters.indexOf(existing);
            chapters[index] = {
              number: chapterNum,
              url: `${this.baseUrl}/chapter/${chapter.id}`,
              title: chapter.attributes.title || undefined
            };
          }
          continue;
        }

        seenChapters.add(key);
        chapters.push({
          number: chapterNum,
          url: `${this.baseUrl}/chapter/${chapter.id}`,
          title: chapter.attributes.title || undefined
        });
      }

      offset += limit;
      hasMore = offset < response.total;

      // Delay para não sobrecarregar a API
      if (hasMore) {
        await this.sleep(300);
      }
    }

    // Ordena capítulos por número
    chapters.sort((a, b) => {
      const numA = parseFloat(a.number);
      const numB = parseFloat(b.number);
      return numA - numB;
    });

    return chapters;
  }

  async getChapterPages(chapterUrl: string): Promise<ChapterContent> {
    // Extrai ID do capítulo da URL
    const chapterMatch = chapterUrl.match(/chapter\/([a-f0-9-]{36})/i);
    if (!chapterMatch) {
      throw new Error('ID do capítulo não encontrado na URL');
    }

    const chapterId = chapterMatch[1];

    // Busca informações do capítulo para obter o número
    const chapterInfoResponse = await this.httpClient.get<{ result: string; data: MangaDexChapterListResponse['data'][0] }>(
      `${this.apiUrl}/chapter/${chapterId}?includes[]=manga`
    );

    if (chapterInfoResponse.result !== 'ok') {
      throw new Error('Falha ao obter informações do capítulo');
    }

    const chapterNumber = chapterInfoResponse.data.attributes.chapter || '0';
    const mangaRel = chapterInfoResponse.data.relationships.find(r => r.type === 'manga');
    const mangaSlug = mangaRel?.id || 'unknown';

    // Busca as páginas do capítulo
    const response = await this.httpClient.get<MangaDexChapterPagesResponse>(
      `${this.apiUrl}/at-home/server/${chapterId}`
    );

    if (response.result !== 'ok') {
      throw new Error('Falha ao obter páginas do capítulo');
    }

    const { baseUrl, chapter } = response;
    
    // Usa imagens de qualidade original (data) ao invés de comprimidas (dataSaver)
    const pages: Page[] = chapter.data.map((filename, index) => ({
      number: index + 1,
      url: `${baseUrl}/data/${chapter.hash}/${filename}`
    }));

    return {
      mangaSlug,
      chapterNumber,
      url: chapterUrl,
      totalPages: pages.length,
      pages
    };
  }

  /**
   * Obtém string localizada de um objeto de traduções
   */
  private getLocalizedString(obj: Record<string, string> | undefined, language: string): string | undefined {
    if (!obj) return undefined;
    return obj[language];
  }

  /**
   * Utilitário para delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
