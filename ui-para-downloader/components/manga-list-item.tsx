"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  MoreVertical,
  Eye,
  Trash2,
  FolderOpen,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import type { Manga } from "./manga-card"

interface MangaListItemProps {
  manga: Manga
  selected: boolean
  onSelect: (id: string, selected: boolean) => void
  onDownload: (id: string) => void
  onView: (id: string) => void
  onDelete: (id: string) => void
}

const statusColors = {
  completed: "bg-primary/20 text-primary",
  ongoing: "bg-chart-3/20 text-chart-3",
  hiatus: "bg-muted text-muted-foreground",
}

const statusLabels = {
  completed: "Completo",
  ongoing: "Em Andamento",
  hiatus: "Hiato",
}

export function MangaListItem({ manga, selected, onSelect, onDownload, onView, onDelete }: MangaListItemProps) {
  const progressPercent = manga.chapters > 0 ? (manga.downloadedChapters / manga.chapters) * 100 : 0

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors",
        selected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(manga.id, checked as boolean)}
        className="h-5 w-5 shrink-0"
      />

      {/* Cover Thumbnail */}
      <div className="relative h-16 w-12 shrink-0 rounded overflow-hidden bg-muted">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="h-full w-full object-cover"
        />
        {/* Download Status Overlay */}
        {manga.downloadStatus === "downloading" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{manga.title}</h3>
          <Badge variant="secondary" className={cn("text-xs shrink-0", statusColors[manga.status])}>
            {statusLabels[manga.status]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {manga.downloadedChapters}/{manga.chapters} capítulos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {manga.lastUpdated}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <Progress
            value={progressPercent}
            className="h-1.5 flex-1"
          />
          <span className="text-xs text-muted-foreground w-10 text-right">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Status Icon */}
      <div className="shrink-0">
        {manga.downloadStatus === "completed" && (
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
        )}
        {manga.downloadStatus === "error" && (
          <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
        {manga.downloadStatus === "idle" && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(manga.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(manga.id)}>
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FolderOpen className="mr-2 h-4 w-4" />
              Abrir Pasta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(manga.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
