import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import type { LibraryManga, Manga } from '@/services/types';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  manga?: Manga;
  libraryManga?: LibraryManga;
  className?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  ongoing: { color: 'bg-primary/20 text-primary', label: 'Em andamento' },
  completed: { color: 'bg-chart-3/20 text-chart-3', label: 'Completo' },
  hiatus: { color: 'bg-muted text-muted-foreground', label: 'Hiato' },
  Emandamento: { color: 'bg-primary/20 text-primary', label: 'Em andamento' },
  Completo: { color: 'bg-chart-3/20 text-chart-3', label: 'Completo' },
  Hiato: { color: 'bg-muted text-muted-foreground', label: 'Hiato' },
};

export function MangaCard({ manga, libraryManga, className }: MangaCardProps) {
  const data = libraryManga ?? manga;
  if (!data) return null;

  const isLibrary = Boolean(libraryManga);
  const title = data.title;
  const coverUrl = data.coverUrl;
  const totalChapters = data.totalChapters;
  const updatedAt = isLibrary ? (data as LibraryManga).updatedAt : undefined;
  const status = isLibrary
    ? statusConfig[(data as LibraryManga).status ?? '']
    : statusConfig[(data as Manga).status ?? 'unknown'];
  const hasConverted = isLibrary ? (data as LibraryManga).hasConverted : false;
  const href = isLibrary
    ? `/manga/${(data as LibraryManga).slug}`
    : `/search?url=${encodeURIComponent((data as Manga).url)}`;

  return (
    <Link
      to={href}
      state={!isLibrary ? { manga: data } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5',
        className,
      )}
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
            <BookOpen className="h-14 w-14 text-primary/30" />
          </div>
        )}

        <div className="cover-gradient absolute inset-0" />

        {hasConverted && (
          <div className="absolute right-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Convertido
            </span>
          </div>
        )}

        {status && (
          <div className="absolute bottom-2 left-2 z-10">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm',
                status.color,
              )}
            >
              {status.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="truncate text-sm font-semibold">{title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalChapters} cap.
          </span>
          {updatedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(updatedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
