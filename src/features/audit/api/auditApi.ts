import { apiClient } from "@/lib/axios";
import { AuditLog, AuditLogQueryFilters, PaginatedResponse } from "../types";

export const auditApi = {
  getAuditLogs: async (filters: AuditLogQueryFilters): Promise<PaginatedResponse<AuditLog>> => {
    return apiClient.get<PaginatedResponse<AuditLog>, PaginatedResponse<AuditLog>>("/admin/audit-log", { params: filters });
  }
};
