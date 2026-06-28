import { CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui';
import { useKcc } from '@/hooks';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

function statusBadgeVariant(
  status?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'outline';
  if (status === 'completed') return 'default';
  if (status === 'failed' || status === 'cancelled') return 'destructive';
  if (status === 'processing' || status === 'queued') return 'secondary';
  return 'outline';
}

export function JobsView() {
  const { jobs, convertedFiles, loading, fetchInitialData, refreshJobs } = useKcc();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Jobs KCC</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshJobs}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && jobs.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum job encontrado.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="space-y-2 rounded-xl border border-border/50 p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{job.id}</p>
                  <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                </div>
                <Progress value={job.progress} />
                <div className="text-xs text-muted-foreground">
                  <p>
                    Formato: {job.outputFormat} • Perfil: {job.profile}
                  </p>
                  <p>
                    Progresso: {job.progress}% • Criado em: {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Arquivos convertidos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => fetchInitialData()}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {convertedFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum arquivo convertido ainda.
            </p>
          ) : (
            convertedFiles.slice(0, 20).map((file) => (
              <div
                key={file.name}
                className="flex items-start justify-between gap-2 rounded-xl border border-border/50 p-3 hover:border-success/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.format} • {file.sizeFormatted} • {formatDate(file.createdAt)}
                  </p>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${file.downloadUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Baixar
                </a>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
