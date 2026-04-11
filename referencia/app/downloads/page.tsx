"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { DownloadsTable } from "@/components/downloads-table";
import { Button } from "@/components/ui/button";
import { FileDown, Trash2 } from "lucide-react";

export default function DownloadsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Downloads"
        description="Gerencie seus downloads ativos e concluídos"
      >
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar concluídos
        </Button>
      </PageHeader>

      <DownloadsTable showHeader={false} />

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Os downloads são salvos automaticamente na sua biblioteca local
      </p>
    </AppShell>
  );
}
