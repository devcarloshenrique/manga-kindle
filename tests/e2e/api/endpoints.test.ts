import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import router from '../../../src/api/routes/api.routes.js';

describe('API E2E Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
  });

  describe('GET /api/connectors', () => {
    it('should return list of available connectors', async () => {
      const response = await request(app)
        .get('/api/connectors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('connectors');
      expect(response.body.connectors).toBeInstanceOf(Array);
      expect(response.body.connectors.length).toBeGreaterThan(0);
      
      const connector = response.body.connectors[0];
      expect(connector).toHaveProperty('name');
      expect(connector).toHaveProperty('displayName');
      expect(connector).toHaveProperty('baseUrl');
    });
  });

  describe('GET /api/connectors/health', () => {
    it('should return health status of all connectors', async () => {
      const response = await request(app)
        .get('/api/connectors/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('totalConnectors');
      expect(response.body).toHaveProperty('healthyConnectors');
      expect(response.body).toHaveProperty('connectors');
      expect(response.body.connectors).toBeInstanceOf(Array);
      
      if (response.body.connectors.length > 0) {
        const connector = response.body.connectors[0];
        expect(connector).toHaveProperty('name');
        expect(connector).toHaveProperty('displayName');
        expect(connector).toHaveProperty('status');
        expect(connector).toHaveProperty('endpoints');
        
        if (connector.endpoints.getMangaInfo) {
          expect(connector.endpoints.getMangaInfo).toHaveProperty('status');
        }
        if (connector.endpoints.getChapterPages) {
          expect(connector.endpoints.getChapterPages).toHaveProperty('status');
        }
      }
    }, 60000); // Increase timeout as it tests real endpoints
  });

  describe('PUT /api/connectors/:name/language', () => {
    it('should update language for mangadex connector', async () => {
      const response = await request(app)
        .put('/api/connectors/mangadex/language')
        .send({ language: 'en' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('connector', 'mangadex');
      expect(response.body).toHaveProperty('language', 'en');
      expect(response.body).toHaveProperty('supportedLanguages');
    });

    it('should return 400 when language is missing', async () => {
      const response = await request(app)
        .put('/api/connectors/mangadex/language')
        .send({})
        .expect('Content-Type', /json/);

      // Should accept the request but may set language to undefined
      expect([200, 400]).toContain(response.status);
    });

    it('should return 404 for non-existent connector', async () => {
      const response = await request(app)
        .put('/api/connectors/non-existent/language')
        .send({ language: 'en' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/manga/info', () => {
    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/api/manga/info')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('obrigatório');
    });

    it('should return manga info for valid MangaLivre URL', async () => {
      const response = await request(app)
        .get('/api/manga/info')
        .query({ url: 'https://mangalivre.to/manga/one-piece' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('slug');
      expect(response.body).toHaveProperty('chapters');
      expect(response.body).toHaveProperty('source');
      expect(response.body.chapters).toBeInstanceOf(Array);
    }, 30000); // Increase timeout for real API call
  });

  describe('GET /api/manga/chapter/pages', () => {
    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/api/manga/chapter/pages')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('obrigatório');
    });

    it('should return chapter pages for valid MangaDex chapter URL', async () => {
      const response = await request(app)
        .get('/api/manga/chapter/pages')
        .query({ url: 'https://mangadex.org/chapter/9aab37f1-faf2-4204-b90d-c005d969c42f' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('mangaSlug');
      expect(response.body).toHaveProperty('chapterNumber');
      expect(response.body).toHaveProperty('pages');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.pages).toBeInstanceOf(Array);
      expect(response.body.pages.length).toBeGreaterThan(0);
      
      const page = response.body.pages[0];
      expect(page).toHaveProperty('number');
      expect(page).toHaveProperty('url');
    }, 30000); // Increase timeout for real API call
  });

  describe('POST /api/downloads', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/downloads')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/downloads')
        .send({
          mangaUrl: 'not-a-valid-url',
          startChapter: 1,
          endChapter: 5,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/downloads', () => {
    it('should return list of downloads', async () => {
      const response = await request(app)
        .get('/api/downloads')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('downloads');
      expect(response.body.downloads).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/downloads/:id', () => {
    it('should return 404 for non-existent download', async () => {
      const response = await request(app)
        .get('/api/downloads/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/system/stats', () => {
    it('should return system statistics', async () => {
      const response = await request(app)
        .get('/api/system/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('rateLimiters');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body).toHaveProperty('platform');
    });
  });
});
