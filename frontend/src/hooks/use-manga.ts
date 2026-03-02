import { useState, useCallback } from 'react';
import { mangaService } from '@/services';
import type { Manga, ChapterContent } from '@/services/types';

export function useManga() {
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMangaInfo = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mangaService.getInfo(url);
      setManga(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar manga';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChapterPages = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mangaService.getChapterPages(url);
      setChapterContent(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar paginas';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setManga(null);
    setChapterContent(null);
    setError(null);
  }, []);

  return {
    manga,
    chapterContent,
    loading,
    error,
    fetchMangaInfo,
    fetchChapterPages,
    reset,
  };
}
