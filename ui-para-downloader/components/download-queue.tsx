"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  Pause,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"

export interface DownloadItem {
  id: string
  title: string
  chapter: string
  progress: number
  status: "queued" | "downloading" | "paused" | "completed" | "error"
  speed?: string
  eta?: string
}

interface DownloadQueueProps {
  items: DownloadItem[]
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
}

export function DownloadQueue({
  items,
  expanded,
  onExpandedChange,
  onPause,
  onResume,
  onCancel,
  onPauseAll,
  onResumeAll,
  onClearCompleted
}: DownloadQueueProps) {
  const activeDownloads = items.filter(i => i.status === "downloading").length
  const completedDownloads = items.filter(i => i.status === "completed").length
  const totalDownloads = items.length
  const isPaused = items.some(i => i.status === "paused")

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="w-full flex items-center justify-between p-3">
          <button
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
          >
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-sm">Downloads</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeDownloads} ativo{activeDownloads !== 1 && "s"} • {completedDownloads}/{totalDownloads} completos
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {isPaused ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onResumeAll}>
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPauseAll}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onExpandedChange(!expanded)}
              aria-label={expanded ? "Recolher" : "Expandir"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Queue List */}
        {expanded && (
          <div className="border-t border-border">
            <div className="max-h-64 overflow-y-auto">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-0"
                >
                  {/* Status Icon */}
                  <div className="shrink-0">
                    {item.status === "downloading" && (
                      <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    )}
                    {item.status === "queued" && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {item.status === "paused" && (
                      <div className="h-8 w-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                        <Pause className="h-4 w-4 text-chart-3" />
                      </div>
                    )}
                    {item.status === "completed" && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {item.status === "error" && (
                      <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.chapter}</p>
                    {item.status === "downloading" && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={item.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">{item.progress}%</span>
                      </div>
                    )}
                    {item.status === "downloading" && item.speed && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.speed} • {item.eta}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "downloading" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPause(item.id)}>
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {item.status === "paused" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onResume(item.id)}>
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {item.status !== "completed" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onCancel(item.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {completedDownloads > 0 && (
              <div className="border-t border-border p-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onClearCompleted}>
                  Limpar Concluídos ({completedDownloads})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
