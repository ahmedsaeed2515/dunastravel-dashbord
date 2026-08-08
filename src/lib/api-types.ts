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

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[] | string>;
}

export interface PermissionDefinition {
  action: string;
  resource: string;
}
