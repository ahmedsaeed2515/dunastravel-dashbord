"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { StatisticCard } from "@/components/shared/widgets/StatisticCard";
import { Compass, CalendarCheck, Percent, MessageSquare, Mail, AlertOctagon } from "lucide-react";
import { CardSkeleton } from "@/components/shared/ui/Skeletons";

export function KPIGrid() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <StatisticCard
        title="Total Tours"
        value={data?.tours?.totalTours || 0}
        icon={<Compass className="w-4 h-4" />}
        description={`${data?.tours?.publishedTours || 0} published`}
      />
      <StatisticCard
        title="Total Bookings"
        value={data?.general?.totalBookings || 0}
        icon={<CalendarCheck className="w-4 h-4" />}
        description={`${data?.general?.bookingsThisMonth || 0} this month`}
        variant="gold"
      />
      <StatisticCard
        title="Occupancy Rate"
        value={`${data?.tours?.occupancyRate || 0}%`}
        icon={<Percent className="w-4 h-4" />}
        description={`${data?.tours?.totalCapacity || 0} capacity`}
        variant="success"
      />
      <StatisticCard
        title="Open Inquiries"
        value={data?.general?.openInquiries || 0}
        icon={<MessageSquare className="w-4 h-4" />}
        description={`Out of ${data?.general?.totalInquiries || 0} total`}
      />
      <StatisticCard
        title="Contact Inbox"
        value={data?.general?.unreadContactSubmissions || 0}
        icon={<Mail className="w-4 h-4" />}
        description="Unread messages"
      />
      <StatisticCard
        title="Failed Logs"
        value={data?.general?.totalNotificationsFailed || 0}
        icon={<AlertOctagon className="w-4 h-4" />}
        description="Delivery failures"
        variant={data?.general?.totalNotificationsFailed ? "danger" : "default"}
      />
    </div>
  );
}
