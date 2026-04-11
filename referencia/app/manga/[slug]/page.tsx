"use client";

import { use } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockMangas } from "@/lib/mock-data";
import {
  Download,
  BookOpen,
  User,
  Calendar,
  ArrowLeft,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function MangaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const manga = mockMangas.find((m) => m.slug === resolvedParams.slug) || mockMangas[0];

  // Generate mock chapters
  const chapters = Array.from({ length: 20 }, (_, i) => {
    const number = manga.chapters - i;
    return {
      number,
      title: `Capítulo ${number}`,
      pages: Math.floor(Math.random() * 20) + 15,
      date: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}/03/2024`,
    };
  });

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    ongoing: { label: "Em andamento", variant: "default" },
    completed: { label: "Completo", variant: "secondary" },
    hiatus: { label: "Hiato", variant: "outline" },
  };

  const status = statusConfig[manga.status];

  return (
    <AppShell>
      {/* Back link */}
      <Link
        href="/buscar"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para busca
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-1">
          <Card>
            {/* Cover */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-primary/40" />
              </div>
            </div>

            <CardContent className="p-5">
              <Badge variant={status.variant} className="mb-3">
                {status.label}
              </Badge>
              <h1 className="text-2xl font-bold">{manga.title}</h1>

              <div className="mt-4 space-y-3 text-sm">
                {manga.author && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{manga.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{manga.chapters} capítulos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Atualizado recentemente</span>
                </div>
              </div>

              {manga.genres && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {manga.genres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-2">
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Todos
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/biblioteca">
                    <Zap className="mr-2 h-4 w-4" />
                    Converter para Kindle
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold">
                Capítulos Disponíveis
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Selecionar Todos
                </Button>
                <Button size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Baixar Selecionados
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.number}
                    className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox id={`chapter-${chapter.number}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={`chapter-${chapter.number}`}
                          className="cursor-pointer font-medium"
                        >
                          {chapter.title}
                        </label>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {chapter.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {chapter.pages} páginas
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <BookOpen className="mr-1 h-3 w-3" />
                      Ler
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button variant="outline">Carregar mais capítulos</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
