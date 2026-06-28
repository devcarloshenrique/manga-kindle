import { useCallback, useEffect, useRef, useState } from 'react';

interface WebtoonViewProps {
  urls: string[];
  currentPage: number;
  totalPages: number;
  brightness: number;
  showControls: boolean;
  onToggleControls: () => void;
  onPageVisible: (page: number) => void;
}

export function WebtoonView({
  urls,
  currentPage,
  totalPages,
  brightness,
  showControls,
  onToggleControls,
  onPageVisible,
}: WebtoonViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLImageElement>>(new Map());
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  // IntersectionObserver to detect most-visible page
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }
        if (bestEntry) {
          const idx = Number(bestEntry.target.getAttribute('data-page-idx'));
          if (!Number.isNaN(idx)) onPageVisible(idx);
        }
      },
      { root: containerRef.current, threshold: [0.3, 0.5, 0.7] },
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onPageVisible, urls.length]);

  // Scroll to current page when it changes externally
  useEffect(() => {
    const el = pageRefs.current.get(currentPage);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handleLoad = useCallback(
    (idx: number) => {
      setLoadedPages((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto"
      onClick={onToggleControls}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-0">
        {urls.map((url, idx) => (
          <img
            key={`${idx}-${url}`}
            ref={(el) => {
              if (el) pageRefs.current.set(idx, el);
              else pageRefs.current.delete(idx);
            }}
            data-page-idx={idx}
            src={url}
            alt={`Página ${idx + 1}`}
            className="w-full select-none"
            style={{
              filter: `brightness(${brightness})`,
              opacity: loadedPages.has(idx) ? 1 : 0.3,
              transition: 'opacity 0.3s ease',
            }}
            draggable={false}
            onLoad={() => handleLoad(idx)}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
}
