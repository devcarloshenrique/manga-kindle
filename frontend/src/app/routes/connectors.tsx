import { Link } from 'react-router-dom';
import { FolderKanban, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { ConnectorList } from '@/features/connectors';
import { ROUTES } from '@/lib/constants';

export function ConnectorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Conectores" description="Sites de manga disponiveis para download">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.SEARCH}>
            <Search className="h-4 w-4" />
            Buscar mangá
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.LIBRARY}>
            <FolderKanban className="h-4 w-4" />
            Biblioteca
          </Link>
        </Button>
      </PageHeader>
      <ConnectorList />
    </div>
  );
}
