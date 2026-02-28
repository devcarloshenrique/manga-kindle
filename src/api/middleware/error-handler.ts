import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Middleware de tratamento de erros global
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, error.message);

  // Erro de validação Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Erro de validação',
      message: 'Os dados fornecidos são inválidos',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Erro de URL não suportada
  if (error.message.includes('não suportada') || error.message.includes('Nenhum conector')) {
    res.status(400).json({
      error: 'URL não suportada',
      message: error.message
    });
    return;
  }

  // Erro de não encontrado
  if (error.message.includes('não encontrado') || error.message.includes('not found')) {
    res.status(404).json({
      error: 'Não encontrado',
      message: error.message
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ocorreu um erro interno no servidor'
      : error.message
  });
}

/**
 * Middleware para rotas não encontradas
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.path} não existe`,
    availableRoutes: [
      'GET /',
      'GET /api/connectors',
      'GET /api/manga/info',
      'GET /api/manga/chapter/pages',
      'POST /api/downloads',
      'POST /api/downloads/chapter',
      'GET /api/downloads',
      'GET /api/downloads/:id',
      'GET /api/system/stats',
      'GET /docs'
    ]
  });
}

/**
 * Wrapper para handlers assíncronos
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
