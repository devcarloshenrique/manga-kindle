import { useState } from 'react';
import { toast } from 'sonner';
import { connectorService } from '@/services';
import { ConnectorCard } from './connector-card';
import { Button, Card, CardContent } from '@/components/ui';
import { useConnectors } from '@/hooks';

export function ConnectorList() {
  const { connectors, loading, error, fetchConnectors } = useConnectors();
  const [settingLanguage, setSettingLanguage] = useState<string | null>(null);

  const handleSetLanguage = async (name: string, language: string) => {
    setSettingLanguage(name);
    try {
      await connectorService.setLanguage(name, language);
      toast.success('Idioma atualizado', {
        description: `${name} configurado para ${language}`,
      });
    } catch {
      toast.error('Erro ao atualizar idioma');
    } finally {
      setSettingLanguage(null);
    }
  };

  if (loading && connectors.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded bg-[hsl(var(--muted))]" />
                <div className="h-3 w-1/2 rounded bg-[hsl(var(--muted))]" />
                <div className="h-8 w-24 rounded bg-[hsl(var(--muted))]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && connectors.length === 0) {
    return (
      <Card className="border-[hsl(var(--destructive))]/30">
        <CardContent className="p-6 text-center">
          <p className="text-[hsl(var(--destructive))] mb-4">{error}</p>
          <Button onClick={fetchConnectors} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {connectors.map((connector) => (
          <ConnectorCard
            key={connector.name}
            connector={connector}
            onSetLanguage={handleSetLanguage}
            disabled={settingLanguage === connector.name}
          />
        ))}
      </div>

      {connectors.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              Nenhum conector disponível.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
