import { useCallback, useEffect, useState } from 'react';
import { libraryService } from '@/services/library.service';
import type {
  LibraryListMangasQuery,
  LibraryManga,
  LibraryMangaDetails,
  LibraryStats,
} from '@/services';

export function useLibrary(initialQuery: LibraryListMangasQuery = {}) {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [mangas, setMangas] = useState<LibraryManga[]>([]);
  const [selectedManga, setSelectedManga] = useState<LibraryMangaDetails | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<LibraryListMangasQuery>(initialQuery);

  const fetchStats = useCallback(async () => {
    try {
      const data = await libraryService.getStats();
      setStats(data);
    } catch (err) {
      console.error('[Library] fetchStats', err);
    }
  }, []);

  const fetchMangas = useCallback(async (nextQuery?: LibraryListMangasQuery) => {
    setLoading(true);
    setError(null);

    try {
      const resolvedQuery = nextQuery ?? query;
      const response = await libraryService.listMangas(resolvedQuery);
      setMangas(response.mangas);
      setMeta(response.meta);
      setQuery(resolvedQuery);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao buscar biblioteca';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const fetchMangaDetails = useCallback(async (slug: string) => {
    try {
      const details = await libraryService.getManga(slug);
      setSelectedManga(details);
      return details;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar detalhes do manga';
      setError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchMangas(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stats,
    mangas,
    selectedManga,
    meta,
    loading,
    error,
    query,
    setQuery,
    setSelectedManga,
    fetchStats,
    fetchMangas,
    fetchMangaDetails,
  };
}
