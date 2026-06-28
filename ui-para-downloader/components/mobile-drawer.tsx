"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Library,
  Download,
  Settings,
  FolderOpen,
  Clock,
  Search,
  FileArchive,
  BarChart3,
  HelpCircle,
  X
} from "lucide-react"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "search", label: "Buscar", icon: Search },
  { id: "history", label: "Histórico", icon: Clock },
  { id: "folders", label: "Pastas", icon: FolderOpen },
  { id: "convert", label: "Converter", icon: FileArchive },
]

const bottomItems = [
  { id: "stats", label: "Estatísticas", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "help", label: "Ajuda", icon: HelpCircle },
]

export function MobileDrawer({ open, onClose, currentPage, onPageChange }: MobileDrawerProps) {
  const handlePageChange = (page: string) => {
    onPageChange(page)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sidebar-border h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">MangaFlow</h1>
              <p className="text-xs text-muted-foreground">Download & Conversão</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-3 h-11",
                  currentPage === item.id && "bg-sidebar-accent text-primary font-medium"
                )}
                onClick={() => handlePageChange(item.id)}
              >
                <item.icon className={cn("h-5 w-5", currentPage === item.id && "text-primary")} />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="h-px bg-sidebar-border my-4" />

          <div className="flex flex-col gap-1">
            {bottomItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-3 h-11",
                  currentPage === item.id && "bg-sidebar-accent text-primary font-medium"
                )}
                onClick={() => handlePageChange(item.id)}
              >
                <item.icon className={cn("h-5 w-5", currentPage === item.id && "text-primary")} />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
