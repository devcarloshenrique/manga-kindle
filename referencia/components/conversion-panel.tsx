"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "./status-badge";
import {
  mockMangas,
  mockJobs,
  mockConverted,
  conversionProfiles,
  conversionFormats,
  conversionPresets,
} from "@/lib/mock-data";
import { Zap, FileDown, Settings2 } from "lucide-react";

export function ConversionPanel() {
  const [selectedManga, setSelectedManga] = useState(mockMangas[0].slug);
  const [format, setFormat] = useState("EPUB");
  const [profile, setProfile] = useState("Kindle PW");
  const [preset, setPreset] = useState("manga");
  const [mergeVolumes, setMergeVolumes] = useState(true);
  const [mangaStyle, setMangaStyle] = useState(true);
  const [hq, setHq] = useState(true);

  const manga = mockMangas.find((m) => m.slug === selectedManga);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Conversion Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings2 className="h-5 w-5 text-primary" />
            Nova Conversão KCC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Selects Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mangá</Label>
              <Select value={selectedManga} onValueChange={setSelectedManga}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockMangas.map((m) => (
                    <SelectItem key={m.slug} value={m.slug}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversionFormats.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Perfil do Dispositivo</Label>
              <Select value={profile} onValueChange={setProfile}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversionProfiles.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preset</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversionPresets.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="merge" className="cursor-pointer text-sm">
                Agrupar volumes
              </Label>
              <Switch
                id="merge"
                checked={mergeVolumes}
                onCheckedChange={setMergeVolumes}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="manga-style" className="cursor-pointer text-sm">
                Manga style
              </Label>
              <Switch
                id="manga-style"
                checked={mangaStyle}
                onCheckedChange={setMangaStyle}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="hq" className="cursor-pointer text-sm">
                Alta qualidade
              </Label>
              <Switch id="hq" checked={hq} onCheckedChange={setHq} />
            </div>
          </div>

          {/* Summary */}
          {manga && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{manga.title}</strong> ·{" "}
                {manga.chapters} capítulos disponíveis · Formato {format} ·{" "}
                {profile}
              </p>
            </div>
          )}

          <Button className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Iniciar Conversão
          </Button>
        </CardContent>
      </Card>

      {/* Queue & Converted */}
      <div className="space-y-6">
        {/* Queue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Fila de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.manga}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.id} · {job.profile} · {job.format}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Converted Files */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Arquivos Convertidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockConverted.map((file) => (
                <div
                  key={file.file}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
                      <FileDown className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.file}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} · {file.createdAt}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
