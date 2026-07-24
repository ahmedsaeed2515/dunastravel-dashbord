"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuditLogs } from "@/features/audit/hooks/useAuditLogs";
import { format } from "date-fns";
import { Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AuditLogsPage() {
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="System Audit Logs"
        description="Immutable audit trail of administrator actions, data modifications, user logins, and system events."
      />

      <Card className="border-border/80 shadow-xs bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 p-4 sm:p-6">
          <div className="flex flex-wrap gap-4 items-center w-full">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audit logs by action or resource..." 
                className="pl-9" 
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
              <span className="text-xs text-muted-foreground">to</span>
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
                  <TableHead className="w-[100px]">Log ID</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading audit logs...</TableCell>
                  </TableRow>
                ) : (Array.isArray(data) ? data : (data?.data || [])).length > 0 ? (
                  (Array.isArray(data) ? data : (data?.data || [])).map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.user ? `${log.user.name} (${log.user.email})` : (log.ipAddress || "System")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.resourceType} {log.resourceId}</TableCell>
                      <TableCell>
                        {!log.action.includes("FAILED") ? (
                          <Badge variant="success">Success</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <ShieldAlert className="h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
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
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No audit logs found.</TableCell>
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
