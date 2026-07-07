"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reportsApi";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCharts() {
  const { data: bookingsTrend, isLoading } = useQuery({
    queryKey: ["reports", "bookings-trend"],
    queryFn: () => reportsApi.getBookingsTrend('monthly'),
  });

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
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : !bookingsTrend || bookingsTrend.length === 0 ? (
            <BeautifulEmptyState
              icon={BarChart3}
              title="No Analytics Data"
              description="No booking data available for this period."
            />
          ) : (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(30, 58, 138, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
