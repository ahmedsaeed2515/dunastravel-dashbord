"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar as CalendarIcon, Clock } from "lucide-react";
import { DashboardFilters } from "../types";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  filters,
  onFilterChange,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const handleRangeSelect = (preset: string) => {
    const now = new Date();
    let from = new Date();

    if (preset === "today") {
      from = new Date(now.setHours(0, 0, 0, 0));
    } else if (preset === "7d") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === "30d") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (preset === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    onFilterChange({
      ...filters,
      from: from.toISOString(),
      to: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive & Operations Command Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> Single Source of Truth • Real-Time Database Metrics (Timezone: UTC)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Date Range Buttons */}
        <div className="flex items-center bg-muted p-1 rounded-lg border text-xs">
          <button
            onClick={() => handleRangeSelect("7d")}
            className="px-2.5 py-1 rounded font-medium transition-colors hover:bg-background hover:shadow-sm"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleRangeSelect("30d")}
            className="px-2.5 py-1 rounded font-medium transition-colors bg-background shadow-sm text-primary"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleRangeSelect("month")}
            className="px-2.5 py-1 rounded font-medium transition-colors hover:bg-background hover:shadow-sm"
          >
            This Month
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>
    </div>
  );
}
