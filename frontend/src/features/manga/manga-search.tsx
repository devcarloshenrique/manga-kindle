import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useManga } from '@/hooks';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { MangaCard } from './manga-card';

export function MangaSearch() {
  const [url, setUrl] = useState('');
  const { manga, loading, error, fetchMangaInfo, reset } = useManga();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    reset();
    fetchMangaInfo(url.trim());
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL do manga (ex: https://mangalivre.to/manga/one-piece)"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      </form>

      {loading && <LoadingSpinner className="py-12" text="Buscando informacoes do manga..." />}

      {error && (
        <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/10 p-4">
          <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
        </div>
      )}

      {!loading && !error && manga && <MangaCard manga={manga} />}

      {!loading && !error && !manga && (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title="Busque um manga"
          description="Cole a URL de um manga para ver suas informacoes e capitulos."
        />
      )}
    </div>
  );
}
