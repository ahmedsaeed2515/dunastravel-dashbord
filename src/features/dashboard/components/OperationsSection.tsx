"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Timeline, TimelineItem } from "@/components/shared/ui/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AlertOctagon, MailWarning } from "lucide-react";
import { BeautifulEmptyState } from "@/components/shared/ui/BeautifulEmptyState";

export function OperationsSection() {
  const { data } = useDashboardMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Left Column - Recent Bookings Placeholder (Span 2) */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <BeautifulEmptyState
            icon={MailWarning}
            title="Pending Integration"
            description="Recent Bookings will be loaded here once the Bookings module is fully attached."
          />
        </CardContent>
      </Card>

      {/* Right Column - System Activity Timeline */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentFailedNotifications?.length ? (
            <Timeline>
              {data.recentFailedNotifications.map((log, idx) => (
                <TimelineItem
                  key={log.id}
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
              title="No Recent Activity"
              description="System logs and notifications will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
