import Bottleneck from 'bottleneck';

/**
 * Configuração do Rate Limiter
 */
export interface RateLimiterConfig {
  /**
   * Máximo de requisições por intervalo
   */
  maxConcurrent: number;

  /**
   * Tempo mínimo entre requisições (ms)
   */
  minTime: number;

  /**
   * Máximo de requisições enfileiradas
   */
  maxQueued?: number;

  /**
   * Tempo máximo de espera na fila (ms)
   */
  highWater?: number;

  /**
   * Estratégia quando a fila está cheia
   */
  strategy?: Bottleneck.Strategy;

  /**
   * Penalidade por erro (ms adicionais de espera)
   */
  errorPenalty?: number;

  /**
   * Máximo de retentativas
   */
  maxRetries?: number;
}

/**
 * Configurações padrão para diferentes sites
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimiterConfig> = {
  mangalivre: {
    maxConcurrent: 2,
    minTime: 50, // 50ms entre requisições
    maxQueued: 100,
    errorPenalty: 5000,
    maxRetries: 3
  },
  default: {
    maxConcurrent: 1,
    minTime: 500, // 500ms entre requisições (conservador)
    maxQueued: 50,
    errorPenalty: 10000,
    maxRetries: 3
  }
};

/**
 * Rate Limiter usando Bottleneck
 * Controla a taxa de requisições para evitar bloqueios
 */
export class RateLimiter {
  private limiter: Bottleneck;
  private config: RateLimiterConfig;
  private errorCount: number = 0;
  private lastErrorTime: number = 0;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      ...DEFAULT_RATE_LIMITS.default,
      ...config
    };

    this.limiter = new Bottleneck({
      maxConcurrent: this.config.maxConcurrent,
      minTime: this.config.minTime,
      highWater: this.config.maxQueued,
      strategy: this.config.strategy || Bottleneck.strategy.LEAK
    });

    // Listener para erros
    this.limiter.on('failed', async (error, jobInfo) => {
      this.errorCount++;
      this.lastErrorTime = Date.now();

      const retryCount = jobInfo.retryCount || 0;
      if (retryCount < (this.config.maxRetries || 3)) {
        // Aplica penalidade exponencial
        const penalty = (this.config.errorPenalty || 5000) * Math.pow(2, retryCount);
        console.warn(`[RateLimiter] Erro na requisição. Tentativa ${retryCount + 1}. Aguardando ${penalty}ms...`);
        return penalty;
      }
      return undefined; // Não faz mais retentativas
    });

    this.limiter.on('retry', (error, jobInfo) => {
      console.log(`[RateLimiter] Retentando... (${jobInfo.retryCount})`);
    });
  }

  /**
   * Executa uma função com rate limiting
   */
  async execute<T>(fn: () => Promise<T>, priority: number = 5): Promise<T> {
    return this.limiter.schedule({ priority }, fn);
  }

  /**
   * Executa uma função com rate limiting e retentativas
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: { priority?: number; id?: string } = {}
  ): Promise<T> {
    const { priority = 5, id } = options;
    
    return this.limiter.schedule(
      { 
        priority,
        id,
        expiration: 60000 // Timeout de 1 minuto
      },
      async () => {
        try {
          return await fn();
        } catch (error) {
          // Se for erro de rate limit (429), aumenta o delay
          if (error instanceof Error && error.message.includes('429')) {
            await this.handleRateLimitError();
          }
          throw error;
        }
      }
    );
  }

  /**
   * Trata erro de rate limit aumentando o delay temporariamente
   */
  private async handleRateLimitError(): Promise<void> {
    const newMinTime = this.config.minTime * 2;
    console.warn(`[RateLimiter] Rate limit detectado! Aumentando delay para ${newMinTime}ms`);
    
    await this.limiter.updateSettings({
      minTime: newMinTime
    });

    // Restaura após 5 minutos
    setTimeout(() => {
      this.limiter.updateSettings({
        minTime: this.config.minTime
      });
      console.log(`[RateLimiter] Delay restaurado para ${this.config.minTime}ms`);
    }, 300000);
  }

  /**
   * Obtém estatísticas do rate limiter
   */
  getStats(): {
    running: number;
    queued: number;
    errorCount: number;
    lastErrorTime: number;
  } {
    const counts = this.limiter.counts();
    return {
      running: counts.RUNNING,
      queued: counts.QUEUED,
      errorCount: this.errorCount,
      lastErrorTime: this.lastErrorTime
    };
  }

  /**
   * Para o rate limiter e cancela requisições pendentes
   */
  async stop(): Promise<void> {
    await this.limiter.stop();
  }

  /**
   * Limpa a fila de requisições
   */
  clear(): void {
    this.limiter.disconnect();
  }
}

/**
 * Gerenciador global de Rate Limiters por fonte
 */
export class RateLimiterManager {
  private static instance: RateLimiterManager;
  private limiters: Map<string, RateLimiter> = new Map();

  private constructor() {}

  static getInstance(): RateLimiterManager {
    if (!RateLimiterManager.instance) {
      RateLimiterManager.instance = new RateLimiterManager();
    }
    return RateLimiterManager.instance;
  }

  /**
   * Obtém ou cria um rate limiter para uma fonte específica
   */
  getLimiter(source: string): RateLimiter {
    if (!this.limiters.has(source)) {
      const config = DEFAULT_RATE_LIMITS[source] || DEFAULT_RATE_LIMITS.default;
      this.limiters.set(source, new RateLimiter(config));
    }
    return this.limiters.get(source)!;
  }

  /**
   * Registra configuração customizada para uma fonte
   */
  registerConfig(source: string, config: RateLimiterConfig): void {
    this.limiters.set(source, new RateLimiter(config));
  }

  /**
   * Obtém estatísticas de todos os rate limiters
   */
  getAllStats(): Record<string, ReturnType<RateLimiter['getStats']>> {
    const stats: Record<string, ReturnType<RateLimiter['getStats']>> = {};
    for (const [source, limiter] of this.limiters) {
      stats[source] = limiter.getStats();
    }
    return stats;
  }
}
