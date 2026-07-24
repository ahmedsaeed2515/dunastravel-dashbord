"use client";

import { RevenueTrendItem, BookingsTrendItem } from "../types";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartsProps {
  revenueTrend?: RevenueTrendItem[];
  bookingsTrend?: BookingsTrendItem[];
  isLoadingRevenue?: boolean;
  isLoadingBookings?: boolean;
}

export function AnalyticsCharts({
  revenueTrend,
  bookingsTrend,
  isLoadingRevenue,
  isLoadingBookings,
}: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Revenue Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Gross & Collected Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRevenue ? (
            <Skeleton className="h-[280px] w-full" />
          ) : !revenueTrend || revenueTrend.length === 0 ? (
            <BeautifulEmptyState
              icon={BarChart3}
              title="No Revenue Data"
              description="No confirmed payments or bookings recorded in selected date range."
            />
          ) : (
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()} USD`, ""]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="grossRevenue" name="Gross Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Collected Payments" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Bookings Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Bookings Volume & Status Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <Skeleton className="h-[280px] w-full" />
          ) : !bookingsTrend || bookingsTrend.length === 0 ? (
            <BeautifulEmptyState
              icon={BarChart3}
              title="No Bookings Data"
              description="No bookings created in selected date range."
            />
          ) : (
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="confirmed" name="Confirmed / Paid" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
