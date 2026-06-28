import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReadingDirection, ReadingMode } from '@/lib/constants';

interface ReaderEngineOptions {
  totalPages: number;
  initialPage?: number;
  mode?: ReadingMode;
  direction?: ReadingDirection;
  autoHideMs?: number;
}

interface ReaderEngine {
  page: number;
  mode: ReadingMode;
  direction: ReadingDirection;
  zoom: number;
  fit: 'width' | 'height' | 'contain';
  showControls: boolean;
  brightness: number;
  currentPage: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  setMode: (mode: ReadingMode) => void;
  setDirection: (direction: ReadingDirection) => void;
  setZoom: (zoom: number) => void;
  setFit: (fit: 'width' | 'height' | 'contain') => void;
  setBrightness: (brightness: number) => void;
  toggleControls: () => void;
}

export function useReaderEngine(opts: ReaderEngineOptions): ReaderEngine {
  const { totalPages, initialPage = 0, autoHideMs = 3000 } = opts;
  const [mode, setMode] = useState<ReadingMode>(opts.mode ?? 'single');
  const [direction, setDirection] = useState<ReadingDirection>(
    opts.direction ?? 'ltr',
  );
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<'width' | 'height' | 'contain'>('contain');
  const [showControls, setShowControls] = useState(true);
  const [brightness, setBrightness] = useState(1);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = page;
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, autoHideMs);
  }, [autoHideMs]);

  useEffect(() => {
    if (showControls) {
      scheduleHide();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls, scheduleHide, page]);

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  const goTo = useCallback(
    (p: number) => {
      setPage(Math.max(0, Math.min(p, totalPages - 1)));
    },
    [totalPages],
  );

  const toggleControls = useCallback(() => {
    setShowControls((v) => !v);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case 'ArrowRight':
          if (direction === 'ltr') next();
          else prev();
          break;
        case 'ArrowLeft':
          if (direction === 'ltr') prev();
          else next();
          break;
        case 'ArrowDown':
          next();
          break;
        case 'ArrowUp':
          prev();
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(totalPages - 1);
          break;
        case 'f':
        case 'F':
          // fullscreen is handled externally; just prevent default
          break;
        case 'Escape':
          // let parent handle exit
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [direction, next, prev, goTo, totalPages]);

  // Touch / click navigation helpers (wired by views)
  return {
    page,
    mode,
    direction,
    zoom,
    fit,
    showControls,
    brightness,
    currentPage,
    totalPages,
    isFirstPage,
    isLastPage,
    next,
    prev,
    goTo,
    setMode,
    setDirection,
    setZoom,
    setFit,
    setBrightness,
    toggleControls,
  };
}
