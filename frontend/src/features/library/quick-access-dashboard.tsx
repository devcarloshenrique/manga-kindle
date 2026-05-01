import { BookMarked, Download, PlayCircle } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

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
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acesso rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentReading ? (
            <>
              <div className="space-y-1">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Leitura atual</p>
                <p className="font-semibold">{currentReading.mangaTitle}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {currentReading.chapterLabel}
                  {typeof currentReading.progressPercent === 'number'
                    ? ` • ${currentReading.progressPercent}% concluído`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentReading.offlineAvailable && (
                  <Badge variant="info" size="sm">
                    Offline disponível
                  </Badge>
                )}
                <Badge variant="outline" size="sm">
                  1 clique para retomar
                </Badge>
              </div>
            </>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Nenhuma leitura em andamento. Escolha um capítulo para começar.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={onContinueReading} disabled={disabled || !currentReading}>
              <PlayCircle className="h-4 w-4" />
              Continuar lendo
            </Button>
            <Button variant="outline" onClick={onDownloadNext} disabled={disabled || !currentReading}>
              <Download className="h-4 w-4" />
              Baixar próximo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Últimos baixados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentDownloadedChapters.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum capítulo baixado recentemente.</p>
          ) : (
            recentDownloadedChapters.slice(0, 5).map((chapter) => (
              <Button
                key={chapter.id}
                variant="outline"
                className="h-auto w-full justify-start p-3 text-left"
                onClick={() => onOpenRecentChapter(chapter.id)}
                disabled={disabled}
              >
                <div>
                  <p className="font-medium leading-tight">{chapter.mangaTitle}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{chapter.chapterLabel}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    {chapter.offline ? (
                      <span className="inline-flex items-center gap-1">
                        <BookMarked className="h-3.5 w-3.5" />
                        Offline
                      </span>
                    ) : null}
                    {chapter.downloadedAtLabel ? <span>• {chapter.downloadedAtLabel}</span> : null}
                  </div>
                </div>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
