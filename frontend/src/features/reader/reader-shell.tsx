import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useReaderEngine } from './hooks/use-reader-engine';
import { usePagePreload } from './hooks/use-page-preload';
import { ReaderControls } from './reader-controls';
import { SinglePageView } from './pages/single-page-view';
import { DoublePageView } from './pages/double-page-view';
import { WebtoonView } from './pages/webtoon-view';

interface ReaderShellProps {
  pageUrls: string[];
  initialPage?: number;
  initialMode?: 'single' | 'double' | 'webtoon';
  initialDirection?: 'ltr' | 'rtl';
  onPageChange?: (page: number) => void;
  onClose: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
}

export function ReaderShell({
  pageUrls,
  initialPage = 0,
  initialMode = 'single',
  initialDirection = 'ltr',
  onPageChange,
  onClose,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
}: ReaderShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const engine = useReaderEngine({
    totalPages: pageUrls.length,
    initialPage,
    mode: initialMode,
    direction: initialDirection,
  });

  usePagePreload({
    urls: pageUrls,
    currentIndex: engine.currentPage,
    preloadAhead: engine.mode === 'webtoon' ? 4 : 2,
    preloadBehind: engine.mode === 'webtoon' ? 2 : 1,
  });

  // Notify parent of page changes
  useEffect(() => {
    onPageChange?.(engine.currentPage);
  }, [engine.currentPage, onPageChange]);

  // Auto-advance to next chapter when reaching last page in webtoon mode
  useEffect(() => {
    if (engine.mode !== 'webtoon') return;
    if (engine.isLastPage && hasNextChapter) {
      // Don't auto-advance; show a hint instead (handled by parent)
    }
  }, [engine.isLastPage, engine.mode, hasNextChapter]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const pages = useMemo(
    () =>
      pageUrls.map((src, index) => ({
        src,
        index,
      })),
    [pageUrls],
  );

  if (!pageUrls.length) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando páginas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      {engine.mode === 'webtoon' ? (
        <WebtoonView
          urls={pageUrls}
          currentPage={engine.currentPage}
          totalPages={pageUrls.length}
          brightness={engine.brightness}
          showControls={engine.showControls}
          onToggleControls={engine.toggleControls}
          onPageVisible={(p) => engine.goTo(p)}
        />
      ) : engine.mode === 'double' ? (
        <DoublePageView
          pages={pages}
          currentPage={engine.currentPage}
          totalPages={pageUrls.length}
          zoom={engine.zoom}
          brightness={engine.brightness}
          direction={engine.direction}
          showControls={engine.showControls}
          onToggleControls={engine.toggleControls}
          onNext={engine.next}
          onPrev={engine.prev}
        />
      ) : (
        <SinglePageView
          key={engine.currentPage}
          src={pageUrls[engine.currentPage]}
          pageIndex={engine.currentPage}
          totalPages={pageUrls.length}
          fit={engine.fit}
          zoom={engine.zoom}
          brightness={engine.brightness}
          direction={engine.direction}
          showControls={engine.showControls}
          onToggleControls={engine.toggleControls}
          onNext={engine.next}
          onPrev={engine.prev}
          onImageLoad={() => {}}
        />
      )}

      <ReaderControls
        currentPage={engine.currentPage}
        totalPages={pageUrls.length}
        mode={engine.mode}
        direction={engine.direction}
        fit={engine.fit}
        zoom={engine.zoom}
        brightness={engine.brightness}
        showControls={engine.showControls}
        isFirstPage={engine.isFirstPage}
        isLastPage={engine.isLastPage}
        onNext={engine.next}
        onPrev={engine.prev}
        onGoTo={engine.goTo}
        onModeChange={engine.setMode}
        onDirectionChange={engine.setDirection}
        onFitChange={engine.setFit}
        onZoomChange={engine.setZoom}
        onBrightnessChange={engine.setBrightness}
        onClose={onClose}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onPauseAutoHide={engine.pauseAutoHide}
        onResumeAutoHide={engine.resumeAutoHide}
      />

      {/* Chapter navigation floating buttons */}
      {engine.showControls && (
        <div className="absolute bottom-20 left-1/2 z-40 flex -translate-x-1/2 gap-2">
          {hasPrevChapter && (
            <Button variant="glass" size="sm" onClick={onPrevChapter}>
              ← Capítulo anterior
            </Button>
          )}
          {hasNextChapter && (
            <Button variant="glass" size="sm" onClick={onNextChapter}>
              Próximo capítulo →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
