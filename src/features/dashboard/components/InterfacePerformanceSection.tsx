"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InterfacePerformanceItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Eye, MousePointerClick, CalendarCheck, ExternalLink } from "lucide-react";

interface InterfacePerformanceSectionProps {
  interfaces?: InterfacePerformanceItem[];
  isLoading?: boolean;
}

export function InterfacePerformanceSection({ interfaces, isLoading }: InterfacePerformanceSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">{isAr ? "جاري تحميل أداء واجهات الهبوط..." : "Tour Interfaces Performance Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const interfaceList = interfaces ?? [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> {isAr ? `أداء صفحات وواجهات الهبوط (${interfaceList.length} واجهة)` : `Landing Page Interfaces Performance (${interfaceList.length} Interfaces)`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {interfaceList.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">{isAr ? "لا توجد سجلات أداء للواجهات حالياً" : "No interface performance records found"}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interfaceList.map((lp) => (
            <div key={lp.id} className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{isAr ? (lp.titleJsonb?.ar || lp.titleJsonb?.en || lp.slug) : (lp.titleJsonb?.en || lp.slug)}</h4>
                  <p className="text-xs font-mono text-muted-foreground">/{lp.slug}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{lp.type}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-muted/50 p-2 rounded-lg border">
                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" /> {lp.pageViews}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "مشاهدات" : "Views"}</div>
                </div>

                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <MousePointerClick className="w-3 h-3 text-amber-500" /> {lp.tourClicks}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "نقرات" : "Clicks"}</div>
                </div>

                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <CalendarCheck className="w-3 h-3 text-emerald-500" /> {lp.toursCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{isAr ? "رحلات" : "Tours"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
