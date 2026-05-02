import { Link } from 'react-router-dom';
import { Download, FolderKanban } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { MangaSearch } from '@/features/manga';
import { ROUTES } from '@/lib/constants';

export function SearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Buscar Mangá" description="Cole a URL de um mangá de uma fonte suportada para ver suas informações e capítulos disponíveis.">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.DOWNLOADS}>
            <Download className="h-4 w-4" />
            Ver downloads
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.LIBRARY}>
            <FolderKanban className="h-4 w-4" />
            Ir para biblioteca
          </Link>
        </Button>
      </PageHeader>
      <MangaSearch />
    </div>
  );
}
