import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDownloadRepository } from '../../../src/infrastructure/repositories/download-repository.js';
import type { Download } from '../../../src/domain/entities/download.js';

describe('InMemoryDownloadRepository', () => {
  let repository: InMemoryDownloadRepository;

  beforeEach(() => {
    repository = new InMemoryDownloadRepository();
  });

  describe('create', () => {
    it('should save a new download', async () => {
      const download: Download = {
        id: 'test-1',
        mangaUrl: 'https://example.com/manga/test',
        mangaTitle: 'Test Manga',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download);
      const found = await repository.findById('test-1');
      
      expect(found).toBeDefined();
      expect(found?.id).toBe('test-1');
      expect(found?.mangaTitle).toBe('Test Manga');
    });
  });

  describe('update', () => {
    it('should update an existing download', async () => {
      const download: Download = {
        id: 'test-2',
        mangaUrl: 'https://example.com/manga/test',
        mangaTitle: 'Test Manga',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download);
      
      // Update download
      download.status = 'downloading';
      download.progress.currentChapter = '5';
      download.progress.chaptersCompleted = 4;
      await repository.update(download);

      const found = await repository.findById('test-2');
      expect(found?.status).toBe('downloading');
      expect(found?.progress.currentChapter).toBe('5');
      expect(found?.progress.chaptersCompleted).toBe(4);
    });

    it('should deep clone the download to avoid reference issues', async () => {
      const download: Download = {
        id: 'test-3',
        mangaUrl: 'https://example.com/manga/test',
        mangaTitle: 'Test Manga',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download);
      
      // Modify the original object
      download.progress.chaptersCompleted = 100;
      download.status = 'completed';

      // Retrieved download should not be affected
      const found = await repository.findById('test-3');
      expect(found?.progress.chaptersCompleted).toBe(0);
      expect(found?.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent download', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });

    it('should return deep clone of download', async () => {
      const download: Download = {
        id: 'test-4',
        mangaUrl: 'https://example.com/manga/test',
        mangaTitle: 'Test Manga',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download);
      const found1 = await repository.findById('test-4');
      const found2 = await repository.findById('test-4');

      // Should be equal but not the same reference
      expect(found1).toEqual(found2);
      expect(found1).not.toBe(found2);
      
      // Modifying one shouldn't affect the other
      found1!.progress.chaptersCompleted = 5;
      expect(found2!.progress.chaptersCompleted).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no downloads exist', async () => {
      const all = await repository.findAll();
      expect(all).toEqual([]);
    });

    it('should return all downloads', async () => {
      const download1: Download = {
        id: 'test-5',
        mangaUrl: 'https://example.com/manga/test-1',
        mangaTitle: 'Test Manga 1',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      const download2: Download = {
        id: 'test-6',
        mangaUrl: 'https://example.com/manga/test-2',
        mangaTitle: 'Test Manga 2',
        source: 'test-source',
        status: 'downloading',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 1,
          totalChapters: 5,
          currentChapter: '2',
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 20,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download1);
      await repository.create(download2);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(all.find(d => d.id === 'test-5')).toBeDefined();
      expect(all.find(d => d.id === 'test-6')).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should remove a download', async () => {
      const download: Download = {
        id: 'test-7',
        mangaUrl: 'https://example.com/manga/test',
        mangaTitle: 'Test Manga',
        source: 'test-source',
        status: 'pending',
        startedAt: new Date(),
        progress: {
          chaptersCompleted: 0,
          totalChapters: 10,
          currentChapter: null,
          currentChapterImages: 0,
          totalChapterImages: 0,
          percentage: 0,
        },
        results: [],
        errors: [],
        outputDirectory: '/test/output',
      };

      await repository.create(download);
      expect(await repository.findById('test-7')).toBeDefined();

      await repository.delete('test-7');
      expect(await repository.findById('test-7')).toBeNull();
    });

    it('should not throw error when deleting non-existent download', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });
});
