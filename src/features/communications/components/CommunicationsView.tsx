"use client";

import { useState } from "react";
import { useDeliveryLogs } from "../hooks/useCommunications";
import { NotificationDeliveryLogQueryFilters, NotificationDeliveryStatus } from "../types";
import { DeliveryLogsTable } from "./DeliveryLogsTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

export function CommunicationsView() {
  const [filters, setFilters] = useState<NotificationDeliveryLogQueryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  });

  const { data, isLoading } = useDeliveryLogs(filters);

  return (
    <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Delivery Logs</h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search recipient email..." 
              className="pl-9 bg-background/50"
              onChange={(e) => setFilters(f => ({ ...f, recipientEmail: e.target.value || undefined, page: 1 }))}
            />
          </div>

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => setFilters(f => ({ ...f, status: val === "ALL" || !val ? undefined : val as NotificationDeliveryStatus, page: 1 }))}
          >
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="EXHAUSTED">Exhausted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card/50 overflow-hidden">
        <DeliveryLogsTable 
          data={Array.isArray(data) ? data : (data?.data || [])} 
          isLoading={isLoading} 
          pageCount={Array.isArray(data) ? 1 : (data?.meta?.totalPages || 1)}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        />
      </div>
    </Card>
  );
}
