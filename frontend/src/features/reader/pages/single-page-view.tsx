import { useCallback, useEffect, useRef } from 'react';

interface SinglePageViewProps {
  src: string;
  pageIndex: number;
  totalPages: number;
  fit: 'width' | 'height' | 'contain';
  zoom: number;
  brightness: number;
  direction: 'ltr' | 'rtl';
  showControls: boolean;
  onToggleControls: () => void;
  onNext: () => void;
  onPrev: () => void;
  onImageLoad?: (pageIndex: number, width: number, height: number) => void;
}

export function SinglePageView({
  src,
  pageIndex,
  totalPages,
  fit,
  zoom,
  brightness,
  direction,
  showControls,
  onToggleControls,
  onNext,
  onPrev,
  onImageLoad,
}: SinglePageViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      // Click left third → prev, right third → next, middle → toggle controls
      if (x < 0.33) {
        if (direction === 'rtl') onNext();
        else onPrev();
      } else if (x > 0.66) {
        if (direction === 'rtl') onPrev();
        else onNext();
      } else {
        onToggleControls();
      }
    },
    [direction, onNext, onPrev, onToggleControls],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        onToggleControls();
      }
    },
    [onToggleControls],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const objectFit =
    fit === 'width' ? 'contain' : fit === 'height' ? 'contain' : 'contain';

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onClick={handleClick}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={`Página ${pageIndex + 1}`}
        className="max-h-full max-w-full select-none transition-transform duration-200"
        style={{
          objectFit,
          transform: `scale(${zoom})`,
          filter: `brightness(${brightness})`,
          imageRendering: zoom > 1.2 ? 'pixelated' : 'auto',
        }}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          onImageLoad?.(pageIndex, img.naturalWidth, img.naturalHeight);
        }}
      />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
        {pageIndex + 1} / {totalPages}
      </div>
    </div>
  );
}
