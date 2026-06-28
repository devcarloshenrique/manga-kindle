import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import type { LibraryManga, Manga } from '@/services/types';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  /** External manga (search results). Slug is synthesized from title if missing. */
  manga?: Manga;
  /** Library manga (downloaded). */
  libraryManga?: LibraryManga;
  className?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  ongoing: { color: 'bg-emerald-500/90', label: 'Em andamento' },
  completed: { color: 'bg-blue-500/90', label: 'Completo' },
  hiatus: { color: 'bg-amber-500/90', label: 'Hiato' },
  Emandamento: { color: 'bg-emerald-500/90', label: 'Em andamento' },
  Completo: { color: 'bg-blue-500/90', label: 'Completo' },
  Hiato: { color: 'bg-amber-500/90', label: 'Hiato' },
};

export function MangaCard({ manga, libraryManga, className }: MangaCardProps) {
  const data = libraryManga ?? manga;
  if (!data) return null;

  const isLibrary = Boolean(libraryManga);
  const title = data.title;
  const coverUrl = data.coverUrl;
  const author = data.author;
  const totalChapters = data.totalChapters;
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
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover-lift',
        className,
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
            <BookOpen className="h-14 w-14 text-primary/30" />
          </div>
        )}

        <div className="cover-gradient absolute inset-0" />

        {hasConverted && (
          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-success-foreground shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Convertido
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-lg">
            {title}
          </h3>
          {author && (
            <p className="mt-1 truncate text-xs text-white/70">{author}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {status && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm',
                  status.color,
                )}
              >
                {status.label}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              {totalChapters} cap.
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
