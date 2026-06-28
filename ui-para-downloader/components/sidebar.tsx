"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Library,
  Download,
  Settings,
  FolderOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  FileArchive,
  BarChart3,
  HelpCircle
} from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
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

export function Sidebar({ currentPage, onPageChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border h-16 px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">MangaFlow</h1>
            <p className="text-xs text-muted-foreground truncate">Download & Conversão</p>
          </div>
        )}
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-3 h-10 transition-all",
                collapsed && "justify-center px-2",
                currentPage === item.id && "bg-sidebar-accent text-primary font-medium"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", currentPage === item.id && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* Menu Inferior */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-3 h-10 transition-all",
                collapsed && "justify-center px-2",
                currentPage === item.id && "bg-sidebar-accent text-primary font-medium"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", currentPage === item.id && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggle Collapse */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-secondary"
        onClick={() => onCollapsedChange(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}
