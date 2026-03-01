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
║  Conectores disponíveis:                                         ║
║  └─ MangaLivre (mangalivre.to)                                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
