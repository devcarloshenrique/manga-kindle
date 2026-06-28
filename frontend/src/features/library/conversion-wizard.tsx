import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FolderSync,
  HardDrive,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import { useKcc, useLibrary } from '@/hooks';

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'EPUB', label: 'EPUB' },
  { value: 'MOBI', label: 'MOBI' },
  { value: 'CBZ', label: 'CBZ' },
  { value: 'KFX', label: 'KFX' },
];

type ConversionMode = 'all' | 'range' | 'selected';

export function ConversionWizard() {
  const { mangas, selectedManga, fetchMangaDetails } = useLibrary({
    page: 1,
    limit: 50,
    sortBy: 'updatedAt',
    order: 'desc',
  });
  const {
    profiles,
    presets,
    jobs,
    loading: kccLoading,
    submitting,
    error: kccError,
    convertManga,
    convertChapters,
    organizeDownloads,
    organizeConverted,
  } = useKcc();

  const [selectedMangaSlug, setSelectedMangaSlug] = useState('');
  const [format, setFormat] = useState<'EPUB' | 'MOBI' | 'CBZ' | 'KFX'>('EPUB');
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

  const selectedMangaOption = mangas.find((m) => m.slug === resolvedMangaSlug);

  const chapterOptions = (resolvedMangaDetails?.chapters ?? []).map((c: { name: string; pageCount: number }) => ({
    value: c.name,
    label: `${c.name} • ${c.pageCount} pág.`,
  }));

  const firstChapterName = resolvedMangaDetails?.chapters?.[0]?.name ?? '';
  const lastChapterName =
    resolvedMangaDetails?.chapters?.[resolvedMangaDetails.chapters.length - 1]?.name ?? '';
  const effectiveRangeStartChapter = rangeStartChapter || firstChapterName;
  const effectiveRangeEndChapter = rangeEndChapter || lastChapterName;

  const selectedChapterPaths = useMemo(() => {
    const chapters = resolvedMangaDetails?.chapters ?? [];
    if (!chapters.length || conversionMode !== 'selected') return [] as string[];
    return chapters
      .filter((c: { name: string }) => selectedChapterNames.includes(c.name))
      .map((c: { path: string; name: string }) =>
        c.path.startsWith('downloads/')
          ? c.path.replace(/^downloads\//, '')
          : `${resolvedMangaSlug}/${c.name}`,
      );
  }, [conversionMode, resolvedMangaDetails, resolvedMangaSlug, selectedChapterNames]);

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === 'queued' || j.status === 'processing'),
    [jobs],
  );

  const stepOneDone = Boolean(resolvedMangaSlug && resolvedProfile);
  const stepTwoDone =
    conversionMode === 'selected'
      ? selectedChapterPaths.length > 0
      : conversionMode === 'range'
        ? Boolean(effectiveRangeStartChapter && effectiveRangeEndChapter)
        : true;
  const stepperValue = stepOneDone && stepTwoDone ? 100 : stepOneDone ? 66 : 33;

  const handleToggleSelectedChapter = (name: string) => {
    setSelectedChapterNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
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
        options: { mangaStyle, hq, webtoon },
      });
      if (result) {
        toast.success('Conversão enviada para fila', { description: result.message });
      } else {
        toast.error('Falha ao enviar conversão');
      }
      return;
    }

    const chapters = resolvedMangaDetails?.chapters ?? [];
    const startIndex = chapters.findIndex((c: { name: string }) => c.name === effectiveRangeStartChapter);
    const endIndex = chapters.findIndex((c: { name: string }) => c.name === effectiveRangeEndChapter);
    const startChapter =
      conversionMode === 'range' && startIndex >= 0
        ? Math.min(startIndex, endIndex) + 1
        : undefined;
    const endChapter =
      conversionMode === 'range' && endIndex >= 0
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
      options: { mangaStyle, hq, webtoon },
    });
    if (result) {
      toast.success('Conversão enviada para fila', { description: result.message });
    } else {
      toast.error('Falha ao enviar conversão');
    }
  };

  const handleOrganizeDownloads = async () => {
    const response = await organizeDownloads(resolvedMangaSlug || undefined);
    if (response) {
      toast.success('Downloads organizados', { description: response.message });
    }
  };

  const handleOrganizeConverted = async () => {
    const response = await organizeConverted();
    if (response) {
      toast.success('Convertidos organizados', { description: response.message });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wand2 className="h-4 w-4 text-primary" />
            Conversão KCC por etapas
          </CardTitle>
          <div className="space-y-2">
            <Progress value={stepperValue} />
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <p className={stepOneDone ? 'text-foreground font-medium' : ''}>
                1. Fonte e dispositivo
              </p>
              <p className={stepTwoDone ? 'text-foreground font-medium' : ''}>
                2. Escopo de capítulos
              </p>
              <p className={stepOneDone && stepTwoDone ? 'text-foreground font-medium' : ''}>
                3. Revisar e enviar
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Mangá</label>
              <Select value={resolvedMangaSlug} onValueChange={setSelectedMangaSlug}>
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
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {`${p.id}${p.name ? ` - ${p.name}` : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Formato de saída</label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as 'EPUB' | 'MOBI' | 'CBZ' | 'KFX')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um formato" />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
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
                  {presets.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {`${p.name} — ${p.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Modo de conversão</label>
              <Select
                value={conversionMode}
                onValueChange={(v) => setConversionMode(v as ConversionMode)}
              >
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
                <Select
                  value={effectiveRangeStartChapter}
                  onValueChange={setRangeStartChapter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Capítulo inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapterOptions.map((o: { value: string; label: string }) => (
                      <SelectItem key={`start-${o.value}`} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Capítulo final</label>
                <Select
                  value={effectiveRangeEndChapter}
                  onValueChange={setRangeEndChapter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Capítulo final" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapterOptions.map((o: { value: string; label: string }) => (
                      <SelectItem key={`end-${o.value}`} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {conversionMode === 'selected' && (
            <div className="space-y-2 rounded-xl border border-border/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Seleção manual de capítulos</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedChapterNames(
                        (resolvedMangaDetails?.chapters ?? []).map((c: { name: string }) => c.name),
                      )
                    }
                  >
                    Selecionar todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChapterNames([])}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              <div className="max-h-52 space-y-1 overflow-auto">
                {(resolvedMangaDetails?.chapters ?? []).map((c: { name: string; pageCount: number }) => {
                  const checked = selectedChapterNames.includes(c.name);
                  return (
                    <label
                      key={c.name}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleToggleSelectedChapter(c.name)}
                        />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.pageCount} pág.</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <details className="rounded-xl border border-border/50 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Opções avançadas (KCC)
            </summary>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm">
                Agrupar em volumes
                <Switch checked={mergeIntoVolumes} onCheckedChange={setMergeIntoVolumes} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm">
                Volume único
                <Switch checked={singleVolume} onCheckedChange={setSingleVolume} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm">
                Manga mode
                <Switch checked={mangaStyle} onCheckedChange={setMangaStyle} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm">
                High quality
                <Switch checked={hq} onCheckedChange={setHq} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm md:col-span-2">
                Webtoon mode
                <Switch checked={webtoon} onCheckedChange={setWebtoon} />
              </label>
            </div>
          </details>

          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p>
              <strong>Mangá:</strong> {selectedMangaOption?.title ?? '—'}
            </p>
            <p>
              <strong>Capítulos totais:</strong>{' '}
              {resolvedMangaDetails?.chapters.length ?? 0}
              {conversionMode === 'selected'
                ? ` • Selecionados: ${selectedChapterNames.length}`
                : ''}
              {conversionMode === 'range' &&
              effectiveRangeStartChapter &&
              effectiveRangeEndChapter
                ? ` • Faixa: ${effectiveRangeStartChapter} até ${effectiveRangeEndChapter}`
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleConvertManga}
              disabled={submitting || !resolvedMangaSlug || !resolvedProfile}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
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

          {kccError && (
            <p className="text-sm text-destructive">{kccError}</p>
          )}
        </CardContent>
      </Card>

      {/* Summary card */}
      <Card className="flex flex-col overflow-hidden border-primary/20 bg-gradient-to-b from-card to-card/50 shadow-lg">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-base">Resumo da conversão</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {selectedMangaOption?.coverUrl ? (
              <>
                <img
                  src={selectedMangaOption.coverUrl}
                  alt=""
                  className="h-full w-full object-cover blur-sm opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <img
                    src={selectedMangaOption.coverUrl}
                    alt={selectedMangaOption.title}
                    className="h-full rounded-lg shadow-2xl"
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Wand2 className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="space-y-3 px-6 pb-6 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mangá selecionado
              </p>
              <p className="font-semibold text-foreground">
                {selectedMangaOption?.title ?? '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Perfil
                </p>
                <p className="font-medium text-foreground">{resolvedProfile || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Preset
                </p>
                <p className="font-medium text-foreground">{selectedPreset}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Formato
                </p>
                <p className="font-medium text-foreground">{format}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Jobs ativos
                </p>
                <p className="font-medium text-foreground">{activeJobs.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
