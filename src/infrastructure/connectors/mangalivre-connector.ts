import * as cheerio from 'cheerio';
import { BaseMangaConnector } from './base-connector.js';
import type { Manga, ChapterContent, Chapter, Page } from '../../domain/entities/index.js';
import type { ConnectorConfig } from '../../domain/interfaces/index.js';

/**
 * Conector para o site MangaLivre.to
 */
export class MangaLivreConnector extends BaseMangaConnector {
  readonly name = 'mangalivre';
  readonly displayName = 'Manga Livre';
  readonly baseUrl = 'https://mangalivre.to';
  readonly urlPattern = /mangalivre\.(to|net)\/manga\//;

  constructor(config: ConnectorConfig = {}) {
    super({
      headers: {
        'Referer': 'https://mangalivre.to/'
      },
      ...config
    });
    this.initHttpClient();
  }

  async getMangaInfo(mangaUrl: string): Promise<Manga> {
    // Normaliza URL
    const url = mangaUrl.endsWith('/') ? mangaUrl : `${mangaUrl}/`;
    
    const $ = await this.fetchAndParse(url);

    // Extrai título
    const title = $('h1').first().text().trim() || 'Manga Desconhecido';

    // Extrai slug da URL
    const slugMatch = url.match(/manga\/([^\/]+)/);
    const slug = slugMatch ? slugMatch[1] : 'unknown';

    // Extrai informações adicionais
    const author = $('a[href*="/manga-author/"]').first().text().trim() || undefined;
    const artist = $('a[href*="/artista/"]').first().text().trim() || undefined;
    
    // Extrai gêneros
    const genres: string[] = [];
    $('a[href*="/genero/"]').each((_, el) => {
      const genre = $(el).text().trim();
      if (genre && !genres.includes(genre)) {
        genres.push(genre);
      }
    });

    // Extrai status
    let status: Manga['status'] = 'unknown';
    const statusText = $('body').text().toLowerCase();
    if (statusText.includes('em andamento') || statusText.includes('ongoing')) {
      status = 'ongoing';
    } else if (statusText.includes('completo') || statusText.includes('completed')) {
      status = 'completed';
    }

    // Extrai descrição
    const description = $('.description, .summary, .desc').first().text().trim() || undefined;

    // Extrai capítulos
    const chapters: Chapter[] = [];
    const seenChapters = new Set<string>();

    $('a[href*="/capitulo-"]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      const chapterMatch = href.match(/capitulo-(\d+(?:\.\d+)?)/);
      if (chapterMatch) {
        const chapterNumber = chapterMatch[1];
        
        // Evita duplicatas
        if (!seenChapters.has(chapterNumber)) {
          seenChapters.add(chapterNumber);
          
          const chapterUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          const title = $(element).text().trim() || undefined;

          chapters.push({
            number: chapterNumber,
            url: chapterUrl,
            title
          });
        }
      }
    });

    // Ordena capítulos por número
    chapters.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

    return {
      title: this.sanitizeFileName(title),
      slug,
      url,
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

  async getChapterPages(chapterUrl: string): Promise<ChapterContent> {
    const url = chapterUrl.endsWith('/') ? chapterUrl : `${chapterUrl}/`;
    
    const $ = await this.fetchAndParse(url);

    // Extrai informações do capítulo da URL
    const mangaMatch = url.match(/manga\/([^\/]+)/);
    const chapterMatch = url.match(/capitulo-(\d+(?:\.\d+)?)/);
    
    const mangaSlug = mangaMatch ? mangaMatch[1] : 'unknown';
    const chapterNumber = chapterMatch ? chapterMatch[1] : '0';

    const pages: Page[] = [];
    const seenUrls = new Set<string>();

    // Procura por imagens do mangá (padrão WP-Manga)
    $('img').each((index, element) => {
      let src = $(element).attr('src') || 
                $(element).attr('data-src') || 
                $(element).attr('data-lazy-src');
      
      if (src) {
        src = src.trim(); // Remove espaços em branco
        if (src.includes('WP-manga/data') && !seenUrls.has(src)) {
          seenUrls.add(src);
          pages.push({
            number: pages.length + 1,
            url: src
          });
        }
      }
    });

    // Se não encontrou imagens nos atributos padrão, busca no HTML/JavaScript
    if (pages.length === 0) {
      const html = $.html();
      const imageMatches = html.match(/https?:\/\/[^"'\s]+WP-manga\/data\/[^"'\s]+\.(webp|jpg|jpeg|png)/gi);
      
      if (imageMatches) {
        imageMatches.forEach((imgUrl) => {
          const cleanUrl = imgUrl.trim(); // Remove espaços em branco
          if (!seenUrls.has(cleanUrl)) {
            seenUrls.add(cleanUrl);
            pages.push({
              number: pages.length + 1,
              url: cleanUrl
            });
          }
        });
      }
    }

    // Ordena páginas por número no nome do arquivo
    pages.sort((a, b) => {
      const numA = parseInt(a.url.match(/(\d+)\.(webp|jpg|jpeg|png)$/i)?.[1] || '0');
      const numB = parseInt(b.url.match(/(\d+)\.(webp|jpg|jpeg|png)$/i)?.[1] || '0');
      return numA - numB;
    });

    // Renumera após ordenação
    pages.forEach((page, index) => {
      page.number = index + 1;
    });

    return {
      mangaSlug,
      chapterNumber,
      url,
      totalPages: pages.length,
      pages
    };
  }
}
