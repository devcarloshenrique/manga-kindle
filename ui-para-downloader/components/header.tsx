"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Grid3X3,
  List,
  Download,
  Trash2,
  Menu,
  Filter,
  SortAsc,
  CheckSquare,
  X,
  RefreshCw
} from "lucide-react"

interface HeaderProps {
  title: string
  selectedCount: number
  totalCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onBatchDownload: () => void
  onBatchDelete: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  filterStatus: string
  onFilterChange: (status: string) => void
  onMobileMenuClick: () => void
  onRefresh: () => void
  showLibraryControls?: boolean
}

export function Header({
  title,
  selectedCount,
  totalCount,
  viewMode,
  onViewModeChange,
  onSelectAll,
  onDeselectAll,
  onBatchDownload,
  onBatchDelete,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterStatus,
  onFilterChange,
  onMobileMenuClick,
  onRefresh,
  showLibraryControls = true
}: HeaderProps) {
  const hasSelection = selectedCount > 0

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4 lg:px-6">
      {/* Top Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {showLibraryControls && (
              <p className="text-sm text-muted-foreground">
                {totalCount} itens {hasSelection && `• ${selectedCount} selecionados`}
              </p>
            )}
          </div>
        </div>

        {/* Batch Actions */}
        {showLibraryControls && (hasSelection ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              {selectedCount} selecionados
            </Badge>
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button variant="default" size="sm" onClick={onBatchDownload}>
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
            <Button variant="destructive" size="sm" onClick={onBatchDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              <CheckSquare className="h-4 w-4 mr-1" />
              Selecionar Tudo
            </Button>
          </div>
        ))}
      </div>

      {/* Bottom Row - Search & Filters */}
      {showLibraryControls && (
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mangás..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-input"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[140px] bg-input">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completos</SelectItem>
              <SelectItem value="ongoing">Em Andamento</SelectItem>
              <SelectItem value="hiatus">Em Hiato</SelectItem>
              <SelectItem value="downloaded">Baixados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px] bg-input">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Título A-Z</SelectItem>
              <SelectItem value="title-desc">Título Z-A</SelectItem>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="chapters">Mais Capítulos</SelectItem>
              <SelectItem value="progress">Progresso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-input p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      )}
    </header>
  )
}
