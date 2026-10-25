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

    const parsedFieldErrors: Record<string, string> = {};
    if (Array.isArray(body.message)) {
      for (const item of body.message) {
        if (typeof item === 'string') {
          // Nest's ValidationPipe reports unknown payload keys as
          // "property <name> should not exist". Without this branch the field
          // would be parsed as "property", hiding the real culprit behind the
          // generic validation summary.
          const unknownProperty = item.match(
            /^property\s+([a-zA-Z0-9_.]+)\s+should not exist$/i,
          );
          const match = unknownProperty ?? item.match(/^([a-zA-Z0-9_.]+)\s+(.+)$/);
          if (match) {
            const rawKey = match[1];
            // Normalize common field aliases
            const normalizedKey = rawKey.startsWith('titleJsonb') ? 'title'
              : rawKey === 'basePriceUsd' ? 'price'
              : rawKey;
            if (!parsedFieldErrors[normalizedKey]) {
              parsedFieldErrors[normalizedKey] = item;
            }
          }
        }
      }
    } else if (isRecord(body.errors)) {
      for (const [k, v] of Object.entries(body.errors)) {
        parsedFieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
      }
    }

    const hasValidationErrors = Object.keys(parsedFieldErrors).length > 0;
    // Keep the human-friendly Arabic summary, but append the server's actual
    // messages so the offending field is never hidden behind a generic text.
    const validationDetails = Array.from(
      new Set(Object.values(parsedFieldErrors)),
    ).slice(0, 3);
    const defaultValidationSummary = hasValidationErrors
      ? [
          'يرجى مراجعة وتصحيح الحقول المحددة أدناه قبل الحفظ.',
          ...validationDetails.map((detail) => `• ${detail}`),
        ].join('\n')
      : 'An unexpected error occurred';

    const message = typeof body.message === 'string' && body.message.trim().length > 0
      ? body.message
      : hasValidationErrors
        ? defaultValidationSummary
        : Array.isArray(body.message)
          ? body.message.join(', ')
          : 'An unexpected error occurred';

    return {
      message,
      status,
      code: typeof body.code === 'string' ? body.code : status ? `HTTP_${status}` : undefined,
      errors: hasValidationErrors ? parsedFieldErrors : undefined,
    };
  }
  return { message: value instanceof Error ? value.message : 'An unexpected error occurred' };
}

export interface PermissionDefinition {
  action: string;
  resource: string;
}
