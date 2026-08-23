export type UserRole = "SUPER_ADMIN" | "ADMIN" | "AGENT" | "USER" | "GUEST" | "COMPANY";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status?: string;
  suspendedAt?: string | null;
  suspendReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryFilters {
  search?: string;
  role?: UserRole;
  status?: string;
  page?: number;
  limit?: number;
}
