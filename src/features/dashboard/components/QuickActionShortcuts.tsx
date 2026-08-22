"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Compass, Hotel, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { adminRoutes } from "@/config/admin-routes";

export function QuickActionShortcuts() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isRtl = locale === "ar";

  const cards = [
    {
      title: isRtl ? "إدارة الرحلات والبرامج" : "Tours & Itineraries",
      desc: isRtl ? "إدراج رحلات جديدة، تعديل الأسعار، وتخصيص البرنامج اليومي المفصل والصور." : "Create new tours, adjust pricing, manage daily itineraries and multi-media galleries.",
      icon: Compass,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      btnText: isRtl ? "إدارة الرحلات ←" : "Manage Tours →",
      href: `/${locale}${adminRoutes.tours}`,
    },
    {
      title: isRtl ? "الفنادق وأسطول النقل" : "Hotels & Fleet",
      desc: isRtl ? "الإشراف على الفنادق المعتمدة، تصنيف النجوم، وأسطول حافلات وسيارات Dunas Travel." : "Oversee verified 5-star hotels, room rates, and the modern Dunas Travel fleet.",
      icon: Hotel,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      btnText: isRtl ? "الفنادق والأسطول ←" : "Hotels & Fleet →",
      href: `/${locale}${adminRoutes.hotels}`,
    },
    {
      title: isRtl ? "تقييمات وآراء العملاء" : "Customer Reviews",
      desc: isRtl ? "استعراض ومراجعة تقييمات العملاء، اعتماد التعليقات، وإبراز الآراء المميزة." : "Review visitor feedback, approve verified testimonials, and feature top customer ratings.",
      icon: Star,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      btnText: isRtl ? "إدارة التقييمات ←" : "Manage Reviews →",
      href: `/${locale}${adminRoutes.reviews}`,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
              <Link
                href={card.href}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>{card.btnText}</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
