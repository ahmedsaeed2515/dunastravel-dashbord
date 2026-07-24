"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";

interface TrafficAnalyticsCardProps {
  data?: any;
  isLoading?: boolean;
}

export function TrafficAnalyticsCard({ data, isLoading }: TrafficAnalyticsCardProps) {
  if (isLoading || !data) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Traffic & Devices Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const devices = data.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const totalDevs = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;

  const desktopPct = Math.round(((devices.desktop || 0) / totalDevs) * 100);
  const mobilePct = Math.round(((devices.mobile || 0) / totalDevs) * 100);
  const tabletPct = Math.round(((devices.tablet || 0) / totalDevs) * 100);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-500" /> Device & Traffic Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 border rounded-lg bg-card">
            <Monitor className="w-5 h-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{desktopPct}%</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Desktop</div>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <Smartphone className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <div className="text-lg font-bold">{mobilePct}%</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Mobile</div>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <Tablet className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
            <div className="text-lg font-bold">{tabletPct}%</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tablet</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Top Visitor Locales</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.locales || {}).map(([loc, count]: [string, any]) => (
              <span key={loc} className="text-xs px-2.5 py-1 rounded bg-muted font-mono uppercase font-semibold">
                {loc}: {count}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
