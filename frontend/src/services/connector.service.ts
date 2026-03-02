import { http } from './http';
import type {
  ConnectorsResponse,
  HealthResponse,
  SetLanguageResponse,
} from './types';

export const connectorService = {
  async list(): Promise<ConnectorsResponse> {
    const response = await http.get<ConnectorsResponse>('/api/connectors');
    return response.data;
  },

  async health(): Promise<HealthResponse> {
    const response = await http.get<HealthResponse>('/api/connectors/health');
    return response.data;
  },

  async setLanguage(name: string, language: string): Promise<SetLanguageResponse> {
    const response = await http.put<SetLanguageResponse>(
      `/api/connectors/${name}/language`,
      { language },
    );
    return response.data;
  },
};
