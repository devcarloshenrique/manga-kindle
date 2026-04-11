"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./status-badge";
import { mockDownloads } from "@/lib/mock-data";
import { MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DownloadsTableProps {
  limit?: number;
  showHeader?: boolean;
}

export function DownloadsTable({ limit, showHeader = true }: DownloadsTableProps) {
  const downloads = limit ? mockDownloads.slice(0, limit) : mockDownloads;

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Downloads Recentes</CardTitle>
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <div className="space-y-4">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {download.manga.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{download.manga}</p>
                  <StatusBadge status={download.status} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Cap. {download.chapter}</span>
                  <span>•</span>
                  <span>{download.id}</span>
                  <span>•</span>
                  <span>{download.started}</span>
                </div>
                {(download.status === "downloading" || download.status === "queued") && (
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={download.progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium">{download.progress}%</span>
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {download.status === "downloading" ? (
                    <DropdownMenuItem>
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar
                    </DropdownMenuItem>
                  ) : download.status === "queued" ? (
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
