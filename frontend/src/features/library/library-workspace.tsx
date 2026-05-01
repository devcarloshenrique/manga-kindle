import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  FolderSync,
  HardDrive,
  RefreshCw,
  Sparkles,
  Workflow,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDownloads, useKcc, useLibrary } from '@/hooks';
import { API_URL } from '@/lib/constants';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Progress,
  Switch,
} from '@/components/ui';
import { QuickAccessDashboard } from './quick-access-dashboard';
import { ChapterListOptimized, type ChapterListItem } from './chapter-list-optimized';

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'EPUB', label: 'EPUB' },
  { value: 'MOBI', label: 'MOBI' },
  { value: 'CBZ', label: 'CBZ' },
  { value: 'KFX', label: 'KFX' },
];

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
type ConversionMode = 'all' | 'range' | 'selected';

const WORKSPACE_VIEW_QUERY_KEY = 'view';

function parseWorkspaceView(raw: string | null): WorkspaceView {
  if (raw === 'explore' || raw === 'conversion' || raw === 'jobs') {
    return raw;
  }

  if (raw === 'library') {
    return 'explore';
  }

  return 'explore';
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

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

function statusBadgeVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'outline';
  if (status === 'completed') return 'default';
  if (status === 'failed' || status === 'cancelled') return 'destructive';
  if (status === 'processing' || status === 'queued') return 'secondary';
  return 'outline';
}

export function LibraryWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const {
    profiles,
    presets,
    jobs,
    convertedFiles,
    loading: kccLoading,
    submitting,
    error: kccError,
    convertManga,
    convertChapters,
    fetchInitialData,
    refreshJobs,
    organizeDownloads,
    organizeConverted,
  } = useKcc();

  const {
    activeDownloads,
    startDownload,
    startingDownload,
  } = useDownloads();

  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<'EPUB' | 'MOBI' | 'CBZ' | 'KFX'>('EPUB');
  const [selectedMangaSlug, setSelectedMangaSlug] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('manga');
  const [mergeIntoVolumes, setMergeIntoVolumes] = useState(true);
  const [singleVolume, setSingleVolume] = useState(false);
  const [chaptersPerVolume, setChaptersPerVolume] = useState('10');
  const [mangaStyle, setMangaStyle] = useState(true);
  const [hq, setHq] = useState(true);
  const [webtoon, setWebtoon] = useState(false);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('all');
  const [rangeStartChapter, setRangeStartChapter] = useState('');
  const [rangeEndChapter, setRangeEndChapter] = useState('');
  const [selectedChapterNames, setSelectedChapterNames] = useState<string[]>([]);

  const activeView = parseWorkspaceView(searchParams.get(WORKSPACE_VIEW_QUERY_KEY));

  const setActiveView = (view: WorkspaceView) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(WORKSPACE_VIEW_QUERY_KEY, view);
      return next;
    }, { replace: true });
  };

  const resolvedMangaSlug = selectedMangaSlug || mangas[0]?.slug || '';
  const resolvedProfile = selectedProfile || profiles[0]?.id || '';
  const isSelectedMangaLoaded = selectedManga?.slug === resolvedMangaSlug;
  const resolvedMangaDetails = isSelectedMangaLoaded ? selectedManga : null;

  useEffect(() => {
    if (resolvedMangaSlug && !isSelectedMangaLoaded) {
      fetchMangaDetails(resolvedMangaSlug);
    }
  }, [resolvedMangaSlug, isSelectedMangaLoaded, fetchMangaDetails]);

  const paginationInfo = useMemo(() => {
    const page = Number(meta?.page ?? 1);
    const totalPages = Number(meta?.totalPages ?? 1);
    const total = Number(meta?.total ?? mangas.length);
    return { page, totalPages, total };
  }, [meta, mangas.length]);

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
    setSelectedChapterNames([]);
    setRangeStartChapter('');
    setRangeEndChapter('');
    await fetchMangaDetails(slug);
  };

  const chapterOptions = (resolvedMangaDetails?.chapters ?? []).map((chapter) => ({
    value: chapter.name,
    label: `${chapter.name} • ${chapter.pageCount} pág.`,
  }));

  const firstChapterName = resolvedMangaDetails?.chapters?.[0]?.name ?? '';
  const lastChapterName =
    resolvedMangaDetails?.chapters?.[resolvedMangaDetails.chapters.length - 1]?.name ?? '';
  const effectiveRangeStartChapter = rangeStartChapter || firstChapterName;
  const effectiveRangeEndChapter = rangeEndChapter || lastChapterName;

  const selectedChapterPaths = useMemo(() => {
    const chapters = resolvedMangaDetails?.chapters ?? [];
    if (!chapters.length) return [] as string[];

    const toRelativePath = (chapterPath: string, chapterName: string) => {
      if (chapterPath.startsWith('downloads/')) {
        return chapterPath.replace(/^downloads\//, '');
      }
      return `${resolvedMangaSlug}/${chapterName}`;
    };

    if (conversionMode === 'selected') {
      return chapters
        .filter((chapter) => selectedChapterNames.includes(chapter.name))
        .map((chapter) => toRelativePath(chapter.path, chapter.name));
    }

    return [];
  }, [conversionMode, resolvedMangaDetails, resolvedMangaSlug, selectedChapterNames]);

  const handleToggleSelectedChapter = (chapterName: string) => {
    setSelectedChapterNames((prev) =>
      prev.includes(chapterName)
        ? prev.filter((name) => name !== chapterName)
        : [...prev, chapterName],
    );
  };

  const handleConvertManga = async () => {
    if (!resolvedMangaSlug || !resolvedProfile) {
      toast.error('Selecione manga e perfil antes de converter');
      return;
    }

    if (conversionMode === 'selected') {
      if (selectedChapterPaths.length === 0) {
        toast.error('Selecione ao menos um capítulo para converter');
        return;
      }

      const result = await convertChapters({
        chapters: selectedChapterPaths,
        mergeIntoSingleVolume: singleVolume || mergeIntoVolumes,
        outputFormat: format,
        profile: resolvedProfile,
        preset: selectedPreset as
          | 'default'
          | 'manga'
          | 'webtoon'
          | 'highQuality'
          | 'noProcessing'
          | 'comic',
        options: {
          mangaStyle,
          hq,
          webtoon,
        },
      });

      if (!result) {
        toast.error('Falha ao enviar conversão');
        return;
      }

      toast.success('Conversão enviada para fila', {
        description: result.message,
      });
      setActiveView('jobs');
      refreshJobs();
      return;
    }

    const chapters = resolvedMangaDetails?.chapters ?? [];
  const startIndex = chapters.findIndex((chapter) => chapter.name === effectiveRangeStartChapter);
  const endIndex = chapters.findIndex((chapter) => chapter.name === effectiveRangeEndChapter);

    const startChapter = conversionMode === 'range' && startIndex >= 0
      ? Math.min(startIndex, endIndex) + 1
      : undefined;

    const endChapter = conversionMode === 'range' && endIndex >= 0
      ? Math.max(startIndex, endIndex) + 1
      : undefined;

    const result = await convertManga({
      mangaSlug: resolvedMangaSlug,
      outputFormat: format,
      profile: resolvedProfile,
      preset: selectedPreset as
        | 'default'
        | 'manga'
        | 'webtoon'
        | 'highQuality'
        | 'noProcessing'
        | 'comic',
      mergeIntoVolumes,
      singleVolume,
      chaptersPerVolume: Number(chaptersPerVolume) || 10,
      startChapter,
      endChapter,
      options: {
        mangaStyle,
        hq,
        webtoon,
      },
    });

    if (!result) {
      toast.error('Falha ao enviar conversão');
      return;
    }

    toast.success('Conversão enviada para fila', {
      description: result.message,
    });
    setActiveView('jobs');
    refreshJobs();
  };

  const handleOrganizeDownloads = async () => {
  const response = await organizeDownloads(resolvedMangaSlug || undefined);
    if (response) {
      toast.success('Downloads organizados', { description: response.message });
      fetchMangas({ page: 1, limit: 20, sortBy: 'updatedAt', order: 'desc' });
    }
  };

  const handleOrganizeConverted = async () => {
    const response = await organizeConverted();
    if (response) {
      toast.success('Convertidos organizados', { description: response.message });
    }
  };

  const activeDownloadForSelectedManga = useMemo(
    () => activeDownloads.find((download) => download.data.mangaTitle === selectedManga?.info.title),
    [activeDownloads, selectedManga?.info.title],
  );

  const chapterListItems = useMemo<ChapterListItem[]>(() => {
    const chapters = selectedManga?.chapters ?? [];

    return chapters.map((chapter) => {
      const isCurrentDownloading = activeDownloadForSelectedManga?.data.progress.currentChapter === chapter.name;
      const hasError = (activeDownloadForSelectedManga?.data.errors ?? []).some(
        (error) => error.chapter === chapter.name,
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

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === 'queued' || job.status === 'processing'),
    [jobs],
  );

  const activeJobsProgress = useMemo(() => {
    if (activeJobs.length === 0) return 0;

    const total = activeJobs.reduce((sum, job) => sum + (Number.isFinite(job.progress) ? job.progress : 0), 0);
    return Math.round(total / activeJobs.length);
  }, [activeJobs]);

  const conversionStepOneDone = Boolean(resolvedMangaSlug && resolvedProfile);
  const conversionStepTwoDone =
    conversionMode === 'selected'
      ? selectedChapterPaths.length > 0
      : conversionMode === 'range'
        ? Boolean(effectiveRangeStartChapter && effectiveRangeEndChapter)
        : true;
  const conversionStepThreeReady = conversionStepOneDone && conversionStepTwoDone;
  const conversionStepperValue = conversionStepThreeReady
    ? 100
    : conversionStepOneDone
      ? 66
      : 33;

  useEffect(() => {
    if (activeJobs.length > 0) {
      toast.loading('Conversões em segundo plano', {
        id: 'kcc-background-jobs',
        description: `${activeJobs.length} job(s) ativo(s) • ${activeJobsProgress}%`,
      });
      return;
    }

    toast.dismiss('kcc-background-jobs');
  }, [activeJobs.length, activeJobsProgress]);

  const recentDownloadedChapters = useMemo(() => {
    if (!selectedManga) return [];

    return [...selectedManga.chapters]
      .filter((chapter) => chapter.pageCount > 0)
      .sort((a, b) =>
        new Date(b.downloadedAt ?? 0).getTime() - new Date(a.downloadedAt ?? 0).getTime(),
      )
      .slice(0, 5)
      .map((chapter) => ({
        id: chapter.name,
        mangaTitle: selectedManga.info.title,
        chapterLabel: chapter.name,
        downloadedAtLabel: formatDate(chapter.downloadedAt),
        offline: true,
      }));
  }, [selectedManga]);

  const currentReading = useMemo(() => {
    if (!selectedManga) return null;

    const currentChapter = selectedManga.chapters.find((chapter) => chapter.converted)
      ?? selectedManga.chapters[0];

    if (!currentChapter) return null;

    const hasOffline = selectedManga.chapters.some((chapter) => chapter.pageCount > 0);

    return {
      mangaTitle: selectedManga.info.title,
      chapterLabel: currentChapter.name,
      progressPercent: activeDownloadForSelectedManga?.data.progress.percentage,
      offlineAvailable: hasOffline,
    };
  }, [activeDownloadForSelectedManga?.data.progress.percentage, selectedManga]);

  const getChapterOrdinal = (chapterName: string) => {
    const chapterIndex = (selectedManga?.chapters ?? []).findIndex((chapter) => chapter.name === chapterName);
    if (chapterIndex < 0) return 1;

    const chapter = selectedManga?.chapters[chapterIndex];
    const extracted = chapter?.name.match(/\d+/)?.[0];
    const numericFromName = extracted ? Number.parseInt(extracted, 10) : NaN;

    if (Number.isFinite(numericFromName) && numericFromName > 0) {
      return numericFromName;
    }

    return chapterIndex + 1;
  };

  const handleContinueReading = () => {
    if (!selectedManga?.info.url) {
      toast.error('Nenhum mangá selecionado para continuar leitura');
      return;
    }

    navigate(`/manga?url=${encodeURIComponent(selectedManga.info.url)}`);
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

    if (!result) {
      toast.error('Falha ao enviar capítulo para download');
      return;
    }

    toast.success('Download de capítulo enviado', {
      description: `Capítulo ${chapterId}`,
    });
  };

  const handleDownloadNext = async () => {
    const nextChapter = chapterListItems.find((chapter) => chapter.status === 'unread')
      ?? chapterListItems.find((chapter) => chapter.status === 'downloaded');

    if (!nextChapter) {
      toast.info('Nenhum próximo capítulo disponível para download');
      return;
    }

    await queueChapterDownload(nextChapter.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-center pb-2">
        <div className="inline-flex items-center justify-center rounded-2xl bg-muted/40 p-1.5 shadow-inner ring-1 ring-inset ring-border/50 backdrop-blur-md">
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

      {activeJobs.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-2 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Conversões em andamento no background</p>
              <Badge variant="outline" className="border-primary/30 bg-background">
                {activeJobs.length} job(s) ativo(s)
              </Badge>
            </div>
            <Progress value={activeJobsProgress} />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setActiveView('jobs')}>
                Ver detalhes dos jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(libraryError || kccError) && (
        <Card className="border-[hsl(var(--destructive))]/40">
          <CardContent className="pt-6 text-sm text-[hsl(var(--destructive))]">
            {libraryError ?? kccError}
          </CardContent>
        </Card>
      )}

      {activeView === 'explore' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Mangás</p>
                <p className="text-2xl font-bold">{stats?.totalMangas ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Capítulos</p>
                <p className="text-2xl font-bold">{stats?.totalChapters ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Páginas</p>
                <p className="text-2xl font-bold">{stats?.totalPages ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Tamanho</p>
                <p className="text-2xl font-bold">{stats?.totalSizeMB?.toFixed(1) ?? 0} MB</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Explorar biblioteca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar manga por título..."
                />
                <Button onClick={handleSearch} disabled={libraryLoading}>
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>

              {libraryLoading && mangas.length === 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`manga-skeleton-${index}`}>
                      <CardContent className="space-y-3 p-4">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {mangas.map((manga) => (
                    <button
                      key={manga.slug}
                      type="button"
                      className={`group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                        selectedMangaSlug === manga.slug
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectManga(manga.slug)}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
                        
                        <div className="absolute right-2 top-2 flex flex-col gap-1">
                          <Badge variant={manga.hasConverted ? 'default' : 'secondary'} className="bg-background/80 text-[10px] backdrop-blur-md">
                            {manga.hasConverted ? 'Convertido' : 'Sem conv.'}
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                          <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{manga.title}</p>
                          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-medium text-white/80">
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{manga.totalChapters} caps</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{manga.totalSizeMB.toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Página {paginationInfo.page} de {paginationInfo.totalPages} • Total: {paginationInfo.total}
              </p>
            </CardContent>
          </Card>

          {selectedManga && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              {/* Hero Banner Integrado */}
              <div className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
                <div className="absolute inset-0 opacity-10 blur-xl">
                  {selectedMangaOption?.coverUrl ? (
                    <img src={selectedMangaOption.coverUrl} alt="Background cover" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    {/* Cover Art */}
                    <div className="w-32 shrink-0 md:w-48">
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-primary/20 shadow-xl">
                        {selectedMangaOption?.coverUrl ? (
                          <img src={selectedMangaOption.coverUrl} alt={selectedManga.info.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted/50">
                            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex flex-col flex-1 space-y-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="bg-background/50 backdrop-blur">{selectedManga.info.status ?? 'Desconhecido'}</Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">{selectedManga.info.language ?? '—'}</Badge>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{selectedManga.info.title}</h2>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <p>Tamanho: <span className="font-medium text-foreground">{formatBytes(selectedManga.totalSizeBytes)}</span></p>
                          <p>Atualizado: <span className="font-medium text-foreground">{formatDate(selectedManga.updatedAt)}</span></p>
                        </div>
                      </div>

                      <QuickAccessDashboard
                        currentReading={currentReading}
                        recentDownloadedChapters={recentDownloadedChapters}
                        onContinueReading={handleContinueReading}
                        onDownloadNext={handleDownloadNext}
                        onOpenRecentChapter={() => handleContinueReading()}
                        disabled={startingDownload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Capítulos */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-0">
                  {resolvedMangaSlug && !isSelectedMangaLoaded ? (
                    <div className="space-y-2 p-6">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={`chapter-skeleton-${index}`} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6">
                      <ChapterListOptimized
                        chapters={chapterListItems}
                        onRead={() => handleContinueReading()}
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
        </div>
      )}

      {activeView === 'conversion' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4" />
                Conversão KCC por etapas
              </CardTitle>
              <div className="space-y-2">
                <Progress value={conversionStepperValue} />
                <div className="grid gap-2 text-xs text-[hsl(var(--muted-foreground))] sm:grid-cols-3">
                  <p className={conversionStepOneDone ? 'text-[hsl(var(--foreground))]' : ''}>1. Fonte e dispositivo</p>
                  <p className={conversionStepTwoDone ? 'text-[hsl(var(--foreground))]' : ''}>2. Escopo de capítulos</p>
                  <p className={conversionStepThreeReady ? 'text-[hsl(var(--foreground))]' : ''}>3. Revisar e enviar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Mangá</label>
                  <Select value={resolvedMangaSlug} onValueChange={handleSelectManga}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um mangá" />
                    </SelectTrigger>
                    <SelectContent>
                      {mangas.map((m) => (
                        <SelectItem key={m.slug} value={m.slug}>
                          {`${m.title} • ${m.totalChapters} caps • ${m.totalPages} pág.`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Perfil do dispositivo</label>
                  <Select value={resolvedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {`${profile.id}${profile.name ? ` - ${profile.name}` : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Formato de saída</label>
                  <Select value={format} onValueChange={(value) => setFormat(value as 'EPUB' | 'MOBI' | 'CBZ' | 'KFX')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Preset</label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {`${preset.name} — ${preset.description}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Modo de conversão</label>
                  <Select value={conversionMode} onValueChange={(value) => setConversionMode(value as ConversionMode)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os capítulos do mangá</SelectItem>
                      <SelectItem value="range">Faixa de capítulos (início/fim)</SelectItem>
                      <SelectItem value="selected">Selecionar capítulos manualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Capítulos por volume</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={chaptersPerVolume}
                    onChange={(e) => setChaptersPerVolume(e.target.value)}
                  />
                </div>
              </div>

              {conversionMode === 'range' && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Capítulo inicial</label>
                    <Select value={effectiveRangeStartChapter} onValueChange={setRangeStartChapter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Capítulo inicial" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapterOptions.map((option) => (
                          <SelectItem key={`start-${option.value}`} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Capítulo final</label>
                    <Select value={effectiveRangeEndChapter} onValueChange={setRangeEndChapter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Capítulo final" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapterOptions.map((option) => (
                          <SelectItem key={`end-${option.value}`} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {conversionMode === 'selected' && (
                <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">Seleção manual de capítulos</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChapterNames((resolvedMangaDetails?.chapters ?? []).map((chapter) => chapter.name))}
                      >
                        Selecionar todos
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedChapterNames([])}>
                        Limpar
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-52 space-y-1 overflow-auto">
                    {(resolvedMangaDetails?.chapters ?? []).map((chapter) => {
                      const checked = selectedChapterNames.includes(chapter.name);
                      return (
                        <label
                          key={chapter.name}
                          className="flex items-center justify-between gap-2 rounded-md border border-[hsl(var(--border))] p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={checked} onCheckedChange={() => handleToggleSelectedChapter(chapter.name)} />
                            <span>{chapter.name}</span>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{chapter.pageCount} pág.</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <details className="rounded-lg border border-[hsl(var(--border))] p-3">
                <summary className="cursor-pointer text-sm font-medium">Opções avançadas (KCC)</summary>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <label className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    Agrupar em volumes
                    <Switch checked={mergeIntoVolumes} onCheckedChange={setMergeIntoVolumes} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    Volume único
                    <Switch checked={singleVolume} onCheckedChange={setSingleVolume} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    Manga mode
                    <Switch checked={mangaStyle} onCheckedChange={setMangaStyle} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    High quality
                    <Switch checked={hq} onCheckedChange={setHq} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm md:col-span-2">
                    Webtoon mode
                    <Switch checked={webtoon} onCheckedChange={setWebtoon} />
                  </label>
                </div>
              </details>

              <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3] p-3 text-xs text-[hsl(var(--muted-foreground))]">
                <p>
                  <strong>Mangá:</strong> {selectedMangaOption?.title ?? '—'}
                </p>
                <p>
                  <strong>Capítulos totais:</strong> {resolvedMangaDetails?.chapters.length ?? 0}
                  {conversionMode === 'selected' ? ` • Selecionados: ${selectedChapterNames.length}` : ''}
                  {conversionMode === 'range' && effectiveRangeStartChapter && effectiveRangeEndChapter
                    ? ` • Faixa: ${effectiveRangeStartChapter} até ${effectiveRangeEndChapter}`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleConvertManga} disabled={submitting || !resolvedMangaSlug || !resolvedProfile}>
                  <Sparkles className="h-4 w-4" />
                  {submitting ? 'Enviando...' : 'Converter mangá'}
                </Button>
                <Button variant="outline" onClick={handleOrganizeDownloads}>
                  <FolderSync className="h-4 w-4" />
                  Organizar downloads
                </Button>
                <Button variant="outline" onClick={handleOrganizeConverted}>
                  <HardDrive className="h-4 w-4" />
                  Organizar convertidos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col overflow-hidden border-primary/20 bg-gradient-to-b from-card to-card/50 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-base">Resumo da conversão</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 p-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {selectedMangaOption?.coverUrl ? (
                  <img src={selectedMangaOption.coverUrl} alt="Cover" className="h-full w-full object-cover blur-sm opacity-50" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {selectedMangaOption?.coverUrl ? (
                    <img src={selectedMangaOption.coverUrl} alt="Cover" className="h-full rounded-md shadow-2xl" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                  )}
                </div>
              </div>
              <div className="space-y-3 px-6 pb-6 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mangá selecionado</p>
                  <p className="font-semibold text-foreground">{selectedMangaOption?.title ?? '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Perfil</p>
                    <p className="font-medium text-foreground">{resolvedProfile || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preset</p>
                    <p className="font-medium text-foreground">{selectedPreset}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Formato</p>
                    <p className="font-medium text-foreground">{format}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Jobs ativos</p>
                    <p className="font-medium text-foreground">{activeJobs.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'jobs' && (
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
              {kccLoading && jobs.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={`job-skeleton-${index}`} className="h-20 w-full" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum job encontrado.</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{job.id}</p>
                      <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      <p>Formato: {job.outputFormat} • Perfil: {job.profile}</p>
                      <p>Progresso: {job.progress}% • Criado em: {formatDate(job.createdAt)}</p>
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum arquivo convertido ainda.</p>
              ) : (
                convertedFiles.slice(0, 20).map((file) => (
                  <div key={file.name} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {file.format} • {file.sizeFormatted} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                      <a
                        href={`${API_URL}${file.downloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Baixar
                      </a>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Clock3 className="h-3.5 w-3.5" />
        Sincronizado com Swagger (`/docs`) e endpoints da API KCC/Library.
      </div>
    </div>
  );
}
