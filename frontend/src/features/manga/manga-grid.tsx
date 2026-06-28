import { MangaCard } from './manga-card';
import type { LibraryManga, Manga } from '@/services/types';
import { cn } from '@/lib/utils';

interface MangaGridProps {
  mangas?: Manga[];
  libraryMangas?: LibraryManga[];
  className?: string;
}

export function MangaGrid({ mangas, libraryMangas, className }: MangaGridProps) {
  const items = libraryMangas ?? mangas ?? [];
  if (items.length === 0) return null;

  const isLibraryMode = Boolean(libraryMangas);

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className,
      )}
    >
      {items.map((item, idx) =>
        isLibraryMode ? (
          <MangaCard
            key={(item as LibraryManga).slug}
            libraryManga={item as LibraryManga}
          />
        ) : (
          <MangaCard
            key={(item as Manga).url ?? idx}
            manga={item as Manga}
          />
        ),
      )}
    </div>
  );
}
