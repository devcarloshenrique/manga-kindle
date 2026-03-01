import type { Download } from '../../domain/entities/index.js';
import type { IDownloadRepository } from '../../domain/interfaces/index.js';

/**
 * Deep clone de um objeto Download
 */
function cloneDownload(download: Download): Download {
  return {
    ...download,
    startedAt: new Date(download.startedAt),
    completedAt: download.completedAt ? new Date(download.completedAt) : undefined,
    progress: { ...download.progress },
    results: download.results.map(r => ({ ...r })),
    errors: download.errors.map(e => ({ ...e }))
  };
}

/**
 * Repositório de downloads em memória
 * Para produção, pode ser substituído por uma implementação com banco de dados
 */
export class InMemoryDownloadRepository implements IDownloadRepository {
  private downloads: Map<string, Download> = new Map();

  async create(download: Download): Promise<Download> {
    this.downloads.set(download.id, cloneDownload(download));
    return download;
  }

  async findById(id: string): Promise<Download | null> {
    const download = this.downloads.get(id);
    return download ? cloneDownload(download) : null;
  }

  async findAll(): Promise<Download[]> {
    return Array.from(this.downloads.values()).map(d => cloneDownload(d));
  }

  async update(download: Download): Promise<Download> {
    if (!this.downloads.has(download.id)) {
      throw new Error(`Download não encontrado: ${download.id}`);
    }
    this.downloads.set(download.id, cloneDownload(download));
    return download;
  }

  async delete(id: string): Promise<void> {
    this.downloads.delete(id);
  }

  async findByStatus(status: Download['status']): Promise<Download[]> {
    return Array.from(this.downloads.values())
      .filter(d => d.status === status)
      .map(d => cloneDownload(d));
  }

  /**
   * Limpa downloads antigos (completados há mais de X horas)
   */
  async cleanup(maxAgeHours: number = 24): Promise<number> {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    let removed = 0;

    for (const [id, download] of this.downloads) {
      if (download.completedAt) {
        const age = now.getTime() - download.completedAt.getTime();
        if (age > maxAge) {
          this.downloads.delete(id);
          removed++;
        }
      }
    }

    return removed;
  }
}
