import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FolderOpen,
  Loader2,
  Pause,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, Skeleton } from '@/components/ui';
import { useDownloads } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import type { Download as DownloadItem } from '@/services/types';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

function statusBadge(status?: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Concluído</Badge>;
    case 'downloading':
      return <Badge variant="info">Baixando</Badge>;
    case 'paused':
      return <Badge variant="warning">Pausado</Badge>;
    case 'failed':
      return <Badge variant="destructive">Falhou</Badge>;
    case 'cancelled':
      return <Badge variant="secondary">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status ?? '—'}</Badge>;
  }
}

function groupDownloads(items: DownloadItem[]) {
  const groups: Record<string, DownloadItem[]> = {
    active: [],
    completed: [],
    failed: [],
  };
  for (const item of items) {
    if (item.status === 'completed') groups.completed.push(item);
    else if (item.status === 'failed') groups.failed.push(item);
    else groups.active.push(item);
  }
  return groups;
}

export function DownloadsPage() {
  const {
    downloads,
    loading,
    listError,
    clearListError,
    cancelDownload,
    retryDownload,
    clearError,
    fetchDownloads,
    getItem,
  } = useDownloads();

  const groups = groupDownloads(downloads);

  const handleCancel = async (id: string) => {
    const success = await cancelDownload(id);
    toast.success(success ? 'Download cancelado' : 'Falha ao cancelar');
  };

  const handleRetry = async (id: string) => {
    const item = downloads.find((d) => d.id === id);
    const success = await retryDownload(id, {
      url: item?.mangaUrl ?? '',
      startChapter: 1,
    });
    toast.success(success ? 'Download reiniciado' : 'Falha ao reiniciar');
  };

  const handleClearError = (id: string) => {
    clearError(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
          <p className="text-sm text-muted-foreground">
            {downloads.length} download{downloads.length !== 1 ? 's' : ''} na lista
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDownloads}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button asChild size="sm">
            <Link to={ROUTES.SEARCH}>
              <Search className="h-4 w-4" />
              Novo download
            </Link>
          </Button>
        </div>
      </div>

      {listError && downloads.length === 0 && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-destructive">{listError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearListError();
                fetchDownloads();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && downloads.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!loading && downloads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Download className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nenhum download</h2>
          <p className="text-muted-foreground max-w-md mb-4">
            Busque um mangá e inicie o download para ele aparecer aqui.
          </p>
          <Button asChild>
            <Link to={ROUTES.SEARCH}>
              <Search className="mr-2 h-4 w-4" />
              Buscar mangá
            </Link>
          </Button>
        </div>
      )}

      {groups.active.length > 0 && (
        <DownloadSection
          title="Ativos"
          icon={<Loader2 className="h-4 w-4 animate-spin text-primary" />}
          items={groups.active}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      )}

      {groups.failed.length > 0 && (
        <DownloadSection
          title="Com falha"
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          items={groups.failed}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      )}

      {groups.completed.length > 0 && (
        <DownloadSection
          title="Concluídos"
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          items={groups.completed}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      )}
    </div>
  );
}

interface DownloadSectionProps {
  title: string;
  icon: React.ReactNode;
  items: DownloadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onClearError: (id: string) => void;
}

function DownloadSection({
  title,
  icon,
  items,
  onCancel,
  onRetry,
  onClearError,
}: DownloadSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant="secondary" size="sm">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((d) => (
          <DownloadRow key={d.id} item={d} onCancel={onCancel} onRetry={onRetry} onClearError={onClearError} />
        ))}
      </CardContent>
    </Card>
  );
}

interface DownloadRowProps {
  item: DownloadItem;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onClearError: (id: string) => void;
}

function DownloadRow({ item, onCancel, onRetry, onClearError }: DownloadRowProps) {
  const { data } = { data: item };
  const isActive = data.status === 'downloading' || data.status === 'pending';
  const isCompleted = data.status === 'completed';
  const isFailed = data.status === 'failed';
  const progress = data.progress.percentage;

  const slug = data.mangaTitle?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 p-3 sm:flex-row sm:items-center">
      <div className="w-16 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted">
        <div className="flex h-20 items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{data.mangaTitle ?? 'Mangá'}</p>
          {statusBadge(data.status)}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {data.progress.totalChapters > 0 && (
            <span>{data.progress.chaptersCompleted}/{data.progress.totalChapters} cap.</span>
          )}
          {data.startedAt && <span>Início: {formatDate(data.startedAt)}</span>}
          {data.errors && data.errors.length > 0 && (
            <span className="text-destructive">{data.errors.length} erro(s)</span>
          )}
        </div>
        {isActive && (
          <div className="mt-2 flex items-center gap-2">
            <Progress value={progress} className="flex-1 h-1.5" />
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isCompleted && slug && (
          <Button variant="ghost" size="icon" asChild title="Abrir na biblioteca">
            <Link to={`/manga/${slug}`}>
              <FolderOpen className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {isActive && (
          <Button variant="ghost" size="icon" onClick={() => onCancel(data.id)} title="Cancelar">
            <Pause className="h-4 w-4" />
          </Button>
        )}
        {isFailed && (
          <Button variant="ghost" size="icon" onClick={() => onRetry(data.id)} title="Tentar novamente">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {isFailed && (
          <Button variant="ghost" size="icon" onClick={() => onClearError(data.id)} title="Limpar erro">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
