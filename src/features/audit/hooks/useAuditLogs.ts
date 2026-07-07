import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/auditApi";
import { AuditLogQueryFilters } from "../types";

export function useAuditLogs(filters: AuditLogQueryFilters) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditApi.getAuditLogs(filters),
    placeholderData: (prev) => prev,
  });
}
