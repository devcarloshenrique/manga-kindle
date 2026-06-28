import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  HardDrive,
  RefreshCw,
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
  Skeleton,
} from '@/components/ui';
import { useDownloads, useLibrary } from '@/hooks';
import type { DownloadItemState } from '@/stores/download-store';
import { ChapterListOptimized, type ChapterListItem } from './chapter-list-optimized';
import { QuickAccessDashboard, type QuickAccessCurrentReading, type QuickAccessRecentChapter } from './quick-access-dashboard';

function formatBytes(bytes?: number) {
  if (!bytes || Number.isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size > 10 ? 0 : 1)} ${units[unit]}`;
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

interface ExploreViewProps {
  activeDownloads: DownloadItemState[];
}

export function ExploreView({ activeDownloads }: ExploreViewProps) {
  const navigate = useNavigate();
  const {
    stats,
    mangas,
    selectedManga,
    meta,
    loading: libraryLoading,
    error: libraryError,
    fetchMangas,
    fetchMangaDetails,
  } = useLibrary({ page: 1, limit: 20, sortBy: 'updatedAt', order: 'desc' });
  const { startDownload, startingDownload } = useDownloads();

  const [search, setSearch] = useState('');
  const [selectedMangaSlug, setSelectedMangaSlug] = useState('');

  const resolvedMangaSlug = selectedMangaSlug || mangas[0]?.slug || '';
  const isSelectedMangaLoaded = selectedManga?.slug === resolvedMangaSlug;

  useEffect(() => {
    if (resolvedMangaSlug && !isSelectedMangaLoaded) {
      fetchMangaDetails(resolvedMangaSlug);
    }
  }, [resolvedMangaSlug, isSelectedMangaLoaded, fetchMangaDetails]);

  const paginationInfo = useMemo(
    () => ({
      page: Number(meta?.page ?? 1),
      totalPages: Number(meta?.totalPages ?? 1),
      total: Number(meta?.total ?? mangas.length),
    }),
    [meta, mangas.length],
  );

  const selectedMangaOption = mangas.find((m) => m.slug === resolvedMangaSlug);

  const handleSearch = async () => {
    await fetchMangas({
      page: 1,
      limit: 20,
      search: search.trim() || undefined,
      sortBy: 'updatedAt',
      order: 'desc',
    });
  };

  const handleSelectManga = async (slug: string) => {
    setSelectedMangaSlug(slug);
    await fetchMangaDetails(slug);
  };

  const getChapterOrdinal = (chapterName: string) => {
    const idx = (selectedManga?.chapters ?? []).findIndex((c: { name: string }) => c.name === chapterName);
    if (idx < 0) return 1;
    const extracted = selectedManga?.chapters[idx].name.match(/\d+/)?.[0];
    const n = extracted ? Number.parseInt(extracted, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : idx + 1;
  };

  const queueChapterDownload = async (chapterId: string) => {
    if (!selectedManga?.info.url) {
      toast.error('Selecione um mangá para baixar capítulos');
      return;
    }
    const chapterNumber = getChapterOrdinal(chapterId);
    const result = await startDownload({
      url: selectedManga.info.url,
      startChapter: chapterNumber,
      endChapter: chapterNumber,
      imageFormat: 'original',
    });
    if (result) {
      toast.success('Download de capítulo enviado', { description: `Capítulo ${chapterId}` });
    } else {
      toast.error('Falha ao enviar capítulo para download');
    }
  };

  const handleContinueReading = () => {
    if (!resolvedMangaSlug) {
      toast.error('Nenhum mangá selecionado');
      return;
    }
    const chapterName = selectedManga?.chapters?.[0]?.name;
    if (chapterName) {
      navigate(`/manga/${resolvedMangaSlug}/read/${encodeURIComponent(chapterName)}`);
    } else {
      navigate(`/manga/${resolvedMangaSlug}`);
    }
  };

  const handleReadChapter = (chapterId: string) => {
    if (!resolvedMangaSlug) return;
    navigate(`/manga/${resolvedMangaSlug}/read/${encodeURIComponent(chapterId)}`);
  };

  const activeDownloadForSelectedManga = useMemo(
    () => activeDownloads.find((d) => d.data.mangaTitle === selectedManga?.info.title),
    [activeDownloads, selectedManga?.info.title],
  );

  const chapterListItems = useMemo<ChapterListItem[]>(() => {
    const chapters = selectedManga?.chapters ?? [];
    return chapters.map((chapter: { name: string; pageCount: number; converted?: boolean; downloadedAt?: string }) => {
      const isCurrentDownloading =
        activeDownloadForSelectedManga?.data.progress.currentChapter === chapter.name;
      const hasError = (activeDownloadForSelectedManga?.data.errors ?? []).some(
        (e) => e.chapter === chapter.name,
      );
      const status = hasError
        ? 'error'
        : isCurrentDownloading
          ? 'downloading'
          : chapter.converted
            ? 'read'
            : chapter.pageCount > 0
              ? 'downloaded'
              : 'unread';
      return {
        id: chapter.name,
        chapterLabel: chapter.name,
        pageCount: chapter.pageCount,
        status,
        progressPercent: isCurrentDownloading
          ? activeDownloadForSelectedManga?.data.progress.percentage
          : undefined,
      };
    });
  }, [activeDownloadForSelectedManga, selectedManga?.chapters]);

  const recentDownloadedChapters = useMemo<QuickAccessRecentChapter[]>(() => {
    if (!selectedManga) return [];
    return [...selectedManga.chapters]
      .filter((c) => c.pageCount > 0)
      .sort(
        (a, b) =>
          new Date(b.downloadedAt ?? 0).getTime() -
          new Date(a.downloadedAt ?? 0).getTime(),
      )
      .slice(0, 5)
      .map((c) => ({
        id: c.name,
        mangaTitle: selectedManga.info.title,
        chapterLabel: c.name,
        downloadedAtLabel: formatDate(c.downloadedAt),
        offline: true,
      }));
  }, [selectedManga]);

  const currentReading = useMemo<QuickAccessCurrentReading | null>(() => {
    if (!selectedManga) return null;
    const currentChapter =
      selectedManga.chapters.find((c: { converted?: boolean }) => c.converted) ?? selectedManga.chapters[0];
    if (!currentChapter) return null;
    const hasOffline = selectedManga.chapters.some((c: { pageCount: number }) => c.pageCount > 0);
    return {
      mangaTitle: selectedManga.info.title,
      chapterLabel: currentChapter.name,
      progressPercent: activeDownloadForSelectedManga?.data.progress.percentage,
      offlineAvailable: hasOffline,
    };
  }, [activeDownloadForSelectedManga?.data.progress.percentage, selectedManga]);

  const handleDownloadNext = async () => {
    const next =
      chapterListItems.find((c) => c.status === 'unread') ??
      chapterListItems.find((c) => c.status === 'downloaded');
    if (!next) {
      toast.info('Nenhum próximo capítulo disponível para download');
      return;
    }
    await queueChapterDownload(next.id);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Mangás', value: stats?.totalMangas ?? 0, icon: BookOpen },
          { label: 'Capítulos', value: stats?.totalChapters ?? 0, icon: Compass },
          { label: 'Páginas', value: stats?.totalPages ?? 0, icon: RefreshCw },
          {
            label: 'Tamanho',
            value: `${stats?.totalSizeMB?.toFixed(1) ?? 0} MB`,
            icon: HardDrive,
          },
        ].map((s) => (
          <Card key={s.label} className="hover-lift">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manga grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="h-4 w-4 text-primary" />
            Explorar biblioteca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar manga por título..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={libraryLoading}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>

          {libraryLoading && mangas.length === 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {mangas.map((manga) => (
                <button
                  key={manga.slug}
                  type="button"
                  onClick={() => handleSelectManga(manga.slug)}
                  className={`group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover-lift ${
                    selectedMangaSlug === manga.slug
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-border/50 hover:border-primary/40'
                  }`}
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                    {manga.coverUrl ? (
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="cover-gradient absolute inset-0" />
                    {manga.hasConverted && (
                      <div className="absolute right-2 top-2">
                        <Badge variant="success" size="xs" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Convertido
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <p className="line-clamp-2 text-sm font-bold leading-tight text-white">
                        {manga.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-medium text-white/80">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {manga.totalChapters} caps
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {manga.totalSizeMB.toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Página {paginationInfo.page} de {paginationInfo.totalPages} • Total:{' '}
            {paginationInfo.total}
          </p>
        </CardContent>
      </Card>

      {/* Selected manga detail */}
      {selectedManga && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="absolute inset-0 opacity-20 blur-2xl">
              {selectedMangaOption?.coverUrl && (
                <img
                  src={selectedMangaOption.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="w-32 shrink-0 md:w-48">
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-primary/20 shadow-xl">
                    {selectedMangaOption?.coverUrl ? (
                      <img
                        src={selectedMangaOption.coverUrl}
                        alt={selectedManga.info.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/50">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1 space-y-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-background/50 backdrop-blur">
                        {selectedManga.info.status ?? 'Desconhecido'}
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {selectedManga.info.language ?? '—'}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                      {selectedManga.info.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <p>
                        Tamanho:{' '}
                        <span className="font-medium text-foreground">
                          {formatBytes(selectedManga.totalSizeBytes)}
                        </span>
                      </p>
                      <p>
                        Atualizado:{' '}
                        <span className="font-medium text-foreground">
                          {formatDate(selectedManga.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <QuickAccessDashboard
                    currentReading={currentReading}
                    recentDownloadedChapters={recentDownloadedChapters}
                    onContinueReading={handleContinueReading}
                    onDownloadNext={handleDownloadNext}
                    onOpenRecentChapter={(id) => handleReadChapter(id)}
                    disabled={startingDownload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapter list */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {resolvedMangaSlug && !isSelectedMangaLoaded ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <ChapterListOptimized
                    chapters={chapterListItems}
                    onRead={handleReadChapter}
                    onDownload={queueChapterDownload}
                    onRetry={queueChapterDownload}
                    disabled={startingDownload}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {libraryError && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{libraryError}</CardContent>
        </Card>
      )}
    </div>
  );
}
