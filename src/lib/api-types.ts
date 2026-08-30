export type Role = 'USER' | 'COMPANY' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  status?: string;
  isVerified?: boolean;
  customerNumber?: string | null;
  isVip?: boolean;
  tags?: string[];
  segments?: string[];
  passportNumber?: string | null;
  nationality?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  preferredDestination?: string | null;
  preferredTravelType?: string | null;
  marketingConsent?: boolean;
  companyId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginatedMeta;
}

export interface ApiEnvelope<T> extends ApiResponse<T> {
  statusCode: number;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[] | string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function unwrapApiEnvelope<T>(value: unknown): T {
  if (value === null || value === undefined || value === "") {
    return {} as T;
  }
  if (!isRecord(value)) {
    return value as T;
  }
  // A response shaped as { data: { success, data, ... }, meta } is a legacy
  // double envelope. Accepting it would make callers guess which pagination
  // layer is authoritative and can silently reintroduce stale contracts.
  if (
    isRecord(value.data) &&
    value.data.success === true &&
    'data' in value.data
  ) {
    throw new Error('Invalid API success envelope');
  }
  if (value.success !== true || !('data' in value)) {
    return value as T;
  }

  const data = value.data as T;
  if (isRecord(data) && data.success === false) {
    const errorMsg = typeof data.message === 'string' && data.message.trim().length > 0
      ? data.message
      : typeof data.error === 'string' && data.error.trim().length > 0
      ? data.error
      : 'The operation was not completed';
    const error = new Error(errorMsg) as Error & ApiError;
    error.code = typeof data.code === 'string' ? data.code : 'BUSINESS_OPERATION_FAILED';
    throw error;
  }


  if ('meta' in value && value.meta !== undefined) {
    return { data, meta: value.meta } as T;
  }
  return data;
}

export function normalizeApiError(value: unknown): ApiError {
  if (isRecord(value)) {
    const status = typeof value.status === 'number' ? value.status : undefined;
    const body = isRecord(value.data) ? value.data : value;
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : typeof body.message === 'string'
        ? body.message
        : 'An unexpected error occurred';
    return {
      message,
      status,
      code: typeof body.code === 'string' ? body.code : status ? `HTTP_${status}` : undefined,
      errors: isRecord(body.errors) ? body.errors as Record<string, string[] | string> : undefined,
    };
  }
  return { message: value instanceof Error ? value.message : 'An unexpected error occurred' };
}

export interface PermissionDefinition {
  action: string;
  resource: string;
}
