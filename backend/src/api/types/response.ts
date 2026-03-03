/**
 * API Response Types
 * Padronização de respostas da API
 */

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total items available */
  total: number;
  /** Total pages available */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrev: boolean;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Metadata (pagination, etc) */
  meta?: PaginationMeta | Record<string, unknown>;
  /** Error information (null if success) */
  error: null;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  /** Null data on error */
  data: null;
  /** Error metadata */
  meta?: Record<string, unknown>;
  /** Error information */
  error: {
    /** Error code */
    code: string;
    /** Human-readable message */
    message: string;
    /** Detailed error info */
    details?: unknown;
  };
}

/**
 * Creates a successful API response
 */
export function createResponse<T>(data: T, meta?: PaginationMeta | Record<string, unknown>): ApiResponse<T> {
  return {
    data,
    meta,
    error: null,
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    data: null,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Creates pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Paginates an array
 */
export function paginate<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}
