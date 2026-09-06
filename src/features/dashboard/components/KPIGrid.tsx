"use client";

import { ExecutiveSummary } from "../types";
import { Card } from "@/components/ui/card";
import { 
  DollarSign,
  CalendarCheck,
  Map,
  MessageSquare,
  Bell,
  Users
} from "lucide-react";
import { CardSkeleton } from "@/components/shared/ui/Skeletons";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";

interface KPIGridProps {
  data?: ExecutiveSummary;
  isLoading?: boolean;
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const summaryData = data;
  const revenue = summaryData?.revenue;
  const bookings = summaryData?.bookings;
  const capacity = summaryData?.capacity;
  const operational = summaryData?.operational;

  const bookingsGrowth = bookings?.changePercent ?? 0;
  const revenueGrowth = revenue?.revenueChangePercent ?? 0;
  const totalCatalogTours = operational?.totalToursCount || 72;
  const seatsSold = capacity?.seatsSold ?? 0;
  const totalSeats = capacity?.totalCapacity ?? 0;
  const unreadMessages = operational?.unreadContactsCount ?? 0;
  const deliveryFailures = operational?.failedNotificationsCount ?? 0;
  const outstandingBal = Number(revenue?.outstandingBalance ?? 0);

  const kpiCards = [
    {
      title: isAr ? "إجمالي الحجوزات" : "Total Bookings",
      value: bookings?.total ?? 0,
      badge: `${bookingsGrowth >= 0 ? "+" : ""}${bookingsGrowth}% ${isAr ? "مقارنة بالفترة السابقة" : "vs prev period"}`,
      badgeColor: bookingsGrowth >= 0
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: CalendarCheck,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.bookings,
    },
    {
      title: isAr ? "إجمالي إيرادات الحجوزات" : "Gross Revenue",
      value: revenue?.grossRevenue == null ? '—' : `$${revenue.grossRevenue.toLocaleString()}`,
      badge: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% ${revenueGrowth >= 0 ? "نمو متصاعد 📈" : "تراجع 📉"}`,
      badgeColor: revenueGrowth >= 0
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: DollarSign,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      href: adminRoutes.bookings,
    },
    {
      title: isAr ? "إجمالي الرحلات النشطة" : "Active Tours",
      value: operational?.activeToursCount ?? 0,
      badge: isAr
        ? `${operational?.activeToursCount ?? 0} نشطة من ${totalCatalogTours} رحلة 🌐`
        : `${operational?.activeToursCount ?? 0} of ${totalCatalogTours} active 🌐`,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: Map,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.tours,
    },
    {
      title: isAr ? "استفسارات العملاء" : "Customer Inquiries",
      value: operational?.openInquiriesCount ?? 0,
      badge: isAr
        ? (unreadMessages > 0 ? `${unreadMessages} رسائل جديدة غير مقروءة 📩` : "جميع الرسائل مقروءة")
        : (unreadMessages > 0 ? `${unreadMessages} unread messages 📩` : "All messages read"),
      badgeColor: unreadMessages > 0
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        : "bg-muted text-muted-foreground border-border",
      icon: MessageSquare,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      href: adminRoutes.communications,
    },
    {
      title: isAr ? "الزوار النشطون الآن" : "Live Active Visitors",
      value: summaryData?.conversion?.activeVisitors ?? summaryData?.operational?.activeVisitors ?? 0,
      badge: isAr
        ? `🟢 نشط الآن (${summaryData?.conversion?.visitorViews ?? 0} إجمالي الزيارات)`
        : `🟢 Active now (${summaryData?.conversion?.visitorViews ?? 0} total views)`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold",
      icon: Users,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20 animate-pulse",
      href: adminRoutes.bookings,
    },
    {
      title: isAr ? "المبالغ المحصلة والمتبقية" : "Collected & Balance",
      value: revenue?.collectedPayments == null ? "—" : `$${revenue.collectedPayments.toLocaleString()}`,
      badge: isAr
        ? `$${outstandingBal.toLocaleString()} متبقي تحصيله`
        : `$${outstandingBal.toLocaleString()} outstanding`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: DollarSign,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      href: adminRoutes.finance.root,
    },
    {
      title: isAr ? "الإشعارات والتنبيهات" : "Notifications",
      value: deliveryFailures,
      badge: isAr
        ? (deliveryFailures > 0 ? `${deliveryFailures} فشل تسليم يحتاج متابعة` : "جميع الإشعارات سليمة")
        : (deliveryFailures > 0 ? `${deliveryFailures} delivery failures need review` : "All notifications healthy"),
      badgeColor: deliveryFailures > 0
        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        : "bg-muted text-muted-foreground border-border",
      icon: Bell,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      href: adminRoutes.notifications,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link key={idx} href={card.href} className="block group">
            <Card className="p-5.5 bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-full flex flex-col justify-between">
              <div>
                {/* Title */}
                <div className="mb-2">
                  <span className="text-xs sm:text-sm font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors leading-tight">
                    {card.title}
                  </span>
                </div>

                {/* Middle Row: Value on Right + Icon on Left at exact same level */}
                <div className="flex items-center justify-between gap-3 my-1">
                  <div className="text-3xl sm:text-4xl font-black font-mono text-foreground tracking-tight">
                    {card.value}
                  </div>

                  <div className={`p-3 rounded-2xl border ${card.iconBg} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xs flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${card.iconColor} stroke-[2.2]`} />
                  </div>
                </div>
              </div>

              {/* Subtitle Badge */}
              <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <span className="text-xs font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1">
                  {isAr ? "عرض ←" : "View →"}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
