"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  PauseCircle,
  PlayCircle,
} from "lucide-react"

interface DownloadRecord {
  id: string
  title: string
  cover: string
  chapter: string
  totalChapters: number
  doneChapters: number
  progress: number
  status: "downloading" | "queued" | "paused" | "completed" | "error"
  speed?: string
  eta?: string
  size: string
}

const downloadRecords: DownloadRecord[] = [
  {
    id: "1",
    title: "Jujutsu Kaisen",
    cover: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=120&h=160&fit=crop",
    chapter: "Cap. 181 - 200",
    totalChapters: 20,
    doneChapters: 13,
    progress: 65,
    status: "downloading",
    speed: "2.5 MB/s",
    eta: "3 min",
    size: "245 MB",
  },
  {
    id: "2",
    title: "Black Clover",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&h=160&fit=crop",
    chapter: "Cap. 250 - 290",
    totalChapters: 40,
    doneChapters: 13,
    progress: 32,
    status: "downloading",
    speed: "1.8 MB/s",
    eta: "8 min",
    size: "512 MB",
  },
  {
    id: "3",
    title: "Blue Lock",
    cover: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&h=160&fit=crop",
    chapter: "Cap. 100 - 180",
    totalChapters: 80,
    doneChapters: 62,
    progress: 78,
    status: "downloading",
    speed: "3.1 MB/s",
    eta: "2 min",
    size: "890 MB",
  },
  {
    id: "4",
    title: "My Hero Academia",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&h=160&fit=crop",
    chapter: "Cap. 351 - 370",
    totalChapters: 20,
    doneChapters: 0,
    progress: 0,
    status: "queued",
    size: "230 MB",
  },
  {
    id: "5",
    title: "Dandadan",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=160&fit=crop",
    chapter: "Cap. 1 - 140",
    totalChapters: 140,
    doneChapters: 0,
    progress: 0,
    status: "queued",
    size: "1.2 GB",
  },
  {
    id: "6",
    title: "Kingdom",
    cover: "https://images.unsplash.com/photo-1544164559-2e64cde97e9c?w=120&h=160&fit=crop",
    chapter: "Cap. 500 - 600",
    totalChapters: 100,
    doneChapters: 45,
    progress: 45,
    status: "paused",
    size: "1.5 GB",
  },
  {
    id: "7",
    title: "One Piece",
    cover: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=120&h=160&fit=crop",
    chapter: "Cap. 1095 - 1100",
    totalChapters: 6,
    doneChapters: 6,
    progress: 100,
    status: "completed",
    size: "78 MB",
  },
  {
    id: "8",
    title: "Frieren",
    cover: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=120&h=160&fit=crop",
    chapter: "Cap. 120 - 128",
    totalChapters: 8,
    doneChapters: 8,
    progress: 100,
    status: "completed",
    size: "95 MB",
  },
  {
    id: "9",
    title: "Ao Ashi",
    cover: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&h=160&fit=crop",
    chapter: "Cap. 350 - 380",
    totalChapters: 30,
    doneChapters: 12,
    progress: 40,
    status: "error",
    size: "340 MB",
  },
]

const statusConfig = {
  downloading: { label: "Baixando", color: "text-primary", badge: "bg-primary/15 text-primary border-primary/30" },
  queued: { label: "Na fila", color: "text-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
  paused: { label: "Pausado", color: "text-chart-3", badge: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  completed: { label: "Concluído", color: "text-primary", badge: "bg-primary/15 text-primary border-primary/30" },
  error: { label: "Erro", color: "text-destructive", badge: "bg-destructive/15 text-destructive border-destructive/30" },
}

const tabs = [
  { id: "all", label: "Todos" },
  { id: "downloading", label: "Baixando" },
  { id: "queued", label: "Na fila" },
  { id: "completed", label: "Concluídos" },
  { id: "error", label: "Erros" },
]

export function DownloadsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const filtered = activeTab === "all"
    ? downloadRecords
    : downloadRecords.filter((d) => d.status === activeTab)

  const counts = {
    all: downloadRecords.length,
    downloading: downloadRecords.filter((d) => d.status === "downloading").length,
    queued: downloadRecords.filter((d) => d.status === "queued").length,
    completed: downloadRecords.filter((d) => d.status === "completed").length,
    error: downloadRecords.filter((d) => d.status === "error").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Global actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <PauseCircle className="size-4" />
            Pausar tudo
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <PlayCircle className="size-4" />
            Retomar tudo
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Trash2 className="size-4" />
          Limpar concluídos
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              activeTab === tab.id ? "bg-primary/20" : "bg-muted"
            )}>
              {counts[tab.id as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Download list */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const config = statusConfig[item.status]
          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <img
                src={item.cover || "/placeholder.svg"}
                alt={item.title}
                className="h-20 w-14 flex-shrink-0 rounded-md object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.chapter}</p>
                  </div>
                  <Badge variant="outline" className={cn("flex-shrink-0", config.badge)}>
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Progress value={item.progress} className="h-1.5 flex-1" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {item.progress}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.doneChapters}/{item.totalChapters} caps</span>
                    <span>{item.size}</span>
                    {item.status === "downloading" && (
                      <>
                        <span className="flex items-center gap-1 text-primary">
                          <Download className="size-3" />
                          {item.speed}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.eta}
                        </span>
                      </>
                    )}
                    {item.status === "completed" && (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="size-3" />
                        Pronto para leitura
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="size-3" />
                        Falha na conexão
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {item.status === "downloading" && (
                      <Button variant="ghost" size="icon" className="size-8">
                        <Pause className="size-4" />
                      </Button>
                    )}
                    {(item.status === "paused" || item.status === "error") && (
                      <Button variant="ghost" size="icon" className="size-8">
                        <Play className="size-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
