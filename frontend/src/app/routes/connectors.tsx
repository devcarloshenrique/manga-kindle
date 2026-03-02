import { PageHeader } from '@/components/shared';
import { ConnectorList } from '@/features/connectors';

export function ConnectorsPage() {
  return (
    <div>
      <PageHeader title="Conectores" description="Sites de manga disponiveis para download" />
      <ConnectorList />
    </div>
  );
}
