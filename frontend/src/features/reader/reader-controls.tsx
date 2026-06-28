import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Minimize2,
  X,
} from 'lucide-react';
import { Button, Progress } from '@/components/ui';
import { ReaderSettings } from './reader-settings';
import type { ReadingDirection, ReadingMode } from '@/lib/constants';

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  mode: ReadingMode;
  direction: ReadingDirection;
  fit: 'width' | 'height' | 'contain';
  zoom: number;
  brightness: number;
  showControls: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (page: number) => void;
  onModeChange: (mode: ReadingMode) => void;
  onDirectionChange: (direction: ReadingDirection) => void;
  onFitChange: (fit: 'width' | 'height' | 'contain') => void;
  onZoomChange: (zoom: number) => void;
  onBrightnessChange: (brightness: number) => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onPauseAutoHide: () => void;
  onResumeAutoHide: () => void;
}

export function ReaderControls({
  currentPage,
  totalPages,
  mode,
  direction,
  fit,
  zoom,
  brightness,
  showControls,
  isFirstPage,
  isLastPage,
  onNext,
  onPrev,
  onGoTo,
  onModeChange,
  onDirectionChange,
  onFitChange,
  onZoomChange,
  onBrightnessChange,
  onClose,
  onToggleFullscreen,
  isFullscreen,
  onPauseAutoHide,
  onResumeAutoHide,
}: ReaderControlsProps) {
  const progress = totalPages > 1 ? ((currentPage + 1) / totalPages) * 100 : 100;

  return (
    <>
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-gradient-to-b from-black/80 to-transparent px-4 pb-12 pt-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Button variant="glass" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <p className="text-sm font-medium text-white">
                Página {currentPage + 1} / {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ReaderSettings
                mode={mode}
                direction={direction}
                fit={fit}
                zoom={zoom}
                brightness={brightness}
                onModeChange={onModeChange}
                onDirectionChange={onDirectionChange}
                onFitChange={onFitChange}
                onZoomChange={onZoomChange}
                onBrightnessChange={onBrightnessChange}
                onOpenChange={(open) => {
                  if (open) onPauseAutoHide();
                  else onResumeAutoHide();
                }}
              />
              <Button variant="glass" size="icon" onClick={onToggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Expand className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Side navigation buttons (click zones) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-1/3 items-center">
        <Button
          variant="ghost"
          size="icon"
          className={`pointer-events-auto ml-2 h-16 w-16 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 ${
            isFirstPage ? 'opacity-30 pointer-events-none' : ''
          }`}
          onClick={onPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-1/3 items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className={`pointer-events-auto mr-2 h-16 w-16 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 ${
            isLastPage ? 'opacity-30 pointer-events-none' : ''
          }`}
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Bottom bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-gradient-to-t from-black/80 to-transparent pb-4 pt-12 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4">
            <Progress value={progress} className="h-1.5" />
            <div className="mt-2 flex items-center justify-between text-xs text-white/80">
              <span>{currentPage + 1}</span>
              <span>{Math.round(progress)}%</span>
              <span>{totalPages}</span>
            </div>
            <input
              type="range"
              min={0}
              max={totalPages - 1}
              value={currentPage}
              onChange={(e) => onGoTo(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
}
