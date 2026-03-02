import { useState, useCallback, useEffect, useRef } from 'react';
import { downloadService } from '@/services';
import type { Download, StartDownloadRequest } from '@/services/types';

export function useDownloads() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDownloads = useCallback(async () => {
    try {
      const data = await downloadService.list();
      setDownloads(data.downloads);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao listar downloads';
      setError(message);
    }
  }, []);

  const startDownload = useCallback(
    async (request: StartDownloadRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await downloadService.start(request);
        await fetchDownloads();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao iniciar download';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchDownloads],
  );

  const cancelDownload = useCallback(
    async (id: string) => {
      try {
        await downloadService.cancel(id);
        await fetchDownloads();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao cancelar download';
        setError(message);
      }
    },
    [fetchDownloads],
  );

  const startPolling = useCallback(
    (intervalMs: number = 3000) => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchDownloads, intervalMs);
    },
    [fetchDownloads],
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    downloads,
    loading,
    error,
    fetchDownloads,
    startDownload,
    cancelDownload,
    startPolling,
    stopPolling,
  };
}
