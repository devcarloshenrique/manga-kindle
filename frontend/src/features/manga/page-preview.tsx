import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button, Slider } from '@/components/ui';
import type { Page } from '@/services/types';

interface PagePreviewProps {
  pages: Page[];
  initialPage?: number;
  onClose: () => void;
}

export function PagePreview({ pages, initialPage = 0, onClose }: PagePreviewProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);

  const currentPageData = pages[currentPage];

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  }, [pages.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevPage();
        break;
      case 'ArrowRight':
        handleNextPage();
        break;
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
    }
  }, [handlePrevPage, handleNextPage, handleZoomIn, handleZoomOut, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const zoomClass =
    zoom <= 0.5 ? 'scale-50' :
    zoom <= 0.75 ? 'scale-75' :
    zoom <= 1 ? 'scale-100' :
    zoom <= 1.25 ? 'scale-125' :
    zoom <= 1.5 ? 'scale-150' :
    zoom <= 1.75 ? 'scale-[1.75]' :
    zoom <= 2 ? 'scale-[2]' :
    zoom <= 2.25 ? 'scale-[2.25]' :
    zoom <= 2.5 ? 'scale-[2.5]' :
    zoom <= 2.75 ? 'scale-[2.75]' :
    'scale-[3]';

  if (!currentPageData) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/80 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-5 w-5" />
          </Button>
          <span className="text-sm text-white/80">
            Página {currentPage + 1} de {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white/80 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Display */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <div className={`relative transform transition-transform duration-200 ${zoomClass}`}>
          <img
            src={currentPageData.url}
            alt={`Página ${currentPage + 1}`}
            className="max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
            loading="eager"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-white/10 bg-black/80 p-4">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Slider
            min={0}
            max={pages.length - 1}
            step={1}
            value={[currentPage]}
            onValueChange={(value: number[]) => setCurrentPage(value[0] ?? 0)}
            className="w-48"
          />
          <span className="text-sm text-white/80 w-16 text-right">
            {currentPage + 1}/{pages.length}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
