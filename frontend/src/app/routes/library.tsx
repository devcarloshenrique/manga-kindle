import { PageHeader } from '@/components/shared';
import { LibraryWorkspace } from '@/features/library';

export function LibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca & Conversão"
        description="Gerencie mangás baixados, conversões KCC e arquivos convertidos"
      />
      <LibraryWorkspace />
    </div>
  );
}
