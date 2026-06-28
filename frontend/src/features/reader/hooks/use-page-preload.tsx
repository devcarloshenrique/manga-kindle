import { useEffect, useRef } from 'react';

interface PreloadOptions {
  urls: string[];
  currentIndex: number;
  preloadAhead?: number;
  preloadBehind?: number;
}

/**
 * Preloads images adjacent to the current page for snappy navigation.
 * Uses <link rel="preload" as="image"> with an AbortController per image
 * so stale requests when navigating quickly don't waste bandwidth.
 */
export function usePagePreload({
  urls,
  currentIndex,
  preloadAhead = 2,
  preloadBehind = 1,
}: PreloadOptions) {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!urls.length) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const start = Math.max(0, currentIndex - preloadBehind);
    const end = Math.min(urls.length - 1, currentIndex + preloadAhead);

    for (let i = start; i <= end; i++) {
      if (i === currentIndex) continue;
      if (controller.signal.aborted) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = urls[i];
      link.setAttribute('data-reader-preload', String(i));
      document.head.appendChild(link);
    }

    return () => {
      // Cleanup previous preload links on unmount
      document.querySelectorAll('[data-reader-preload]').forEach((el) => el.remove());
    };
  }, [urls, currentIndex, preloadAhead, preloadBehind]);
}
