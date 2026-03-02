import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useManga, useDownloads } from '@/hooks';
import { LoadingSpinner } from '@/components/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Select,
  Separator,
  ScrollArea,
} from '@/components/ui';
import { IMAGE_FORMATS, ROUTES } from '@/lib/constants';

const statusLabels: Record<string, string> = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  unknown: 'Desconhecido',
};

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
      navigate(ROUTES.DOWNLOADS);
    } else {
      toast.error('Falha ao iniciar download');
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-24" text="Carregando informacoes do manga..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.SEARCH)}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/10 p-4">
          <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
        </div>
      </div>
    );
  }

  if (!manga) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.SEARCH)}>
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Cover & Info */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
            {manga.coverUrl ? (
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <BookOpen className="h-16 w-16 text-[hsl(var(--muted-foreground))]" />
              </div>
            )}
          </div>

          {/* Download Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Baixar Manga</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartDownload} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Cap. Inicial</label>
                    <Input
                      type="number"
                      min="1"
                      value={startChapter}
                      onChange={(e) => setStartChapter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Cap. Final</label>
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
                  <label className="mb-1 block text-sm font-medium">Formato</label>
                  <Select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value)}
                    options={IMAGE_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={startingDownload}>
                  <Download className="h-4 w-4" />
                  {startingDownload ? 'Iniciando...' : 'Iniciar Download'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{manga.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {manga.status && (
                <Badge>{statusLabels[manga.status] || manga.status}</Badge>
              )}
              <Badge variant="outline">{manga.source}</Badge>
              <Badge variant="secondary">{manga.totalChapters} capitulos</Badge>
            </div>
          </div>

          {(manga.author || manga.artist) && (
            <div className="flex gap-6 text-sm">
              {manga.author && (
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Autor: </span>
                  <span className="font-medium">{manga.author}</span>
                </div>
              )}
              {manga.artist && (
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Artista: </span>
                  <span className="font-medium">{manga.artist}</span>
                </div>
              )}
            </div>
          )}

          {manga.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Sinopse</h2>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {manga.description}
              </p>
            </div>
          )}

          {manga.genres && manga.genres.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Generos</h2>
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Chapters List */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Capitulos ({manga.chapters.length})
            </h2>
            <ScrollArea className="max-h-[500px] rounded-lg border border-[hsl(var(--border))]">
              <div className="divide-y divide-[hsl(var(--border))]">
                {manga.chapters.map((chapter) => (
                  <div
                    key={chapter.url}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    <div>
                      <span className="font-medium">Capitulo {chapter.number}</span>
                      {chapter.title && (
                        <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
                          - {chapter.title}
                        </span>
                      )}
                    </div>
                    {chapter.publishedAt && (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(chapter.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
