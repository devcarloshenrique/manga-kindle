import { http } from './http';
import type { Manga, ChapterContent } from './types';

export const mangaService = {
  async getInfo(url: string): Promise<Manga> {
    const response = await http.get<Manga>('/api/manga/info', {
      params: { url },
    });
    return response.data;
  },

  async getChapterPages(url: string): Promise<ChapterContent> {
    const response = await http.get<ChapterContent>('/api/manga/chapter/pages', {
      params: { url },
    });
    return response.data;
  },
};
