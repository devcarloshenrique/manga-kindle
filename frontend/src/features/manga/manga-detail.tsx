import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  Play,
  User,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { libraryService } from '@/services/library.service';
import { useDownloads } from '@/hooks';
import type { LibraryMangaDetails, Manga } from '@/services/types';

function statusLabels(s?: string) {
  const map: Record<string, string> = {
    ongoing: 'Em andamento',
    completed: 'Completo',
    hiatus: 'Hiato',
  };
  return s ? map[s] ?? s : 'Desconhecido';
}

function formatDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('pt-BR');
}

/**
 * Unified manga details page. Works for:
 * - Downloaded library manga (route /manga/:slug) — full reading + conversion actions.
 * - External manga (state.manga from search) — download form only.
 */
export function MangaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startDownload, startingDownload } = useDownloads();

  const [details, setDetails] = useState<LibraryMangaDetails | null>(null);
  const [externalManga, setExternalManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startChapter, setStartChapter] = useState('1');
  const [endChapter, setEndChapter] = useState('');
  const [imageFormat, setImageFormat] = useState('original');

  const fromUrl = searchParams.get('url') || '';

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Mode 1: external URL from search redirect
        if (fromUrl) {
          const { mangaService } = await import('@/services/manga.service');
          const info = await mangaService.getInfo(fromUrl);
          if (active) setExternalManga(info);
          return;
        }
        // Mode 2: library slug
        if (slug) {
          const data = await libraryService.getManga(slug);
          if (active) setDetails(data);
          return;
        }
        if (active) setError('Nenhum mangá especificado.');
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : 'Erro ao carregar mangá');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, fromUrl]);

  const title = details?.info.title ?? externalManga?.title ?? 'Carregando...';
  const coverUrl = details?.info.coverUrl ?? externalManga?.coverUrl;
  const description = details?.info.description ?? externalManga?.description;
  const author = details?.info.author ?? externalManga?.author;
  const artist = details?.info.artist ?? externalManga?.artist;
  const genres = details?.info.genres ?? externalManga?.genres;
  const status = details?.info.status ?? externalManga?.status;
  const source = details?.info.source ?? externalManga?.source;
  const language = details?.info.language ?? externalManga?.language;

  const handleStartDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = details?.info.url ?? externalManga?.url;
    if (!url) {
      toast.error('URL do mangá indisponível');
      return;
    }
    const result = await startDownload({
      url,
      startChapter: parseInt(startChapter) || 1,
      endChapter: endChapter ? parseInt(endChapter) : undefined,
      imageFormat,
    });
    if (result) {
      toast.success('Download iniciado!', { description: `ID: ${result.downloadId}` });
      navigate('/downloads');
    } else {
      toast.error('Falha ao iniciar download');
    }
  };

  const handleReadChapter = (chapterName: string) => {
    if (slug) navigate(`/manga/${slug}/read/${encodeURIComponent(chapterName)}`);
  };

  const handleContinueReading = () => {
    if (!details) return;
    const chapter =
      details.chapters.find((c) => c.converted) ?? details.chapters[0];
    if (chapter) {
      navigate(`/manga/${slug}/read/${encodeURIComponent(chapter.name)}`);
    }
  };

  const handleConvert = () => {
    if (slug) navigate(`/convert?manga=${slug}`);
  };

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] animate-in fade-in duration-300">
        <Skeleton className="aspect-[2/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <BookOpen className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Erro ao carregar mangá</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => navigate('/search')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Busca
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-enter">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50">
        <div className="absolute inset-0">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover blur-2xl opacity-40 scale-110"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className={`Absolute top-0 left-0 m-4 md:m-6`}>
            <Button variant="glass" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end pt-12 md:pt-0">
            {/* Cover */}
            <div className="w-40 shrink-0 md:w-56">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl ring-1 ring-black/20">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/50">
                    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 pb-2">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {status && (
                    <Badge
                      variant={
                        status === 'ongoing'
                          ? 'success'
                          : status === 'completed'
                            ? 'default'
                            : status === 'hiatus'
                              ? 'warning'
                              : 'secondary'
                      }
                      size="lg"
                    >
                      {statusLabels(status)}
                    </Badge>
                  )}
                  {language && <Badge variant="secondary">{language}</Badge>}
                  {source && <Badge variant="outline">{source}</Badge>}
                  {details && (
                    <Badge variant="info" size="sm">
                      {details.totalChapters} cap. • {details.totalSizeMB.toFixed(1)} MB
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {title}
                </h1>
                {author && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {author}
                    </span>
                    {artist && artist !== author && (
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4" />
                        {artist}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {details && details.totalPages > 0 && (
                  <Button size="lg" onClick={handleContinueReading}>
                    <Play className="h-4 w-4" />
                    Continuar Lendo
                  </Button>
                )}
                <Button variant="gradient" size="lg" onClick={handleConvert}>
                  <Download className="h-4 w-4" />
                  Converter para Kindle
                </Button>
                {externalManga && externalManga.url && (
                  <a
                    href={externalManga.url}
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

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-8">
          {/* Synopsis */}
          {description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sinopse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Genres */}
          {genres && genres.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Gêneros</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chapters (library mode) */}
          {details && details.chapters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Capítulos ({details.chapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {details.chapters.slice(0, 20).map((ch) => (
                  <div
                    key={ch.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 p-3 hover:border-primary/30 hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ch.pageCount} pág.
                        {ch.downloadedAt && ` • ${formatDate(ch.downloadedAt)}`}
                        {ch.converted && ' • ✓ Convertido'}
                      </p>
                    </div>
                    {ch.pageCount > 0 ? (
                      <Button size="sm" onClick={() => handleReadChapter(ch.name)}>
                        <Play className="h-3 w-3" />
                        Ler
                      </Button>
                    ) : (
                      <Badge variant="outline" size="sm">
                        Offline indisponível
                      </Badge>
                    )}
                  </div>
                ))}
                {details.chapters.length > 20 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    ... e mais {details.chapters.length - 20} capítulos
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — download form (external mode) */}
        {externalManga && (
          <Card className="h-fit border-primary/20 bg-gradient-to-b from-card to-card/50">
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
                  disabled={startingDownload || externalManga.chapters.length === 0}
                >
                  {startingDownload ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {startingDownload
                    ? 'Iniciando...'
                    : `Iniciar Download (${externalManga.chapters.length} cap.)`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
