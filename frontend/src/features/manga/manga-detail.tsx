import { ArrowLeft, Download, BookOpen } from 'lucide-react';
import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui';
import { Breadcrumb } from '@/components/shared';
import { useManga, useDownloads } from '@/hooks';
import { ChapterCard } from './chapter-card';

const statusLabels: Record<string, string> = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  unknown: 'Desconhecido',
};

const ROUTES = {
  SEARCH: '/search',
} as const;

export function MangaDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mangaUrl = searchParams.get('url') || '';
  const { manga, loading, error, fetchMangaInfo } = useManga();
  const { startDownload, startingDownload } = useDownloads();

  const [startChapter, setStartChapter] = useState('1');
  const [endChapter, setEndChapter] = useState('');
  const [imageFormat, setImageFormat] = useState('original');

  useEffect(() => {
    if (mangaUrl) {
      fetchMangaInfo(mangaUrl);
    }
  }, [mangaUrl, fetchMangaInfo]);

  const handleStartDownload = async (e: FormEvent) => {
    e.preventDefault();
    if (!mangaUrl) return;

    const result = await startDownload({
      url: mangaUrl,
      startChapter: parseInt(startChapter) || 1,
      endChapter: endChapter ? parseInt(endChapter) : undefined,
      imageFormat,
    });

    if (result) {
      toast.success('Download iniciado!', {
        description: `ID: ${result.downloadId}`,
      });
      navigate('/downloads');
    } else {
      toast.error('Falha ao iniciar download');
    }
  };

  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Buscar', href: ROUTES.SEARCH },
    { label: manga?.title || 'Carregando...' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[hsl(var(--muted))] border-t-[hsl(var(--primary))]" />
            <p className="text-[hsl(var(--muted-foreground))]">Carregando informações do mangá...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-[hsl(var(--destructive))]/10 p-6 mb-4">
            <svg className="h-12 w-12 text-[hsl(var(--destructive))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Erro ao carregar mangá</h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-md mb-6">{error}</p>
          <Button onClick={() => navigate(ROUTES.SEARCH)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Busca
          </Button>
        </div>
      </div>
    );
  }

  if (!manga) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Cover & Actions */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
            {manga.coverUrl ? (
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full object-cover transition-transform hover:scale-105 duration-500"
              />
            ) : (
              <div className="flex h-80 items-center justify-center">
                <BookOpen className="h-20 w-20 text-[hsl(var(--muted-foreground))]" />
              </div>
            )}
          </div>

          {/* Download Card */}
          <Card className="overflow-hidden border-[hsl(var(--primary))]/20">
            <CardHeader className="bg-[hsl(var(--primary))]/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5 text-[hsl(var(--primary))]" />
                Baixar Mangá
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleStartDownload} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Cap. Inicial</label>
                    <Input
                      type="number"
                      min="1"
                      value={startChapter}
                      onChange={(e) => setStartChapter(e.target.value)}
                      className="h-10"
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
                      className="h-10"
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
                  className="w-full"
                  size="lg"
                  disabled={startingDownload || manga.chapters.length === 0}
                >
                  {startingDownload ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Iniciar Download ({manga.chapters.length} cap.)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Source Badge */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Fonte: {manga.source}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{manga.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              {manga.status && (
                <Badge
                  variant={
                    manga.status === 'ongoing'
                      ? 'success'
                      : manga.status === 'completed'
                      ? 'default'
                      : manga.status === 'hiatus'
                      ? 'warning'
                      : 'secondary'
                  }
                  size="lg"
                >
                  {statusLabels[manga.status] || manga.status}
                </Badge>
              )}
              <Badge variant="outline" size="lg">
                {manga.source}
              </Badge>
              <Badge variant="secondary" size="lg">
                {manga.totalChapters} capítulos
              </Badge>
            </div>
          </div>

          {/* Meta Information */}
          {(manga.author || manga.artist || manga.genres?.length) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {manga.author && (
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-1">Autor</h3>
                  <p className="font-medium">{manga.author}</p>
                </div>
              )}
              {manga.artist && (
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-1">Artista</h3>
                  <p className="font-medium">{manga.artist}</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {manga.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sinopse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))] whitespace-pre-line">
                  {manga.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Genres */}
          {manga.genres && manga.genres.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Gêneros</h2>
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" size="lg">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Chapters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Capítulos ({manga.chapters.length})
              </h2>
            </div>

            {manga.chapters.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Nenhum capítulo disponível.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {manga.chapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.url}
                    chapter={chapter}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
