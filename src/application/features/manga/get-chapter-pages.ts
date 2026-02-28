import { z } from 'zod';
import { ConnectorRegistry } from '../../../infrastructure/connectors/index.js';
import type { ChapterContent } from '../../../domain/entities/index.js';

/**
 * Schema de validação para a request
 */
export const GetChapterPagesRequestSchema = z.object({
  url: z.string().url('URL inválida')
});

export type GetChapterPagesRequest = z.infer<typeof GetChapterPagesRequestSchema>;

/**
 * Response type
 */
export type GetChapterPagesResponse = ChapterContent;

/**
 * Handler do caso de uso GetChapterPages
 */
export class GetChapterPagesHandler {
  async execute(request: GetChapterPagesRequest): Promise<GetChapterPagesResponse> {
    // Valida request
    const validated = GetChapterPagesRequestSchema.parse(request);
    
    // Encontra o conector apropriado
    const connector = ConnectorRegistry.getInstance().findByUrl(validated.url);
    if (!connector) {
      throw new Error('Nenhum conector disponível para esta URL');
    }

    // Obtém páginas do capítulo
    const chapterContent = await connector.getChapterPages(validated.url);
    
    if (chapterContent.pages.length === 0) {
      throw new Error('Nenhuma página encontrada neste capítulo');
    }
    
    return chapterContent;
  }
}

// Singleton do handler
let handler: GetChapterPagesHandler | null = null;

export function getHandler(): GetChapterPagesHandler {
  if (!handler) {
    handler = new GetChapterPagesHandler();
  }
  return handler;
}
