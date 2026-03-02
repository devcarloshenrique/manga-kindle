import { useState, useCallback } from 'react';
import { connectorService } from '@/services';
import type { Connector, ConnectorHealth } from '@/services/types';

export function useConnectors() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [health, setHealth] = useState<ConnectorHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connectorService.list();
      setConnectors(data.connectors);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao listar conectores';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connectorService.health();
      setHealth(data.connectors);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar saude dos conectores';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setLanguage = useCallback(
    async (name: string, language: string) => {
      try {
        await connectorService.setLanguage(name, language);
        await fetchConnectors();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao definir idioma';
        setError(message);
      }
    },
    [fetchConnectors],
  );

  return {
    connectors,
    health,
    loading,
    error,
    fetchConnectors,
    fetchHealth,
    setLanguage,
  };
}
