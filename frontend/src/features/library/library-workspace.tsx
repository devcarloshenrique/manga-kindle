import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, Compass, Workflow } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { useDownloads, useKcc } from '@/hooks';
import { ExploreView } from './explore-view';
import { ConversionWizard } from './conversion-wizard';
import { JobsView } from './jobs-view';

const VIEW_OPTIONS = [
  {
    value: 'explore',
    label: 'Explorar e ler',
    description: 'Biblioteca, seleção de mangá e leitura com 1 clique.',
    icon: Compass,
  },
  {
    value: 'conversion',
    label: 'Conversão KCC',
    description: 'Fluxo guiado em etapas para converter com menos atrito.',
    icon: Workflow,
  },
  {
    value: 'jobs',
    label: 'Status e jobs',
    description: 'Acompanhe fila, progresso e arquivos prontos.',
    icon: BarChart3,
  },
] as const;

type WorkspaceView = (typeof VIEW_OPTIONS)[number]['value'];

function parseWorkspaceView(raw: string | null): WorkspaceView {
  if (raw === 'explore' || raw === 'conversion' || raw === 'jobs') return raw;
  if (raw === 'library') return 'explore';
  return 'explore';
}

export function LibraryWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { activeDownloads } = useDownloads();
  const { jobs } = useKcc();

  const activeView = parseWorkspaceView(searchParams.get('view'));
  const setActiveView = (view: WorkspaceView) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', view);
      return next;
    }, { replace: true });
  };

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === 'queued' || j.status === 'processing'),
    [jobs],
  );
  const activeJobsProgress = useMemo(() => {
    if (activeJobs.length === 0) return 0;
    const total = activeJobs.reduce(
      (s, j) => s + (Number.isFinite(j.progress) ? j.progress : 0),
      0,
    );
    return Math.round(total / activeJobs.length);
  }, [activeJobs]);

  return (
    <div className="space-y-8 page-enter">
      {/* View switcher */}
      <div className="flex justify-center pb-2">
        <div className="inline-flex items-center justify-center rounded-2xl glass-strong p-1.5 ring-1 ring-inset ring-border/40">
          {VIEW_OPTIONS.map((view) => {
            const Icon = view.icon;
            const selected = activeView === view.value;
            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setActiveView(view.value)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
                  selected
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className={`mr-2 h-4 w-4 ${selected ? 'text-primary' : ''}`} />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background jobs banner */}
      {activeJobs.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Workflow className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-sm font-medium">
                {activeJobs.length} conversão(ões) em segundo plano — {activeJobsProgress}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('jobs')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver jobs
            </button>
          </CardContent>
        </Card>
      )}

      {activeView === 'explore' && (
        <ExploreView activeDownloads={activeDownloads} />
      )}
      {activeView === 'conversion' && <ConversionWizard />}
      {activeView === 'jobs' && <JobsView />}
    </div>
  );
}
