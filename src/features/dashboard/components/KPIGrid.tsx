"use client";

import { ExecutiveSummary } from "../types";
import { Card } from "@/components/ui/card";
import { 
  DollarSign,
  CalendarCheck,
  Map,
  MessageSquare,
  Bell
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

  const kpiCards = [
    {
      title: isAr ? "إجمالي الحجوزات" : "Total Bookings",
      value: bookings?.total ?? 0,
      badge: isAr ? "+12% هذا الشهر" : "+12% this month",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: CalendarCheck,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.bookings,
    },
    {
      title: isAr ? "إجمالي إيرادات الحجوزات" : "Gross Revenue",
      value: revenue?.grossRevenue == null ? '—' : `$${revenue.grossRevenue.toLocaleString()}`,
      badge: isAr ? "نمو متصاعد 📈" : "Upward Growth 📈",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: DollarSign,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      href: adminRoutes.bookings,
    },
    {
      title: isAr ? "إجمالي الرحلات النشطة" : "Active Tours",
      value: operational?.activeToursCount ?? 0,
      badge: isAr ? "مترجمة للغات الـ 5 🌐" : "Translated in 5 Languages 🌐",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: Map,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.tours,
    },
    {
      title: isAr ? "إشغال الرحلات" : "Tour Occupancy",
      value: capacity?.occupancyRate == null ? "—" : `${capacity.occupancyRate}%`,
      badge: isAr ? "المقاعد المباعة من السعة" : "Sold seats / total capacity",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      icon: Map,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
      href: adminRoutes.tours,
    },
    {
      title: isAr ? "استفسارات العملاء" : "Customer Inquiries",
      value: operational?.openInquiriesCount ?? 0,
      badge: isAr ? "غير مقروء 📩" : "Unread Messages 📩",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: MessageSquare,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      href: adminRoutes.communications,
    },
    {
      title: isAr ? "الإشعارات والتنبيهات" : "Notifications",
      value: operational?.failedNotificationsCount ?? 0,
      badge: isAr ? "فشل التسليم يحتاج متابعة" : "Delivery failures need review",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
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
