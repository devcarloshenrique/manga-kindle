import { useEffect } from 'react';
import { Plug } from 'lucide-react';
import { useConnectors } from '@/hooks';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { ConnectorCard } from './connector-card';

export function ConnectorList() {
  const { connectors, loading, error, fetchConnectors, setLanguage } = useConnectors();

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  if (loading && connectors.length === 0) {
    return <LoadingSpinner className="py-12" text="Carregando conectores..." />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/10 p-4">
        <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
      </div>
    );
  }

  if (connectors.length === 0) {
    return (
      <EmptyState
        icon={<Plug className="h-12 w-12" />}
        title="Nenhum conector disponivel"
        description="Nenhum conector de sites de manga foi encontrado."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {connectors.map((connector) => (
        <ConnectorCard
          key={connector.name}
          connector={connector}
          onSetLanguage={setLanguage}
        />
      ))}
    </div>
  );
}
