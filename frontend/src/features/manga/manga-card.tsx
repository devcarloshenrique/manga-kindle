import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { Manga } from '@/services/types';
import { Card, CardContent, Badge } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

interface MangaCardProps {
  manga: Manga;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  ongoing: 'success',
  completed: 'default',
  hiatus: 'warning',
  unknown: 'secondary',
};

const statusLabels: Record<string, string> = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  unknown: 'Desconhecido',
};

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link to={`${ROUTES.MANGA}?url=${encodeURIComponent(manga.url)}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-[hsl(var(--primary))]/50">
        <div className="flex gap-4 p-4">
          {/* Cover */}
          <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
            {manga.coverUrl ? (
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              </div>
            )}
          </div>

          {/* Info */}
          <CardContent className="flex-1 p-0">
            <h3 className="font-semibold line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
              {manga.title}
            </h3>
            {manga.author && (
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{manga.author}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {manga.status && (
                <Badge variant={statusColors[manga.status] || 'secondary'}>
                  {statusLabels[manga.status] || manga.status}
                </Badge>
              )}
              <Badge variant="outline">{manga.totalChapters} cap.</Badge>
            </div>
            {manga.genres && manga.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {manga.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
