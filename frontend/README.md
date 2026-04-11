# Frontend - MangaDownloader

Frontend moderno para gerenciamento de downloads de mangás, inspirado no design do MangaDex e MangaLivre.

## 🎨 Design System

- **Tema**: Claro/Escuro com CSS Variables
- **Cores**: Azul primário (#1d4ed8), Laranja accent (#f97316)
- **Responsivo**: Mobile-first (1-5 colunas)
- **Componentes**: Especializados para mangás

## 🚀 Funcionalidades

- Dashboard com estatísticas em tempo real
- Busca de mangás por URL
- Visualização detalhada de mangás
- Gerenciamento de downloads
- Lista de conectores disponíveis
- Sistema de preview de páginas

## 📦 Tecnologias

- React 19 + TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- React Router 7
- Zustand ( state global )
- Axios
- Sonner (toasts)

## 🔧 Scripts

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Testes
npm test
npm run test:watch
npm run test:coverage

# Lint e formatação
npm run lint
npm run format
```

## 🔗 API

O frontend se comunica com o backend em `http://localhost:3000`. Configure `VITE_API_URL` se necessário:

```env
VITE_API_URL=http://localhost:3000
```

## 📱 Navegação

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard |
| `/search` | Buscar Mangá |
| `/manga?url=...` | Detalhes do Mangá |
| `/downloads` | Gerenciar Downloads |
| `/connectors` | Conectores Disponíveis |

## 🧪 Testes

Executar suite completa:

```bash
npm test
```

Cobertura:
```bash
npm run test:coverage
```

## 📁 Estrutura

```
src/
├── app/
│   ├── layout/        # Layout principal
│   ├── providers/     # Context providers
│   └── routes/        # Páginas/rotas
├── components/
│   ├── shared/        # Componentes compartilhados
│   └── ui/            # UI primitivos
├── features/          # Features (manga, downloads, connectors)
├── hooks/             # Custom hooks
├── services/          # Serviços HTTP
├── stores/            # Estado global
├── lib/               # Utilitários
├── styles/            # CSS global
└── tokens/            # Tokens de design
```

## 🎯 Design System

### Cores

```css
Primary: #1d4ed8 (azul)
Accent: #f97316 (laranja)
Success: #10b981 (verde)
Warning: #f59e0b (amber)
```

### Componentes

- **MangaCard**: Card 3:4 com overlay gradiente
- **MangaGrid**: Grid responsivo (1-5 colunas)
- **ChapterCard**: Card com botões Ler/Baixar
- **Breadcrumb**: Navegação contextual
- **PagePreview**: Modal de leitura

## 🐛 Bugs Conhecidos

- Nenhum bug crítico conhecido no momento
- Reportar issues em: https://github.com/seu-repo/issues

## 📝 Licença

MIT - veja o arquivo LICENSE.