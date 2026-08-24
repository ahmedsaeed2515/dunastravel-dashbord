"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Timeline, TimelineItem } from "@/components/shared/ui/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, MailWarning } from "lucide-react";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";
import { useTranslations } from "next-intl";

export function OperationsSection() {
  const { data } = useDashboardMetrics();
  const tDashboard = useTranslations("dashboard");
  const failedNotificationsCount = data?.general.operational.failedNotificationsCount ?? 0;

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
          {failedNotificationsCount > 0 ? (
            <Timeline>
              <TimelineItem
                icon={<AlertOctagon className="w-4 h-4 text-destructive" />}
                title="Failed notifications"
                description={`${failedNotificationsCount} notification delivery failure${failedNotificationsCount === 1 ? "" : "s"} require attention.`}
                time="Current"
              />
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
