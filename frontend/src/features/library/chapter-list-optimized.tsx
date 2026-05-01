import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Download, Loader2, Play, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@/components/ui';

export type ChapterVisualStatus = 'read' | 'unread' | 'downloaded' | 'downloading' | 'error';
export type ChapterQuickFilter = 'all' | 'offline' | 'error';

export interface ChapterListItem {
  id: string;
  chapterLabel: string;
  pageCount?: number;
  status: ChapterVisualStatus;
  progressPercent?: number;
}

interface ChapterListOptimizedProps {
  chapters: ChapterListItem[];
  onRead: (chapterId: string) => void;
  onDownload: (chapterId: string) => void;
  onRetry: (chapterId: string) => void;
  initialFilter?: ChapterQuickFilter;
  disabled?: boolean;
}

const FILTERS: ReadonlyArray<{ key: ChapterQuickFilter; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'offline', label: 'Disponível Offline' },
  { key: 'error', label: 'Com Erro' },
];

function statusBadge(status: ChapterVisualStatus) {
  switch (status) {
    case 'read':
      return (
        <Badge variant="outline" size="sm" className="gap-1 border-success/30 bg-success/10 text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Lido
        </Badge>
      );
    case 'downloaded':
      return (
        <Badge variant="outline" size="sm" className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <Download className="h-3.5 w-3.5" />
          Baixado
        </Badge>
      );
    case 'downloading':
      return (
        <Badge variant="outline" size="sm" className="gap-1 border-warning/30 bg-warning/10 text-warning">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Baixando
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="outline" size="sm" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          Erro
        </Badge>
      );
    case 'unread':
    default:
      return (
        <Badge variant="outline" size="sm" className="gap-1 border-border/60 bg-muted/60 text-muted-foreground">
          <Circle className="h-3.5 w-3.5" />
          Não lido
        </Badge>
      );
  }
}

export function ChapterListOptimized({
  chapters,
  onRead,
  onDownload,
  onRetry,
  initialFilter = 'all',
  disabled,
}: ChapterListOptimizedProps) {
  const [activeFilter, setActiveFilter] = useState<ChapterQuickFilter>(initialFilter);

  const hasOffline = chapters.some((chapter) => chapter.status === 'downloaded');

  const filteredChapters = useMemo(() => {
    if (activeFilter === 'offline') {
      return chapters.filter((chapter) => chapter.status === 'downloaded');
    }

    if (activeFilter === 'error') {
      return chapters.filter((chapter) => chapter.status === 'error');
    }

    return chapters;
  }, [activeFilter, chapters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              disabled={disabled}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {hasOffline ? (
          <Badge variant="info" size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            Leitura offline disponível
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        {filteredChapters.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Nenhum capítulo para o filtro selecionado.
            </CardContent>
          </Card>
        ) : (
          filteredChapters.map((chapter) => (
            <Card key={chapter.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{chapter.chapterLabel}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge(chapter.status)}
                    {typeof chapter.pageCount === 'number' ? (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{chapter.pageCount} pág.</span>
                    ) : null}
                    {chapter.status === 'downloading' && typeof chapter.progressPercent === 'number' ? (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{chapter.progressPercent}%</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onRead(chapter.id)} disabled={disabled}>
                    <Play className="h-4 w-4" />
                    Ler
                  </Button>

                  {chapter.status === 'error' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry(chapter.id)}
                      disabled={disabled}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tentar novamente
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(chapter.id)}
                      disabled={disabled || chapter.status === 'downloading'}
                    >
                      <Download className="h-4 w-4" />
                      {chapter.status === 'downloaded' ? 'Rebaixar' : 'Baixar'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
