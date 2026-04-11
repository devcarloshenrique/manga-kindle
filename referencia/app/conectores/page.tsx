"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ConnectorCard } from "@/components/connector-card";
import { Button } from "@/components/ui/button";
import { mockConnectors } from "@/lib/mock-data";
import { Plus, RefreshCw } from "lucide-react";

export default function ConectoresPage() {
  const onlineCount = mockConnectors.filter((c) => c.healthy).length;

  return (
    <AppShell>
      <PageHeader
        title="Conectores"
        description={`${onlineCount} de ${mockConnectors.length} conectores online`}
      >
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Testar Todos
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Conector
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockConnectors.map((connector) => (
          <ConnectorCard key={connector.name} connector={connector} />
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <Plus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <h3 className="font-semibold">Adicionar novo conector</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure fontes adicionais para expandir sua biblioteca
        </p>
        <Button variant="outline" className="mt-4">
          Configurar Conector
        </Button>
      </div>
    </AppShell>
  );
}
