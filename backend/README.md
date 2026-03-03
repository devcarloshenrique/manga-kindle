# 📖 MangaKindle# 📖 MangaKindle



**API backend para download e conversão de mangás para e-readers (Kindle, Kobo, reMarkable).****API backend para download e conversão de mangás para e-readers (Kindle, Kobo, reMarkable).**



Baixe mangás de múltiplas fontes, organize automaticamente em uma biblioteca local e converta para formatos compatíveis com e-readers usando o [Kindle Comic Converter (KCC)](https://github.com/ciromattia/kcc).Baixe mangás de múltiplas fontes, organize automaticamente em uma biblioteca local e converta para formatos compatíveis com e-readers usando o [Kindle Comic Converter (KCC)](https://github.com/ciromattia/kcc).



------



## ✨ Features## ✨ Features



| Feature | Descrição || Feature | Descrição |

|---|---||---|---|

| 🌐 **Multi-source** | Suporte a múltiplos sites via conectores (MangaLivre, MangaDex) || 🌐 **Multi-source** | Suporte a múltiplos sites via conectores (MangaLivre, MangaDex) |

| 📥 **Downloads assíncronos** | Downloads em background com acompanhamento de progresso || 📥 **Downloads assíncronos** | Downloads em background com acompanhamento de progresso |

| 📚 **Biblioteca local** | Gerenciamento completo dos mangás baixados com filtros e paginação || 📚 **Biblioteca local** | Gerenciamento completo dos mangás baixados com filtros e paginação |

| 🔄 **Conversão KCC** | Converta capítulos para EPUB, MOBI, CBZ e KFX || 🔄 **Conversão KCC** | Converta capítulos para EPUB, MOBI, CBZ e KFX |

| 📱 **40+ perfis** | Kindle (K1–KCS), Kobo, reMarkable e mais || 📱 **40+ perfis** | Kindle (K1–KCS), Kobo, reMarkable e mais |

| 🎛️ **Presets** | Presets de conversão prontos: manga, webtoon, highQuality || 🎛️ **Presets** | Presets de conversão prontos: manga, webtoon, highQuality |

| 📊 **Job queue** | Fila de conversão com BullMQ + Redis || 📊 **Job queue** | Fila de conversão com BullMQ + Redis |

| 📖 **Swagger** | Documentação interativa completa em `/docs` || 📖 **Swagger** | Documentação interativa completa em `/docs` |

| ⚡ **Rate limiting** | Controle automático de requisições por conector || ⚡ **Rate limiting** | Controle automático de requisições por conector |



------



## 🏗️ Arquitetura## 🏗️ Arquitetura



O projeto segue **DDD** (Domain-Driven Design) e **Vertical Slice Architecture**:O projeto segue os princípios de **Domain-Driven Design (DDD)** e **Vertical Slice Architecture**:



``````

backend/src/

├── bin/kcc/                        # Binários KCC (kcc_c2e 9.4.3, kindlegen)├── domain/                    # Camada de Domínio

├── src/│   ├── entities/              # Entidades do domínio

│   ├── api/                        # Camada HTTP│   │   ├── manga.ts           # Manga, Chapter, Page, ChapterContent

│   │   ├── config/                 # Swagger / OpenAPI config│   │   └── download.ts        # Download, DownloadProgress

│   │   ├── controllers/            # Controllers (manga, download, kcc, library)│   ├── interfaces/            # Contratos/Interfaces

│   │   ├── middleware/             # Error handling, async handler│   │   ├── manga-connector.interface.ts

│   │   ├── routes/                 # Definição de rotas + JSDoc Swagger│   │   └── download-repository.interface.ts

│   │   └── types/                  # Tipos de resposta padronizados (ApiResponse)│   └── value-objects/         # Value Objects

│   ├── application/                # Camada de aplicação (use cases)│       ├── manga-url.ts

│   │   └── features/│       └── chapter-url.ts

│   │       ├── download/           # Serviço de download de mangás│

│   │       ├── kcc/                # Serviço de conversão KCC├── application/               # Camada de Aplicação

│   │       │   ├── dto/            # KccOptionsDto (validação Zod)│   └── features/              # Casos de uso (Vertical Slices)

│   │       │   └── helpers/        # naming, command-builder, folder-organizer│       ├── manga/

│   │       ├── library/            # Serviço de biblioteca local│       │   ├── get-manga-info.ts

│   │       └── manga/              # Serviço de busca/info de mangás│       │   └── get-chapter-pages.ts

│   ├── domain/                     # Entidades, interfaces, value objects│       └── download/

│   │   ├── entities/               # Manga, Chapter, Page, Download│           ├── download-manga.ts

│   │   ├── interfaces/             # Contratos (MangaConnector, DownloadRepository)│           └── download-chapter.ts

│   │   └── value-objects/          # MangaUrl, ChapterUrl│

│   ├── infrastructure/             # Implementações concretas├── infrastructure/            # Camada de Infraestrutura

│   │   ├── connectors/             # MangaLivre, MangaDex, ConnectorRegistry│   ├── connectors/            # Conectores de sites

│   │   ├── http/                   # HTTP client com retry│   │   ├── base-connector.ts  # Classe base abstrata

│   │   ├── rate-limiter/           # Rate limiter (Bottleneck) por conector│   │   ├── mangalivre-connector.ts

│   │   ├── redis/                  # Conexão ioredis│   │   └── connector-registry.ts

│   │   ├── repositories/           # Download repository (in-memory)│   ├── http/                  # Cliente HTTP

│   │   └── utils/                  # Image converter (Sharp)│   │   └── http-client.ts

│   └── scripts/                    # Scripts auxiliares (BullMQ dashboard)│   ├── rate-limiter/          # Controle de requisições

├── tests/│   │   └── rate-limiter.ts

│   ├── unit/                       # Testes unitários (connectors, repos, utils)│   └── repositories/          # Repositórios

│   └── e2e/                        # Testes de integração (endpoints HTTP)│       └── download-repository.ts

├── downloads/                      # Mangás baixados (criada automaticamente)│

├── converted/                      # E-books convertidos (criada automaticamente)├── api/                       # Camada de API

├── docker-compose.yml              # Redis 7 Alpine│   ├── config/

├── tsconfig.json│   │   └── swagger.ts         # Configuração OpenAPI

└── vitest.config.ts│   ├── controllers/           # Controllers

```│   │   ├── manga.controller.ts

│   │   ├── download.controller.ts

---│   │   └── system.controller.ts

│   ├── middleware/            # Middlewares

## 🚀 Quick Start│   │   └── error-handler.ts

│   ├── routes/                # Rotas

### Pré-requisitos│   │   └── api.routes.ts

│   └── app.ts                 # Configuração Express

| Requisito | Versão |│

|---|---|├── index.ts                   # Entry point da API

| **Node.js** | ≥ 18 |└── cli.ts                     # Interface de linha de comando

| **npm** | ≥ 9 |```

| **Docker** + **Docker Compose** | Qualquer versão recente |

## 🚀 Instalação

### 1. Clone o repositório

```bash

```bash# Instalar dependências

git clone <repo-url>npm install

cd mangalivre/backend

```# Modo desenvolvimento (com hot reload)

npm run dev

### 2. Instale as dependências

# Build para produção

```bashnpm run build

npm install

```# Executar build

npm start

### 3. Suba o Redis```



O Redis é necessário para a fila de conversão KCC (BullMQ).## 📖 Uso



```bash### API HTTP

docker-compose up -d

``````bash

# Iniciar servidor

Isso inicia um container `redis:7-alpine` na porta **6379** com persistência de dados.npm run dev



Para verificar se está rodando:# Servidor disponível em http://localhost:3000

# Documentação Swagger em http://localhost:3000/docs

```bash```

docker-compose ps

```### CLI



> 💡 O servidor inicia **mesmo sem Redis** — as rotas de mangá, download e biblioteca funcionam normalmente. Apenas as funcionalidades de conversão KCC ficam desabilitadas.```bash

# Ver ajuda

### 4. Inicie o servidor em modo desenvolvimentonpm run cli -- --help



```bash# Listar conectores disponíveis

npm run devnpm run cli -- --connectors

```

# Ver informações do mangá

Ou com **hot-reload** automático (reinicia ao salvar qualquer arquivo):npm run cli -- https://mangalivre.to/manga/sakamoto-days/ --info



```bash# Baixar todos os capítulos

npm run dev:watchnpm run cli -- https://mangalivre.to/manga/sakamoto-days/

```

# Baixar capítulos específicos (1 a 10)

O servidor inicia na porta **3000** por padrão:npm run cli -- https://mangalivre.to/manga/sakamoto-days/ --start 1 --end 10



```# Especificar diretório de saída

╔══════════════════════════════════════════╗npm run cli -- https://mangalivre.to/manga/sakamoto-days/ -o ./meus-mangas

║        MangaKindle API v2.0.0            ║```

╠══════════════════════════════════════════╣

║  🚀 Servidor:     http://localhost:3000  ║## 🔌 Endpoints da API

║  📚 Documentação:  http://localhost:3000/docs  ║

╚══════════════════════════════════════════╝### Conectores

```

| Método | Endpoint | Descrição |

### 5. Acesse o Swagger|--------|----------|-----------|

| GET | `/api/connectors` | Lista conectores disponíveis |

Abra no navegador:| GET | `/api/connectors/health` | Health check de todos conectores |

| PUT | `/api/connectors/:name/language` | Define idioma do conector (MangaDex) |

```

http://localhost:3000/docs### Manga

```

| Método | Endpoint | Descrição |

Lá você encontra todos os endpoints documentados com exemplos interativos.|--------|----------|-----------|

| GET | `/api/manga/info?url=<url>` | Informações do mangá |

---| GET | `/api/manga/chapter/pages?url=<url>` | Páginas de um capítulo |



## 📋 Scripts Disponíveis### Downloads



| Script | Comando | Descrição || Método | Endpoint | Descrição |

|---|---|---||--------|----------|-----------|

| **dev** | `npm run dev` | Inicia servidor com tsx (sem build, rápido) || POST | `/api/downloads` | Inicia download de mangá |

| **dev:watch** | `npm run dev:watch` | Dev com hot-reload automático || POST | `/api/downloads/chapter` | Baixa um capítulo |

| **build** | `npm run build` | Compila TypeScript para `dist/` || GET | `/api/downloads` | Lista todos os downloads |

| **start** | `npm start` | Inicia a versão compilada (produção) || GET | `/api/downloads/:id` | Status de um download |

| **test** | `npm test` | Roda todos os 41 testes || DELETE | `/api/downloads/:id` | Cancela um download |

| **test:watch** | `npm run test:watch` | Testes com watch mode |

| **test:ui** | `npm run test:ui` | Dashboard visual do Vitest no browser |### Sistema

| **test:coverage** | `npm run test:coverage` | Relatório de cobertura de código |

| **cli** | `npm run cli` | Interface de linha de comando || Método | Endpoint | Descrição |

| **clean** | `npm run clean` | Limpa a pasta `dist/` ||--------|----------|-----------|

| **lint** | `npm run lint` | Linting com ESLint || GET | `/` | Informações da API |

| **bullmq:dashboard** | `npm run bullmq:dashboard` | Dashboard web de jobs (porta 3001) || GET | `/api/system/stats` | Estatísticas do sistema |

| **bullmq:install** | `npm run bullmq:install` | Instala dependências do dashboard || GET | `/docs` | Documentação Swagger |



---## 📝 Exemplos de Requisições



## 🔌 API – Endpoints### Obter informações do mangá



> Documentação interativa completa: `http://localhost:3000/docs````bash

curl "http://localhost:3000/api/manga/info?url=https://mangalivre.to/manga/sakamoto-days/"

### Mangá & Download```



| Método | Rota | Descrição |### Obter páginas de um capítulo

|---|---|---|

| `GET` | `/api/connectors` | Lista conectores disponíveis |```bash

| `GET` | `/api/connectors/health` | Health check dos conectores |curl "http://localhost:3000/api/manga/chapter/pages?url=https://mangalivre.to/manga/sakamoto-days/capitulo-1/"

| `PUT` | `/api/connectors/:name/language` | Define idioma de um conector |```

| `GET` | `/api/manga/info?url=` | Informações de um mangá |

| `GET` | `/api/manga/chapter/pages?url=` | Páginas de um capítulo |### Iniciar download de mangá

| `POST` | `/api/downloads` | Inicia download de mangá completo |

| `POST` | `/api/downloads/chapter` | Baixa um capítulo específico |```bash

| `GET` | `/api/downloads` | Lista todos os downloads |curl -X POST http://localhost:3000/api/downloads \

| `GET` | `/api/downloads/:id` | Status de um download |  -H "Content-Type: application/json" \

| `DELETE` | `/api/downloads/:id` | Cancela um download |  -d '{

    "url": "https://mangalivre.to/manga/sakamoto-days/",

### Biblioteca Local    "startChapter": 1,

    "endChapter": 5

| Método | Rota | Descrição |  }'

|---|---|---|```

| `GET` | `/api/library/stats` | Estatísticas da biblioteca |

| `GET` | `/api/library/mangas` | Lista mangás com filtros e paginação |### Verificar status do download

| `GET` | `/api/library/mangas/:slug` | Detalhes de um mangá |

| `PATCH` | `/api/library/mangas/:slug` | Atualiza metadados |```bash

| `DELETE` | `/api/library/mangas/:slug` | Deleta mangá e todos os capítulos |curl "http://localhost:3000/api/downloads/<download-id>"

| `GET` | `/api/library/mangas/:slug/chapters/:chapter` | Detalhes do capítulo |```

| `DELETE` | `/api/library/mangas/:slug/chapters/:chapter` | Deleta capítulo |

| `GET` | `/api/library/mangas/:slug/chapters/:chapter/pages` | Lista páginas (paginado) |### Verificar saúde dos conectores

| `GET` | `/api/library/mangas/:slug/chapters/:chapter/pages/:page` | Serve imagem da página |

```bash

#### Query params — `GET /api/library/mangas`curl "http://localhost:3000/api/connectors/health"

```

| Param | Tipo | Default | Descrição |

|---|---|---|---|Resposta:

| `page` | integer | `1` | Página atual |```json

| `limit` | integer | `20` | Itens por página (max 100) |{

| `search` | string | — | Busca por título (parcial, case-insensitive) |  "timestamp": "2026-03-01T19:50:40.688Z",

| `sortBy` | string | `title` | `title` · `chapterCount` · `lastDownloaded` · `totalSize` |  "status": "healthy",

| `order` | string | `asc` | `asc` ou `desc` |  "totalConnectors": 2,

| `status` | string | — | `ongoing` · `completed` · `hiatus` · `unknown` |  "healthyConnectors": 2,

| `language` | string | — | Código do idioma (ex: `pt-br`) |  "connectors": [

| `hasConverted` | boolean | — | Filtra por status de conversão |    {

      "name": "mangalivre",

### KCC – Conversão      "displayName": "Manga Livre",

      "status": "healthy",

| Método | Rota | Descrição |      "endpoints": {

|---|---|---|        "getMangaInfo": {

| `GET` | `/api/kcc/profiles` | Lista perfis de dispositivo (40+) |          "status": "healthy",

| `GET` | `/api/kcc/options` | Documentação de todas as opções KCC |          "responseTime": 979

| `POST` | `/api/kcc/convert` | Cria job de conversão (capítulos) |        },

| `POST` | `/api/kcc/convert/manga` | Converte mangá inteiro (com volumes) |        "getChapterPages": {

| `GET` | `/api/kcc/jobs` | Lista jobs de conversão |          "status": "healthy",

| `GET` | `/api/kcc/jobs/:id` | Detalhes de um job |          "responseTime": 335

| `GET` | `/api/kcc/jobs/:id/progress` | Progresso em tempo real |        }

| `POST` | `/api/kcc/jobs/:id/cancel` | Cancela um job |      }

| `DELETE` | `/api/kcc/jobs/:id` | Remove job do histórico |    }

| `GET` | `/api/kcc/converted` | Lista arquivos convertidos |  ]

| `GET` | `/api/kcc/converted/:name` | Detalhes do arquivo convertido |}

| `GET` | `/api/kcc/converted/:name/download` | Download do e-book |```



### SistemaVer documentação completa em [`docs/HEALTH_CHECK.md`](docs/HEALTH_CHECK.md).



| Método | Rota | Descrição |## 🧪 Testes

|---|---|---|

| `GET` | `/api/system/stats` | Estatísticas do sistema |O projeto possui uma suite completa de testes com **Vitest**:



---```bash

# Executar todos os testes

## 🎛️ KCC – Conversão para E-Readersnpm test



### Formatos de saída# Executar em modo watch

npm run test:watch

| Formato | Extensão | Dispositivos |

|---|---|---|# Ver UI interativa

| **EPUB** | `.epub` | Kindle (Send-to-Kindle), Kobo, genéricos |npm run test:ui

| **MOBI** | `.mobi` | Kindle (legado) |

| **CBZ** | `.cbz` | Qualquer leitor de quadrinhos |# Gerar relatório de cobertura

| **KFX** | `.kfx` | Kindle (formato nativo) |npm run test:coverage

```

### Perfis de dispositivo (exemplos)

### Status dos Testes

| Perfil | Resolução | Dispositivo |

|---|---|---|```

| `K1` | 600×800 | Kindle 1ª Geração |✅ 41 testes passando (100%)

| `KPW5` | 1236×1648 | Kindle Paperwhite 5 (2021) |📊 4 arquivos de teste

| `KS` | 1860×2480 | Kindle Scribe |🎯 Cobertura: Excelente

| `KO` | 1264×1680 | Kobo Libra / Clara HD |```

| `RM2` | 1404×1872 | reMarkable 2 |

**Tipos de testes:**

> Use `GET /api/kcc/profiles` para ver todos os 40+ perfis com resoluções e formatos suportados.- ✅ Unit Tests: Image Converter, Repository, Connector Registry

- ✅ E2E Tests: Todos os endpoints da API

### Opções de conversão- ✅ Health Check Tests: Validação de conectores



Todas as opções equivalem às disponíveis na GUI do KCC:Ver documentação completa em [`TESTING.md`](TESTING.md).



| Opção | Tipo | Default | CLI Flag | Descrição |## ⚙️ Rate Limiting

|---|---|---|---|---|

| `mangaStyle` | boolean | `false` | `-m, --manga-style` | Modo mangá (direita → esquerda) |A API implementa controle automático de requisições para evitar bloqueios:

| `hq` | boolean | `false` | `--hq` | Alta qualidade (4-bit/pixel) |

| `webtoonMode` | boolean | `false` | `--webtoon` | Modo webtoon (scroll vertical) |- **Fila de requisições**: Requisições são enfileiradas e processadas sequencialmente

| `noSplitDoubleSpreads` | boolean | `false` | `--nosplitrotate` | Manter páginas duplas intactas |- **Delay entre requisições**: Mínimo de 1 segundo entre requisições

| `rotate` | boolean | `false` | `--rotate` | Auto-rotacionar imagens largas |- **Concorrência limitada**: Máximo de 2 requisições simultâneas por conector

| `upscale` | boolean | `false` | `--upscale` | Ampliar imagens pequenas |- **Retry automático**: Retentativas com backoff exponencial em caso de erro

| `stretch` | boolean | `false` | `--stretch` | Esticar para preencher tela |- **Proteção contra 429**: Aumenta delay automaticamente quando detecta rate limit

| `gamma` | number | — | `--gamma` | Correção gama (0.1–5.0) |

| `cropping` | number | `2` | `--cropping` | Auto-crop margens (0=desligado, 1=suave, 2=agressivo) |Configurações por conector em `src/infrastructure/rate-limiter/rate-limiter.ts`:

| `quality` | number | — | `--quality` | Qualidade JPEG (0–100) |

| `forceColor` | boolean | `false` | `--forcecolor` | Forçar modo colorido |```typescript

| `forcePng` | boolean | `false` | `--forcepng` | Forçar saída PNG |export const DEFAULT_RATE_LIMITS = {

| `mozJpeg` | boolean | `false` | `--mozjpeg` | Usar mozJPEG encoder |  mangalivre: {

| `maximizeStrips` | boolean | `false` | `--maximizestrips` | Strips 1×4 → 2×2 |    maxConcurrent: 2,

| `batchSplit` | number | — | `--batchsplit` | Dividir saída em N partes |    minTime: 1000,          // 1 segundo entre requisições

| `noProcessing` | boolean | `false` | `--noprocessing` | Desabilitar todo processamento |    maxQueued: 100,

| `splitter` | boolean | `false` | `--splitter` | Dividir páginas duplas automaticamente |    errorPenalty: 5000,     // 5 segundos de penalidade por erro

| `twoPanel` | boolean | `false` | `--twopanel` | Modo dois painéis |    maxRetries: 3

  }

> Use `GET /api/kcc/options` para ver a documentação completa com exemplos para cada opção.};

```

### Presets

## 🔧 Adicionando Novos Conectores

Presets pré-configurados para os casos mais comuns:

Para adicionar suporte a um novo site de mangá:

```jsonc

// POST /api/kcc/convert1. Crie um novo conector em `src/infrastructure/connectors/`:

{

  "chapters": ["one-piece/one-piece_cap_001"],```typescript

  "outputFormat": "EPUB",// src/infrastructure/connectors/novo-site-connector.ts

  "profile": "KPW5",import { BaseMangaConnector } from './base-connector.js';

  "preset": "manga"        // ← aplica flags automaticamenteimport type { Manga, ChapterContent } from '../../domain/entities/index.js';

}

```export class NovoSiteConnector extends BaseMangaConnector {

  readonly name = 'novosite';

| Preset | Flags aplicadas |  readonly displayName = 'Novo Site';

|---|---|  readonly baseUrl = 'https://novosite.com';

| `manga` | `mangaStyle: true`, `hq: true`, `cropping: 2` |  readonly urlPattern = /novosite\.com\/manga\//;

| `webtoon` | `webtoonMode: true`, `noSplitDoubleSpreads: true` |

| `highQuality` | `hq: true`, `upscale: true`, `quality: 90` |  constructor() {

| `noProcessing` | `noProcessing: true` |    super();

    this.initHttpClient();

### Conversão de mangá inteiro  }



```jsonc  async getMangaInfo(mangaUrl: string): Promise<Manga> {

// POST /api/kcc/convert/manga    // Implementar scraping

{  }

  "mangaSlug": "one-piece",

  "outputFormat": "EPUB",  async getChapterPages(chapterUrl: string): Promise<ChapterContent> {

  "profile": "KPW5",    // Implementar scraping

  "mergeIntoVolumes": true,     // agrupa capítulos em volumes  }

  "chaptersPerVolume": 10,      // 10 capítulos por volume}

  "preset": "manga"```

}

```2. Registre o conector em `src/infrastructure/connectors/connector-registry.ts`:



---```typescript

import { NovoSiteConnector } from './novo-site-connector.js';

## 📥 Fluxo de Download e Conversão

// No construtor:

```this.register(new NovoSiteConnector());

                  POST /api/downloads```

                         │

                         ▼3. Adicione configuração de rate limit em `src/infrastructure/rate-limiter/rate-limiter.ts`:

              ┌──────────────────┐

              │  Connector       │  (MangaLivre / MangaDex)```typescript

              │  + Rate Limiter  │export const DEFAULT_RATE_LIMITS = {

              └────────┬─────────┘  // ...

                       │  novosite: {

                       ▼    maxConcurrent: 1,

      downloads/<manga>/<manga>_cap_<num>/    minTime: 2000,

            001.jpg, 002.jpg, ...    maxQueued: 50,

                       │    errorPenalty: 10000,

                       ▼  (opcional)    maxRetries: 3

              ┌──────────────────┐  }

              │  KCC Conversion  │  (BullMQ → Redis)};

              │  kcc_c2e 9.4.3   │```

              └────────┬─────────┘

                       │## 📁 Estrutura dos Downloads

                       ▼

      converted/<manga>/<manga>_cap_<num>.epub```

```downloads/

└── Sakamoto Days/

### Estrutura de pastas    ├── info.json              # Metadados do mangá

    ├── Capitulo_0001/

```    │   ├── 001.webp

downloads/    │   ├── 002.webp

├── one-piece/    │   └── ...

│   ├── one-piece_cap_001/    ├── Capitulo_0002/

│   │   ├── 001.jpg    │   └── ...

│   │   ├── 002.jpg    └── ...

│   │   └── ...```

│   ├── one-piece_cap_002/

│   └── ...## 🛠️ Tecnologias

└── vagabond/

    ├── vagabond_cap_001/- **TypeScript** - Linguagem principal

    └── ...- **Express** - Framework web

- **Swagger/OpenAPI** - Documentação

converted/- **Axios** - Cliente HTTP

├── one-piece/- **Cheerio** - Parser HTML

│   ├── one-piece_cap_001.epub- **Bottleneck** - Rate limiting

│   ├── one-piece_cap_002.epub- **Zod** - Validação de schemas

│   └── ...

└── vagabond/## 📄 Licença

    └── vagabond_cap_001.epub

```MIT



---## ⚠️ Aviso Legal



## 🧪 TestesEsta ferramenta é fornecida apenas para fins educacionais. Respeite os termos de uso dos sites e os direitos autorais dos criadores dos mangás.


O projeto usa **Vitest** com **41 testes** (unitários + e2e):

```bash
# Rodar todos os testes
npm test

# Com watch mode (re-executa ao salvar)
npm run test:watch

# Com UI interativa no browser
npm run test:ui

# Com relatório de cobertura
npm run test:coverage
```

### Estrutura de testes

```
tests/
├── unit/
│   ├── connectors/         # Testes do ConnectorRegistry
│   ├── repositories/       # Testes do DownloadRepository
│   └── utils/              # Testes do ImageConverter (Sharp)
└── e2e/
    └── api/                # Testes de integração dos endpoints
```

---

## 🐳 Docker & Redis

O Redis é utilizado pelo BullMQ para gerenciar a fila de jobs de conversão KCC.

```bash
# Subir Redis
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs do Redis
docker-compose logs -f redis

# Parar
docker-compose down

# Parar e limpar dados persistidos
docker-compose down -v
```

---

## 📊 BullMQ Dashboard

Para monitorar os jobs de conversão visualmente:

```bash
# Instalar dependências do dashboard (uma única vez)
npm run bullmq:install

# Iniciar o dashboard
npm run bullmq:dashboard
```

Acesse: **http://localhost:3001**

Funcionalidades:
- Ver jobs por status: waiting, active, completed, failed
- Retry de jobs com falha
- Limpar jobs antigos
- Ver detalhes e progresso de cada job

---

## 🔧 Produção

```bash
# 1. Compilar TypeScript
npm run build

# 2. Iniciar servidor (usa dist/)
npm start
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Default | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor HTTP |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `BULLBOARD_PORT` | `3001` | Porta do dashboard BullMQ |
| `NODE_ENV` | — | `development` / `production` |

---

## 🔌 Adicionando um Novo Conector

1. Crie um arquivo em `src/infrastructure/connectors/` estendendo `BaseConnector`
2. Implemente os métodos: `searchManga()`, `getMangaInfo()`, `getChapterPages()`
3. Registre no `ConnectorRegistry` em `connector-registry.ts`
4. O conector estará automaticamente disponível em `GET /api/connectors`

---

## 📄 Resposta Padronizada da API

Todas as respostas seguem o formato consistente:

**Sucesso:**

```json
{
  "data": { "..." },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "error": null
}
```

**Erro:**

```json
{
  "data": null,
  "error": {
    "message": "Manga not found",
    "code": "NOT_FOUND"
  }
}
```

---

## 📦 Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| **TypeScript** | ^5.3 | Linguagem principal |
| **Express** | ^4.18 | Framework HTTP |
| **Zod** | ^3.22 | Validação de schemas e DTOs |
| **BullMQ** | ^5.70 | Fila de jobs de conversão |
| **ioredis** | ^5.10 | Cliente Redis |
| **Sharp** | ^0.34 | Processamento de imagens |
| **Axios** | ^1.6 | HTTP client |
| **Cheerio** | ^1.0 | Web scraping (HTML parsing) |
| **Bottleneck** | ^2.19 | Rate limiting |
| **swagger-jsdoc** | ^6.2 | Geração da documentação OpenAPI |
| **swagger-ui-express** | ^5.0 | UI do Swagger em `/docs` |
| **Vitest** | ^4.0 | Framework de testes |
| **KCC** | 9.4.3 | Kindle Comic Converter (binário) |

---

## 📄 Licença

MIT

## ⚠️ Aviso Legal

Esta ferramenta é fornecida apenas para fins educacionais. Respeite os termos de uso dos sites e os direitos autorais dos criadores dos mangás.
