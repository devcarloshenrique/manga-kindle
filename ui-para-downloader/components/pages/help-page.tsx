"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  ChevronDown,
  BookOpen,
  Download,
  RefreshCw,
  MessageCircle,
  Mail,
  FileQuestion,
} from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: "Como faço para baixar um mangá completo?",
    answer: "Na biblioteca, selecione o mangá desejado e clique no botão de download. Você pode escolher baixar todos os capítulos ou selecionar um intervalo específico. O download aparecerá no painel de fila no canto inferior direito.",
  },
  {
    question: "Posso baixar vários mangás de uma vez?",
    answer: "Sim! Use o modo de seleção múltipla clicando nos checkboxes dos cards. Depois, use o botão 'Baixar selecionados' na barra de ações para iniciar downloads em lote.",
  },
  {
    question: "Quais formatos de conversão estão disponíveis?",
    answer: "Atualmente suportamos conversão entre PDF, CBZ, EPUB e MOBI. Acesse a seção 'Converter Formatos' para transformar seus mangás baixados no formato ideal para seu dispositivo.",
  },
  {
    question: "Como organizar meus mangás em pastas?",
    answer: "Na seção 'Gerenciar Pastas', você pode criar pastas personalizadas e mover seus mangás entre elas. Isso ajuda a manter sua biblioteca organizada por gênero, status ou qualquer critério que preferir.",
  },
  {
    question: "Por que alguns downloads falham?",
    answer: "Downloads podem falhar por instabilidade na conexão ou indisponibilidade temporária da fonte. Você pode tentar novamente clicando no botão de retomar no item com erro na página de Downloads.",
  },
  {
    question: "O download automático consome muitos dados?",
    answer: "Você pode configurar o download automático para funcionar apenas em redes Wi-Fi nas Configurações, evitando consumo de dados móveis.",
  },
]

const quickLinks = [
  { icon: BookOpen, title: "Guia de início", desc: "Primeiros passos no MangaFlow" },
  { icon: Download, title: "Downloads", desc: "Tudo sobre baixar mangás" },
  { icon: RefreshCw, title: "Conversão", desc: "Converter entre formatos" },
]

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [query, setQuery] = useState("")

  const filteredFaqs = query
    ? faqs.filter((f) => f.question.toLowerCase().includes(query.toLowerCase()))
    : faqs

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Como podemos ajudar?"
          className="h-12 pl-12 text-base"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.title}
              className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="size-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{link.title}</span>
              <span className="text-xs text-muted-foreground">{link.desc}</span>
            </button>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <FileQuestion className="size-5 text-primary" />
          Perguntas frequentes
        </h3>
        <div className="flex flex-col gap-2">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "size-5 flex-shrink-0 text-muted-foreground transition-transform",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              {openIndex === i && (
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-foreground">Ainda precisa de ajuda?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Nossa equipe de suporte está disponível para ajudar você.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="gap-2">
            <MessageCircle className="size-4" />
            Chat ao vivo
          </Button>
          <Button variant="secondary" className="gap-2">
            <Mail className="size-4" />
            Enviar e-mail
          </Button>
        </div>
      </div>
    </div>
  )
}
