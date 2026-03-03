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
      name: 'Library',
      description: 'Gerenciamento da biblioteca local de mangás baixados'
    },
    {
      name: 'KCC',
      description: 'Kindle Comic Converter - Conversão de mangás para e-readers'
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
      },
      // ========================================
      // KCC Schemas
      // ========================================
      KccProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'KPW5' },
          name: { type: 'string', example: 'Kindle Paperwhite 5' },
          resolution: { type: 'string', example: '1236x1648' },
          device: { type: 'string', example: 'Kindle Paperwhite 5th Gen (2021)' },
          supportedFormats: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['EPUB', 'MOBI', 'KFX']
          }
        },
        required: ['id', 'name', 'resolution', 'device', 'supportedFormats']
      },
      KccOptionDoc: {
        type: 'object',
        properties: {
          description: { type: 'string', example: 'Use manga reading mode (right-to-left)' },
          type: { type: 'string', enum: ['boolean', 'number', 'string'], example: 'boolean' },
          default: { oneOf: [{ type: 'boolean' }, { type: 'number' }, { type: 'string' }] },
          cliFlag: { type: 'string', example: '-m, --manga-style' },
          example: { oneOf: [{ type: 'boolean' }, { type: 'number' }, { type: 'string' }] }
        },
        required: ['description', 'type', 'cliFlag']
      },
      ConversionOptions: {
        type: 'object',
        description: 'KCC conversion options (all optional)',
        properties: {
          mangaStyle: { type: 'boolean', description: 'Manga reading mode (RTL)', default: false },
          hq: { type: 'boolean', description: 'High quality mode', default: false },
          webtoonMode: { type: 'boolean', description: 'Webtoon/vertical scroll mode', default: false },
          noSplitDoubleSpreads: { type: 'boolean', description: 'Keep double-page spreads intact', default: false },
          rotate: { type: 'boolean', description: 'Auto-rotate wide images', default: false },
          upscale: { type: 'boolean', description: 'Upscale small images', default: false },
          stretch: { type: 'boolean', description: 'Stretch images to fill screen', default: false },
          gamma: { type: 'number', description: 'Gamma correction (0.1-5.0)', minimum: 0.1, maximum: 5.0 },
          cropping: { type: 'number', description: 'Auto-crop margins (0-2)', minimum: 0, maximum: 2, default: 2 },
          quality: { type: 'number', description: 'Image quality (0-100)', minimum: 0, maximum: 100 }
        }
      },
      ConversionRequest: {
        type: 'object',
        required: ['chapters', 'outputFormat', 'profile'],
        properties: {
          chapters: {
            type: 'array',
            items: { type: 'string' },
            description: 'Chapter paths relative to downloads folder',
            example: ['vagabond/Capitulo_0001', 'vagabond/Capitulo_0002']
          },
          mergeIntoSingleVolume: { 
            type: 'boolean', 
            default: false,
            description: 'Merge all chapters into single output file'
          },
          outputFormat: { 
            type: 'string', 
            enum: ['EPUB', 'MOBI', 'CBZ', 'KFX'],
            example: 'EPUB'
          },
          profile: { 
            type: 'string', 
            example: 'KPW5',
            description: 'Target device profile'
          },
          options: { '$ref': '#/components/schemas/ConversionOptions' }
        }
      },
      MangaConversionRequest: {
        type: 'object',
        required: ['mangaSlug', 'outputFormat', 'profile'],
        properties: {
          mangaSlug: {
            type: 'string',
            description: 'The manga slug/identifier',
            example: 'one-piece'
          },
          mergeIntoVolumes: {
            type: 'boolean',
            default: false,
            description: 'Group chapters into volumes'
          },
          chaptersPerVolume: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
            description: 'Chapters per volume when mergeIntoVolumes is true'
          },
          singleVolume: {
            type: 'boolean',
            default: false,
            description: 'Merge ALL chapters into one file'
          },
          outputFormat: { 
            type: 'string', 
            enum: ['EPUB', 'MOBI', 'CBZ', 'KFX'],
            example: 'EPUB'
          },
          profile: { 
            type: 'string', 
            example: 'KPW5',
            description: 'Target device profile'
          },
          options: { '$ref': '#/components/schemas/ConversionOptions' }
        }
      },
      KccJob: {
        type: 'object',
        properties: {
          jobId: { type: 'string', example: 'kcc-job-abc123' },
          status: { 
            type: 'string', 
            enum: ['waiting', 'active', 'completed', 'failed', 'cancelled'],
            example: 'waiting'
          },
          progress: { type: 'number', minimum: 0, maximum: 100, example: 0 },
          chapters: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['vagabond/Capitulo_0001']
          },
          outputFormat: { type: 'string', example: 'EPUB' },
          profile: { type: 'string', example: 'KPW5' },
          outputFile: { type: 'string', nullable: true, example: 'vagabond-Capitulo_0001.epub' },
          createdAt: { type: 'string', format: 'date-time' },
          startedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          error: { type: 'string', nullable: true }
        },
        required: ['jobId', 'status', 'chapters', 'outputFormat', 'profile']
      },
      KccJobDetails: {
        allOf: [
          { '$ref': '#/components/schemas/KccJob' },
          {
            type: 'object',
            properties: {
              options: { '$ref': '#/components/schemas/ConversionOptions' },
              volumeName: { type: 'string', nullable: true },
              logs: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Conversion log messages'
              }
            }
          }
        ]
      },
      ConvertedFile: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'vagabond-Capitulo_0001.epub' },
          format: { type: 'string', enum: ['EPUB', 'MOBI', 'CBZ', 'KFX'], example: 'EPUB' },
          size: { type: 'string', example: '15.2 MB' },
          sizeBytes: { type: 'integer', example: 15938560 },
          profile: { type: 'string', example: 'KPW5' },
          createdAt: { type: 'string', format: 'date-time' },
          manga: { type: 'string', example: 'vagabond' }
        },
        required: ['name', 'format', 'size', 'sizeBytes', 'createdAt']
      },
      ConvertedFileDetails: {
        allOf: [
          { '$ref': '#/components/schemas/ConvertedFile' },
          {
            type: 'object',
            properties: {
              chapters: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['Capitulo_0001', 'Capitulo_0002']
              },
              path: { type: 'string', example: '/converted/vagabond-Capitulo_0001.epub' }
            }
          }
        ]
      },
      // ========================================
      // Library Schemas
      // ========================================
      LibraryManga: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'vagabond' },
          title: { type: 'string', example: 'Vagabond' },
          chapterCount: { type: 'integer', example: 327 },
          totalPages: { type: 'integer', example: 6540 },
          hasConverted: { type: 'boolean', example: true },
          language: { type: 'string', example: 'pt-br' },
          status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus', 'unknown'] },
          lastDownloaded: { type: 'string', format: 'date-time' }
        },
        required: ['slug', 'title', 'chapterCount']
      },
      LibraryChapter: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Capitulo_0001' },
          path: { type: 'string', example: 'downloads/vagabond/Capitulo_0001' },
          pageCount: { type: 'integer', example: 53 },
          converted: { type: 'boolean', example: false },
          convertedFile: { type: 'string', nullable: true },
          downloadedAt: { type: 'string', format: 'date-time' }
        },
        required: ['name', 'path', 'pageCount']
      },
      // ========================================
      // Standard API Response Schemas
      // ========================================
      ErrorResponse: {
        type: 'object',
        properties: {
          data: { type: 'null' },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Resource not found' },
              code: { type: 'string', example: 'NOT_FOUND' },
              details: { type: 'object' }
            },
            required: ['message']
          }
        },
        required: ['data', 'error']
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasMore: { type: 'boolean', example: true }
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasMore']
      }
    }
  }
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts']
};
