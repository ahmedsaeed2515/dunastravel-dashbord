"use client";

import { ChartWrapper } from "@/components/shared/charts/ChartWrapper";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCharts() {
  // Using empty states because backend currently lacks timeseries endpoint
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <BeautifulEmptyState
            icon={BarChart3}
            title="No Analytics Data"
            description="Timeseries data for Revenue is pending backend implementation."
          />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Booking Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <BeautifulEmptyState
            icon={BarChart3}
            title="No Analytics Data"
            description="Timeseries data for Bookings is pending backend implementation."
          />
        </CardContent>
      </Card>
    </div>
  );
}
