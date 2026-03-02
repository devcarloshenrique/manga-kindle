import { useEffect } from 'react';
import { useDownloadStore } from '@/stores';

/**
 * Thin wrapper around DownloadStore.
 * Automatically fetches downloads on first mount.
 * State is persisted globally via DownloadProvider — survives navigation.
 */
export function useDownloads() {
  const store = useDownloadStore();

  // Fetch on first mount (idempotent – store deduplicates)
  useEffect(() => {
    store.fetchDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    downloads: store.downloads,
    activeDownloads: store.activeDownloads,
    hasActiveDownloads: store.hasActiveDownloads,

    // Loading states
    loading: store.listLoading,
    startingDownload: store.startingDownload,

    // Errors
    listError: store.listError,
    clearListError: store.clearListError,
    getItemError: (id: string) => store.getItem(id)?.error ?? null,

    // Actions
    fetchDownloads: store.fetchDownloads,
    startDownload: store.startDownload,
    cancelDownload: store.cancelDownload,
    retryDownload: store.retryDownload,
    clearError: store.clearError,

    // Item accessor
    getItem: store.getItem,
  };
}
