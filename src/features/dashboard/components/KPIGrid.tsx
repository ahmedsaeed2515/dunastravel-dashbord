"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { StatisticCard } from "@/components/shared/widgets/StatisticCard";
import { Ticket, Users, MessageSquareWarning, AlertOctagon, DollarSign } from "lucide-react";
import { CardSkeleton } from "@/components/shared/ui/Skeletons";

export function KPIGrid() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  // Calculate trends gracefully if data is missing, we use stub trends since backend doesn't provide it yet
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      <StatisticCard
        title="Total Revenue"
        value="$--"
        icon={<DollarSign />}
        description="Pending backend integration"
      />
      <StatisticCard
        title="Total Bookings"
        value={data?.totalBookings || 0}
        icon={<Ticket />}
        description={`${data?.bookingsThisMonth || 0} this month`}
      />
      <StatisticCard
        title="Open Inquiries"
        value={data?.openInquiries || 0}
        icon={<Users />}
        description={`Out of ${data?.totalInquiries || 0} total`}
      />
      <StatisticCard
        title="Contact Requests"
        value={data?.unreadContactSubmissions || 0}
        icon={<MessageSquareWarning />}
        description="Unread messages"
      />
      <StatisticCard
        title="Failed Logs"
        value={data?.totalNotificationsFailed || 0}
        icon={<AlertOctagon />}
        description="Notification errors"
        trend={data?.totalNotificationsFailed ? { value: 100, isPositive: false } : undefined}
      />
    </div>
  );
}
