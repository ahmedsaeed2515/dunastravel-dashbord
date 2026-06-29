export type UserRole = "ADMIN" | "USER" | "GUEST" | "COMPANY";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
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
