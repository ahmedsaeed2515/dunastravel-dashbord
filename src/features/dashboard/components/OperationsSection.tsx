"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Timeline, TimelineItem } from "@/components/shared/ui/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AlertOctagon, MailWarning } from "lucide-react";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";
import { useTranslations } from "next-intl";

export function OperationsSection() {
  const { data } = useDashboardMetrics();
  const tDashboard = useTranslations("dashboard");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Left Column - Recent Bookings Placeholder (Span 2) */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>{tDashboard("recentBookings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BeautifulEmptyState
            icon={MailWarning}
            title={tDashboard("recentBookings")}
            description={tDashboard("recentBookingsDescription")}
          />
        </CardContent>
      </Card>

      {/* Right Column - System Activity Timeline */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{tDashboard("systemActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.general?.recentFailedNotifications?.length ? (
            <Timeline>
              {data.general.recentFailedNotifications.map((log: any, idx: number) => (
                <TimelineItem
                  key={log.id || idx}
                  icon={<AlertOctagon className="w-4 h-4 text-destructive" />}
                  title={`Failed: ${log.subject}`}
                  description={`Recipient: ${log.recipient}`}
                  time={formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                />
              ))}
            </Timeline>
          ) : (
            <BeautifulEmptyState
              icon={MailWarning}
              title={tDashboard("noRecentActivity")}
              description={tDashboard("activityLogsPlaceholder")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
