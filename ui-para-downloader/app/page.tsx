"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { MangaCard, type Manga } from "@/components/manga-card"
import { MangaListItem } from "@/components/manga-list-item"
import { DownloadQueue, type DownloadItem } from "@/components/download-queue"
import { MobileDrawer } from "@/components/mobile-drawer"
import { StatsCard } from "@/components/stats-card"
import { EmptyState } from "@/components/empty-state"
import { DownloadsPage } from "@/components/pages/downloads-page"
import { SearchPage } from "@/components/pages/search-page"
import { HistoryPage } from "@/components/pages/history-page"
import { FoldersPage } from "@/components/pages/folders-page"
import { ConvertPage } from "@/components/pages/convert-page"
import { StatsPage } from "@/components/pages/stats-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { HelpPage } from "@/components/pages/help-page"
import { Library, Download, BookOpen, HardDrive, Search } from "lucide-react"

// Mock data for demonstration - Extended dataset for usability testing
const mockMangas: Manga[] = [
  {
    id: "1",
    title: "One Piece",
    coverUrl: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=300&h=400&fit=crop",
    chapters: 1100,
    downloadedChapters: 1100,
    lastUpdated: "2h atrás",
    status: "ongoing",
    downloadStatus: "completed",
  },
  {
    id: "2",
    title: "Naruto Shippuden",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop",
    chapters: 700,
    downloadedChapters: 700,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "3",
    title: "Attack on Titan",
    coverUrl: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=400&fit=crop",
    chapters: 139,
    downloadedChapters: 139,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "4",
    title: "My Hero Academia",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=400&fit=crop",
    chapters: 420,
    downloadedChapters: 350,
    lastUpdated: "1d atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "5",
    title: "Jujutsu Kaisen",
    coverUrl: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=400&fit=crop",
    chapters: 260,
    downloadedChapters: 180,
    lastUpdated: "3h atrás",
    status: "ongoing",
    downloadStatus: "downloading",
    progress: 65,
  },
  {
    id: "6",
    title: "Demon Slayer",
    coverUrl: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&h=400&fit=crop",
    chapters: 205,
    downloadedChapters: 205,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "7",
    title: "Chainsaw Man",
    coverUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=400&fit=crop",
    chapters: 170,
    downloadedChapters: 120,
    lastUpdated: "5h atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "8",
    title: "Solo Leveling",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=400&fit=crop",
    chapters: 180,
    downloadedChapters: 0,
    lastUpdated: "Novo",
    status: "completed",
    downloadStatus: "error",
  },
  {
    id: "9",
    title: "Hunter x Hunter",
    coverUrl: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=300&h=400&fit=crop",
    chapters: 400,
    downloadedChapters: 380,
    lastUpdated: "Em hiato",
    status: "hiatus",
    downloadStatus: "idle",
  },
  {
    id: "10",
    title: "Spy x Family",
    coverUrl: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=300&h=400&fit=crop",
    chapters: 90,
    downloadedChapters: 90,
    lastUpdated: "1 sem atrás",
    status: "ongoing",
    downloadStatus: "completed",
  },
  {
    id: "11",
    title: "Dragon Ball Super",
    coverUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=400&fit=crop",
    chapters: 100,
    downloadedChapters: 45,
    lastUpdated: "2 sem atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "12",
    title: "Bleach",
    coverUrl: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=300&h=400&fit=crop",
    chapters: 686,
    downloadedChapters: 686,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "13",
    title: "Tokyo Ghoul",
    coverUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    chapters: 179,
    downloadedChapters: 179,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "14",
    title: "Black Clover",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=400&fit=crop",
    chapters: 368,
    downloadedChapters: 250,
    lastUpdated: "6h atrás",
    status: "ongoing",
    downloadStatus: "downloading",
    progress: 32,
  },
  {
    id: "15",
    title: "Death Note",
    coverUrl: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=300&h=400&fit=crop",
    chapters: 108,
    downloadedChapters: 108,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "16",
    title: "Fullmetal Alchemist",
    coverUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=400&fit=crop",
    chapters: 116,
    downloadedChapters: 116,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "17",
    title: "Berserk",
    coverUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=400&fit=crop",
    chapters: 374,
    downloadedChapters: 370,
    lastUpdated: "Em hiato",
    status: "hiatus",
    downloadStatus: "idle",
  },
  {
    id: "18",
    title: "One Punch Man",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
    chapters: 195,
    downloadedChapters: 150,
    lastUpdated: "4d atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "19",
    title: "Mob Psycho 100",
    coverUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=400&fit=crop",
    chapters: 101,
    downloadedChapters: 101,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "20",
    title: "Vinland Saga",
    coverUrl: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=300&h=400&fit=crop",
    chapters: 203,
    downloadedChapters: 180,
    lastUpdated: "2 sem atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "21",
    title: "The Promised Neverland",
    coverUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&h=400&fit=crop",
    chapters: 181,
    downloadedChapters: 181,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "22",
    title: "Dr. Stone",
    coverUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=300&h=400&fit=crop",
    chapters: 232,
    downloadedChapters: 232,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "23",
    title: "Blue Lock",
    coverUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=400&fit=crop",
    chapters: 245,
    downloadedChapters: 100,
    lastUpdated: "1d atrás",
    status: "ongoing",
    downloadStatus: "downloading",
    progress: 78,
  },
  {
    id: "24",
    title: "Kaiju No. 8",
    coverUrl: "https://images.unsplash.com/photo-1518882605630-8eb9e27c3d08?w=300&h=400&fit=crop",
    chapters: 105,
    downloadedChapters: 80,
    lastUpdated: "8h atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "25",
    title: "Dandadan",
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
    chapters: 140,
    downloadedChapters: 0,
    lastUpdated: "Novo",
    status: "ongoing",
    downloadStatus: "queued",
  },
  {
    id: "26",
    title: "Sakamoto Days",
    coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
    chapters: 160,
    downloadedChapters: 45,
    lastUpdated: "12h atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "27",
    title: "Mashle",
    coverUrl: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=400&fit=crop",
    chapters: 162,
    downloadedChapters: 162,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "28",
    title: "Oshi no Ko",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop",
    chapters: 156,
    downloadedChapters: 120,
    lastUpdated: "3d atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "29",
    title: "Frieren",
    coverUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=400&fit=crop",
    chapters: 128,
    downloadedChapters: 128,
    lastUpdated: "5d atrás",
    status: "ongoing",
    downloadStatus: "completed",
  },
  {
    id: "30",
    title: "Kingdom",
    coverUrl: "https://images.unsplash.com/photo-1544164559-2e64cde97e9c?w=300&h=400&fit=crop",
    chapters: 785,
    downloadedChapters: 500,
    lastUpdated: "1 sem atrás",
    status: "ongoing",
    downloadStatus: "idle",
  },
  {
    id: "31",
    title: "Vagabond",
    coverUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=400&fit=crop",
    chapters: 327,
    downloadedChapters: 327,
    lastUpdated: "Em hiato",
    status: "hiatus",
    downloadStatus: "completed",
  },
  {
    id: "32",
    title: "Slam Dunk",
    coverUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=400&fit=crop",
    chapters: 276,
    downloadedChapters: 276,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "33",
    title: "Haikyuu!!",
    coverUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=300&h=400&fit=crop",
    chapters: 402,
    downloadedChapters: 402,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "34",
    title: "Kuroko no Basket",
    coverUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=400&fit=crop",
    chapters: 276,
    downloadedChapters: 200,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "idle",
  },
  {
    id: "35",
    title: "Ao Ashi",
    coverUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=400&fit=crop",
    chapters: 380,
    downloadedChapters: 0,
    lastUpdated: "Novo",
    status: "ongoing",
    downloadStatus: "error",
  },
  {
    id: "36",
    title: "Monster",
    coverUrl: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=300&h=400&fit=crop",
    chapters: 162,
    downloadedChapters: 162,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "37",
    title: "20th Century Boys",
    coverUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=400&fit=crop",
    chapters: 249,
    downloadedChapters: 249,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "38",
    title: "Gantz",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=400&fit=crop",
    chapters: 383,
    downloadedChapters: 300,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "idle",
  },
  {
    id: "39",
    title: "Parasyte",
    coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    chapters: 64,
    downloadedChapters: 64,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
  {
    id: "40",
    title: "Tokyo Revengers",
    coverUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop",
    chapters: 278,
    downloadedChapters: 278,
    lastUpdated: "Completo",
    status: "completed",
    downloadStatus: "completed",
  },
]

const mockDownloads: DownloadItem[] = [
  {
    id: "d1",
    title: "Jujutsu Kaisen",
    chapter: "Cap. 181-200",
    progress: 65,
    status: "downloading",
    speed: "2.5 MB/s",
    eta: "3 min",
  },
  {
    id: "d2",
    title: "My Hero Academia",
    chapter: "Cap. 351-370",
    progress: 0,
    status: "queued",
  },
  {
    id: "d3",
    title: "One Piece",
    chapter: "Cap. 1095-1100",
    progress: 100,
    status: "completed",
  },
]

const pageTitles: Record<string, string> = {
  library: "Biblioteca",
  downloads: "Downloads",
  search: "Buscar Mangás",
  history: "Histórico",
  folders: "Gerenciar Pastas",
  convert: "Converter Formatos",
  stats: "Estatísticas",
  settings: "Configurações",
  help: "Ajuda & Suporte",
}

export default function MangaFlowApp() {
  // State
  const [currentPage, setCurrentPage] = useState("library")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedMangas, setSelectedMangas] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterStatus, setFilterStatus] = useState("all")
  const [downloadQueueExpanded, setDownloadQueueExpanded] = useState(true)
  const [downloads, setDownloads] = useState<DownloadItem[]>(mockDownloads)

  // Filtered and sorted mangas
  const filteredMangas = useMemo(() => {
    let result = [...mockMangas]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m => m.title.toLowerCase().includes(query))
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "downloaded") {
        result = result.filter(m => m.downloadStatus === "completed")
      } else if (filterStatus === "pending") {
        result = result.filter(m => m.downloadStatus !== "completed")
      } else {
        result = result.filter(m => m.status === filterStatus)
      }
    }

    // Sort
    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "chapters":
        result.sort((a, b) => b.chapters - a.chapters)
        break
      case "progress":
        result.sort((a, b) => 
          (b.downloadedChapters / b.chapters) - (a.downloadedChapters / a.chapters)
        )
        break
      // "recent" is default order
    }

    return result
  }, [searchQuery, filterStatus, sortBy])

  // Handlers
  const handleSelectManga = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedMangas)
    if (selected) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedMangas(newSelection)
  }

  const handleSelectAll = () => {
    setSelectedMangas(new Set(filteredMangas.map(m => m.id)))
  }

  const handleDeselectAll = () => {
    setSelectedMangas(new Set())
  }

  const handleBatchDownload = () => {
    console.log("Download:", Array.from(selectedMangas))
    setSelectedMangas(new Set())
  }

  const handleBatchDelete = () => {
    console.log("Delete:", Array.from(selectedMangas))
    setSelectedMangas(new Set())
  }

  const handleDownloadManga = (id: string) => {
    console.log("Download manga:", id)
  }

  const handleViewManga = (id: string) => {
    console.log("View manga:", id)
  }

  const handleDeleteManga = (id: string) => {
    console.log("Delete manga:", id)
  }

  const handlePauseDownload = (id: string) => {
    setDownloads(downloads.map(d => 
      d.id === id ? { ...d, status: "paused" as const } : d
    ))
  }

  const handleResumeDownload = (id: string) => {
    setDownloads(downloads.map(d => 
      d.id === id ? { ...d, status: "downloading" as const } : d
    ))
  }

  const handleCancelDownload = (id: string) => {
    setDownloads(downloads.filter(d => d.id !== id))
  }

  const handlePauseAll = () => {
    setDownloads(downloads.map(d => 
      d.status === "downloading" ? { ...d, status: "paused" as const } : d
    ))
  }

  const handleResumeAll = () => {
    setDownloads(downloads.map(d => 
      d.status === "paused" ? { ...d, status: "downloading" as const } : d
    ))
  }

  const handleClearCompleted = () => {
    setDownloads(downloads.filter(d => d.status !== "completed"))
  }

  const handleRefresh = () => {
    console.log("Refresh library")
  }

  // Stats calculations - use fixed pt-BR locale to avoid SSR/client hydration mismatch
  const formatNumber = (n: number) => new Intl.NumberFormat("pt-BR").format(n)
  const totalMangas = mockMangas.length
  const totalChapters = mockMangas.reduce((acc, m) => acc + m.chapters, 0)
  const downloadedChapters = mockMangas.reduce((acc, m) => acc + m.downloadedChapters, 0)
  const storageUsed = "48.2 GB"

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <Header
          title={pageTitles[currentPage]}
          selectedCount={selectedMangas.size}
          totalCount={filteredMangas.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBatchDownload={handleBatchDownload}
          onBatchDelete={handleBatchDelete}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          onMobileMenuClick={() => setMobileDrawerOpen(true)}
          onRefresh={handleRefresh}
          showLibraryControls={currentPage === "library"}
        />

        <div className="p-4 lg:p-6">
          {/* Stats Cards - Show on library page */}
          {currentPage === "library" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total de Mangás"
                value={totalMangas}
                icon={Library}
              />
              <StatsCard
                title="Capítulos"
                value={formatNumber(totalChapters)}
                subtitle={`${formatNumber(downloadedChapters)} baixados`}
                icon={BookOpen}
              />
              <StatsCard
                title="Downloads Ativos"
                value={downloads.filter(d => d.status === "downloading").length}
                icon={Download}
              />
              <StatsCard
                title="Armazenamento"
                value={storageUsed}
                subtitle="de 100 GB"
                icon={HardDrive}
              />
            </div>
          )}

          {/* Content */}
          {currentPage === "library" && (
            <>
              {filteredMangas.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {filteredMangas.map((manga) => (
                      <MangaCard
                        key={manga.id}
                        manga={manga}
                        selected={selectedMangas.has(manga.id)}
                        onSelect={handleSelectManga}
                        onDownload={handleDownloadManga}
                        onView={handleViewManga}
                        onDelete={handleDeleteManga}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredMangas.map((manga) => (
                      <MangaListItem
                        key={manga.id}
                        manga={manga}
                        selected={selectedMangas.has(manga.id)}
                        onSelect={handleSelectManga}
                        onDownload={handleDownloadManga}
                        onView={handleViewManga}
                        onDelete={handleDeleteManga}
                      />
                    ))}
                  </div>
                )
              ) : (
                <EmptyState
                  icon={Search}
                  title="Nenhum mangá encontrado"
                  description="Tente ajustar seus filtros ou buscar por outro termo"
                  className="min-h-[400px]"
                />
              )}
            </>
          )}

          {currentPage === "downloads" && <DownloadsPage />}
          {currentPage === "search" && <SearchPage />}
          {currentPage === "history" && <HistoryPage />}
          {currentPage === "folders" && <FoldersPage />}
          {currentPage === "convert" && <ConvertPage />}
          {currentPage === "stats" && <StatsPage />}
          {currentPage === "settings" && <SettingsPage />}
          {currentPage === "help" && <HelpPage />}
        </div>
      </main>

      {/* Download Queue Widget */}
      <DownloadQueue
        items={downloads}
        expanded={downloadQueueExpanded}
        onExpandedChange={setDownloadQueueExpanded}
        onPause={handlePauseDownload}
        onResume={handleResumeDownload}
        onCancel={handleCancelDownload}
        onPauseAll={handlePauseAll}
        onResumeAll={handleResumeAll}
        onClearCompleted={handleClearCompleted}
      />
    </div>
  )
}
