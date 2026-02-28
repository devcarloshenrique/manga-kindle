/**
 * Entity: Download
 * Representa um download em andamento ou concluído
 */
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
  startedAt: Date;
  completedAt?: Date;
  progress: DownloadProgress;
  results: DownloadResult[];
  errors: DownloadError[];
  outputDirectory: string;
}
