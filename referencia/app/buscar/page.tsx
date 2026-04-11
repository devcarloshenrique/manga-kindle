"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { MangaCard } from "@/components/manga-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockMangas } from "@/lib/mock-data";
import { Search, Filter, X, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BuscarPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredMangas = mockMangas.filter((manga) => {
    const matchesSearch = manga.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || manga.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <PageHeader
        title="Buscar Mangá"
        description="Encontre e baixe seus mangás favoritos"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Digite o nome do mangá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ongoing">Em andamento</SelectItem>
              <SelectItem value="completed">Completo</SelectItem>
              <SelectItem value="hiatus">Hiato</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-r-none",
                viewMode === "grid" && "bg-muted"
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-l-none",
                viewMode === "list" && "bg-muted"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredMangas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Nenhum mangá encontrado</h3>
          <p className="mt-1 text-muted-foreground">
            Tente ajustar os filtros ou buscar por outro termo
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          )}
        >
          {filteredMangas.map((manga) => (
            <MangaCard
              key={manga.slug}
              manga={manga}
              variant={viewMode === "list" ? "compact" : "default"}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredMangas.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Exibindo {filteredMangas.length} de {mockMangas.length} mangás
        </p>
      )}
    </AppShell>
  );
}
