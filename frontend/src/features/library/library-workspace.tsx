import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FolderSync,
  HardDrive,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useKcc, useLibrary } from '@/hooks';
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
  Switch,
} from '@/components/ui';

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'EPUB', label: 'EPUB' },
  { value: 'MOBI', label: 'MOBI' },
  { value: 'CBZ', label: 'CBZ' },
  { value: 'KFX', label: 'KFX' },
];

const TAB_OPTIONS = [
  { value: 'library', label: 'Biblioteca' },
  { value: 'conversion', label: 'Conversão KCC' },
  { value: 'jobs', label: 'Jobs & Arquivos' },
] as const;

type WorkspaceTab = (typeof TAB_OPTIONS)[number]['value'];
type ConversionMode = 'all' | 'range' | 'selected';

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
  if (status === 'completed' || status === 'completed') return 'default';
  if (status === 'failed' || status === 'cancelled') return 'destructive';
  if (status === 'processing' || status === 'queued') return 'secondary';
  return 'outline';
}

export function LibraryWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('library');

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Navegação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(libraryError || kccError) && (
        <Card className="border-[hsl(var(--destructive))]/40">
          <CardContent className="pt-6 text-sm text-[hsl(var(--destructive))]">
            {libraryError ?? kccError}
          </CardContent>
        </Card>
      )}

      {activeTab === 'library' && (
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
              <CardTitle className="text-base">Busca e lista da biblioteca</CardTitle>
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

              <div className="grid gap-3 lg:grid-cols-2">
                {mangas.map((manga) => (
                  <Button
                    key={manga.slug}
                    type="button"
                    variant="outline"
                    className="h-auto justify-start rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))]/60"
                    onClick={() => handleSelectManga(manga.slug)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{manga.title}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{manga.slug}</p>
                      </div>
                      <Badge variant={manga.hasConverted ? 'default' : 'outline'}>
                        {manga.hasConverted ? 'Convertido' : 'Sem conversão'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>{manga.totalChapters} capítulos</span>
                      <span>•</span>
                      <span>{manga.totalPages} páginas</span>
                      <span>•</span>
                      <span>{manga.totalSizeMB.toFixed(1)} MB</span>
                    </div>
                  </Button>
                ))}
              </div>

              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Página {paginationInfo.page} de {paginationInfo.totalPages} • Total: {paginationInfo.total}
              </p>
            </CardContent>
          </Card>

          {selectedManga && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  {selectedManga.info.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Status</p>
                    <p className="font-medium">{selectedManga.info.status ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Idioma</p>
                    <p className="font-medium">{selectedManga.info.language ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Atualizado</p>
                    <p className="font-medium">{formatDate(selectedManga.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Tamanho total</p>
                    <p className="font-medium">{formatBytes(selectedManga.totalSizeBytes)}</p>
                  </div>
                </div>

                <div className="max-h-80 overflow-auto rounded-lg border border-[hsl(var(--border))]">
                  <table className="w-full text-sm">
                    <thead className="bg-[hsl(var(--muted))] text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Capítulo</th>
                        <th className="px-3 py-2 font-medium">Páginas</th>
                        <th className="px-3 py-2 font-medium">Tamanho</th>
                        <th className="px-3 py-2 font-medium">Conversão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedManga.chapters.slice(0, 50).map((chapter) => (
                        <tr key={chapter.name} className="border-t border-[hsl(var(--border))]">
                          <td className="px-3 py-2">{chapter.name}</td>
                          <td className="px-3 py-2">{chapter.pageCount}</td>
                          <td className="px-3 py-2">{formatBytes(chapter.sizeBytes)}</td>
                          <td className="px-3 py-2">
                            {chapter.converted ? (
                              <Badge variant="default">{chapter.convertedFile ?? 'OK'}</Badge>
                            ) : (
                              <Badge variant="outline">Pendente</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'conversion' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4" />
                Converter mangá baixado (KCC)
              </CardTitle>
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

              <div className="grid gap-3 md:grid-cols-3">
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
                <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                  Agrupar em volumes
                  <Switch checked={mergeIntoVolumes} onCheckedChange={setMergeIntoVolumes} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                  Volume único
                  <Switch checked={singleVolume} onCheckedChange={setSingleVolume} />
                </label>
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

              <div>
                <p className="mb-2 text-sm font-medium">Opções rápidas (equivalente KCC GUI)</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Switch checked={mangaStyle} onCheckedChange={setMangaStyle} />
                    Manga mode
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Switch checked={hq} onCheckedChange={setHq} />
                    High quality
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Switch checked={webtoon} onCheckedChange={setWebtoon} />
                    Webtoon mode
                  </label>
                </div>
              </div>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo da conversão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Mangá selecionado</p>
                <p className="font-medium">{selectedMangaOption?.title ?? '—'}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Perfil</p>
                <p className="font-medium">{resolvedProfile || '—'}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Preset</p>
                <p className="font-medium">{selectedPreset}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Formato</p>
                <p className="font-medium">{format}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Jobs ativos</p>
                <p className="font-medium">{jobs.filter((j) => j.status === 'queued' || j.status === 'processing').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'jobs' && (
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
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando jobs...</p>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum job encontrado.</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{job.id}</p>
                      <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
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
