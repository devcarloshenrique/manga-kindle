import { http } from './http';
import type {
  ApiEnvelope,
  CreateKccConversionRequest,
  CreateKccMangaConversionRequest,
  KccConvertedFile,
  KccJobCreateResponse,
  KccJobSummary,
  KccOptionDoc,
  KccPreset,
  KccProfile,
} from './types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.error) {
    throw new Error(envelope.error.message || 'Erro ao processar resposta da API');
  }
  return envelope.data;
}

function normalizeKccPayload(payload: CreateKccConversionRequest): CreateKccConversionRequest;
function normalizeKccPayload(payload: CreateKccMangaConversionRequest): CreateKccMangaConversionRequest;
function normalizeKccPayload<T extends { options?: { webtoon?: boolean; webtoonMode?: boolean } }>(payload: T): T {
  if (!payload.options) return payload;

  const options = { ...payload.options };

  if (typeof options.webtoonMode === 'boolean' && typeof options.webtoon !== 'boolean') {
    options.webtoon = options.webtoonMode;
  }

  delete (options as { webtoonMode?: boolean }).webtoonMode;

  return {
    ...payload,
    options,
  };
}

export const kccService = {
  async getProfiles(): Promise<KccProfile[]> {
    const response = await http.get<ApiEnvelope<KccProfile[]>>('/api/kcc/profiles');
    return unwrap(response.data);
  },

  async getOptions(): Promise<{ options: Record<string, KccOptionDoc>; cliFlags: Record<string, string[]> }> {
    const response = await http.get<
      ApiEnvelope<{ options: Record<string, KccOptionDoc>; cliFlags: Record<string, string[]> }>
    >('/api/kcc/options');
    return unwrap(response.data);
  },

  async getPresets(): Promise<KccPreset[]> {
    const response = await http.get<ApiEnvelope<KccPreset[]>>('/api/kcc/presets');
    return unwrap(response.data);
  },

  async listJobs(page = 1, limit = 20): Promise<{ jobs: KccJobSummary[]; meta?: Record<string, unknown> }> {
    const response = await http.get<ApiEnvelope<KccJobSummary[]>>('/api/kcc/jobs', {
      params: { page, limit },
    });

    return {
      jobs: unwrap(response.data),
      meta: response.data.meta,
    };
  },

  async listConverted(): Promise<KccConvertedFile[]> {
    const response = await http.get<ApiEnvelope<KccConvertedFile[]>>('/api/kcc/converted');
    return unwrap(response.data);
  },

  async createConversion(payload: CreateKccConversionRequest): Promise<KccJobCreateResponse> {
    const normalizedPayload = normalizeKccPayload(payload);
    const response = await http.post<ApiEnvelope<KccJobCreateResponse>>('/api/kcc/convert', normalizedPayload);
    return unwrap(response.data);
  },

  async createMangaConversion(payload: CreateKccMangaConversionRequest): Promise<KccJobCreateResponse> {
    const normalizedPayload = normalizeKccPayload(payload);
    const response = await http.post<ApiEnvelope<KccJobCreateResponse>>('/api/kcc/convert/manga', normalizedPayload);
    return unwrap(response.data);
  },

  async organizeDownloads(slug?: string): Promise<{ message: string }> {
    const endpoint = slug ? `/api/kcc/organize/downloads/${slug}` : '/api/kcc/organize/downloads';
    const response = await http.post<ApiEnvelope<{ message: string }>>(endpoint);
    return unwrap(response.data);
  },

  async organizeConverted(): Promise<{ message: string }> {
    const response = await http.post<ApiEnvelope<{ message: string }>>('/api/kcc/organize/converted');
    return unwrap(response.data);
  },
};
