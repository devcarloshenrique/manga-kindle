import { http } from './http';
import type {
  Download,
  DownloadsResponse,
  StartDownloadRequest,
  StartDownloadResponse,
  DownloadChapterRequest,
  DownloadChapterResponse,
} from './types';

export const downloadService = {
  async list(): Promise<DownloadsResponse> {
    const response = await http.get<DownloadsResponse>('/api/downloads');
    return response.data;
  },

  async getStatus(id: string): Promise<Download> {
    const response = await http.get<Download>(`/api/downloads/${id}`);
    return response.data;
  },

  async start(data: StartDownloadRequest): Promise<StartDownloadResponse> {
    const response = await http.post<StartDownloadResponse>('/api/downloads', data);
    return response.data;
  },

  async downloadChapter(data: DownloadChapterRequest): Promise<DownloadChapterResponse> {
    const response = await http.post<DownloadChapterResponse>('/api/downloads/chapter', data);
    return response.data;
  },

  async cancel(id: string): Promise<{ message: string }> {
    const response = await http.delete<{ message: string }>(`/api/downloads/${id}`);
    return response.data;
  },
};
