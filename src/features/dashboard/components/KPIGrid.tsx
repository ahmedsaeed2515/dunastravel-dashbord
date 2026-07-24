"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { StatisticCard } from "@/components/shared/widgets/StatisticCard";
import { Compass, CalendarCheck, Percent, MessageSquare, Mail, AlertOctagon } from "lucide-react";
import { CardSkeleton } from "@/components/shared/ui/Skeletons";
import { useTranslations } from "next-intl";

export function KPIGrid() {
  const { data, isLoading } = useDashboardMetrics();
  const tDashboard = useTranslations("dashboard");

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
        title={tDashboard("totalTours")}
        value={data?.tours?.totalTours || 0}
        icon={<Compass className="w-4 h-4" />}
        description={`${data?.tours?.publishedTours || 0} ${tDashboard("publishedTours")}`}
      />
      <StatisticCard
        title={tDashboard("totalBookings")}
        value={data?.general?.totalBookings || 0}
        icon={<CalendarCheck className="w-4 h-4" />}
        description={`${data?.general?.bookingsThisMonth || 0} ${tDashboard("thisMonth")}`}
        variant="gold"
      />
      <StatisticCard
        title={tDashboard("occupancyRate")}
        value={`${data?.tours?.occupancyRate || 0}%`}
        icon={<Percent className="w-4 h-4" />}
        description={`${data?.tours?.totalCapacity || 0} ${tDashboard("capacity")}`}
        variant="success"
      />
      <StatisticCard
        title={tDashboard("openInquiries")}
        value={data?.general?.openInquiries || 0}
        icon={<MessageSquare className="w-4 h-4" />}
        description={tDashboard("outOfTotal", { total: data?.general?.totalInquiries || 0 })}
      />
      <StatisticCard
        title={tDashboard("contactInbox")}
        value={data?.general?.unreadContactSubmissions || 0}
        icon={<Mail className="w-4 h-4" />}
        description={tDashboard("unreadMessages", { defaultValue: "Unread messages" })}
      />
      <StatisticCard
        title={tDashboard("failedLogs")}
        value={data?.general?.totalNotificationsFailed || 0}
        icon={<AlertOctagon className="w-4 h-4" />}
        description={tDashboard("deliveryFailures", { defaultValue: "Delivery failures" })}
        variant={data?.general?.totalNotificationsFailed ? "danger" : "default"}
      />
    </div>
  );
}
