import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Cable,
  Cpu,
  Globe,
  Monitor,
  Palette,
  RefreshCw,
  Settings as SettingsIcon,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useConnectors } from '@/hooks/use-connectors';
import { useSystemStats } from '@/hooks/use-system-stats';
import { useTheme } from '@/app/providers/theme-provider';
import { ROUTES } from '@/lib/constants';

function formatUptime(seconds?: number) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Conectores, tema, preferências e sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="connectors" onValueChange={() => {}}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="connectors" className="gap-2">
            <Cable className="h-4 w-4" />
            Conectores
          </TabsTrigger>
          <TabsTrigger value="reader" className="gap-2">
            <Monitor className="h-4 w-4" />
            Leitor
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Cpu className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connectors">
          <ConnectorsTab />
        </TabsContent>
        <TabsContent value="reader">
          <ReaderTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectorsTab() {
  const { connectors, loading, error, fetchConnectors, setLanguage } = useConnectors();

  if (loading && connectors.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cable className="h-4 w-4 text-primary" />
            Fontes conectadas
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchConnectors}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          )}
          {connectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum conector configurado.
            </p>
          ) : (
            <div className="space-y-2">
              {connectors.map((conn) => (
                <div
                  key={conn.name}
                  className="flex flex-col gap-3 rounded-xl border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{conn.displayName ?? conn.name}</p>
                    </div>
                    {conn.baseUrl && (
                      <p className="mt-1 text-xs text-muted-foreground truncate max-w-md">
                        {conn.baseUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={conn.currentLanguage ?? 'en'}
                      onValueChange={(lang) => {
                        setLanguage(conn.name, lang);
                        toast.success(`Idioma alterado para ${lang}`);
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {(conn.supportedLanguages ?? ['en', 'pt', 'ja', 'ko', 'zh', 'es']).map((l) => (
                          <SelectItem key={l} value={l}>
                            {l === 'en' ? 'Inglês' : l === 'pt' ? 'Português' : l === 'ja' ? 'Japonês' : l === 'ko' ? 'Coreano' : l === 'zh' ? 'Chinês' : l === 'es' ? 'Espanhol' : l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReaderTab() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('reader-mode') : null;
  const storedDir = typeof window !== 'undefined' ? localStorage.getItem('reader-direction') : null;
  const [mode, setMode] = useState(stored ?? 'single');
  const [direction, setDirection] = useState(storedDir ?? 'ltr');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4 text-primary" />
            Preferências do leitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Modo de leitura padrão</label>
            <Select
              value={mode}
              onValueChange={(v) => {
                setMode(v);
                localStorage.setItem('reader-mode', v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Página única</SelectItem>
                <SelectItem value="double">Página dupla</SelectItem>
                <SelectItem value="webtoon">Webtoon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Direção de leitura padrão</label>
            <Select
              value={direction}
              onValueChange={(v) => {
                setDirection(v);
                localStorage.setItem('reader-direction', v);
              }}
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
          <p className="text-xs text-muted-foreground">
            Essas preferências serão aplicadas quando um novo capítulo for aberto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          Aparência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Tema</label>
          <div className="grid grid-cols-3 gap-2">
            {(['dark', 'light', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-medium transition-all ${
                  theme === t
                    ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                }`}
              >
                {t === 'dark' && <span className="text-base">🌙</span>}
                {t === 'light' && <span className="text-base">☀️</span>}
                {t === 'system' && <span className="text-base">⚙️</span>}
                <span className="capitalize">
                  {t === 'dark' ? 'Escuro' : t === 'light' ? 'Claro' : 'Sistema'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemTab() {
  const { stats, loading, error, fetchStats } = useSystemStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Status do sistema
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loading && !stats && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {stats && (
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard label="Uptime" value={formatUptime(stats.uptime)} />
              <StatCard label="Versão" value={stats.nodeVersion} />
              <StatCard label="Memória usada" value={stats.memory?.used} />
              <StatCard label="Memória total" value={stats.memory?.total} />
              <StatCard label="RSS" value={stats.memory?.rss} />
              <StatCard label="Plataforma" value={stats.platform} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-primary" />
            Sobre
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>MangaFlow • Frontend redesign 2026</p>
          <p>API {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
          <p>Build: {import.meta.env.MODE}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value ?? '—'}</p>
    </div>
  );
}
