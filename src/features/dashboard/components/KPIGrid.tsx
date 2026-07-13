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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <StatisticCard
        title="Total Tours"
        value={data?.tours?.totalTours || 0}
        icon={<Ticket />} // Alternatively use a different icon if available, Map or similar
        description={`${data?.tours?.publishedTours || 0} published`}
      />
      <StatisticCard
        title="Total Bookings"
        value={data?.general?.totalBookings || 0}
        icon={<Ticket />}
        description={`${data?.general?.bookingsThisMonth || 0} this month`}
      />
      <StatisticCard
        title="Occupancy Rate"
        value={`${data?.tours?.occupancyRate || 0}%`}
        icon={<Users />}
        description={`${data?.tours?.totalCapacity || 0} total capacity`}
      />
      <StatisticCard
        title="Open Inquiries"
        value={data?.general?.openInquiries || 0}
        icon={<Users />}
        description={`Out of ${data?.general?.totalInquiries || 0} total`}
      />
      <StatisticCard
        title="Contact Requests"
        value={data?.general?.unreadContactSubmissions || 0}
        icon={<MessageSquareWarning />}
        description="Unread messages"
      />
      <StatisticCard
        title="Failed Logs"
        value={data?.general?.totalNotificationsFailed || 0}
        icon={<AlertOctagon />}
        description="Notification errors"
        trend={data?.general?.totalNotificationsFailed ? { value: 100, isPositive: false } : undefined}
      />
    </div>
  );
}
