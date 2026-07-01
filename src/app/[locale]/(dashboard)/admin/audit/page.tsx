"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Search, Filter, ShieldAlert } from "lucide-react";

export default function AuditLogsPage() {
  const mockLogs = [
    { id: "AL-1092", user: "Admin (admin@dunas.travel)", action: "UPDATE_TOUR", resource: "Tour: luxury-maldives", status: "SUCCESS", time: "2 minutes ago" },
    { id: "AL-1091", user: "System", action: "SYNC_EXCHANGE_RATES", resource: "Finance Module", status: "SUCCESS", time: "1 hour ago" },
    { id: "AL-1090", user: "B2B Partner (agency@travel.com)", action: "CREATE_BOOKING", resource: "Booking: REF-5092", status: "SUCCESS", time: "3 hours ago" },
    { id: "AL-1089", user: "Unknown User (192.168.1.5)", action: "FAILED_LOGIN", resource: "Auth Module", status: "FAILURE", time: "5 hours ago" },
    { id: "AL-1088", user: "Admin (admin@dunas.travel)", action: "DELETE_USER", resource: "User: ID-908", status: "SUCCESS", time: "1 day ago" },
  ];

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
          <div className="flex gap-4 items-center w-full max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs by user, action, or resource..." className="pl-9 bg-background/50" />
            </div>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="h-4 w-4" /> Filter Events
            </Button>
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
              {mockLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.id}</TableCell>
                  <TableCell className="font-medium text-sm">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.resource}</TableCell>
                  <TableCell>
                    {log.status === "SUCCESS" ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Success</Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <ShieldAlert className="h-3 w-3" /> Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                    {log.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
