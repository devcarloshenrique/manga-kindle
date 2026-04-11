# Arquitetura do Frontend - MangaDownloader

## 🎨 Design System

### Paleta de Cores
- **Primary**: Azul vibrante (#1d4ed8 / hsl(217, 91%, 60%))
- **Accent**: Laranja manga (#f97316 / hsl(24, 95%, 53%))
- **Success**: Verde esmeralda
- **Warning**: Amber
- **Dark/Light themes**: Suporte completo com CSS variables

### Componentes
- `Badge`: Sistema de badges com variantes (default, success, warning, destructive, outline)
- `Button`: Botões com variantes e tamanhos
- `Card`, `CardHeader`, `CardContent`: Cards modulares
- `Input`, `Select`: Formulários
- `Skeleton`: Estados de loading incluindo `MangaCardSkeleton`, `ChapterCardSkeleton`, `GridSkeleton`

## 📁 Estrutura de Pastas

```
src/
├── app/
│   ├── layout/
│   │   └── app-layout.tsx       # Layout principal com sidebar responsiva
│   ├── providers/
│   │   ├── app-providers.tsx    # Provedores globais
│   │   └── theme-provider.tsx   # Tema claro/escuro
│   └── routes/
│       ├── dashboard.tsx        # Dashboard com estatísticas
│       ├── search.tsx           # Busca de mangás
│       ├── manga.tsx            # Detalhes do mangá
│       ├── downloads.tsx        # Gerenciamento de downloads
│       └── connectors.tsx       # Gestão de conectores
├── components/
│   ├── shared/
│   │   ├── breadcrumb.tsx      # Navegação por breadcrumbs
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── page-header.tsx
│   │   └── theme-toggle.tsx
│   └── ui/                      # Componentes de UI reutilizáveis
├── features/
│   ├── manga/
│   │   ├── manga-card.tsx      # Card de mangá individual
│   │   ├── manga-grid.tsx      # Grid responsivo de mangás
│   │   ├── manga-search.tsx    # Página de busca
│   │   ├── manga-detail.tsx    # Página de detalhes
│   │   ├── chapter-card.tsx    # Card de capítulo
│   │   └── page-preview.tsx    # Visualizador de páginas (modal)
│   ├── downloads/
│   │   ├── download-card.tsx   # Card de download
│   │   ├── download-list.tsx   # Lista de downloads
│   │   └── start-download-form.tsx
│   └── connectors/
│       ├── connector-card.tsx  # Card de conector
│       └── connector-list.tsx  # Lista de conectores
├── hooks/
│   ├── use-manga.ts            # Hook para manga
│   ├── use-downloads.ts        # Hook para downloads
│   ├── use-connectors.ts       # Hook para conectores
│   └── use-system-stats.ts     # Hook para estatísticas
├── services/
│   ├── http.ts                 # Cliente HTTP Axios
│   ├── manga.service.ts        # Serviço de mangás
│   ├── download.service.ts     # Serviço de downloads
│   └── connector.service.ts    # Serviço de conectores
├── stores/
│   └── download-store.tsx      # Estado global (Zustand pattern)
├── lib/
│   ├── constants.ts            # Constantes e enums
│   └── utils.ts                # Utilitários (cn function)
├── styles/
│   └── global.css              # Estilos globais e tokens
└── tokens/                     # (planejado) Tokens de design

## 🚀 Funcionalidades

### Navegação
- Rotas React Router com lazy loading
- Breadcrumbs em todas as páginas
- Sidebar responsiva (mobile/desktop)

### Gerenciamento de Estado
- **Zustand pattern** com `useSyncExternalStore`
- Estado global de downloads persistente
- Auto-refresh de dados (polling)
- Loading states otimizados

### API Integration
- Cliente HTTP configurado com interceptors
- Erros tratados centralmente
- Timeout de 30s
- Suporte a queries param

### Design Responsivo
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Grids responsivos (1-5 colunas)
- Cards adaptativos
- Sidebar colapsável mobile

## 🐛 Bugs Corrigidos

1. **Encoding de URLs**: Uso correto de `encodeURIComponent` nas navegações
2. **Loading states**: Estados de loading consistentes em todas as pages
3. **Error handling**: Mensagens de erro amigáveis com retry
4. **Form validation**: Validação de campos obrigatórios
5. **TypeScript**: Tipos corretos e interfaces completas
6. **Memory leaks**: Cleanup de polling intervals
7. **Dark mode**: Cores funcionais em ambos os temas

## 📱 Páginas

### Dashboard (`/`)
- Cards de estatísticas com links
- Lista de downloads recentes
- Status dos conectores
- Informações do sistema

### Busca (`/search`)
- Input de URL com validação
- Cards de mangá em grid responsivo
- Empty state informativo

### Detalhes do Mangá (`/manga?url=...`)
- Capa em alta qualidade
- Formulário de download integrado
- Lista de capítulos com ChapterCards
- Sinopse e metadados
- Gêneros e autor/artista

### Downloads (`/downloads`)
- Formulário de novo download
- Lista de downloads com progresso
- Cancelamento e retry
- Detalhes expandidos

### Conectores (`/connectors`)
- Cards com informações dos conectores
- Seletor de idioma
- Status health check
- Links externos

## 🔧 Tecnologias

- **React 19** + TypeScript 5.9
- **Vite 7** ( bundler )
- **Tailwind CSS 4** ( estilização )
- **React Router 7** ( navegação )
- **Axios 1** ( HTTP client )
- **Zod** ( validação de schemas ) - *backend*
- **Sonner** ( toast notifications )
- **Lucide React** ( ícones )

## 📈 Melhorias Implementadas

1. **Design Moderno**: Inspirado no MangaDex e MangaLivre
2. **Performance**: Lazy loading de imagens, memoização
3. **Acessibilidade**: ARIA labels, navegação por teclado
4. **UX**: Hover effects, transições suaves, loading skeletons
5. **Mobile-first**: Layout responsivo total
6. **Theme**: Dark/Light mode completo
7. **Code Quality**: Componentização, tipagem, DRY

## 🧪 Testes

O frontend inclui testes com Vitest:
- Testes unitários de hooks
- Testes de componentes
- Testes de services (HTTP mocking)

Executar:
```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🔗 Backend API

O frontend se comunica com a API documentada no Swagger (`/docs`):

- GET `/api/manga/info?url=`
- GET `/api/manga/chapter/pages?url=`
- POST `/api/downloads`
- GET `/api/downloads`
- GET `/api/downloads/:id`
- DELETE `/api/downloads/:id`
- GET `/api/connectors`
- PUT `/api/connectors/:name/language`

## 📄 Licença

MIT - Veja o arquivo LICENSE para detalhes.
