import { useCallback, useEffect, useRef } from 'react';
import { libraryService } from '@/services/library.service';

interface UseReaderProgressOptions {
  slug: string | undefined;
  chapterName: string | undefined;
  currentPage: number;
  totalPages: number;
  debounceMs?: number;
}

/**
 * Tracks reading progress by PATCHing lastReadChapter/lastReadAt
 * when the current page changes (debounced).
 * Also fires on chapter completion (last page reached).
 */
export function useReaderProgress({
  slug,
  chapterName,
  currentPage,
  totalPages,
  debounceMs = 2000,
}: UseReaderProgressOptions) {
  const lastSavedRef = useRef<string | null>(null);

  const saveProgress = useCallback(async () => {
    if (!slug || !chapterName) return;
    const key = `${slug}:${chapterName}:${currentPage}`;
    if (lastSavedRef.current === key) return;
    lastSavedRef.current = key;
    try {
      await libraryService.updateManga(slug, {
        lastReadChapter: chapterName,
        lastReadAt: new Date().toISOString(),
        lastReadPage: currentPage,
        totalPages,
      });
    } catch {
      // Silent: progress tracking is best-effort
    }
  }, [slug, chapterName, currentPage, totalPages]);

  useEffect(() => {
    const timer = setTimeout(saveProgress, debounceMs);
    return () => clearTimeout(timer);
  }, [saveProgress, debounceMs]);

  // Save immediately on unmount if pending
  useEffect(() => {
    return () => {
      if (lastSavedRef.current !== `${slug}:${chapterName}:${currentPage}`) {
        saveProgress();
      }
    };
  }, [slug, chapterName, currentPage, saveProgress]);
}
