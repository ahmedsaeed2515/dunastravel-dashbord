"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuditLogs } from "@/features/audit/hooks/useAuditLogs";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export default function AuditLogsPage() {
  const tAudit = useTranslations("audit");
  const tCommon = useTranslations("common");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  
  const { data, isLoading } = useAuditLogs({
    page: 1,
    limit: 100,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: search || undefined,
  });
  const logs = data?.data ?? [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="سجل المراجعة — تتبع جميع العمليات الحساسة التي أجراها المسؤولون على النظام."
        title={tAudit("title")}
        description={tAudit("description")}
      />

      <Card className="border-border/80 shadow-xs bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 p-4 sm:p-6">
          <div className="flex flex-wrap gap-4 items-center w-full">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`${tCommon("searchPlaceholder")}...`} 
                className="ps-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                className="w-auto"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">—</span>
              <Input 
                type="date" 
                className="w-auto"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>{tAudit("action")}</TableHead>
                  <TableHead>{tAudit("resource")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead className="text-end">{tAudit("timestamp")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{tCommon("loading")}</TableCell>
                  </TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground dir-ltr text-start">{log.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.action}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.resourceType} {log.resourceId}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.action.includes("FAILED") ? "FAILED" : "ACTIVE"} />
                      </TableCell>
                      <TableCell className="text-end text-xs text-muted-foreground whitespace-nowrap">
                        {(() => {
                          if (!log.createdAt) return "—";
                          const d = new Date(log.createdAt);
                          return isNaN(d.getTime()) ? "—" : format(d, "PPp");
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{tAudit("noLogs")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
