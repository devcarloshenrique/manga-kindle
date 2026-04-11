"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ConversionPanel } from "@/components/conversion-panel";
import { MangaCard } from "@/components/manga-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMangas } from "@/lib/mock-data";
import { Search, X, FileDown, BookOpen, Settings2 } from "lucide-react";

export default function BibliotecaPage() {
  const [search, setSearch] = useState("");

  const filteredMangas = mockMangas.filter((manga) =>
    manga.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        title="Biblioteca / KCC"
        description="Gerencie sua biblioteca e converta mangás para e-readers"
      >
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Lista
        </Button>
      </PageHeader>

      <Tabs defaultValue="conversion" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Conversão KCC
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Biblioteca Local
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversion">
          <ConversionPanel />
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-semibold">
                  Mangás na Biblioteca ({filteredMangas.length})
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar mangás..."
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
              </div>
            </CardHeader>
            <CardContent>
              {filteredMangas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">Nenhum mangá encontrado</h3>
                  <p className="mt-1 text-muted-foreground">
                    Sua biblioteca está vazia ou o filtro não retornou resultados
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMangas.map((manga) => (
                    <MangaCard key={manga.slug} manga={manga} variant="compact" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
