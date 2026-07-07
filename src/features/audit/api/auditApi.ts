import { apiClient } from "@/lib/axios";
import { AuditLog, AuditLogQueryFilters, PaginatedResponse } from "../types";

export const auditApi = {
  getAuditLogs: async (filters: AuditLogQueryFilters): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await apiClient.get("/admin/audit-log", { params: filters });
    return data;
  }
};
