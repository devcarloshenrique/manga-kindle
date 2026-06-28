import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FolderOpen,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { LibraryManga, Manga } from '@/services/types';
import { cn } from '@/lib/utils';
import { Button, Checkbox, Badge } from '@/components/ui';

interface MangaCardProps {
  manga?: Manga;
  libraryManga?: LibraryManga;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  ongoing: 'bg-chart-3/20 text-chart-3',
  completed: 'bg-primary/20 text-primary',
  hiatus: 'bg-muted text-muted-foreground',
  Emandamento: 'bg-chart-3/20 text-chart-3',
  Completo: 'bg-primary/20 text-primary',
  Hiato: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  ongoing: 'Em Andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  Emandamento: 'Em Andamento',
  Completo: 'Completo',
  Hiato: 'Hiato',
};

export function MangaCard({
  manga,
  libraryManga,
  selected = false,
  onSelect,
  onDownload,
  onView,
  onDelete,
  className,
}: MangaCardProps) {
  const data = libraryManga ?? manga;
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  if (!data) return null;

  const isLibrary = Boolean(libraryManga);
  const title = data.title;
  const coverUrl = data.coverUrl;
  const totalChapters = data.totalChapters;
  const rawStatus = isLibrary
    ? (data as LibraryManga).status ?? ''
    : (data as Manga).status ?? 'unknown';
  const statusColor = statusColors[rawStatus] ?? 'bg-muted text-muted-foreground';
  const statusLabel = statusLabels[rawStatus] ?? 'Desconhecido';
  const hasConverted = isLibrary ? (data as LibraryManga).hasConverted : false;
  const id = isLibrary ? (data as LibraryManga).slug : (data as Manga).url;

  const href = isLibrary
    ? `/manga/${(data as LibraryManga).slug}`
    : `/search?url=${encodeURIComponent((data as Manga).url)}`;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200',
        selected && 'ring-2 ring-primary border-primary',
        isHovered && 'shadow-lg shadow-primary/5',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!menuOpen) setIsHovered(false);
      }}
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link
          to={href}
          state={!isLibrary ? { manga: data } : undefined}
          className="block h-full w-full"
        >
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
        </Link>

        {/* Selection Checkbox */}
        {onSelect && (
          <div
            className={cn(
              'absolute left-2 top-2 transition-opacity duration-200',
              selected || isHovered ? 'opacity-100' : 'opacity-0',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(id, checked as boolean)}
              className="h-5 w-5 border-2 bg-background/80 backdrop-blur data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        )}

        {/* Quick Actions Dropdown */}
        <div
          className={cn(
            'absolute right-2 top-2 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0',
          )}
          ref={menuRef}
        >
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ações rápidas"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 w-48 rounded-lg border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95">
              {onView && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    onView(id);
                    setMenuOpen(false);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </button>
              )}
              {onDownload && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    onDownload(id);
                    setMenuOpen(false);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Baixar Tudo
                </button>
              )}
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                <FolderOpen className="h-4 w-4" />
                Abrir Pasta
              </button>
              <div className="my-1 h-px bg-border" />
              {onDelete && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onDelete(id);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </button>
              )}
            </div>
          )}
        </div>

        {/* Converted badge */}
        {hasConverted && (
          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-success-foreground shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Convertido
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className={cn('text-xs font-medium', statusColor)}>
            {statusLabel}
          </Badge>
        </div>

        {/* Downloaded/Error Icon */}
        {isLibrary && (data as LibraryManga).hasConverted && (
          <div className="absolute bottom-2 right-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="mb-1 truncate text-sm font-semibold" title={title}>
          {title}
        </h3>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalChapters} caps
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isLibrary ? 'Atualizado' : 'Novo'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full bg-primary transition-all duration-300',
            )}
            style={{ width: `${Math.min(100, totalChapters > 0 ? 100 : 0)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
