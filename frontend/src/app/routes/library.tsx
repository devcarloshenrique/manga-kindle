import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { LibraryWorkspace } from '@/features/library';
import { ROUTES } from '@/lib/constants';

export function LibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca & Conversão"
        description="Gerencie mangás baixados, conversões KCC e arquivos convertidos"
      >
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.SEARCH}>
            <Search className="h-4 w-4" />
            Buscar mangá
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.DOWNLOADS}>
            <Download className="h-4 w-4" />
            Ver downloads
          </Link>
        </Button>
      </PageHeader>
      <LibraryWorkspace />
    </div>
  );
}
