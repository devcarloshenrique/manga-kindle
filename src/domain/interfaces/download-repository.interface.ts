import type { Download } from '../entities/index.js';

/**
 * Interface para repositório de downloads
 * Gerencia o estado dos downloads em memória ou persistido
 */
export interface IDownloadRepository {
  /**
   * Cria um novo download
   */
  create(download: Download): Promise<Download>;

  /**
   * Obtém um download por ID
   */
  findById(id: string): Promise<Download | null>;

  /**
   * Lista todos os downloads
   */
  findAll(): Promise<Download[]>;

  /**
   * Atualiza um download existente
   */
  update(download: Download): Promise<Download>;

  /**
   * Remove um download
   */
  delete(id: string): Promise<void>;

  /**
   * Lista downloads por status
   */
  findByStatus(status: Download['status']): Promise<Download[]>;
}
