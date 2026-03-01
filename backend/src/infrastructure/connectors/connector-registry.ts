import type { IMangaConnector } from '../../domain/interfaces/index.js';
import { MangaLivreConnector } from './mangalivre-connector.js';
import { MangaDexConnector } from './mangadex-connector.js';

/**
 * Registry de conectores disponíveis
 * Gerencia a criação e acesso aos conectores de mangá
 */
export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, IMangaConnector> = new Map();

  private constructor() {
    // Registra conectores padrão
    this.register(new MangaLivreConnector());
    this.register(new MangaDexConnector());
  }

  static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  /**
   * Registra um novo conector
   */
  register(connector: IMangaConnector): void {
    this.connectors.set(connector.name, connector);
  }

  /**
   * Obtém um conector pelo nome
   */
  get(name: string): IMangaConnector | undefined {
    return this.connectors.get(name);
  }

  /**
   * Encontra um conector que suporta a URL fornecida
   */
  findByUrl(url: string): IMangaConnector | undefined {
    for (const connector of this.connectors.values()) {
      if (connector.supportsUrl(url)) {
        return connector;
      }
    }
    return undefined;
  }

  /**
   * Lista todos os conectores registrados
   */
  getAll(): IMangaConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Lista informações resumidas dos conectores
   */
  listConnectors(): Array<{ name: string; displayName: string; baseUrl: string }> {
    return this.getAll().map(c => ({
      name: c.name,
      displayName: c.displayName,
      baseUrl: c.baseUrl
    }));
  }
}
