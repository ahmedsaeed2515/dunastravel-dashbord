"use client";

import { ConversionFunnelData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { useParams } from "next/navigation";

interface ConversionFunnelCardProps {
  data?: ConversionFunnelData;
  isLoading?: boolean;
}

export function ConversionFunnelCard({ data, isLoading }: ConversionFunnelCardProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">{isAr ? "جاري تحميل قمع تحويل الزوار..." : "Website Conversion Funnel Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const stages = data?.stages ?? [];

  const stageTranslations: Record<string, string> = {
    'Website Visitors': 'زوار الموقع العام',
    'Tour Details Views': 'مشاهدة تفاصيل الرحلات',
    'Checkout Initiated': 'بدء إجراءات الحجز والدفع',
    'Confirmed Bookings': 'الحجوزات المؤكدة بنجاح',
    'Visitors': 'الزوار',
    'Tour Views': 'مشاهدات الرحلات',
    'Checkout': 'الدفع',
    'Bookings': 'الحجوزات',
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500" /> {isAr ? "قمع تحويل زوار الموقع إلى حجوزات" : "Website Visitor to Booking Funnel"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">{isAr ? "لا توجد بيانات مسجلة لقمع التحويل حالياً" : "No funnel data available"}</div>
        ) : (
          stages.map((stage, idx) => {
            const displayStage = isAr ? (stageTranslations[stage.stage] || stage.stage) : stage.stage;
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">{idx + 1}. {displayStage}</span>
                  <span className="font-mono text-muted-foreground">
                    {stage.count} ({stage.percent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(stage.percent, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
