"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuditLogs } from "@/features/audit/hooks/useAuditLogs";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Activity, Search, ShieldAlert } from "lucide-react";

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
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <Activity className="h-6 w-6" />
            System Audit Logs
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Immutable tracking of all system modifications, logins, and critical events.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex flex-wrap gap-4 items-center w-full">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs by action or resource..." 
                className="pl-9 bg-background/50" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                className="w-auto bg-background/50"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span className="text-muted-foreground">to</span>
              <Input 
                type="date" 
                className="w-auto bg-background/50"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
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
                  <TableCell colSpan={6} className="h-24 text-center">Loading audit logs...</TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
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
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Success</Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <ShieldAlert className="h-3 w-3" /> Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "PPp")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No audit logs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
