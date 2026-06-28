"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Download, FolderOpen, Bell, Palette, Wifi, Globe } from "lucide-react"

interface ToggleSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function ToggleRow({ setting }: { setting: ToggleSetting }) {
  const [enabled, setEnabled] = useState(setting.enabled)
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <Label className="text-sm font-medium text-foreground">{setting.label}</Label>
        <span className="text-xs text-muted-foreground">{setting.description}</span>
      </div>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  )
}

const qualityOptions = ["Original", "Alta", "Média", "Baixa"]

export function SettingsPage() {
  const [quality, setQuality] = useState("Alta")

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {/* Downloads */}
      <SettingsSection icon={Download} title="Downloads">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Qualidade da imagem</Label>
          <div className="flex flex-wrap gap-2">
            {qualityOptions.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  quality === q
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Downloads simultâneos</Label>
          <Input type="number" defaultValue={3} min={1} max={10} className="w-24" />
        </div>
        <ToggleRow setting={{ id: "1", label: "Download automático", description: "Baixar novos capítulos automaticamente", enabled: true }} />
        <ToggleRow setting={{ id: "2", label: "Apenas Wi-Fi", description: "Baixar somente conectado ao Wi-Fi", enabled: true }} />
      </SettingsSection>

      {/* Storage */}
      <SettingsSection icon={FolderOpen} title="Armazenamento">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Pasta de downloads</Label>
          <div className="flex gap-2">
            <Input defaultValue="/Mangás/Downloads" className="flex-1" />
            <Button variant="secondary">Alterar</Button>
          </div>
        </div>
        <ToggleRow setting={{ id: "3", label: "Limpar cache automático", description: "Remover arquivos temporários semanalmente", enabled: false }} />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notificações">
        <ToggleRow setting={{ id: "4", label: "Novos capítulos", description: "Avisar quando houver novos capítulos", enabled: true }} />
        <ToggleRow setting={{ id: "5", label: "Download concluído", description: "Notificar ao finalizar downloads", enabled: true }} />
        <ToggleRow setting={{ id: "6", label: "Erros de download", description: "Alertar sobre falhas nos downloads", enabled: false }} />
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection icon={Palette} title="Aparência">
        <ToggleRow setting={{ id: "7", label: "Tema escuro", description: "Usar tema escuro na interface", enabled: true }} />
        <ToggleRow setting={{ id: "8", label: "Animações reduzidas", description: "Diminuir movimentos na interface", enabled: false }} />
      </SettingsSection>

      {/* Connection */}
      <SettingsSection icon={Wifi} title="Conexão & Fontes">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Idioma preferido dos mangás</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Português (BR)</span>
          </div>
        </div>
        <ToggleRow setting={{ id: "9", label: "Usar servidor proxy", description: "Conectar através de proxy seguro", enabled: false }} />
      </SettingsSection>

      <div className="flex justify-end gap-2">
        <Button variant="ghost">Restaurar padrões</Button>
        <Button>Salvar alterações</Button>
      </div>
    </div>
  )
}
