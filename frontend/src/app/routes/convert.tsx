import { Link } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui';

export function ConvertPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Wand2 className="h-16 w-16 text-muted-foreground/40" />
      <h2 className="mt-4 text-xl font-semibold">Conversão KCC</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Wizard de conversão em 4 etapas será entregue no Marco 4.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Voltar à biblioteca</Link>
      </Button>
    </div>
  );
}
