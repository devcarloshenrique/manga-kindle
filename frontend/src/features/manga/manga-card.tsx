import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { Manga } from '@/services/types';
import { ROUTES } from '@/lib/constants';

interface MangaCardProps {
  manga: Manga;
}

const statusConfig = {
  ongoing: { color: 'bg-emerald-500/90', label: 'Em andamento' },
  completed: { color: 'bg-blue-500/90', label: 'Completo' },
  hiatus: { color: 'bg-amber-500/90', label: 'Hiato' },
  unknown: { color: 'bg-gray-500/90', label: 'Desconhecido' },
};

export function MangaCard({ manga }: MangaCardProps) {
  const status = statusConfig[manga.status as keyof typeof statusConfig] || statusConfig.unknown;

  return (
    <Link
      to={`${ROUTES.MANGA}?url=${encodeURIComponent(manga.url)}`}
      className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:border-[hsl(var(--primary))]/50 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/10 hover:scale-[1.02]"
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-[hsl(var(--muted))]">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-[hsl(var(--muted-foreground))]" />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-lg">
          {manga.title}
        </h3>

        {manga.author && (
          <p className="mt-1 truncate text-xs text-white/80">
            {manga.author}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {manga.status && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${status.color}`}
            >
              {status.label}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/90">
            {manga.totalChapters} cap.
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/0 to-[hsl(var(--accent))]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
    </Link>
  );
}
