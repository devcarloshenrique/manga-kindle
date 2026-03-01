import { describe, it, expect } from 'vitest';
import { ConnectorRegistry } from '../../../src/infrastructure/connectors/connector-registry.js';

describe('ConnectorRegistry', () => {
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ConnectorRegistry.getInstance();
      const instance2 = ConnectorRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAll', () => {
    it('should return all registered connectors', () => {
      const registry = ConnectorRegistry.getInstance();
      const connectors = registry.getAll();
      
      expect(connectors.length).toBeGreaterThan(0);
      expect(connectors.some(c => c.name === 'mangalivre')).toBe(true);
      expect(connectors.some(c => c.name === 'mangadex')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return connector by name', () => {
      const registry = ConnectorRegistry.getInstance();
      const connector = registry.get('mangalivre');
      
      expect(connector).toBeDefined();
      expect(connector?.name).toBe('mangalivre');
      expect(connector?.displayName).toBe('Manga Livre');
    });

    it('should return undefined for non-existent connector', () => {
      const registry = ConnectorRegistry.getInstance();
      const connector = registry.get('non-existent');
      
      expect(connector).toBeUndefined();
    });
  });

  describe('findByUrl', () => {
    it('should find MangaLivre connector by URL', () => {
      const registry = ConnectorRegistry.getInstance();
      
      const urls = [
        'https://mangalivre.to/manga/one-piece',
        'https://mangalivre.net/manga/naruto',
        'http://mangalivre.to/manga/bleach/capitulo-1',
      ];

      urls.forEach(url => {
        const connector = registry.findByUrl(url);
        expect(connector).toBeDefined();
        expect(connector?.name).toBe('mangalivre');
      });
    });

    it('should find MangaDex connector by URL', () => {
      const registry = ConnectorRegistry.getInstance();
      
      const urls = [
        'https://mangadex.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8/kaguya-sama-wa-kokurasetai',
        'https://mangadex.org/manga/d1a9fdeb-f713-407f-960c-8326b586e6fd',
        'https://mangadex.org/chapter/9aab37f1-faf2-4204-b90d-c005d969c42f',
      ];

      urls.forEach(url => {
        const connector = registry.findByUrl(url);
        expect(connector).toBeDefined();
        expect(connector?.name).toBe('mangadex');
      });
    });

    it('should return undefined for unsupported URL', () => {
      const registry = ConnectorRegistry.getInstance();
      const connector = registry.findByUrl('https://unsupported-site.com/manga/test');
      
      expect(connector).toBeUndefined();
    });
  });

  describe('listConnectors', () => {
    it('should return list of connector summaries', () => {
      const registry = ConnectorRegistry.getInstance();
      const list = registry.listConnectors();
      
      expect(list.length).toBeGreaterThan(0);
      expect(list.every(c => c.name && c.displayName && c.baseUrl)).toBe(true);
      
      const mangaLivre = list.find(c => c.name === 'mangalivre');
      expect(mangaLivre).toBeDefined();
      expect(mangaLivre?.displayName).toBe('Manga Livre');
      
      const mangaDex = list.find(c => c.name === 'mangadex');
      expect(mangaDex).toBeDefined();
      expect(mangaDex?.displayName).toBe('MangaDex');
    });
  });
});
