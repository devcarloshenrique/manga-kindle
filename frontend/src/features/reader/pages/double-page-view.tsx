import { useCallback, useEffect, useState } from 'react';

interface DoublePageViewProps {
  pages: { src: string; index: number }[];
  currentPage: number;
  totalPages: number;
  fit: 'width' | 'height' | 'contain';
  zoom: number;
  brightness: number;
  direction: 'ltr' | 'rtl';
  showControls: boolean;
  onToggleControls: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DoublePageView({
  pages,
  currentPage,
  totalPages,
  fit,
  zoom,
  brightness,
  direction,
  showControls,
  onToggleControls,
  onNext,
  onPrev,
}: DoublePageViewProps) {
  const [leftPage, rightPage] = direction === 'rtl'
    ? [Math.min(currentPage + 1, totalPages - 1), currentPage]
    : [currentPage, Math.min(currentPage + 1, totalPages - 1)];

  const hasSecondPage = rightPage !== leftPage && rightPage < totalPages;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
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

  return (
    <div
      className="relative flex h-full w-full items-center justify-center gap-1"
      onClick={handleClick}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <PageImage
        src={pages[leftPage]?.src}
        alt={`Página ${leftPage + 1}`}
        fit={fit}
        zoom={zoom}
        brightness={brightness}
      />
      {hasSecondPage && (
        <PageImage
          src={pages[rightPage]?.src}
          alt={`Página ${rightPage + 1}`}
          fit={fit}
          zoom={zoom}
          brightness={brightness}
        />
      )}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
        {currentPage + 1}–{Math.min(currentPage + 2, totalPages)} / {totalPages}
      </div>
    </div>
  );
}

function PageImage({
  src,
  alt,
  fit,
  zoom,
  brightness,
}: {
  src?: string;
  alt: string;
  fit: string;
  zoom: number;
  brightness: number;
}) {
  if (!src) {
    return <div className="h-full w-full bg-muted/30" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-1/2 object-contain select-none"
      style={{
        transform: `scale(${zoom})`,
        filter: `brightness(${brightness})`,
        transformOrigin: 'center center',
      }}
      draggable={false}
    />
  );
}
