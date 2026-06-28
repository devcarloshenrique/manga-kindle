import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui';
import { ConversionWizard, JobsView } from '@/features/library';
import { ROUTES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

export function ConvertPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversão para Kindle</h1>
          <p className="text-sm text-muted-foreground">
            Mangá → EPUB/MOBI/CBZ/KFX em 4 etapas
          </p>
        </div>
      </div>

      <Tabs defaultValue="wizard" onValueChange={() => {}}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="wizard" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Novo wizard
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Jobs & Arquivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard">
          <ConversionWizard />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
