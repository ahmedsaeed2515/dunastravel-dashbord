"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuditLogs } from "@/features/audit/hooks/useAuditLogs";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export default function AuditLogsPage() {
  const tAudit = useTranslations("audit");
  const tCommon = useTranslations("common");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  
  const query = useAuditLogs({
    page,
    limit: 25,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: search || undefined,
  });
  const { data, isLoading } = query;
  const logs = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  if (query.isError) {
    return <QueryErrorState message="تعذر تحميل سجل التدقيق من الباك إند." onRetry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
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
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                className="w-auto"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              />
              <span className="text-xs text-muted-foreground">—</span>
              <Input 
                type="date" 
                className="w-auto"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
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
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/70 p-4">
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(current => current - 1)}>{tCommon("previous")}</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(current => current + 1)}>{tCommon("next")}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
