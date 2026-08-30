"use client";

import { memo } from "react";
import { useUserMonitoringOverview } from "../hooks/useUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  UserPlus,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

export const UserMonitoringMetricsBanner = memo(function UserMonitoringMetricsBanner() {
  const { data, isLoading } = useUserMonitoringOverview();
  const tUsers = useTranslations("users");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-card border border-border/80" />
        ))}
      </div>
    );
  }

  const metrics = data || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    vipUsers: 0,
    newUsers: { today: 0, last7Days: 0, last30Days: 0 },
    rolesDistribution: {},
    activityMetrics: { past24HoursEvents: 0, past24HoursLogins: 0 },
  };

  const cards = [
    {
      title: tUsers("totalUsers"),
      value: metrics.totalUsers,
      subtext: `${metrics.newUsers.last30Days} ${tUsers("newThisMonth")}`,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20",
    },
    {
      title: tUsers("activeUsers"),
      value: metrics.activeUsers,
      subtext: `${Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100)}% ${tUsers("ofTotal")}`,
      icon: UserCheck,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
    },
    {
      title: tUsers("suspendedUsers"),
      value: metrics.suspendedUsers,
      subtext: metrics.suspendedUsers > 0 ? tUsers("actionRequired") : tUsers("noSuspended"),
      icon: metrics.suspendedUsers > 0 ? ShieldAlert : UserX,
      color: metrics.suspendedUsers > 0 ? "text-red-500 dark:text-red-400" : "text-slate-400",
      bg: metrics.suspendedUsers > 0 ? "bg-red-500/10 dark:bg-red-500/15 border-red-500/20" : "bg-muted/40 border-border/80",
    },
    {
      title: tUsers("vipUsers"),
      value: metrics.vipUsers,
      subtext: tUsers("vipDescription"),
      icon: Crown,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    },
    {
      title: tUsers("registeredToday"),
      value: metrics.newUsers.today,
      subtext: `${metrics.newUsers.last7Days} ${tUsers("last7Days")}`,
      icon: UserPlus,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20",
    },
    {
      title: tUsers("past24HoursLogins"),
      value: metrics.activityMetrics.past24HoursLogins,
      subtext: `${metrics.activityMetrics.past24HoursEvents} ${tUsers("eventsCount")}`,
      icon: Activity,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs relative overflow-hidden group"
          >
            <CardContent className="p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground line-clamp-1">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.bg} ${card.color} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] font-medium text-muted-foreground line-clamp-1">
                  {card.subtext}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
