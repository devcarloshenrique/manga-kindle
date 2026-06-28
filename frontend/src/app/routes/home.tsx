import { Link } from 'react-router-dom';
import { BookOpen, Download, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button, Card, CardContent } from '@/components/ui';
import { useLibrary, useDownloads } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { MangaCard } from '@/features/manga';
import { GridSkeleton } from '@/components/ui/skeleton';

export function HomePage() {
  const { mangas, stats, loading } = useLibrary({
    page: 1,
    limit: 24,
    sortBy: 'updatedAt',
    order: 'desc',
  });
  const { activeDownloads } = useDownloads();

  return (
    <div className="space-y-8 page-enter">
      <PageHeader
        title="Biblioteca"
        description="Seus mangás baixados, sempre a um clique de distância"
      >
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.SEARCH}>
            <Search className="h-4 w-4" />
            Buscar mangá
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.CONVERT}>
            <Sparkles className="h-4 w-4" />
            Converter
          </Link>
        </Button>
      </PageHeader>

      {activeDownloads.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Download className="h-5 w-5 text-primary animate-bounce" />
            <p className="text-sm font-medium">
              {activeDownloads.length} download{activeDownloads.length > 1 ? 's' : ''} em andamento
            </p>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link to={ROUTES.DOWNLOADS}>Ver detalhes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && mangas.length === 0 ? (
        <GridSkeleton count={12} />
      ) : mangas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-4 text-xl font-semibold">Sua biblioteca está vazia</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Busque um mangá por URL para começar a construir sua coleção offline.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to={ROUTES.SEARCH}>
                <Search className="h-4 w-4" />
                Buscar meu primeiro mangá
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {stats?.totalMangas ?? mangas.length} mangá{(stats?.totalMangas ?? mangas.length) > 1 ? 's' : ''} na biblioteca
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.slug} libraryManga={manga} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
