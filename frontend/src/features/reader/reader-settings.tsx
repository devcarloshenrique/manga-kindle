import { useState } from 'react';
import {
  BookOpen,
  Columns2,
  Maximize2,
  Moon,
  ScrollText,
  SlidersHorizontal,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import type { ReadingDirection, ReadingMode } from '@/lib/constants';

interface ReaderSettingsProps {
  mode: ReadingMode;
  direction: ReadingDirection;
  fit: 'width' | 'height' | 'contain';
  zoom: number;
  brightness: number;
  onModeChange: (mode: ReadingMode) => void;
  onDirectionChange: (direction: ReadingDirection) => void;
  onFitChange: (fit: 'width' | 'height' | 'contain') => void;
  onZoomChange: (zoom: number) => void;
  onBrightnessChange: (brightness: number) => void;
}

export function ReaderSettings({
  mode,
  direction,
  fit,
  zoom,
  brightness,
  onModeChange,
  onDirectionChange,
  onFitChange,
  onZoomChange,
  onBrightnessChange,
}: ReaderSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="glass"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Configurações do reader"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </Button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-[calc(100vw-2rem)] sm:w-80 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur-xl z-50 zoom-in-95">
          <Tabs defaultValue="display" onValueChange={() => {}}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="display">Visualização</TabsTrigger>
              <TabsTrigger value="reading">Leitura</TabsTrigger>
            </TabsList>

            <TabsContent value="display" className="space-y-4 pt-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Modo de leitura
                </label>
                <Select value={mode} onValueChange={(v) => onModeChange(v as ReadingMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Página única</SelectItem>
                    <SelectItem value="double">Página dupla</SelectItem>
                    <SelectItem value="webtoon">Webtoon (scroll)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Maximize2 className="h-4 w-4" />
                  Ajuste de imagem
                </label>
                <Select value={fit} onValueChange={(v) => onFitChange(v as 'width' | 'height' | 'contain')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="width">Largura</SelectItem>
                    <SelectItem value="height">Altura</SelectItem>
                    <SelectItem value="contain">Conter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[zoom * 100]}
                    min={50}
                    max={200}
                    step={10}
                    onValueChange={(v) => onZoomChange(v[0] / 100)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Brilho
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(brightness * 100)}%
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[brightness * 100]}
                    min={20}
                    max={100}
                    step={5}
                    onValueChange={(v) => onBrightnessChange(v[0] / 100)}
                    className="flex-1"
                  />
                  <Sun className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-4 pt-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <ScrollText className="h-4 w-4" />
                  Direção de leitura
                </label>
                <Select
                  value={direction}
                  onValueChange={(v) => onDirectionChange(v as ReadingDirection)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">Esquerda → Direita (ocidental)</SelectItem>
                    <SelectItem value="rtl">Direita → Esquerda (mangá)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center justify-between gap-2 rounded-xl border border-border/50 p-3 text-sm">
                <span className="flex items-center gap-2">
                  <Columns2 className="h-4 w-4" />
                  Espelhar páginas em RTL
                </span>
                <Switch checked={direction === 'rtl'} onCheckedChange={() => onDirectionChange(direction === 'rtl' ? 'ltr' : 'rtl')} />
              </label>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
