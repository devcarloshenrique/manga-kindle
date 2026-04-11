import { useState, type FormEvent } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useManga } from '@/hooks';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Breadcrumb } from '@/components/shared';
import { MangaGrid } from './manga-grid';

export function MangaSearch() {
  const [url, setUrl] = useState('');
  const { manga, loading, error, fetchMangaInfo, reset } = useManga();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    reset();
    fetchMangaInfo(url.trim());
  };

  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Buscar' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buscar Mangá</h1>
        <p className="text-muted-foreground mt-1">
          Cole a URL de um mangá de uma fonte suportada para ver suas informações e capítulos disponíveis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole a URL do mangá (ex: https://mangalivre.to/manga/one-piece)"
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading || !url.trim()} className="px-8">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </form>

      {loading && <LoadingSpinner className="py-12" text="Buscando informações do mangá..." />}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && manga && (
        <div className="space-y-4">
          <MangaGrid mangas={[manga]} />
        </div>
      )}

      {!loading && !error && !manga && (
        <div className="space-y-6">
          <EmptyState
            icon={<Search className="h-16 w-16 text-muted-foreground" />}
            title="Busque um mangá"
            description="Cole a URL de um mangá de uma fonte suportada para ver suas informações e capítulos disponíveis."
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Fontes suportadas:</span>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold">
              MangaLivre
            </span>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold">
              MangaDex
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
