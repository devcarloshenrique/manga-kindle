"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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

export interface Manga {
  id: string
  title: string
  coverUrl: string
  chapters: number
  downloadedChapters: number
  lastUpdated: string
  status: "completed" | "ongoing" | "hiatus"
  downloadStatus: "idle" | "downloading" | "completed" | "error"
  progress?: number
}

interface MangaCardProps {
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

export function MangaCard({ manga, selected, onSelect, onDownload, onView, onDelete }: MangaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const progressPercent = manga.chapters > 0 ? (manga.downloadedChapters / manga.chapters) * 100 : 0

  return (
    <div
      className={cn(
        "group relative rounded-lg bg-card border border-border overflow-hidden transition-all duration-200",
        selected && "ring-2 ring-primary border-primary",
        isHovered && "shadow-lg shadow-primary/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Selection Checkbox */}
        <div className={cn(
          "absolute top-2 left-2 transition-opacity duration-200",
          selected || isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(manga.id, checked as boolean)}
            className="h-5 w-5 bg-background/80 backdrop-blur border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "absolute top-2 right-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(manga.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(manga.id)}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Tudo
              </DropdownMenuItem>
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

        {/* Download Status Overlay */}
        {manga.downloadStatus === "downloading" && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <span className="text-sm font-medium">{manga.progress}%</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className={cn("text-xs font-medium", statusColors[manga.status])}>
            {statusLabels[manga.status]}
          </Badge>
        </div>

        {/* Download Status Icon */}
        <div className="absolute bottom-2 right-2">
          {manga.downloadStatus === "completed" && (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          {manga.downloadStatus === "error" && (
            <div className="h-6 w-6 rounded-full bg-destructive flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate mb-1" title={manga.title}>
          {manga.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {manga.downloadedChapters}/{manga.chapters} caps
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {manga.lastUpdated}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progressPercent === 100 ? "bg-primary" : "bg-chart-3"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
