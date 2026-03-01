import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './config/index.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/index.js';
import { getApiInfo } from './controllers/system.controller.js';

/**
 * Cria e configura a aplicação Express
 */
export function createApp(): Express {
  const app = express();

  // Middleware de parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS básico
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Swagger documentation
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Manga Downloader API - Docs',
    customCss: '.swagger-ui .topbar { display: none }'
  }));

  // JSON da spec do Swagger
  app.get('/docs/json', (req, res) => {
    res.json(swaggerSpec);
  });

  // Root route
  app.get('/', asyncHandler(getApiInfo));

  // API routes
  app.use('/api', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}
