"use client";

import React from "react";
import { ExecutiveSummary } from "../types";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  CalendarCheck, 
  AlertCircle, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight
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
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const summaryData = (data as any)?.revenue ? data : (data as any)?.data || data;
  const revenue = summaryData?.revenue || {
    grossRevenue: 0,
    prevGrossRevenue: 0,
    revenueChangePercent: 0,
    collectedPayments: 0,
    prevCollectedPayments: 0,
    paymentsChangePercent: 0,
    outstandingBalance: 0,
  };
  const bookings = summaryData?.bookings || {
    total: 0,
    prevTotal: 0,
    changePercent: 0,
    byStatus: {},
  };
  const operational = summaryData?.operational || {
    activeToursCount: 0,
    openInquiriesCount: 0,
    unreadContactsCount: 0,
    failedNotificationsCount: 0,
  };

  const confirmedCount = 
    (bookings?.byStatus?.CONFIRMED || 0) + 
    (bookings?.byStatus?.PAID || 0) + 
    (bookings?.byStatus?.COMPLETED || 0);

  const pendingCount = bookings?.byStatus?.PENDING || 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const formatPercentBadge = (changePercent: number) => {
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;
    const absVal = Math.abs(changePercent).toFixed(1);

    if (isPositive) {
      return {
        text: `+${absVal}%`,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        Icon: TrendingUp,
      };
    }
    if (isNegative) {
      return {
        text: `-${absVal}%`,
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        Icon: TrendingDown,
      };
    }
    return {
      text: "0.0%",
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      Icon: TrendingUp,
    };
  };

  const revBadge = formatPercentBadge(revenue.paymentsChangePercent || revenue.revenueChangePercent || 0);
  const bookBadge = formatPercentBadge(bookings.changePercent || 0);

  const cards = [
    {
      id: "collected-revenue",
      title: isAr ? "المدفوعات المحصلة (Net Captured)" : "Collected Payments (Net)",
      value: formatCurrency(revenue.collectedPayments || 0),
      badge: revBadge.text,
      badgeColor: revBadge.color,
      BadgeIcon: revBadge.Icon,
      subtitle: isAr
        ? `إجمالي المبيعات: ${formatCurrency(revenue.grossRevenue || 0)}`
        : `Gross Volume: ${formatCurrency(revenue.grossRevenue || 0)}`,
      icon: DollarSign,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      href: adminRoutes.bookings,
    },
    {
      id: "confirmed-bookings",
      title: isAr ? "الحجوزات المؤكدة والمدفوعة" : "Confirmed & Paid Bookings",
      value: confirmedCount > 0 ? confirmedCount.toLocaleString() : (bookings.total || 0).toLocaleString(),
      badge: bookBadge.text,
      badgeColor: bookBadge.color,
      BadgeIcon: bookBadge.Icon,
      subtitle: isAr
        ? `${operational.activeToursCount || 0} برنامج سياحي نشط`
        : `${operational.activeToursCount || 0} active tour itineraries`,
      icon: CalendarCheck,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.bookings,
    },
    {
      id: "outstanding-balance",
      title: isAr ? "المبالغ المعلقة والتحصيل" : "Outstanding / Pipeline Balance",
      value: formatCurrency(revenue.outstandingBalance || 0),
      badge: isAr ? `${pendingCount} بانتظار التأكيد` : `${pendingCount} Pending Review`,
      badgeColor: pendingCount > 0 
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      BadgeIcon: AlertCircle,
      subtitle: isAr
        ? `أرصدة حجوزات مؤكدة وقيد المعالجة`
        : `Unsettled pipeline from confirmed bookings`,
      icon: AlertCircle,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      href: adminRoutes.bookings,
    },
    {
      id: "active-inquiries",
      title: isAr ? "الاستفسارات والطلبات النشطة" : "Active Inquiries & Leads",
      value: (operational.openInquiriesCount || 0).toLocaleString(),
      badge: isAr ? "تتطلب متابعة" : "Requires Action",
      badgeColor: operational.openInquiriesCount > 0
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      BadgeIcon: MessageSquare,
      subtitle: isAr
        ? `عملاء محتملون بانتظار عروض الأسعار`
        : `Prospective travelers awaiting custom quote`,
      icon: MessageSquare,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      href: adminRoutes.inquiries,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const BadgeIcon = card.BadgeIcon;
        return (
          <Link key={card.id} href={card.href} className="block group">
            <Card className="p-5 bg-card border border-border/80 shadow-xs hover:shadow-lg hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-200 rounded-2xl h-full flex flex-col justify-between">
              <div>
                {/* Header: Title & Icon */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-amber-500 transition-colors line-clamp-1">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl border ${card.iconBg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${card.iconColor} stroke-[2.2]`} />
                  </div>
                </div>

                {/* Primary Metric Value */}
                <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tracking-tight my-1">
                  {card.value}
                </div>
              </div>

              {/* Footer: Trend Badge & Subtitle */}
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border text-[11px] ${card.badgeColor}`}>
                  <BadgeIcon className="w-3 h-3 shrink-0" />
                  <span>{card.badge}</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[55%] text-end">
                  {card.subtitle}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
