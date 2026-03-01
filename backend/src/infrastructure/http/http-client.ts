import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { RateLimiterManager } from '../rate-limiter/index.js';

/**
 * Configuração do cliente HTTP
 */
export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  source: string; // Identificador para rate limiting
}

/**
 * Cliente HTTP com rate limiting integrado
 */
export class HttpClient {
  private client: AxiosInstance;
  private source: string;

  constructor(config: HttpClientConfig) {
    this.source = config.source;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        ...config.headers
      }
    });
  }

  private get rateLimiter() {
    return RateLimiterManager.getInstance().getLimiter(this.source);
  }

  /**
   * GET request com rate limiting
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.executeWithRetry(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  /**
   * GET request para download de binários (imagens)
   */
  async getBuffer(url: string, config?: AxiosRequestConfig): Promise<Buffer> {
    return this.rateLimiter.executeWithRetry(async () => {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'arraybuffer',
        headers: {
          ...config?.headers,
          'Accept': 'image/webp,image/*,*/*;q=0.8'
        }
      });
      return Buffer.from(response.data);
    });
  }

  /**
   * POST request com rate limiting
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.executeWithRetry(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    });
  }

  /**
   * Obtém estatísticas do rate limiter
   */
  getStats() {
    return this.rateLimiter.getStats();
  }
}
