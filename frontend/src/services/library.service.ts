import { http } from './http';
import type {
  ApiEnvelope,
  LibraryChapter,
  LibraryListMangasQuery,
  LibraryListMangasResponse,
  LibraryManga,
  LibraryMangaDetails,
  LibraryStats,
} from './types';

export interface LibraryPageRef {
  index: number;
  name: string;
  url: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.error) {
    throw new Error(envelope.error.message || 'Erro ao processar resposta da API');
  }
  return envelope.data;
}

export const libraryService = {
  async getStats(): Promise<LibraryStats> {
    const response = await http.get<ApiEnvelope<LibraryStats>>('/api/library/stats');
    return unwrap(response.data);
  },

  async listMangas(query: LibraryListMangasQuery = {}): Promise<LibraryListMangasResponse> {
    const params: Record<string, string | number | boolean> = {};

    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.search) params.search = query.search;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.order) params.order = query.order;
    if (query.status) params.status = query.status;
    if (query.language) params.language = query.language;
    if (typeof query.hasConverted === 'boolean') params.hasConverted = query.hasConverted;

    const response = await http.get<ApiEnvelope<LibraryManga[]>>('/api/library/mangas', {
      params,
    });

    return {
      mangas: unwrap(response.data),
      meta: response.data.meta,
    };
  },

  async getManga(slug: string): Promise<LibraryMangaDetails> {
    const response = await http.get<ApiEnvelope<LibraryMangaDetails>>(`/api/library/mangas/${slug}`);
    return unwrap(response.data);
  },

  async getChapter(slug: string, chapter: string): Promise<LibraryChapter> {
    const response = await http.get<ApiEnvelope<LibraryChapter>>(
      `/api/library/mangas/${slug}/chapters/${encodeURIComponent(chapter)}`,
    );
    return unwrap(response.data);
  },

  async deleteManga(slug: string): Promise<{ message: string; deleted: boolean }> {
    const response = await http.delete<ApiEnvelope<{ message: string; deleted: boolean }>>(
      `/api/library/mangas/${slug}`,
    );
    return unwrap(response.data);
  },

  /** Returns ordered page references for a chapter. */
  async getChapterPages(slug: string, chapter: string): Promise<LibraryPageRef[]> {
    const response = await http.get<ApiEnvelope<LibraryPageRef[]>>(
      `/api/library/mangas/${slug}/chapters/${encodeURIComponent(chapter)}/pages`,
    );
    return unwrap(response.data);
  },

  /** Updates library manga metadata (lastReadChapter, lastReadAt, etc.). */
  async updateManga(slug: string, body: Record<string, unknown>): Promise<LibraryMangaDetails> {
    const response = await http.patch<ApiEnvelope<LibraryMangaDetails>>(
      `/api/library/mangas/${slug}`,
      body,
    );
    return unwrap(response.data);
  },
};
