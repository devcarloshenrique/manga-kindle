"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Star, TrendingUp, Check } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  cover: string
  author: string
  chapters: number
  rating: number
  genres: string[]
  status: "ongoing" | "completed" | "hiatus"
  inLibrary: boolean
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Sousou no Frieren",
    cover: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=400&fit=crop",
    author: "Kanehito Yamada",
    chapters: 128,
    rating: 9.4,
    genres: ["Aventura", "Fantasia", "Drama"],
    status: "ongoing",
    inLibrary: true,
  },
  {
    id: "2",
    title: "Gachiakuta",
    cover: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=300&h=400&fit=crop",
    author: "Kei Urana",
    chapters: 75,
    rating: 8.7,
    genres: ["Ação", "Fantasia"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "3",
    title: "Hirayasumi",
    cover: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=300&h=400&fit=crop",
    author: "Keigo Shinzo",
    chapters: 62,
    rating: 8.9,
    genres: ["Slice of Life", "Comédia"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "4",
    title: "The Fragrant Flower",
    cover: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&h=400&fit=crop",
    author: "Saka Mikami",
    chapters: 90,
    rating: 8.5,
    genres: ["Romance", "Slice of Life"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "5",
    title: "Kagurabachi",
    cover: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=400&fit=crop",
    author: "Takeru Hokazono",
    chapters: 58,
    rating: 8.8,
    genres: ["Ação", "Sobrenatural"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "6",
    title: "Centuria",
    cover: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=400&fit=crop",
    author: "Tona",
    chapters: 40,
    rating: 8.3,
    genres: ["Fantasia", "Aventura"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "7",
    title: "Ruri Rocks",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop",
    author: "Reita Nara",
    chapters: 45,
    rating: 8.1,
    genres: ["Slice of Life", "Seinen"],
    status: "ongoing",
    inLibrary: false,
  },
  {
    id: "8",
    title: "Ichi the Witch",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=400&fit=crop",
    author: "Osamu Nishi",
    chapters: 30,
    rating: 8.0,
    genres: ["Ação", "Fantasia"],
    status: "ongoing",
    inLibrary: false,
  },
]

const trendingTags = ["Ação", "Romance", "Fantasia", "Isekai", "Slice of Life", "Shonen", "Seinen", "Comédia"]

const statusLabels = {
  ongoing: "Em andamento",
  completed: "Completo",
  hiatus: "Em hiato",
}

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor ou gênero..."
          className="h-12 pl-12 text-base"
        />
      </div>

      {/* Trending tags */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="size-4" />
          Gêneros populares
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                activeTag === tag
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Resultados ({searchResults.length})</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <img
                src={result.cover || "/placeholder.svg"}
                alt={result.title}
                className="h-28 w-20 flex-shrink-0 rounded-md object-cover"
              />
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-foreground line-clamp-2">{result.title}</h3>
                  <span className="flex flex-shrink-0 items-center gap-1 text-sm font-medium text-chart-3">
                    <Star className="size-3.5 fill-chart-3" />
                    {result.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{result.author}</p>
                <div className="flex flex-wrap gap-1">
                  {result.genres.slice(0, 2).map((g) => (
                    <Badge key={g} variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {g}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {result.chapters} caps · {statusLabels[result.status]}
                  </span>
                  {result.inLibrary ? (
                    <Button size="sm" variant="secondary" disabled className="h-7 gap-1 text-xs">
                      <Check className="size-3" />
                      Na biblioteca
                    </Button>
                  ) : (
                    <Button size="sm" className="h-7 gap-1 text-xs">
                      <Plus className="size-3" />
                      Adicionar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
