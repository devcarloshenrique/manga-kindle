// ─── Manga ────────────────────────────────────────────────

export interface Chapter {
  number: string;
  url: string;
  title?: string;
  publishedAt?: string;
}

export interface Manga {
  title: string;
  slug: string;
  url: string;
  source: string;
  language?: string;
  alternativeTitles?: string[];
  author?: string;
  artist?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus' | 'unknown';
  description?: string;
  coverUrl?: string;
  totalChapters: number;
  chapters: Chapter[];
}

export interface Page {
  number: number;
  url: string;
  width?: number;
  height?: number;
}

export interface ChapterContent {
  mangaSlug: string;
  chapterNumber: string;
  url: string;
  totalPages: number;
  pages: Page[];
}

// ─── Download ─────────────────────────────────────────────

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface DownloadProgress {
  chaptersCompleted: number;
  totalChapters: number;
  currentChapter: string | null;
  currentChapterImages: number;
  totalChapterImages: number;
  percentage: number;
}

export interface DownloadResult {
  chapter: string;
  imagesDownloaded: number;
  directory: string;
}

export interface DownloadError {
  chapter: string;
  error: string;
}

export interface Download {
  id: string;
  mangaUrl: string;
  mangaTitle: string;
  source: string;
  status: DownloadStatus;
  startedAt: string;
  completedAt?: string;
  progress: DownloadProgress;
  results: DownloadResult[];
  errors: DownloadError[];
  outputDirectory: string;
}

export interface DownloadsResponse {
  total: number;
  downloads: Download[];
}

export interface StartDownloadRequest {
  url: string;
  outputDir?: string;
  startChapter?: number;
  endChapter?: number;
  imageFormat?: string;
  language?: string;
}

export interface StartDownloadResponse {
  downloadId: string;
  message: string;
  statusUrl: string;
}

export interface DownloadChapterRequest {
  url: string;
  outputDir?: string;
}

export interface DownloadChapterResponse {
  mangaSlug: string;
  chapter: string;
  imagesDownloaded: number;
  directory: string;
}

// ─── Connector ────────────────────────────────────────────

export interface Connector {
  name: string;
  displayName: string;
  baseUrl: string;
  currentLanguage?: string;
  supportedLanguages?: string[];
}

export interface ConnectorsResponse {
  total: number;
  connectors: Connector[];
}

export interface ConnectorEndpointHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  testedUrl?: string;
}

export interface ConnectorHealth {
  name: string;
  displayName: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'skipped';
  reason?: string;
  endpoints?: {
    getMangaInfo: ConnectorEndpointHealth;
    getChapterPages: ConnectorEndpointHealth;
  };
}

export interface HealthResponse {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  totalConnectors: number;
  healthyConnectors: number;
  connectors: ConnectorHealth[];
}

export interface SetLanguageResponse {
  message: string;
  connector: string;
  language: string;
  supportedLanguages: string[];
}

// ─── System ───────────────────────────────────────────────

export interface SystemStats {
  uptime: number;
  memory: {
    used: string;
    total: string;
    rss: string;
  };
  rateLimiters: Record<string, unknown>;
  nodeVersion: string;
  platform: string;
}

// ─── API Error ────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  example?: Record<string, unknown>;
}

// ─── Generic API Envelope ─────────────────────────────────

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  error: null | {
    code?: string;
    message: string;
    details?: unknown;
  };
}

// ─── Library ───────────────────────────────────────────────

export interface LibraryStats {
  totalMangas: number;
  totalChapters: number;
  totalPages: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  totalSizeGB?: number;
  totalConverted?: number;
}

export interface LibraryManga {
  slug: string;
  title: string;
  coverUrl?: string;
  author?: string;
  artist?: string;
  status?: string;
  language?: string;
  genres?: string[];
  totalChapters: number;
  totalPages: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  hasConverted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LibraryChapter {
  name: string;
  path: string;
  pageCount: number;
  sizeBytes?: number;
  sizeMB?: number;
  downloadedAt?: string;
  converted?: boolean;
  convertedFile?: string | null;
}

export interface LibraryMangaDetails {
  slug: string;
  info: Manga;
  totalChapters: number;
  totalPages: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  hasConverted: boolean;
  createdAt?: string;
  updatedAt?: string;
  chapters: LibraryChapter[];
}

export interface LibraryListMangasQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
  language?: string;
  hasConverted?: boolean;
}

export interface LibraryListMangasResponse {
  mangas: LibraryManga[];
  meta?: Record<string, unknown>;
}

// ─── KCC ───────────────────────────────────────────────────

export interface KccProfile {
  id: string;
  name?: string;
  description?: string;
  resolution?: string;
  device?: string;
  supportedFormats?: string[];
}

export interface KccOptionDoc {
  description: string;
  type: 'boolean' | 'number' | 'string';
  default?: boolean | number | string;
  cliFlag: string;
  example?: boolean | number | string;
}

export interface KccPreset {
  name: string;
  description: string;
  options: Record<string, unknown>;
}

export interface KccOptionsDto {
  mangaStyle?: boolean;
  hq?: boolean;
  webtoon?: boolean;
  webtoonMode?: boolean;
  noSplitDoubleSpreads?: boolean;
  rotate?: boolean;
  upscale?: boolean;
  stretch?: boolean;
  gamma?: number;
  cropping?: number;
  quality?: number;
  forceColor?: boolean;
  forcePng?: boolean;
  mozJpeg?: boolean;
  maximizeStrips?: boolean;
  batchSplit?: number;
  noProcessing?: boolean;
  splitter?: boolean;
  twoPanel?: boolean;
}

export interface CreateKccConversionRequest {
  chapters: string[];
  mergeIntoSingleVolume?: boolean;
  outputFormat: 'EPUB' | 'MOBI' | 'CBZ' | 'KFX';
  profile: string;
  preset?: 'default' | 'manga' | 'webtoon' | 'highQuality' | 'noProcessing' | 'comic';
  options?: KccOptionsDto;
}

export interface CreateKccMangaConversionRequest {
  mangaSlug: string;
  mergeIntoVolumes?: boolean;
  chaptersPerVolume?: number;
  singleVolume?: boolean;
  outputFormat: 'EPUB' | 'MOBI' | 'CBZ' | 'KFX';
  profile: string;
  preset?: 'default' | 'manga' | 'webtoon' | 'highQuality' | 'noProcessing' | 'comic';
  options?: KccOptionsDto;
  startChapter?: number;
  endChapter?: number;
}

export interface KccJobSummary {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  profile: string;
  outputFormat: string;
  inputPaths: string[];
  outputPath?: string;
  error?: string;
  duration?: number | null;
  eta?: number | null;
}

export interface KccConvertedFile {
  name: string;
  size: number;
  sizeFormatted: string;
  format: string;
  createdAt: string;
  downloadUrl: string;
}

export interface KccJobCreateResponse {
  jobId?: string;
  message: string;
  statusUrl?: string;
  progressUrl?: string;
  mangaSlug?: string;
  mangaTitle?: string;
  totalChapters?: number;
  totalVolumes?: number;
  totalJobs?: number;
  jobIds?: string[];
  mode?: string;
}
