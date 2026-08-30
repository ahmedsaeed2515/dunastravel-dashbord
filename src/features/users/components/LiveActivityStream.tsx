"use client";

import { useState } from "react";
import { useLiveActivityStream } from "../hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import {
  Activity,
  Search,
  RefreshCw,
  LogIn,
  CalendarCheck,
  HelpCircle,
  Star,
  ShieldCheck,
  ShieldAlert,
  Globe,
  User,
  Clock,
  Eye,
  Code,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export function LiveActivityStream() {
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");

  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);

  const { data, isLoading, isFetching, refetch } = useLiveActivityStream({
    page,
    limit: 25,
    category: category !== "ALL" ? category : undefined,
    search: search || undefined,
  });

  const getActionBadge = (action: string) => {
    if (action.includes("FAILED") || action.includes("SUSPEND")) {
      return {
        icon: ShieldAlert,
        variant: "destructive" as const,
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return {
        icon: LogIn,
        variant: "default" as const,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      };
    }
    if (action.includes("BOOKING")) {
      return {
        icon: CalendarCheck,
        variant: "outline" as const,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      };
    }
    if (action.includes("INQUIRY")) {
      return {
        icon: HelpCircle,
        variant: "secondary" as const,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    if (action.includes("REVIEW")) {
      return {
        icon: Star,
        variant: "outline" as const,
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
      };
    }
    return {
      icon: ShieldCheck,
      variant: "secondary" as const,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    };
  };

  const formatDateSafe = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return format(d, "yyyy-MM-dd HH:mm:ss");
    } catch {
      return "—";
    }
  };

  const formatRelativeSafe = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "";
    }
  };

  const items = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Header Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${tCommon("search")}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="ps-9 h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{tUsers("liveFeedActive")}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{tCommon("refresh")}</span>
          </Button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <Card className="border-border/80 shadow-xs bg-card overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/70 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                <span>{tUsers("liveActivityTitle")}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {tUsers("liveActivitySubtitle")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {data?.meta?.total ?? 0} {tUsers("events")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
              <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">{tUsers("noActivitiesFound")}</p>
              <p className="text-xs text-muted-foreground">{tUsers("noActivitiesDesc")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => {
                const badge = getActionBadge(item.action);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl border ${badge.color} shrink-0 mt-0.5 sm:mt-0`}>
                        <BadgeIcon className="h-4 w-4" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-foreground">
                            {item.action}
                          </span>
                          {item.actorRole && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                              {item.actorRole}
                            </Badge>
                          )}
                          {item.entityType && (
                            <span className="text-xs text-muted-foreground font-medium">
                              • {item.entityType} {item.entityId ? `#${item.entityId.slice(0, 8)}` : ""}
                            </span>
                          )}
                        </div>

                        {/* Actor info & IP */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {item.actor ? (
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <User className="h-3.5 w-3.5 text-amber-500" />
                              {item.actor.name} ({item.actor.email})
                            </span>
                          ) : item.actorId ? (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <User className="h-3 w-3" />
                              ID: {item.actorId.slice(0, 8)}
                            </span>
                          ) : null}

                          {item.ipAddress && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Globe className="h-3 w-3" />
                              {item.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp & Metadata View button */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <div className="text-end">
                        <div className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatRelativeSafe(item.createdAt)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {formatDateSafe(item.createdAt)}
                        </div>
                      </div>

                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs gap-1 font-medium"
                          onClick={() => setSelectedMeta(item.metadata)}
                        >
                          <Code className="h-3.5 w-3.5" />
                          <span>{tUsers("details")}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payload Metadata Inspector Modal */}
      <Dialog open={Boolean(selectedMeta)} onOpenChange={(open) => !open && setSelectedMeta(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Code className="h-4 w-4 text-amber-500" />
              <span>{tUsers("actionMetadata")}</span>
            </DialogTitle>
          </DialogHeader>
          <pre className="p-3 bg-muted/60 rounded-xl font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200 dir-ltr text-left">
            {JSON.stringify(selectedMeta, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
