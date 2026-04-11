"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Manga, MangaStatus } from "@/lib/mock-data";

const statusConfig: Record<MangaStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ongoing: { label: "Em andamento", variant: "default" },
  completed: { label: "Completo", variant: "secondary" },
  hiatus: { label: "Hiato", variant: "outline" },
};

interface MangaCardProps {
  manga: Manga;
  variant?: "default" | "compact";
  className?: string;
}

export function MangaCard({ manga, variant = "default", className }: MangaCardProps) {
  const status = statusConfig[manga.status];

  if (variant === "compact") {
    return (
      <Card className={cn("group overflow-hidden transition-all hover:border-primary/50", className)}>
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-accent/80 text-2xl font-bold text-primary-foreground">
            {manga.title.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{manga.title}</h3>
            <p className="text-sm text-muted-foreground">{manga.chapters} capítulos</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5", className)}>
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-primary/40" />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card via-card/80 to-transparent p-4 pt-16">
          <Badge variant={status.variant} className="mb-2">
            {status.label}
          </Badge>
          <h3 className="text-lg font-bold leading-tight text-balance">{manga.title}</h3>
          {manga.author && (
            <p className="mt-1 text-sm text-muted-foreground">{manga.author}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{manga.chapters} capítulos</span>
          {manga.genres && (
            <span className="text-xs text-muted-foreground">
              {manga.genres.slice(0, 2).join(" · ")}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/manga/${manga.slug}`}>
              Detalhes
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" className="flex-1">
            <Download className="mr-1 h-3 w-3" />
            Baixar
          </Button>
        </div>
      </div>
    </Card>
  );
}
