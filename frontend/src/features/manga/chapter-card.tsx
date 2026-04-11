import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, Button } from '@/components/ui';
import { useManga, useDownloads } from '@/hooks';
import type { Chapter } from '@/services/types';

interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const [reading, setReading] = useState(false);
  const { fetchChapterPages } = useManga();
  const { startDownload, startingDownload } = useDownloads();

  const handleReadChapter = async () => {
    setReading(true);
    try {
      const content = await fetchChapterPages(chapter.url);
      if (content) {
        toast.success('Capítulo carregado!', {
          description: `${content.totalPages} páginas`,
        });
        // TODO: Implement reader view
      }
    } catch {
      toast.error('Erro ao carregar capítulo');
    } finally {
      setReading(false);
    }
  };

  const handleDownload = async () => {
    const result = await startDownload({
      url: chapter.url,
      imageFormat: 'original',
    });

    if (result) {
      toast.success('Download iniciado!');
    }
  };

  return (
    <Card className="group transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
              <span className="text-sm font-bold">
                {chapter.number.padStart(3, '0')}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">
                  Capítulo {chapter.number}
                </span>
                {chapter.title && (
                  <span className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                    - {chapter.title}
                  </span>
                )}
              </div>

              {chapter.publishedAt && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(chapter.publishedAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadChapter}
              disabled={reading}
              title="Ler capítulo"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={startingDownload}
              title="Baixar capítulo"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
