export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  MANGA: '/manga',
  MANGA_BY_SLUG: '/manga/:slug',
  READER: '/manga/:slug/read/:chapter',
  DOWNLOADS: '/downloads',
  CONVERT: '/convert',
  SETTINGS: '/settings',
  // Deprecated — kept for backwards compatibility during migration
  CONNECTORS: '/connectors',
  LIBRARY: '/library',
} as const;

export const IMAGE_FORMATS = ['original', 'webp', 'jpeg', 'jpg', 'png'] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export const DOWNLOAD_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  downloading: 'Baixando',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const CONNECTOR_STATUS_LABELS: Record<string, string> = {
  healthy: 'Saudável',
  degraded: 'Degradado',
  unhealthy: 'Indisponível',
};

export const KCC_STATUS_LABELS: Record<string, string> = {
  queued: 'Na fila',
  processing: 'Convertendo',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const CHAPTER_VISUAL_STATUS_LABELS: Record<string, string> = {
  unread: 'Não baixado',
  downloaded: 'Baixado',
  downloading: 'Baixando',
  read: 'Lido',
  error: 'Com erro',
};

export type ReadingMode = 'single' | 'double' | 'webtoon';
export type ReadingDirection = 'ltr' | 'rtl';
export type FitMode = 'width' | 'height' | 'original';

export const READING_MODE_LABELS: Record<ReadingMode, string> = {
  single: 'Página única',
  double: 'Página dupla',
  webtoon: 'Scroll vertical',
};

export const FIT_MODE_LABELS: Record<FitMode, string> = {
  width: 'Largura',
  height: 'Altura',
  original: 'Original',
};
