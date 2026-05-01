import { BookMarked, Download, PlayCircle } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export interface QuickAccessCurrentReading {
  mangaTitle: string;
  chapterLabel: string;
  progressPercent?: number;
  offlineAvailable?: boolean;
}

export interface QuickAccessRecentChapter {
  id: string;
  mangaTitle: string;
  chapterLabel: string;
  downloadedAtLabel?: string;
  offline?: boolean;
}

interface QuickAccessDashboardProps {
  currentReading: QuickAccessCurrentReading | null;
  recentDownloadedChapters: QuickAccessRecentChapter[];
  onContinueReading: () => void;
  onDownloadNext: () => void;
  onOpenRecentChapter: (chapterId: string) => void;
  disabled?: boolean;
}

export function QuickAccessDashboard({
  currentReading,
  recentDownloadedChapters,
  onContinueReading,
  onDownloadNext,
  onOpenRecentChapter,
  disabled,
}: QuickAccessDashboardProps) {
  return (
    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start">
      <div className="flex-1 space-y-4">
        {currentReading ? (
          <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Continuar leitura</p>
              {currentReading.offlineAvailable && (
                <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px] uppercase">
                  Offline
                </Badge>
              )}
            </div>
            <p className="font-semibold">{currentReading.chapterLabel}</p>
            {typeof currentReading.progressPercent === 'number' && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${currentReading.progressPercent}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{currentReading.progressPercent}%</span>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={onContinueReading} disabled={disabled || !currentReading} className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <PlayCircle className="mr-2 h-4 w-4" />
                Ler Agora
              </Button>
              <Button variant="outline" onClick={onDownloadNext} disabled={disabled || !currentReading} className="bg-background/50">
                <Download className="mr-2 h-4 w-4" />
                Baixar Próximo
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 text-center backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">Nenhuma leitura em andamento. Escolha um capítulo abaixo para começar.</p>
          </div>
        )}
      </div>

      {recentDownloadedChapters.length > 0 && (
        <div className="w-full shrink-0 md:w-64">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Últimos baixados</p>
          <div className="space-y-2">
            {recentDownloadedChapters.slice(0, 3).map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className="flex w-full flex-col items-start gap-1 rounded-xl border border-border/50 bg-background/40 p-3 text-left transition-colors hover:bg-muted/80 backdrop-blur-sm"
                onClick={() => onOpenRecentChapter(chapter.id)}
                disabled={disabled}
              >
                <p className="line-clamp-1 text-sm font-medium">{chapter.chapterLabel}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {chapter.offline && (
                    <span className="flex items-center gap-1 text-sky-500">
                      <BookMarked className="h-3 w-3" /> Offline
                    </span>
                  )}
                  {chapter.downloadedAtLabel && <span>• {chapter.downloadedAtLabel}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
