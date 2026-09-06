"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import { useParams } from "next/navigation";

interface TrafficAnalyticsCardProps {
  data?: any;
  isLoading?: boolean;
}

export function TrafficAnalyticsCard({ data, isLoading }: TrafficAnalyticsCardProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">{isAr ? "جاري تحميل بيانات الأجهزة وحركة الزوار..." : "Traffic & Devices Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const rawDevices = data?.devices;
  let desktopVal = 0;
  let mobileVal = 0;
  let tabletVal = 0;

  if (Array.isArray(rawDevices)) {
    rawDevices.forEach((item: any) => {
      const devName = String(item.device || '').toLowerCase();
      const cnt = Number(item.count || 0);
      if (devName.includes('desktop')) desktopVal += cnt;
      else if (devName.includes('mobile')) mobileVal += cnt;
      else if (devName.includes('tablet')) tabletVal += cnt;
    });
  } else if (rawDevices && typeof rawDevices === 'object') {
    desktopVal = Number(rawDevices.desktop || 0);
    mobileVal = Number(rawDevices.mobile || 0);
    tabletVal = Number(rawDevices.tablet || 0);
  }

  const totalDevs = desktopVal + mobileVal + tabletVal || 1;
  const desktopPct = Math.round((desktopVal / totalDevs) * 100);
  const mobilePct = Math.round((mobileVal / totalDevs) * 100);
  const tabletPct = Math.round((tabletVal / totalDevs) * 100);

  const localesObj: Record<string, number> = data?.locales ?? {};

  const localeFlags: Record<string, string> = {
    ar: '🇸🇦 العربية',
    en: '🇬🇧 English',
    es: '🇪🇸 Español',
    pt: '🇵🇹 Português',
    it: '🇮🇹 Italiano',
  };

  const activeVisitors = Number(data?.activeVisitors ?? 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-500" /> {isAr ? "توزيع حركة الزوار ونوع الأجهزة" : "Device & Traffic Breakdown"}
        </CardTitle>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{activeVisitors} {isAr ? "زائر نشط الآن" : "Active Visitors Now"}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 border rounded-lg bg-card">
            <Monitor className="w-5 h-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{desktopPct}%</div>
            <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "كمبيوتر" : "Desktop"}</div>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <Smartphone className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <div className="text-lg font-bold">{mobilePct}%</div>
            <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "موبايل" : "Mobile"}</div>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <Tablet className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
            <div className="text-lg font-bold">{tabletPct}%</div>
            <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "تابلت" : "Tablet"}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">{isAr ? "أعلى لغات وتفضيلات الزوار تصفحاً:" : "Top Visitor Locales"}</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localesObj).length === 0 ? (
              <span className="text-xs text-muted-foreground font-medium">{isAr ? "لا توجد إحصائيات لغات مسجلة حالياً" : "No locale stats available"}</span>
            ) : (
              Object.entries(localesObj).map(([loc, count]) => (
                <span key={loc} className="text-xs px-2.5 py-1 rounded-xl bg-muted font-bold flex items-center gap-1 border border-border">
                  <span>{localeFlags[loc.toLowerCase()] || loc.toUpperCase()}:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{count}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
