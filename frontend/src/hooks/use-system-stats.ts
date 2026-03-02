import { useState, useCallback } from 'react';
import { systemService } from '@/services';
import type { SystemStats } from '@/services/types';

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemService.getStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
}
