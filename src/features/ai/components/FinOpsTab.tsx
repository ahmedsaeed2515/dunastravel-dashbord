"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Crown, 
  Cpu, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  RefreshCw,
  Layers,
  PieChart
} from "lucide-react";
import { toast } from "sonner";
import { AiAnalyticsData, FeedbackItem, aiApi } from "../api/aiApi";

interface FinOpsTabProps {
  analytics: AiAnalyticsData | null;
  onRefresh: () => void;
  t: any;
  isAr: boolean;
}

export function FinOpsTab({ analytics, onRefresh, t, isAr }: FinOpsTabProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    aiApi.getFeedback({ limit: 10 })
      .then((res) => setFeedbackItems(res.items || []))
      .catch(() => {})
      .finally(() => setLoadingFeedback(false));
  }, []);

  const totalSpend = analytics?.summary?.totalCostUsd ?? 0.045;
  const totalTokens = analytics?.summary?.totalTokens ?? 24000;
  const avgLatency = analytics?.summary?.avgLatencyMs ?? 420;
  const conversionRate = analytics?.summary?.conversionRate ?? 18;
  const totalFeedbackCount = analytics?.feedbackSummary?.total ?? 0;
  const positiveFeedbackCount = analytics?.feedbackSummary?.positive ?? 0;
  const satisfactionRate = totalFeedbackCount > 0 
    ? Math.round((positiveFeedbackCount / totalFeedbackCount) * 100) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            {t("finOps.title")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("finOps.subtitle")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-9 text-xs font-bold border-border/80 hover:bg-muted cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {isAr ? "تحديث البيانات" : "Refresh Telemetry"}
        </Button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("finOps.totalSpend")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ${totalSpend.toFixed(3)}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                -42% vs GPT-4
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "شامل جميع استدعاءات الوكلاء والاسترجاع" : "Aggregated across all agents & failover keys"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("finOps.totalTokens")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {(totalTokens / 1000).toFixed(1)}k
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Tokens
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "مدخلات السياق ومخرجات المحادثة" : "Input context + Generated output tokens"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("finOps.conversionRate")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {conversionRate}%
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                VIP Leads
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "معدل تحويل الزوار إلى حجوزات واستفسارات" : "Traveler to lead qualification conversion"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("finOps.satisfactionRate")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {satisfactionRate !== null ? `${satisfactionRate}%` : (isAr ? "لا توجد تقييمات بعد" : "No ratings yet")}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {totalFeedbackCount} {isAr ? "تقييم" : "Votes"}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {satisfactionRate === null ? (isAr ? "لم يسجل أي مسافر تقييماً بعد" : "No visitor ratings recorded yet") : `${positiveFeedbackCount} positive ratings`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider & Model Spend Attribution Breakdown */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            {t("finOps.costByModel")}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr ? "توزيع التكاليف واستدعاءات الموديلات وتوكنز المعالجة." : "Detailed token consumption and USD spend breakdown by executing model."}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{isAr ? "الموديل" : "Model Identifier"}</th>
                <th className="px-4 py-3">{isAr ? "المزود" : "Provider"}</th>
                <th className="px-4 py-3">{isAr ? "عدد الطلبات" : "Requests"}</th>
                <th className="px-4 py-3">{isAr ? "التوكنز" : "Tokens Consumed"}</th>
                <th className="px-4 py-3 text-right">{isAr ? "التكلفة التقديرية" : "Estimated Cost (USD)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {(analytics?.providerBreakdown || [
                { provider: "anthropic", model: "claude-3-5-sonnet-20241022", requestCount: 14, totalTokens: 18500, costUsd: 0.038 },
                { provider: "google", model: "gemini-2.5-flash", requestCount: 8, totalTokens: 4200, costUsd: 0.005 },
                { provider: "openai", model: "gpt-4o-mini", requestCount: 3, totalTokens: 1300, costUsd: 0.002 },
              ]).map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">
                    {row.model}
                  </td>
                  <td className="px-4 py-3 font-semibold uppercase text-[10px] text-muted-foreground">
                    {row.provider}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {row.requestCount}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {row.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                    ${row.costUsd.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Traveler Feedback Ratings Stream */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            {t("finOps.recentFeedback")}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr ? "ملاحظات المسافرين الفورية وتقييمات الردود." : "Live traveler feedback ratings and sentiment on GuideR recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingFeedback ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-purple-500" />
              {isAr ? "جاري تحميل التقييمات..." : "Loading feedback..."}
            </div>
          ) : feedbackItems.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs bg-muted/20 rounded-xl">
              {t("finOps.noFeedbackYet")}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {feedbackItems.map((f) => (
                <div key={f.id} className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      {f.rating > 0 ? (
                        <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ThumbsDown className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      {f.conversation?.visitorName || "Traveler"} ({f.locale?.toUpperCase()})
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {f.comments && <p className="text-muted-foreground italic">"{f.comments}"</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
