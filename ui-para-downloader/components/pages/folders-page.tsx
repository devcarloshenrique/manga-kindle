"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Folder, FolderPlus, HardDrive, MoreVertical, BookMarked } from "lucide-react"

interface LibraryFolder {
  id: string
  name: string
  mangaCount: number
  size: string
  color: string
  path: string
}

const folders: LibraryFolder[] = [
  { id: "1", name: "Shonen Jump", mangaCount: 18, size: "12.4 GB", color: "bg-chart-1", path: "/Mangás/Shonen" },
  { id: "2", name: "Seinen", mangaCount: 9, size: "8.2 GB", color: "bg-chart-2", path: "/Mangás/Seinen" },
  { id: "3", name: "Concluídos", mangaCount: 22, size: "18.7 GB", color: "bg-chart-3", path: "/Mangás/Concluídos" },
  { id: "4", name: "Favoritos", mangaCount: 7, size: "5.1 GB", color: "bg-chart-4", path: "/Mangás/Favoritos" },
  { id: "5", name: "Para ler depois", mangaCount: 14, size: "3.8 GB", color: "bg-chart-5", path: "/Mangás/Backlog" },
  { id: "6", name: "Esportes", mangaCount: 5, size: "4.2 GB", color: "bg-primary", path: "/Mangás/Esportes" },
]

export function FoldersPage() {
  const totalUsed = 48.2
  const totalCapacity = 100
  const usedPercent = (totalUsed / totalCapacity) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Storage overview */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15">
              <HardDrive className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Armazenamento</h3>
              <p className="text-sm text-muted-foreground">
                {totalUsed} GB de {totalCapacity} GB utilizados
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{Math.round(usedPercent)}%</span>
        </div>
        <Progress value={usedPercent} className="mt-4 h-2" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{folders.length} pastas organizadas</p>
        <Button size="sm" className="gap-2">
          <FolderPlus className="size-4" />
          Nova pasta
        </Button>
      </div>

      {/* Folder grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={cn("flex size-10 items-center justify-center rounded-lg", `${folder.color}/15`)}>
                <Folder className={cn("size-5", folder.color.replace("bg-", "text-"))} />
              </div>
              <Button variant="ghost" size="icon" className="size-7 opacity-0 transition-opacity group-hover:opacity-100">
                <MoreVertical className="size-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{folder.name}</h3>
              <p className="text-xs text-muted-foreground">{folder.path}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookMarked className="size-3.5" />
                {folder.mangaCount} mangás
              </span>
              <span>{folder.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
