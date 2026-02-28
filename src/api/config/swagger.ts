/**
 * Configuração do Swagger/OpenAPI
 */
export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Manga Downloader API',
    version: '2.0.0',
    description: `
API para download de mangás com suporte a múltiplos sites.

## Características

- **Multi-source**: Suporte a múltiplos sites de mangá através de conectores
- **Rate Limiting**: Controle automático de requisições para evitar bloqueios
- **Downloads assíncronos**: Downloads em background com acompanhamento de status
- **Arquitetura modular**: Fácil adição de novos conectores

## Conectores Disponíveis

- **MangaLivre** (mangalivre.to) - Mangás em português

## Rate Limiting

A API implementa controle de taxa de requisições por conector para evitar bloqueios.
Cada conector tem configurações específicas de delay e concorrência.
    `,
    contact: {
      name: 'API Support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento'
    }
  ],
  tags: [
    {
      name: 'Manga',
      description: 'Operações relacionadas a informações de mangás'
    },
    {
      name: 'Download',
      description: 'Operações de download de capítulos e mangás'
    },
    {
      name: 'Connectors',
      description: 'Informações sobre conectores disponíveis'
    },
    {
      name: 'System',
      description: 'Informações do sistema e health check'
    }
  ],
  components: {
    schemas: {
      Chapter: {
        type: 'object',
        properties: {
          number: { type: 'string', example: '1' },
          url: { type: 'string', format: 'uri', example: 'https://mangalivre.to/manga/sakamoto-days/capitulo-1/' },
          title: { type: 'string', example: 'Capítulo 1' },
          publishedAt: { type: 'string', example: '2024-01-15' }
        },
        required: ['number', 'url']
      },
      Manga: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Sakamoto Days' },
          slug: { type: 'string', example: 'sakamoto-days' },
          url: { type: 'string', format: 'uri' },
          source: { type: 'string', example: 'mangalivre' },
          author: { type: 'string', example: 'Suzuki Yuuto' },
          artist: { type: 'string', example: 'Suzuki Yuuto' },
          genres: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['Ação', 'Comédia', 'Shounen']
          },
          status: { 
            type: 'string', 
            enum: ['ongoing', 'completed', 'hiatus', 'unknown'],
            example: 'ongoing'
          },
          description: { type: 'string' },
          totalChapters: { type: 'integer', example: 173 },
          chapters: {
            type: 'array',
            items: { '$ref': '#/components/schemas/Chapter' }
          }
        },
        required: ['title', 'slug', 'url', 'source', 'totalChapters', 'chapters']
      },
      Page: {
        type: 'object',
        properties: {
          number: { type: 'integer', example: 1 },
          url: { type: 'string', format: 'uri' }
        },
        required: ['number', 'url']
      },
      ChapterContent: {
        type: 'object',
        properties: {
          mangaSlug: { type: 'string', example: 'sakamoto-days' },
          chapterNumber: { type: 'string', example: '1' },
          url: { type: 'string', format: 'uri' },
          totalPages: { type: 'integer', example: 53 },
          pages: {
            type: 'array',
            items: { '$ref': '#/components/schemas/Page' }
          }
        },
        required: ['mangaSlug', 'chapterNumber', 'url', 'totalPages', 'pages']
      },
      DownloadProgress: {
        type: 'object',
        properties: {
          chaptersCompleted: { type: 'integer', example: 3 },
          totalChapters: { type: 'integer', example: 10 },
          currentChapter: { type: 'string', nullable: true, example: '4' },
          currentChapterImages: { type: 'integer', example: 15 },
          totalChapterImages: { type: 'integer', example: 50 },
          percentage: { type: 'integer', example: 30 }
        }
      },
      Download: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'm1234abc' },
          mangaUrl: { type: 'string', format: 'uri' },
          mangaTitle: { type: 'string', example: 'Sakamoto Days' },
          source: { type: 'string', example: 'mangalivre' },
          status: { 
            type: 'string', 
            enum: ['pending', 'downloading', 'completed', 'failed', 'cancelled'],
            example: 'downloading'
          },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          progress: { '$ref': '#/components/schemas/DownloadProgress' },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chapter: { type: 'string' },
                imagesDownloaded: { type: 'integer' },
                directory: { type: 'string' }
              }
            }
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chapter: { type: 'string' },
                error: { type: 'string' }
              }
            }
          },
          outputDirectory: { type: 'string' }
        }
      },
      Connector: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'mangalivre' },
          displayName: { type: 'string', example: 'Manga Livre' },
          baseUrl: { type: 'string', format: 'uri', example: 'https://mangalivre.to' }
        },
        required: ['name', 'displayName', 'baseUrl']
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Erro de validação' },
          message: { type: 'string', example: 'URL inválida' },
          details: { type: 'object' }
        },
        required: ['error', 'message']
      },
      RateLimiterStats: {
        type: 'object',
        properties: {
          running: { type: 'integer', description: 'Requisições em execução' },
          queued: { type: 'integer', description: 'Requisições na fila' },
          errorCount: { type: 'integer', description: 'Total de erros' },
          lastErrorTime: { type: 'integer', description: 'Timestamp do último erro' }
        }
      }
    }
  }
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts']
};
