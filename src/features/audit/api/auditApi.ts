import { apiClient } from "@/lib/axios";
import { AuditLog, AuditLogQueryFilters, PaginatedResponse } from "../types";

export const auditApi = {
  getAuditLogs: async (filters: AuditLogQueryFilters): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get("/admin/audit-log", { params: filters });
    return response as any;
  }
};
