# Manga Downloader API v2.0

API Node.js/TypeScript para download de mangás com suporte a múltiplos sites, arquitetura DDD/Vertical Slice, rate limiting e documentação Swagger.

## 🏗️ Arquitetura

O projeto segue os princípios de **Domain-Driven Design (DDD)** e **Vertical Slice Architecture**:

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/              # Entidades do domínio
│   │   ├── manga.ts           # Manga, Chapter, Page, ChapterContent
│   │   └── download.ts        # Download, DownloadProgress
│   ├── interfaces/            # Contratos/Interfaces
│   │   ├── manga-connector.interface.ts
│   │   └── download-repository.interface.ts
│   └── value-objects/         # Value Objects
│       ├── manga-url.ts
│       └── chapter-url.ts
│
├── application/               # Camada de Aplicação
│   └── features/              # Casos de uso (Vertical Slices)
│       ├── manga/
│       │   ├── get-manga-info.ts
│       │   └── get-chapter-pages.ts
│       └── download/
│           ├── download-manga.ts
│           └── download-chapter.ts
│
├── infrastructure/            # Camada de Infraestrutura
│   ├── connectors/            # Conectores de sites
│   │   ├── base-connector.ts  # Classe base abstrata
│   │   ├── mangalivre-connector.ts
│   │   └── connector-registry.ts
│   ├── http/                  # Cliente HTTP
│   │   └── http-client.ts
│   ├── rate-limiter/          # Controle de requisições
│   │   └── rate-limiter.ts
│   └── repositories/          # Repositórios
│       └── download-repository.ts
│
├── api/                       # Camada de API
│   ├── config/
│   │   └── swagger.ts         # Configuração OpenAPI
│   ├── controllers/           # Controllers
│   │   ├── manga.controller.ts
│   │   ├── download.controller.ts
│   │   └── system.controller.ts
│   ├── middleware/            # Middlewares
│   │   └── error-handler.ts
│   ├── routes/                # Rotas
│   │   └── api.routes.ts
│   └── app.ts                 # Configuração Express
│
├── index.ts                   # Entry point da API
└── cli.ts                     # Interface de linha de comando
```

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar build
npm start
```

## 📖 Uso

### API HTTP

```bash
# Iniciar servidor
npm run dev

# Servidor disponível em http://localhost:3000
# Documentação Swagger em http://localhost:3000/docs
```

### CLI

```bash
# Ver ajuda
npm run cli -- --help

# Listar conectores disponíveis
npm run cli -- --connectors

# Ver informações do mangá
npm run cli -- https://mangalivre.to/manga/sakamoto-days/ --info

# Baixar todos os capítulos
npm run cli -- https://mangalivre.to/manga/sakamoto-days/

# Baixar capítulos específicos (1 a 10)
npm run cli -- https://mangalivre.to/manga/sakamoto-days/ --start 1 --end 10

# Especificar diretório de saída
npm run cli -- https://mangalivre.to/manga/sakamoto-days/ -o ./meus-mangas
```

## 🔌 Endpoints da API

### Conectores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/connectors` | Lista conectores disponíveis |

### Manga

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/manga/info?url=<url>` | Informações do mangá |
| GET | `/api/manga/chapter/pages?url=<url>` | Páginas de um capítulo |

### Downloads

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/downloads` | Inicia download de mangá |
| POST | `/api/downloads/chapter` | Baixa um capítulo |
| GET | `/api/downloads` | Lista todos os downloads |
| GET | `/api/downloads/:id` | Status de um download |
| DELETE | `/api/downloads/:id` | Cancela um download |

### Sistema

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Informações da API |
| GET | `/api/system/stats` | Estatísticas do sistema |
| GET | `/docs` | Documentação Swagger |

## 📝 Exemplos de Requisições

### Obter informações do mangá

```bash
curl "http://localhost:3000/api/manga/info?url=https://mangalivre.to/manga/sakamoto-days/"
```

### Obter páginas de um capítulo

```bash
curl "http://localhost:3000/api/manga/chapter/pages?url=https://mangalivre.to/manga/sakamoto-days/capitulo-1/"
```

### Iniciar download de mangá

```bash
curl -X POST http://localhost:3000/api/downloads \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://mangalivre.to/manga/sakamoto-days/",
    "startChapter": 1,
    "endChapter": 5
  }'
```

### Verificar status do download

```bash
curl "http://localhost:3000/api/downloads/<download-id>"
```

## ⚙️ Rate Limiting

A API implementa controle automático de requisições para evitar bloqueios:

- **Fila de requisições**: Requisições são enfileiradas e processadas sequencialmente
- **Delay entre requisições**: Mínimo de 1 segundo entre requisições
- **Concorrência limitada**: Máximo de 2 requisições simultâneas por conector
- **Retry automático**: Retentativas com backoff exponencial em caso de erro
- **Proteção contra 429**: Aumenta delay automaticamente quando detecta rate limit

Configurações por conector em `src/infrastructure/rate-limiter/rate-limiter.ts`:

```typescript
export const DEFAULT_RATE_LIMITS = {
  mangalivre: {
    maxConcurrent: 2,
    minTime: 1000,          // 1 segundo entre requisições
    maxQueued: 100,
    errorPenalty: 5000,     // 5 segundos de penalidade por erro
    maxRetries: 3
  }
};
```

## 🔧 Adicionando Novos Conectores

Para adicionar suporte a um novo site de mangá:

1. Crie um novo conector em `src/infrastructure/connectors/`:

```typescript
// src/infrastructure/connectors/novo-site-connector.ts
import { BaseMangaConnector } from './base-connector.js';
import type { Manga, ChapterContent } from '../../domain/entities/index.js';

export class NovoSiteConnector extends BaseMangaConnector {
  readonly name = 'novosite';
  readonly displayName = 'Novo Site';
  readonly baseUrl = 'https://novosite.com';
  readonly urlPattern = /novosite\.com\/manga\//;

  constructor() {
    super();
    this.initHttpClient();
  }

  async getMangaInfo(mangaUrl: string): Promise<Manga> {
    // Implementar scraping
  }

  async getChapterPages(chapterUrl: string): Promise<ChapterContent> {
    // Implementar scraping
  }
}
```

2. Registre o conector em `src/infrastructure/connectors/connector-registry.ts`:

```typescript
import { NovoSiteConnector } from './novo-site-connector.js';

// No construtor:
this.register(new NovoSiteConnector());
```

3. Adicione configuração de rate limit em `src/infrastructure/rate-limiter/rate-limiter.ts`:

```typescript
export const DEFAULT_RATE_LIMITS = {
  // ...
  novosite: {
    maxConcurrent: 1,
    minTime: 2000,
    maxQueued: 50,
    errorPenalty: 10000,
    maxRetries: 3
  }
};
```

## 📁 Estrutura dos Downloads

```
downloads/
└── Sakamoto Days/
    ├── info.json              # Metadados do mangá
    ├── Capitulo_0001/
    │   ├── 001.webp
    │   ├── 002.webp
    │   └── ...
    ├── Capitulo_0002/
    │   └── ...
    └── ...
```

## 🛠️ Tecnologias

- **TypeScript** - Linguagem principal
- **Express** - Framework web
- **Swagger/OpenAPI** - Documentação
- **Axios** - Cliente HTTP
- **Cheerio** - Parser HTML
- **Bottleneck** - Rate limiting
- **Zod** - Validação de schemas

## 📄 Licença

MIT

## ⚠️ Aviso Legal

Esta ferramenta é fornecida apenas para fins educacionais. Respeite os termos de uso dos sites e os direitos autorais dos criadores dos mangás.
