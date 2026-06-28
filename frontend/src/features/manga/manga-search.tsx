import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  Search,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import { mangaService } from '@/services/manga.service';
import { useDownloads } from '@/hooks';
import type { Manga } from '@/services/types';

function statusLabel(s?: string) {
  const map: Record<string, string> = {
    ongoing: 'Em andamento',
    completed: 'Completo',
    hiatus: 'Hiato',
  };
  return s ? map[s] ?? s : 'Desconhecido';
}

export function MangaSearch() {
  const navigate = useNavigate();
  const { startDownload, startingDownload } = useDownloads();

  const [searchUrl, setSearchUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Manga | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [startChapter, setStartChapter] = useState('1');
  const [endChapter, setEndChapter] = useState('');
  const [imageFormat, setImageFormat] = useState('original');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('url');
    if (q) {
      setSearchUrl(q);
      void handleSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (url?: string) => {
    const targetUrl = url ?? searchUrl;
    if (!targetUrl.trim()) {
      toast.error('Insira uma URL para buscar');
      return;
    }
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const info = await mangaService.getInfo(targetUrl.trim());
      setResult(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar mangá');
    } finally {
      setSearching(false);
    }
  };

  const handleOpenDetails = () => {
    if (!result) return;
    const slug = encodeURIComponent(result.title.toLowerCase().replace(/\s+/g, '-'));
    navigate(`/manga/${slug}`, { state: { manga: result } });
  };

  const handleStartDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?.url) {
      toast.error('URL do mangá indisponível');
      return;
    }
    const out = await startDownload({
      url: result.url,
      startChapter: parseInt(startChapter) || 1,
      endChapter: endChapter ? parseInt(endChapter) : undefined,
      imageFormat,
    });
    if (out) {
      toast.success('Download iniciado!', { description: `ID: ${out.downloadId}` });
      navigate('/downloads');
    } else {
      toast.error('Falha ao iniciar download');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-gradient-to-b from-card to-card/50">
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Cole a URL do mangá (ex. MangaDex, MangaSee)..."
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {searching ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searching && (
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] animate-in fade-in duration-300">
          <Skeleton className="aspect-[2/3] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}

      {error && !searching && (
        <Card className="border-destructive/40">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium mb-2">Erro na busca</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {!searching && !result && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Busque seu próximo mangá</h2>
          <p className="text-muted-foreground max-w-md">
            Cole a URL de qualquer fonte suportada e baixe diretamente para sua biblioteca.
          </p>
        </div>
      )}

      {result && !searching && (
        <div className="space-y-8 page-enter">
          <div className="relative overflow-hidden rounded-2xl border border-border/50">
            <div className="absolute inset-0">
              {result.coverUrl ? (
                <img
                  src={result.coverUrl}
                  alt=""
                  className="h-full w-full object-cover blur-2xl opacity-40 scale-110"
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative z-10 p-6 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-end">
                <div className="w-40 shrink-0 md:w-56">
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl ring-1 ring-black/20">
                    {result.coverUrl ? (
                      <img
                        src={result.coverUrl}
                        alt={result.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 pb-2">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {result.status && (
                        <Badge
                          variant={
                            result.status === 'ongoing'
                              ? 'success'
                              : result.status === 'completed'
                                ? 'default'
                                : 'warning'
                          }
                          size="lg"
                        >
                          {statusLabel(result.status)}
                        </Badge>
                      )}
                      {result.language && <Badge variant="secondary">{result.language}</Badge>}
                      {result.source && <Badge variant="outline">{result.source}</Badge>}
                      <Badge variant="info" size="sm">
                        {result.chapters.length} capítulos
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                      {result.title}
                    </h1>
                    {result.author && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {result.author}
                        </span>
                        {result.artist && result.artist !== result.author && (
                          <span className="flex items-center gap-1.5">
                            <Heart className="h-4 w-4" />
                            {result.artist}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="gradient" size="lg" onClick={handleOpenDetails}>
                      <BookOpen className="h-4 w-4" />
                      Ver detalhes
                    </Button>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background/50 px-6 text-sm font-semibold backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Fonte original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-primary/20 bg-gradient-to-b from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5 text-primary" />
                Baixar Mangá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartDownload} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Cap. Inicial</label>
                    <Input
                      type="number"
                      min="1"
                      value={startChapter}
                      onChange={(e) => setStartChapter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Cap. Final</label>
                    <Input
                      type="number"
                      min="1"
                      value={endChapter}
                      onChange={(e) => setEndChapter(e.target.value)}
                      placeholder="Todos"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Formato de imagem</label>
                  <Select value={imageFormat} onValueChange={setImageFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={startingDownload || result.chapters.length === 0}
                >
                  {startingDownload ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {startingDownload
                    ? 'Iniciando...'
                    : `Iniciar Download (${result.chapters.length} cap.)`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
