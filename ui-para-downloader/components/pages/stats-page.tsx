"use client"

import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import { BookOpen, Download, Clock, TrendingUp, HardDrive, Library } from "lucide-react"

const downloadData = [
  { month: "Jan", caps: 340 },
  { month: "Fev", caps: 280 },
  { month: "Mar", caps: 520 },
  { month: "Abr", caps: 410 },
  { month: "Mai", caps: 680 },
  { month: "Jun", caps: 590 },
]

const readingData = [
  { day: "Seg", horas: 1.5 },
  { day: "Ter", horas: 2.2 },
  { day: "Qua", horas: 0.8 },
  { day: "Qui", horas: 3.1 },
  { day: "Sex", horas: 2.7 },
  { day: "Sáb", horas: 4.5 },
  { day: "Dom", horas: 3.8 },
]

const genreData = [
  { genre: "Ação", value: 35, fill: "var(--color-acao)" },
  { genre: "Aventura", value: 25, fill: "var(--color-aventura)" },
  { genre: "Fantasia", value: 20, fill: "var(--color-fantasia)" },
  { genre: "Romance", value: 12, fill: "var(--color-romance)" },
  { genre: "Outros", value: 8, fill: "var(--color-outros)" },
]

const downloadChartConfig = {
  caps: { label: "Capítulos", color: "var(--chart-1)" },
} satisfies ChartConfig

const readingChartConfig = {
  horas: { label: "Horas", color: "var(--chart-2)" },
} satisfies ChartConfig

const genreChartConfig = {
  value: { label: "Mangás" },
  acao: { label: "Ação", color: "var(--chart-1)" },
  aventura: { label: "Aventura", color: "var(--chart-2)" },
  fantasia: { label: "Fantasia", color: "var(--chart-3)" },
  romance: { label: "Romance", color: "var(--chart-4)" },
  outros: { label: "Outros", color: "var(--chart-5)" },
} satisfies ChartConfig

const summaryStats = [
  { label: "Capítulos baixados", value: "8.420", icon: Download, trend: "+12% este mês" },
  { label: "Horas de leitura", value: "342h", icon: Clock, trend: "+8% esta semana" },
  { label: "Mangás na biblioteca", value: "40", icon: Library, trend: "+5 novos" },
  { label: "Armazenamento", value: "48.2 GB", icon: HardDrive, trend: "48% usado" },
]

const topManga = [
  { title: "One Piece", chapters: 1100, percent: 100 },
  { title: "Kingdom", chapters: 785, percent: 71 },
  { title: "Bleach", chapters: 686, percent: 62 },
  { title: "Naruto Shippuden", chapters: 700, percent: 64 },
  { title: "My Hero Academia", chapters: 420, percent: 38 },
]

export function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <span className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="size-3" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xs text-primary">{stat.trend}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Downloads over time */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 font-semibold text-foreground">Downloads por mês</h3>
          <p className="mb-4 text-sm text-muted-foreground">Capítulos baixados nos últimos 6 meses</p>
          <ChartContainer config={downloadChartConfig} className="h-[220px] w-full">
            <AreaChart data={downloadData} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillCaps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-caps)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-caps)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area dataKey="caps" type="monotone" fill="url(#fillCaps)" stroke="var(--color-caps)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Reading hours */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 font-semibold text-foreground">Tempo de leitura</h3>
          <p className="mb-4 text-sm text-muted-foreground">Horas de leitura nesta semana</p>
          <ChartContainer config={readingChartConfig} className="h-[220px] w-full">
            <BarChart data={readingData} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="horas" fill="var(--color-horas)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Genre distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 font-semibold text-foreground">Distribuição por gênero</h3>
          <p className="mb-4 text-sm text-muted-foreground">Sua biblioteca por categoria</p>
          <div className="flex items-center gap-4">
            <ChartContainer config={genreChartConfig} className="h-[200px] flex-1">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="genre" />} />
                <Pie data={genreData} dataKey="value" nameKey="genre" innerRadius={50} strokeWidth={2}>
                  {genreData.map((entry) => (
                    <Cell key={entry.genre} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2">
              {genreData.map((entry, i) => (
                <div key={entry.genre} className="flex items-center gap-2 text-sm">
                  <span className="size-3 rounded-sm" style={{ backgroundColor: `var(--chart-${i + 1})` }} />
                  <span className="text-muted-foreground">{entry.genre}</span>
                  <span className="font-medium text-foreground">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top manga by chapters */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 font-semibold text-foreground">Maiores coleções</h3>
          <p className="mb-4 text-sm text-muted-foreground">Mangás com mais capítulos</p>
          <div className="flex flex-col gap-3">
            {topManga.map((manga) => (
              <div key={manga.title} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <BookOpen className="size-3.5 text-muted-foreground" />
                    {manga.title}
                  </span>
                  <span className="text-muted-foreground">{manga.chapters} caps</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${manga.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
