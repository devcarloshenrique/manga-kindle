import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, Plug, Activity, Search, Zap, Server, HardDrive } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useDownloads, useConnectors, useSystemStats } from '@/hooks';
import { ROUTES } from '@/lib/constants';

export function DashboardPage() {
  const { downloads, fetchDownloads } = useDownloads();
  const { connectors, fetchConnectors } = useConnectors();
  const { stats, fetchStats } = useSystemStats();

  useEffect(() => {
    fetchDownloads();
    fetchConnectors();
    fetchStats();
  }, [fetchDownloads, fetchConnectors, fetchStats]);

  const activeDownloads = downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'pending',
  );

  const completedDownloads = downloads.filter((d) => d.status === 'completed').length;

  const statCards = [
    {
      title: 'Downloads Ativos',
      value: activeDownloads.length,
      icon: Download,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: ROUTES.DOWNLOADS,
    },
    {
      title: 'Downloads Concluídos',
      value: completedDownloads,
      icon: BookOpen,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: ROUTES.DOWNLOADS,
    },
    {
      title: 'Conectores',
      value: connectors.length,
      icon: Plug,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: ROUTES.CONNECTORS,
    },
    {
      title: 'Uptime',
      value: stats ? `${Math.floor(stats.uptime / 60)}m` : '-',
      icon: Activity,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema e suas atividades"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {card.title}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{card.value}</span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Downloads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {downloads.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[hsl(var(--muted-foreground))] text-sm">Nenhum download recente</p>
                <Link
                  to={ROUTES.SEARCH}
                  className="mt-3 inline-flex items-center text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Buscar Mangá
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {downloads.slice(0, 5).map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{download.mangaTitle}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(download.startedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      download.status === 'downloading' ? 'bg-blue-500/10 text-blue-600' :
                      download.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                      download.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                      download.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {download.status === 'downloading' ? 'Baixando' :
                       download.status === 'completed' ? 'Concluído' :
                       download.status === 'failed' ? 'Falhou' :
                       download.status === 'pending' ? 'Pendente' :
                       download.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-500" />
              Status dos Conectores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectors.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  Verificando conectores...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <div
                    key={connector.name}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                        <Plug className="h-4 w-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <p className="font-medium">{connector.displayName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {connector.baseUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        Ativo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-500" />
              Estatísticas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Memória Usada</p>
                <p className="text-2xl font-bold">{stats.memory.used}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  RSS: {stats.memory.rss}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Node.js</p>
                <p className="text-2xl font-bold">{stats.nodeVersion}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Plataforma</p>
                <p className="text-2xl font-bold">{stats.platform}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
