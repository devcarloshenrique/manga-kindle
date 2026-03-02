import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, Plug, Activity } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
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

  const statCards = [
    {
      title: 'Downloads Ativos',
      value: activeDownloads.length,
      icon: Download,
      to: ROUTES.DOWNLOADS,
      color: 'text-blue-500',
    },
    {
      title: 'Total Downloads',
      value: downloads.length,
      icon: BookOpen,
      to: ROUTES.DOWNLOADS,
      color: 'text-purple-500',
    },
    {
      title: 'Conectores',
      value: connectors.length,
      icon: Plug,
      to: ROUTES.CONNECTORS,
      color: 'text-green-500',
    },
    {
      title: 'Uptime',
      value: stats ? `${Math.floor(stats.uptime / 60)}m` : '-',
      icon: Activity,
      to: ROUTES.HOME,
      color: 'text-amber-500',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visao geral do sistema" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.title} to={card.to}>
            <Card className="transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* System Stats */}
      {stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Memoria usada</p>
                <p className="text-lg font-semibold">{stats.memory.used}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Node.js</p>
                <p className="text-lg font-semibold">{stats.nodeVersion}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Plataforma</p>
                <p className="text-lg font-semibold">{stats.platform}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
