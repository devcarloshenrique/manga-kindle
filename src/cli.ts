#!/usr/bin/env node

import path from 'path';
import { ConnectorRegistry } from './infrastructure/connectors/index.js';
import { getDownloadMangaHandler } from './application/features/download/index.js';
import { getMangaInfoHandler } from './application/features/manga/index.js';

// Parse argumentos da linha de comando
const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║             Manga Downloader CLI v2.0.0                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Uso:                                                            ║
║    npx tsx src/cli.ts <url-do-manga> [opções]                    ║
║                                                                  ║
║  Opções:                                                         ║
║    -o, --output <dir>    Diretório de saída (./downloads)        ║
║    -s, --start <num>     Capítulo inicial (1)                    ║
║    -e, --end <num>       Capítulo final (todos)                  ║
║    -i, --info            Apenas mostra informações               ║
║    -c, --connectors      Lista conectores disponíveis            ║
║    -h, --help            Mostra esta ajuda                       ║
║                                                                  ║
║  Exemplos:                                                       ║
║    npx tsx src/cli.ts https://mangalivre.to/manga/sakamoto-days/ ║
║    npx tsx src/cli.ts https://mangalivre.to/manga/one-piece/     ║
║        --start 1 --end 50 -o ./mangas                            ║
║                                                                  ║
║  Conectores disponíveis:                                         ║
║    • mangalivre (mangalivre.to)                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}

function printConnectors(): void {
  const registry = ConnectorRegistry.getInstance();
  const connectors = registry.listConnectors();

  console.log('\n📚 Conectores disponíveis:\n');
  connectors.forEach(c => {
    console.log(`  • ${c.displayName}`);
    console.log(`    ID: ${c.name}`);
    console.log(`    URL: ${c.baseUrl}\n`);
  });
}

function getOption(flags: string[], defaultValue?: string): string | undefined {
  for (const flag of flags) {
    const index = args.indexOf(flag);
    if (index !== -1 && args[index + 1]) {
      return args[index + 1];
    }
  }
  return defaultValue;
}

async function main(): Promise<void> {
  // Ajuda
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // Lista conectores
  if (args.includes('--connectors') || args.includes('-c')) {
    printConnectors();
    process.exit(0);
  }

  // Extrai URL
  const url = args.find(arg => arg.startsWith('http'));
  if (!url) {
    console.error('❌ Erro: URL do mangá é obrigatória');
    printHelp();
    process.exit(1);
  }

  // Verifica se a URL é suportada
  const registry = ConnectorRegistry.getInstance();
  const connector = registry.findByUrl(url);
  
  if (!connector) {
    console.error('❌ Erro: URL não suportada. Use --connectors para ver os sites disponíveis.');
    process.exit(1);
  }

  // Parse opções
  const outputDir = getOption(['-o', '--output'], './downloads')!;
  const startChapter = parseInt(getOption(['-s', '--start'], '1')!, 10);
  const endChapterStr = getOption(['-e', '--end']);
  const endChapter = endChapterStr ? parseInt(endChapterStr, 10) : undefined;
  const infoOnly = args.includes('-i') || args.includes('--info');

  try {
    console.log(`\n🔍 Obtendo informações do mangá de ${connector.displayName}...\n`);

    const infoHandler = getMangaInfoHandler();
    const manga = await infoHandler.execute({ url });

    console.log(`📖 Mangá: ${manga.title}`);
    console.log(`📚 Total de capítulos: ${manga.totalChapters}`);
    console.log(`🏷️  Fonte: ${manga.source}`);
    if (manga.author) console.log(`✍️  Autor: ${manga.author}`);
    if (manga.status) console.log(`📊 Status: ${manga.status}`);
    console.log(`🔗 URL: ${manga.url}\n`);

    if (infoOnly) {
      console.log('📋 Lista de capítulos:');
      manga.chapters.forEach(ch => {
        console.log(`   • Capítulo ${ch.number}`);
      });
      return;
    }

    // Filtra capítulos
    const chaptersToDownload = manga.chapters.filter(ch => {
      const num = parseFloat(ch.number);
      return num >= startChapter && (!endChapter || num <= endChapter);
    });

    console.log(`⬇️  Iniciando download de ${chaptersToDownload.length} capítulos...`);
    console.log(`📁 Salvando em: ${path.resolve(outputDir, manga.title)}\n`);

    const startTime = Date.now();

    const downloadHandler = getDownloadMangaHandler();
    
    // Inicia download com callbacks
    await new Promise<void>((resolve, reject) => {
      downloadHandler.start(
        {
          url,
          outputDir,
          startChapter,
          endChapter
        },
        {
          onChapterStart: (chapterNum, current, total) => {
            console.log(`\n📖 [${current}/${total}] Baixando capítulo ${chapterNum}...`);
          },
          onProgress: (chapterNum, currentImage, totalImages) => {
            process.stdout.write(`\r   📸 ${currentImage}/${totalImages} imagens`);
          },
          onChapterComplete: (chapterNum, result) => {
            console.log(`\n   ✅ Capítulo ${chapterNum} concluído (${result.imagesDownloaded} imagens)`);
          },
          onError: (chapterNum, error) => {
            console.error(`\n   ❌ Erro no capítulo ${chapterNum}: ${error.message}`);
          },
          onComplete: (download) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log('\n' + '═'.repeat(60));
            console.log(`\n✨ Download concluído em ${duration}s!`);
            console.log(`   📥 Capítulos baixados: ${download.results.length}`);

            if (download.errors.length > 0) {
              console.log(`   ❌ Capítulos com erro: ${download.errors.length}`);
              download.errors.forEach(e => {
                console.log(`      • Capítulo ${e.chapter}: ${e.error}`);
              });
            }

            console.log(`\n📁 Arquivos salvos em: ${download.outputDirectory}\n`);
            resolve();
          }
        }
      ).catch(reject);
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`\n❌ Erro: ${message}\n`);
    process.exit(1);
  }
}

main();
