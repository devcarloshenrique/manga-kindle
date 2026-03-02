import { PageHeader } from '@/components/shared';
import { MangaSearch } from '@/features/manga';

export function SearchPage() {
  return (
    <div>
      <PageHeader title="Buscar Manga" description="Cole a URL de um manga para buscar suas informacoes" />
      <MangaSearch />
    </div>
  );
}
