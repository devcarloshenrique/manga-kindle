import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { downloadService } from '@/services';
import type {
  Download,
  StartDownloadRequest,
  StartDownloadResponse,
} from '@/services/types';

// ─── Types ────────────────────────────────────────────────

export type DownloadItemState = {
  data: Download;
  error: string | null;
  retrying: boolean;
};

export type DownloadStoreState = {
  items: Record<string, DownloadItemState>;
  listLoading: boolean;
  listError: string | null;
  startingDownload: boolean;
};

type DownloadStoreAPI = {
  getState: () => DownloadStoreState;
  subscribe: (listener: () => void) => () => void;

  fetchDownloads: () => Promise<void>;
  startDownload: (request: StartDownloadRequest) => Promise<StartDownloadResponse | null>;
  cancelDownload: (id: string) => Promise<boolean>;
  retryDownload: (id: string, request: StartDownloadRequest) => Promise<StartDownloadResponse | null>;
  clearError: (id: string) => void;
  clearListError: () => void;
};

// ─── Store Factory ────────────────────────────────────────

function createDownloadStore(): DownloadStoreAPI {
  let state: DownloadStoreState = {
    items: {},
    listLoading: false,
    listError: null,
    startingDownload: false,
  };

  const listeners = new Set<() => void>();
  const pollingIntervals = new Map<string, ReturnType<typeof setInterval>>();
  let listPollingInterval: ReturnType<typeof setInterval> | null = null;

  function emit() {
    listeners.forEach((l) => l());
  }

  function setState(partial: Partial<DownloadStoreState>) {
    state = { ...state, ...partial };
    emit();
  }

  function setItem(id: string, patch: Partial<DownloadItemState>) {
    const existing = state.items[id];
    if (existing) {
      state = {
        ...state,
        items: {
          ...state.items,
          [id]: { ...existing, ...patch },
        },
      };
    }
    emit();
  }

  function isActive(status: string): boolean {
    return status === 'pending' || status === 'downloading';
  }

  // ─── Polling per download ───────────────────────────────

  function startPollingDownload(id: string) {
    if (pollingIntervals.has(id)) return;

    const poll = async () => {
      try {
        const data = await downloadService.getStatus(id);
        setItem(id, { data, error: null });

        if (!isActive(data.status)) {
          stopPollingDownload(id);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    // Immediate first poll
    poll();
    const interval = setInterval(poll, 3000);
    pollingIntervals.set(id, interval);
  }

  function stopPollingDownload(id: string) {
    const interval = pollingIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      pollingIntervals.delete(id);
    }
  }

  // ─── List polling ──────────────────────────────────────

  function startListPolling() {
    if (listPollingInterval) return;

    listPollingInterval = setInterval(async () => {
      try {
        const data = await downloadService.list();
        const newItems: Record<string, DownloadItemState> = {};

        for (const dl of data.downloads) {
          const existing = state.items[dl.id];
          newItems[dl.id] = {
            data: dl,
            error: existing?.error ?? null,
            retrying: existing?.retrying ?? false,
          };

          // Auto-start polling for new active downloads
          if (isActive(dl.status) && !pollingIntervals.has(dl.id)) {
            startPollingDownload(dl.id);
          }
        }

        setState({ items: newItems });
      } catch {
        // Silent retry on next interval
      }
    }, 10000);
  }

  function stopListPolling() {
    if (listPollingInterval) {
      clearInterval(listPollingInterval);
      listPollingInterval = null;
    }
  }

  // ─── Actions ────────────────────────────────────────────

  async function fetchDownloads() {
    setState({ listLoading: true, listError: null });
    try {
      const data = await downloadService.list();
      const newItems: Record<string, DownloadItemState> = {};

      for (const dl of data.downloads) {
        const existing = state.items[dl.id];
        newItems[dl.id] = {
          data: dl,
          error: existing?.error ?? null,
          retrying: existing?.retrying ?? false,
        };

        if (isActive(dl.status)) {
          startPollingDownload(dl.id);
        }
      }

      setState({ items: newItems, listLoading: false });
      startListPolling();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao listar downloads';
      setState({ listLoading: false, listError: message });
    }
  }

  async function startDownload(
    request: StartDownloadRequest,
  ): Promise<StartDownloadResponse | null> {
    setState({ startingDownload: true });
    try {
      const result = await downloadService.start(request);

      // Create a placeholder entry immediately
      const placeholder: DownloadItemState = {
        data: {
          id: result.downloadId,
          mangaUrl: request.url,
          mangaTitle: 'Carregando...',
          source: '',
          status: 'pending',
          startedAt: new Date().toISOString(),
          progress: {
            chaptersCompleted: 0,
            totalChapters: 0,
            currentChapter: null,
            currentChapterImages: 0,
            totalChapterImages: 0,
            percentage: 0,
          },
          results: [],
          errors: [],
          outputDirectory: '',
        },
        error: null,
        retrying: false,
      };

      setState({
        startingDownload: false,
        listError: null, // Clear any previous list error on successful download start
        items: { ...state.items, [result.downloadId]: placeholder },
      });

      // Start polling this new download immediately
      startPollingDownload(result.downloadId);

      return result;
    } catch (err) {
      setState({ startingDownload: false });
      const message = err instanceof Error ? err.message : 'Erro ao iniciar download';
      // Return null and let caller handle via listError or toast
      // Don't throw - it triggers ErrorBoundary
      setState({ listError: message });
      return null;
    }
  }

  async function cancelDownload(id: string): Promise<boolean> {
    try {
      await downloadService.cancel(id);
      stopPollingDownload(id);

      // Update the item immediately
      const existing = state.items[id];
      if (existing) {
        setItem(id, {
          data: { ...existing.data, status: 'cancelled' },
        });
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar download';
      setItem(id, { error: message });
      return false;
    }
  }

  async function retryDownload(
    id: string,
    request: StartDownloadRequest,
  ): Promise<StartDownloadResponse | null> {
    setItem(id, { retrying: true, error: null });
    try {
      const result = await startDownload(request);
      // Remove the old failed entry
      const { [id]: _, ...rest } = state.items;
      setState({ items: rest });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reiniciar download';
      setItem(id, { retrying: false, error: message });
      return null;
    }
  }

  function clearError(id: string) {
    setItem(id, { error: null });
  }

  function clearListError() {
    setState({ listError: null });
  }

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);

        // Cleanup polling when no more listeners
        if (listeners.size === 0) {
          stopListPolling();
          pollingIntervals.forEach((_, id) => stopPollingDownload(id));
        }
      };
    },

    fetchDownloads,
    startDownload,
    cancelDownload,
    retryDownload,
    clearError,
    clearListError,
  };
}

// ─── React Context ────────────────────────────────────────

const DownloadStoreContext = createContext<DownloadStoreAPI | null>(null);

export function DownloadProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<DownloadStoreAPI | null>(null);
  if (!storeRef.current) {
    storeRef.current = createDownloadStore();
  }

  return (
    <DownloadStoreContext.Provider value={storeRef.current}>
      {children}
    </DownloadStoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useDownloadStore() {
  const store = useContext(DownloadStoreContext);
  if (!store) {
    throw new Error('useDownloadStore must be used within a DownloadProvider');
  }

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  return {
    // State
    items: state.items,
    listLoading: state.listLoading,
    listError: state.listError,
    startingDownload: state.startingDownload,

    // Computed
    downloads: Object.values(state.items).map((i) => i.data),
    activeDownloads: Object.values(state.items).filter(
      (i) => i.data.status === 'pending' || i.data.status === 'downloading',
    ),
    hasActiveDownloads: Object.values(state.items).some(
      (i) => i.data.status === 'pending' || i.data.status === 'downloading',
    ),

    // Actions
    fetchDownloads: store.fetchDownloads,
    startDownload: store.startDownload,
    cancelDownload: store.cancelDownload,
    retryDownload: store.retryDownload,
    clearError: store.clearError,
    clearListError: store.clearListError,

    // Item accessor
    getItem: (id: string) => state.items[id] ?? null,
  };
}
