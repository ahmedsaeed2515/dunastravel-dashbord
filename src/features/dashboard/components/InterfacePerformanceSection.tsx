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
  const locale = (params?.locale as string) || "en";

  if (isLoading || !interfaces) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Tour Interfaces Performance Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Landing Page Interfaces Performance ({interfaces.length} Interfaces)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interfaces.map((lp) => (
            <div key={lp.id} className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{lp.titleJsonb?.en || lp.slug}</h4>
                  <p className="text-xs font-mono text-muted-foreground">/{lp.slug}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{lp.type}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-muted/50 p-2 rounded-lg border">
                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" /> {lp.pageViews}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Views</div>
                </div>

                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <MousePointerClick className="w-3 h-3 text-amber-500" /> {lp.tourClicks}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Clicks</div>
                </div>

                <div>
                  <div className="font-semibold text-foreground flex items-center justify-center gap-1">
                    <CalendarCheck className="w-3 h-3 text-emerald-500" /> {lp.toursCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Tours</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
