import { apiClient } from "@/lib/axios";
import { AuditLog, AuditLogQueryFilters, PaginatedResponse } from "../types";
import { requirePaginated } from "@/lib/api-response";

export const auditApi = {
  getAuditLogs: async (filters: AuditLogQueryFilters): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get("/admin/audit-log", { params: filters });
    return requirePaginated(response, "audit logs");
  }
};
