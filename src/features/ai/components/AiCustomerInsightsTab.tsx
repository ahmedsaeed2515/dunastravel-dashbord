"use client";

import { useAnalyzeCustomer } from "../hooks/useAi";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AiCustomerInsightsTabProps {
  customerId: string;
  customerName: string;
}

export function AiCustomerInsightsTab({ customerId, customerName }: AiCustomerInsightsTabProps) {
  const analyzeMutation = useAnalyzeCustomer();
  const data = analyzeMutation.data;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-indigo-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Claude AI CRM Strategist
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate hyper-personalized luxury travel recommendations based on {customerName}&apos;s history and notes.
            </p>
          </div>
          <Button 
            onClick={() => analyzeMutation.mutate(customerId)} 
            disabled={analyzeMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-105"
          >
            {analyzeMutation.isPending ? (
              "Analyzing profile..."
            ) : data ? (
              "Regenerate Analysis"
            ) : (
              "Run Deep Analysis ✨"
            )}
          </Button>
        </div>

        {analyzeMutation.isPending && (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full rounded-lg bg-indigo-500/5" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-lg bg-indigo-500/5" />
              <Skeleton className="h-32 w-full rounded-lg bg-indigo-500/5" />
            </div>
          </div>
        )}

        {data && !analyzeMutation.isPending && (
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-5 rounded-lg border border-white/20 dark:border-gray-800/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" /> Executive Summary
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {data.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destinations */}
              <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-5 rounded-lg border border-white/20 dark:border-gray-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Next Logical Destinations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.suggestedDestinations.map((dest, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Churn Risk */}
              <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/20 dark:border-gray-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> تقييم احتمالية فقدان العميل (Churn Risk)
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-playfair">{data.churnRisk}</span>
                  {data.churnRisk.toLowerCase().includes("high") && (
                    <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md">يتطلب تدخلاً فورياً من المبيعات ⚠️</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sales Strategy */}
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/20 dark:border-gray-800/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> استراتيجية المبيعات المقترحة بالذكاء الاصطناعي 💡
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
                &quot;{data.salesStrategy}&quot;
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
