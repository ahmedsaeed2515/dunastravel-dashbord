export type PaginatedPayload<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function requireObject<T extends object>(value: unknown, name: string): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${name} response`);
  }
  return value as T;
}

export function requireArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${name} response`);
  return value as T[];
}

export function requirePaginated<T>(value: unknown, name: string): PaginatedPayload<T> {
  const payload = requireObject<Partial<PaginatedPayload<T>>>(value, name);
  if (!Array.isArray(payload.data) || !payload.meta || typeof payload.meta.total !== "number" || typeof payload.meta.totalPages !== "number") {
    throw new Error(`Invalid ${name} pagination response`);
  }
  return payload as PaginatedPayload<T>;
}
