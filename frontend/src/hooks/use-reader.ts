import { useEffect, useState } from 'react';
import { libraryService } from '@/services/library.service';
import type { LibraryMangaDetails, LibraryPageRef } from '@/services';

interface UseReaderResult {
  manga: LibraryMangaDetails | null;
  pages: LibraryPageRef[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads manga details and the page list for a given chapter.
 * The chapter is identified by its name within the manga's chapter list.
 */
export function useReader(
  slug: string | undefined,
  chapterName: string | undefined,
): UseReaderResult {
  const [manga, setManga] = useState<LibraryMangaDetails | null>(null);
  const [pages, setPages] = useState<LibraryPageRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !chapterName) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [details, chapterPages] = await Promise.all([
          libraryService.getManga(slug!),
          libraryService.getChapterPages(slug!, chapterName!),
        ]);
        if (active) {
          setManga(details);
          setPages(chapterPages);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar capítulo');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, chapterName]);

  return { manga, pages, loading, error };
}
