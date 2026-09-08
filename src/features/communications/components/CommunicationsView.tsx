"use client";

import { useState } from "react";
import { useDeliveryLogs } from "../hooks/useCommunications";
import { NotificationDeliveryLogQueryFilters, NotificationDeliveryStatus } from "../types";
import { DeliveryLogsTable } from "./DeliveryLogsTable";
import { CommunicationsMetricsBanner } from "./CommunicationsMetricsBanner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

export function CommunicationsView() {
  const tComm = useTranslations("communications");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");

  const [filters, setFilters] = useState<NotificationDeliveryLogQueryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  });

  const { data, isLoading, isError, refetch } = useDeliveryLogs(filters);

  const logsList = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  const pageCount = data?.meta?.totalPages ?? (Math.ceil(logsList.length / (filters.limit || 10)) || 1);

  return (
    <div className="space-y-6">
      <CommunicationsMetricsBanner />

      <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">{tComm("deliveryLogsTitle")}</h2>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="بحث ببريد المستلم..." 
                className="pl-9 rtl:pl-3 rtl:pr-9 bg-background/50 rounded-xl"
                onChange={(e) => setFilters(f => ({ ...f, recipientEmail: e.target.value || undefined, page: 1 }))}
              />
            </div>

            <Select
              value={filters.status || "ALL"}
              onValueChange={(val) => setFilters(f => ({ ...f, status: val === "ALL" || !val ? undefined : val as NotificationDeliveryStatus, page: 1 }))}
            >
              <SelectTrigger className="w-[160px] bg-background/50 rounded-xl font-bold text-xs">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent className="font-bold text-xs">
                <SelectItem value="ALL">كافة الحالات</SelectItem>
                <SelectItem value="PENDING">{tStatus("PENDING")}</SelectItem>
                <SelectItem value="SENT">{tStatus("SENT")}</SelectItem>
                <SelectItem value="FAILED">{tStatus("FAILED")}</SelectItem>
                <SelectItem value="EXHAUSTED">{tStatus("EXHAUSTED")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>حدث خطأ أثناء تحميل سجلات الإرسال من الخادم.</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="h-7 text-xs gap-1 rounded-lg border-destructive/30 hover:bg-destructive/10"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </Button>
          </div>
        )}

        <div className="rounded-md border bg-card/50 overflow-hidden">
          <DeliveryLogsTable 
            data={logsList} 
            isLoading={isLoading} 
            pageCount={pageCount}
            currentPage={filters.page || 1}
            onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
          />
        </div>
      </Card>
    </div>
  );
}
