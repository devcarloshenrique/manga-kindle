export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  MANGA: '/manga',
  DOWNLOADS: '/downloads',
  CONNECTORS: '/connectors',
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
