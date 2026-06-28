"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, BookOpen, Archive, Smartphone, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

interface ConversionJob {
  id: string
  title: string
  cover: string
  from: string
  to: string
  progress: number
  status: "converting" | "completed" | "queued"
}

const formats = [
  { id: "pdf", label: "PDF", icon: FileText, desc: "Ideal para impressão e leitura universal" },
  { id: "cbz", label: "CBZ", icon: Archive, desc: "Formato padrão para leitores de quadrinhos" },
  { id: "epub", label: "EPUB", icon: BookOpen, desc: "Compatível com e-readers e Kindle" },
  { id: "mobi", label: "MOBI", icon: Smartphone, desc: "Otimizado para dispositivos Kindle" },
]

const conversionJobs: ConversionJob[] = [
  {
    id: "1",
    title: "Solo Leveling",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=110&fit=crop",
    from: "CBZ",
    to: "PDF",
    progress: 72,
    status: "converting",
  },
  {
    id: "2",
    title: "Spy x Family",
    cover: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=80&h=110&fit=crop",
    from: "CBZ",
    to: "EPUB",
    progress: 100,
    status: "completed",
  },
  {
    id: "3",
    title: "Chainsaw Man",
    cover: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=80&h=110&fit=crop",
    from: "PDF",
    to: "MOBI",
    progress: 0,
    status: "queued",
  },
  {
    id: "4",
    title: "Demon Slayer",
    cover: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=80&h=110&fit=crop",
    from: "CBZ",
    to: "PDF",
    progress: 100,
    status: "completed",
  },
]

export function ConvertPage() {
  const [fromFormat, setFromFormat] = useState("cbz")
  const [toFormat, setToFormat] = useState("pdf")

  return (
    <div className="flex flex-col gap-6">
      {/* Conversion setup */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold text-foreground">Novo trabalho de conversão</h3>
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end">
          {/* From */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Formato de origem</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => {
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setFromFormat(f.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      fromFormat === f.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="size-4" />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center pb-2">
            <ArrowRight className="size-5 rotate-90 text-muted-foreground lg:rotate-0" />
          </div>

          {/* To */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Formato de destino</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => {
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setToFormat(f.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      toFormat === f.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="size-4" />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full lg:w-auto">Selecionar mangás e converter</Button>
      </div>

      {/* Jobs queue */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-foreground">Conversões recentes</h3>
        {conversionJobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <img
              src={job.cover || "/placeholder.svg"}
              alt={job.title}
              className="h-14 w-10 flex-shrink-0 rounded object-cover"
            />
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-foreground">{job.title}</span>
                <div className="flex flex-shrink-0 items-center gap-1.5 text-xs">
                  <Badge variant="secondary" className="px-1.5 py-0">{job.from}</Badge>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <Badge variant="outline" className="border-primary/30 bg-primary/15 px-1.5 py-0 text-primary">{job.to}</Badge>
                </div>
              </div>
              {job.status === "converting" && (
                <div className="flex items-center gap-2">
                  <Progress value={job.progress} className="h-1.5 flex-1" />
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Loader2 className="size-3 animate-spin" />
                    {job.progress}%
                  </span>
                </div>
              )}
              {job.status === "completed" && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="size-3" />
                  Conversão concluída
                </span>
              )}
              {job.status === "queued" && (
                <span className="text-xs text-muted-foreground">Aguardando na fila...</span>
              )}
            </div>
            {job.status === "completed" && (
              <Button variant="secondary" size="sm">Baixar</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
