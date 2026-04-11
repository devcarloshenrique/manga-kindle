import { MangaCard } from './manga-card';
import type { Manga } from '@/services/types';
import { cn } from '@/lib/utils';

interface MangaGridProps {
  mangas: Manga[];
  className?: string;
}

export function MangaGrid({ mangas, className }: MangaGridProps) {
  if (mangas.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        className,
      )}
    >
      {mangas.map((manga) => (
        <MangaCard key={manga.url} manga={manga} />
      ))}
    </div>
  );
}
