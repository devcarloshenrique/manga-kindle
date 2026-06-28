"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, BookOpen, Trash2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

interface HistoryEvent {
  id: string
  title: string
  cover: string
  action: "downloaded" | "read" | "deleted" | "converted" | "failed"
  detail: string
  time: string
}

interface HistoryGroup {
  date: string
  events: HistoryEvent[]
}

const actionConfig = {
  downloaded: { icon: Download, label: "Baixado", color: "text-primary", bg: "bg-primary/15" },
  read: { icon: BookOpen, label: "Lido", color: "text-chart-2", bg: "bg-chart-2/15" },
  deleted: { icon: Trash2, label: "Removido", color: "text-muted-foreground", bg: "bg-muted" },
  converted: { icon: RefreshCw, label: "Convertido", color: "text-chart-3", bg: "bg-chart-3/15" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-destructive", bg: "bg-destructive/15" },
}

const historyGroups: HistoryGroup[] = [
  {
    date: "Hoje",
    events: [
      { id: "1", title: "Jujutsu Kaisen", cover: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=80&h=110&fit=crop", action: "downloaded", detail: "Capítulos 181-200 (20 caps)", time: "14:32" },
      { id: "2", title: "One Piece", cover: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=80&h=110&fit=crop", action: "read", detail: "Capítulo 1100", time: "13:10" },
      { id: "3", title: "Frieren", cover: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=80&h=110&fit=crop", action: "downloaded", detail: "Capítulos 120-128 (8 caps)", time: "11:45" },
      { id: "4", title: "Ao Ashi", cover: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=80&h=110&fit=crop", action: "failed", detail: "Erro ao baixar caps 350-380", time: "10:20" },
    ],
  },
  {
    date: "Ontem",
    events: [
      { id: "5", title: "Solo Leveling", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=110&fit=crop", action: "converted", detail: "Convertido para PDF (180 caps)", time: "22:15" },
      { id: "6", title: "Demon Slayer", cover: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=80&h=110&fit=crop", action: "read", detail: "Capítulo 205 (final)", time: "20:30" },
      { id: "7", title: "Naruto Shippuden", cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=80&h=110&fit=crop", action: "deleted", detail: "Removido da biblioteca", time: "18:05" },
    ],
  },
  {
    date: "23 de Junho",
    events: [
      { id: "8", title: "Chainsaw Man", cover: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=80&h=110&fit=crop", action: "downloaded", detail: "Capítulos 1-120 (120 caps)", time: "16:40" },
      { id: "9", title: "Spy x Family", cover: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=80&h=110&fit=crop", action: "converted", detail: "Convertido para CBZ (90 caps)", time: "15:22" },
      { id: "10", title: "Attack on Titan", cover: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=80&h=110&fit=crop", action: "read", detail: "Capítulo 139 (final)", time: "12:00" },
    ],
  },
]

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Acompanhe todas as suas atividades recentes
        </p>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
          Limpar histórico
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {historyGroups.map((group) => (
          <div key={group.date} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{group.date}</h3>
            <div className="flex flex-col gap-2">
              {group.events.map((event) => {
                const config = actionConfig[event.action]
                const Icon = config.icon
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className={cn("flex size-9 flex-shrink-0 items-center justify-center rounded-lg", config.bg)}>
                      <Icon className={cn("size-4", config.color)} />
                    </div>
                    <img
                      src={event.cover || "/placeholder.svg"}
                      alt={event.title}
                      className="h-12 w-9 flex-shrink-0 rounded object-cover"
                    />
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{event.title}</span>
                        <Badge variant="outline" className={cn("flex-shrink-0 text-[10px]", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      <span className="truncate text-sm text-muted-foreground">{event.detail}</span>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">{event.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
