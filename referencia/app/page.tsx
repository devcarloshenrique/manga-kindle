"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { WeeklyChart } from "@/components/weekly-chart";
import { DownloadsTable } from "@/components/downloads-table";
import { MangaCard } from "@/components/manga-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMetrics, mockMangas } from "@/lib/mock-data";
import { RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua biblioteca de mangás"
      >
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </PageHeader>

      {/* Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            trend={index === 0 ? { value: 12, positive: true } : undefined}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Featured Mangas */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4 text-accent" />
                Mangás em Destaque
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/buscar">
                  Ver todos
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {mockMangas.slice(0, 3).map((manga) => (
                  <MangaCard key={manga.slug} manga={manga} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Downloads Table */}
          <DownloadsTable limit={3} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <WeeklyChart />

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/buscar">
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  Buscar novo mangá
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/biblioteca">
                  <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                  Converter para Kindle
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/conectores">
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  Gerenciar conectores
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
