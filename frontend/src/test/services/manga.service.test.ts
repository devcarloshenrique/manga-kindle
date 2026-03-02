import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mangaService } from '@/services/manga.service';
import { http } from '@/services/http';
import type { Manga, ChapterContent } from '@/services/types';

vi.mock('@/services/http', () => ({
  http: {
    get: vi.fn(),
  },
}));

const mockManga: Manga = {
  title: 'One Piece',
  slug: 'one-piece',
  url: 'https://mangalivre.to/manga/one-piece',
  source: 'mangalivre',
  totalChapters: 1100,
  chapters: [
    { number: '1', url: 'https://mangalivre.to/manga/one-piece/1' },
    { number: '2', url: 'https://mangalivre.to/manga/one-piece/2' },
  ],
  author: 'Eiichiro Oda',
  genres: ['Action', 'Adventure'],
  status: 'ongoing',
  description: 'A story about pirates',
};

const mockChapterContent: ChapterContent = {
  mangaSlug: 'one-piece',
  chapterNumber: '1',
  url: 'https://mangalivre.to/manga/one-piece/1',
  totalPages: 3,
  pages: [
    { number: 1, url: 'https://cdn.example.com/page1.jpg' },
    { number: 2, url: 'https://cdn.example.com/page2.jpg' },
    { number: 3, url: 'https://cdn.example.com/page3.jpg' },
  ],
};

describe('mangaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInfo', () => {
    it('fetches manga info with correct URL parameter', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: mockManga });

      const result = await mangaService.getInfo('https://mangalivre.to/manga/one-piece');

      expect(http.get).toHaveBeenCalledWith('/api/manga/info', {
        params: { url: 'https://mangalivre.to/manga/one-piece' },
      });
      expect(result).toEqual(mockManga);
      expect(result.title).toBe('One Piece');
      expect(result.chapters).toHaveLength(2);
    });

    it('throws error when request fails', async () => {
      vi.mocked(http.get).mockRejectedValue(new Error('Network Error'));

      await expect(
        mangaService.getInfo('https://invalid.url'),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('getChapterPages', () => {
    it('fetches chapter pages with correct URL parameter', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: mockChapterContent });

      const result = await mangaService.getChapterPages(
        'https://mangalivre.to/manga/one-piece/1',
      );

      expect(http.get).toHaveBeenCalledWith('/api/manga/chapter/pages', {
        params: { url: 'https://mangalivre.to/manga/one-piece/1' },
      });
      expect(result).toEqual(mockChapterContent);
      expect(result.pages).toHaveLength(3);
      expect(result.totalPages).toBe(3);
    });
  });
});
