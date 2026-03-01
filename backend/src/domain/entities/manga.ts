/**
 * Entity: Chapter
 * Representa um capítulo de mangá
 */
export interface Chapter {
  number: string;
  url: string;
  title?: string;
  publishedAt?: string;
}

/**
 * Entity: Manga
 * Representa um mangá com suas informações básicas
 */
export interface Manga {
  title: string;
  slug: string;
  url: string;
  source: string;
  alternativeTitles?: string[];
  author?: string;
  artist?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus' | 'unknown';
  description?: string;
  coverUrl?: string;
  totalChapters: number;
  chapters: Chapter[];
}

/**
 * Entity: Page
 * Representa uma página de um capítulo
 */
export interface Page {
  number: number;
  url: string;
  width?: number;
  height?: number;
}

/**
 * Entity: ChapterContent
 * Representa o conteúdo completo de um capítulo com suas páginas
 */
export interface ChapterContent {
  mangaSlug: string;
  chapterNumber: string;
  url: string;
  totalPages: number;
  pages: Page[];
}
