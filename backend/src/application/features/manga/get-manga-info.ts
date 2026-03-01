import { z } from 'zod';
import { ConnectorRegistry } from '../../../infrastructure/connectors/index.js';
import type { Manga } from '../../../domain/entities/index.js';

/**
 * Schema de validação para a request
 */
export const GetMangaInfoRequestSchema = z.object({
  url: z.string().url('URL inválida').refine(
    (url) => ConnectorRegistry.getInstance().findByUrl(url) !== undefined,
    'URL não suportada. Verifique os conectores disponíveis.'
  )
});

export type GetMangaInfoRequest = z.infer<typeof GetMangaInfoRequestSchema>;

/**
 * Response type
 */
export type GetMangaInfoResponse = Manga;

/**
 * Handler do caso de uso GetMangaInfo
 */
export class GetMangaInfoHandler {
  async execute(request: GetMangaInfoRequest): Promise<GetMangaInfoResponse> {
    // Valida request
    const validated = GetMangaInfoRequestSchema.parse(request);
    
    // Encontra o conector apropriado
    const connector = ConnectorRegistry.getInstance().findByUrl(validated.url);
    if (!connector) {
      throw new Error('Nenhum conector disponível para esta URL');
    }

    // Obtém informações do mangá
    const manga = await connector.getMangaInfo(validated.url);
    
    return manga;
  }
}

// Singleton do handler
let handler: GetMangaInfoHandler | null = null;

export function getHandler(): GetMangaInfoHandler {
  if (!handler) {
    handler = new GetMangaInfoHandler();
  }
  return handler;
}
