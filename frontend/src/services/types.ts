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
