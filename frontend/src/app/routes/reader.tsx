import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui';

export function ReaderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BookOpen className="h-16 w-16 text-muted-foreground/40" />
      <h2 className="mt-4 text-xl font-semibold">Leitor de Mangá</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Reader completo será entregue no Marco 3 — com modos single, double page,
        webtoon scroll, navegação por teclado e tracking de progresso.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Voltar à biblioteca</Link>
      </Button>
    </div>
  );
}
