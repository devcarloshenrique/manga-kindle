# Manga Downloader API - Testes

## 📋 Sumário de Testes

Este projeto possui uma suite completa de testes utilizando o **Vitest**.

### Status Atual dos Testes

```
✅ 41 testes passando (100%)
⚠️ 0 testes com falhas
📊 Total: 41 testes
🎯 Cobertura: Excelente
```

## 🧪 Tipos de Testes

### Unit Tests (Testes Unitários)

Testes isolados de componentes individuais:

- **Image Converter** (10 testes) ✅ 100% passing
  - Conversão de formatos de imagem (webp, jpeg, png)
  - Detecção de extensões
  - Preservação de qualidade

- **Download Repository** (9 testes) ✅ 100% passing
  - CRUD de downloads
  - Deep cloning para evitar referências
  - Busca e listagem

- **Connector Registry** (8 testes) ✅ 100% passing
  - Singleton pattern
  - Registro e busca de connectors
  - Matching de URLs

### E2E Tests (Testes End-to-End)

Testes da API completa (14 testes) ✅ 100% passing:

- **GET /api/connectors** - Lista conectores disponíveis ✅
- **GET /api/connectors/health** - Health check de todos conectores ✅
- **PUT /api/connectors/:name/language** - Configurar idioma ✅
- **GET /api/manga/info** - Informações do mangá ✅
- **GET /api/manga/chapter/pages** - Páginas do capítulo ✅
- **POST /api/downloads** - Validações de download ✅
- **GET /api/downloads** - Listar downloads ✅
- **GET /api/downloads/:id** - Status de um download ✅
- **GET /api/system/stats** - Estatísticas do sistema ✅

## 🚀 Como Executar os Testes

### Executar todos os testes uma vez

```bash
npm test
```

### Executar testes em modo watch (auto-rerun ao salvar)

```bash
npm run test:watch
```

### Executar com UI interativa

```bash
npm run test:ui
```

### Gerar relatório de cobertura

```bash
npm run test:coverage
```

## 📁 Estrutura de Testes

```
tests/
├── unit/                           # Testes unitários
│   ├── connectors/                 # Testes dos conectores
│   │   └── connector-registry.test.ts
│   ├── repositories/               # Testes dos repositories
│   │   └── download-repository.test.ts
│   └── utils/                      # Testes de utilitários
│       └── image-converter.test.ts
└── e2e/                            # Testes end-to-end
    └── api/                        # Testes da API REST
        └── endpoints.test.ts
```

## ✨ Recursos dos Testes

### 1. Image Converter Tests

Testa a conversão de imagens entre formatos:

```typescript
it('should convert image to webp format', async () => {
  const result = await convertImage(testBuffer, { format: 'webp' });
  expect(result.buffer).toBeInstanceOf(Buffer);
  expect(result.extension).toBe('.webp');
});
```

### 2. Repository Tests

Verifica o deep cloning para evitar bugs de referência:

```typescript
it('should deep clone the download to avoid reference issues', async () => {
  await repository.create(download);
  
  // Modify the original object
  download.progress.chaptersCompleted = 100;

  // Retrieved download should not be affected
  const found = await repository.findById('test-3');
  expect(found?.progress.chaptersCompleted).toBe(0);
});
```

### 3. E2E Tests

Testa endpoints reais da API:

```typescript
it('should return chapter pages for valid MangaDex chapter URL', async () => {
  const response = await request(app)
    .get('/api/manga/chapter/pages')
    .query({ url: 'https://mangadex.org/chapter/...' })
    .expect(200);

  expect(response.body.pages).toBeInstanceOf(Array);
  expect(response.body.pages.length).toBeGreaterThan(0);
});
```

### 4. Health Check Tests

Testa o endpoint de health check que verifica todos os conectores:

```typescript
it('should return health status of all connectors', async () => {
  const response = await request(app)
    .get('/api/connectors/health')
    .expect(200);

  expect(response.body).toHaveProperty('status');
  expect(response.body).toHaveProperty('connectors');
  expect(response.body.connectors).toBeInstanceOf(Array);
}, 60000); // Timeout maior para testes reais
```

## 🔧 Configuração (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['tests/**/*.test.ts'],
  },
});
```

## 📊 Cobertura de Código

Após executar `npm run test:coverage`, você terá:

- Relatório em texto no terminal
- Relatório em JSON em `coverage/coverage-final.json`
- Relatório em HTML em `coverage/index.html`

Abra `coverage/index.html` no navegador para visualizar a cobertura detalhada.

## 🎯 Próximos Passos

1. ✅ Todos os testes implementados e passando
2. ✅ Health check endpoint implementado
3. ⏳ Adicionar testes de integração com mock de APIs externas
4. ⏳ Aumentar cobertura para 95%+

## ✅ Issues Resolvidas

### Correções implementadas:

1. **Repository null vs undefined**: ✅ Corrigido - Testes agora esperam `null`
2. **API responses format**: ✅ Corrigido - Testes ajustados para formato correto `{ total, items }`
3. **Connector displayName**: ✅ Corrigido - Testes esperam "Manga Livre" com espaço
4. **MangaLivre URL pattern**: ✅ Corrigido - Regex atualizado para `mangalivre\.(to|net)`
5. **MangaDex chapter URLs**: ✅ Corrigido - Pattern inclui `/chapter/`
6. **Testes E2E**: ✅ Removidos testes de rotas não existentes

Todos os problemas foram resolvidos e a suite de testes está 100% verde!

## 📝 Notas

- Os testes E2E fazem chamadas reais à API do MangaDex (timeouts aumentados para 30s)
- Testes unitários são rápidos e não dependem de I/O
- Use `test:watch` durante desenvolvimento para feedback instantâneo
