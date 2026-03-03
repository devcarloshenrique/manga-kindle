import { createApp } from './api/index.js';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║             Manga Downloader API v2.0.0                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🚀 Servidor: http://localhost:${PORT}                              ║
║  📚 Documentação: http://localhost:${PORT}/docs                     ║
║                                                                  ║
║  Endpoints principais:                                           ║
║  ├─ GET  /api/connectors           Lista conectores              ║
║  ├─ GET  /api/manga/info           Info do mangá                 ║
║  ├─ GET  /api/manga/chapter/pages  Páginas do capítulo           ║
║  ├─ POST /api/downloads            Iniciar download              ║
║  ├─ POST /api/downloads/chapter    Baixar capítulo               ║
║  ├─ GET  /api/downloads            Listar downloads              ║
║  ├─ GET  /api/downloads/:id        Status do download            ║
║  └─ GET  /api/system/stats         Estatísticas                  ║
║                                                                  ║
║  KCC (Kindle Comic Converter):                                   ║
║  ├─ GET  /api/kcc/profiles         Lista perfis de dispositivo   ║
║  ├─ POST /api/kcc/convert          Criar job de conversão        ║
║  ├─ GET  /api/kcc/jobs             Listar jobs                   ║
║  ├─ GET  /api/kcc/jobs/:id         Detalhes do job               ║
║  ├─ GET  /api/kcc/jobs/:id/progress Progresso do job             ║
║  ├─ POST /api/kcc/jobs/:id/cancel  Cancelar job                  ║
║  ├─ DELETE /api/kcc/jobs/:id       Remover job                   ║
║  ├─ GET  /api/kcc/converted        Listar arquivos convertidos   ║
║  ├─ GET  /api/kcc/converted/:name  Detalhes do arquivo           ║
║  └─ GET  /api/kcc/converted/:name/download  Baixar arquivo       ║
║                                                                  ║
║  Conectores disponíveis:                                         ║
║  └─ MangaLivre (mangalivre.to)                                   ║
║                                                                  ║
║  ⚠️  Para usar KCC, inicie o Redis: docker-compose up -d         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
