import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';

interface StubPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function StubPage({ title, description, icon: Icon }: StubPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center page-enter">
      <div className="rounded-2xl bg-primary/10 p-6 mb-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <Button asChild>
        <Link to="/">Voltar para a biblioteca</Link>
      </Button>
    </div>
  );
}
