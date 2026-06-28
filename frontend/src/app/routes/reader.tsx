import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ReaderShell } from '@/features/reader';
import { useReader } from '@/hooks/use-reader';
import { useReaderProgress } from '@/hooks/use-reader-progress';
import type { ReadingDirection, ReadingMode } from '@/lib/constants';

export function ReaderPage() {
  const { slug, chapter } = useParams<{ slug: string; chapter: string }>();
  const navigate = useNavigate();
  const decodedChapter = chapter ? decodeURIComponent(chapter) : undefined;

  const { manga, pages, loading, error } = useReader(slug, decodedChapter);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const savedMode = (localStorage.getItem('reader-mode') as ReadingMode) || 'single';
  const savedDirection = (localStorage.getItem('reader-direction') as ReadingDirection) || 'ltr';

  useReaderProgress({
    slug,
    chapterName: decodedChapter,
    currentPage: currentPageIndex,
    totalPages: pages.length,
  });

  const pageUrls = useMemo(() => pages.map((p) => p.url), [pages]);

  const currentChapterIndex = useMemo(() => {
    if (!manga || !decodedChapter) return -1;
    return manga.chapters.findIndex((c: { name: string }) => c.name === decodedChapter);
  }, [manga, decodedChapter]);

  const prevChapter =
    currentChapterIndex > 0 ? manga?.chapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex >= 0 &&
    currentChapterIndex < (manga?.chapters.length ?? 0) - 1
      ? manga?.chapters[currentChapterIndex + 1]
      : null;

  const handlePrevChapter = () => {
    if (prevChapter && slug) {
      navigate(`/manga/${slug}/read/${encodeURIComponent(prevChapter.name)}`);
    }
  };

  const handleNextChapter = () => {
    if (nextChapter && slug) {
      navigate(`/manga/${slug}/read/${encodeURIComponent(nextChapter.name)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando capítulo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            Erro ao carregar capítulo
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!manga || !pages.length) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma página encontrada para este capítulo.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <ReaderShell
        pageUrls={pageUrls}
        initialMode={savedMode}
        initialDirection={savedDirection}
        onPageChange={setCurrentPageIndex}
        onClose={() => navigate(-1)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        hasNextChapter={Boolean(nextChapter)}
        hasPrevChapter={Boolean(prevChapter)}
      />
    </div>
  );
}
