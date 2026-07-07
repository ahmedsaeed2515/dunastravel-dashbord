export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceId: string | null;
  resourceType: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { name: string; email: string };
}

export interface AuditLogQueryFilters {
  page?: number;
  limit?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
