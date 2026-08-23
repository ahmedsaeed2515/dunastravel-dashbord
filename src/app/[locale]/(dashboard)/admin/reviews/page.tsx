"use client";

import { useState } from "react";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { ReviewsTable } from "@/features/reviews/components/ReviewsTable";
import { ReviewCardGrid } from "@/features/reviews/components/ReviewCardGrid";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutGrid, Table as TableIcon, Star, CheckCircle2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export default function ReviewsPage() {
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");

  const [filterState, setFilterState] = useState<"pending" | "published" | "all">("pending");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Pending reviews
  const pendingQuery = useReviews({ status: "PENDING", limit: 50 });
  
  // Approved/Published reviews
  const publishedQuery = useReviews({ status: "APPROVED", limit: 50 });

  // All reviews
  const allQuery = useReviews({ limit: 50 });

  const { data: pendingData, isLoading: pendingLoading } = pendingQuery;
  const { data: publishedData, isLoading: publishedLoading } = publishedQuery;
  const { data: allData, isLoading: allLoading } = allQuery;

  if (pendingQuery.isError || publishedQuery.isError || allQuery.isError) {
    return (
      <QueryErrorState
        message="تعذر تحميل التقييمات من الباك إند."
        onRetry={() => void Promise.all([pendingQuery.refetch(), publishedQuery.refetch(), allQuery.refetch()])}
      />
    );
  }

  const pendingList = Array.isArray(pendingData) ? pendingData : ((pendingData as any)?.data || (pendingData as any)?.items || []);
  const publishedList = Array.isArray(publishedData) ? publishedData : ((publishedData as any)?.data || (publishedData as any)?.items || []);
  const allList = Array.isArray(allData) ? allData : ((allData as any)?.data || (allData as any)?.items || []);

  const currentData = filterState === "pending"
    ? pendingList
    : filterState === "published"
    ? publishedList
    : allList;

  const isLoading = filterState === "pending" 
    ? pendingLoading 
    : filterState === "published" 
    ? publishedLoading 
    : allLoading;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={tReviews("title")}
        description={tReviews("description")}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={filterState} className="w-full sm:w-auto" onValueChange={(val) => setFilterState(val as any)}>
          <TabsList className="grid grid-cols-3 w-[340px] bg-muted/60 p-1 border border-border/60">
            <TabsTrigger value="pending" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>{tReviews("pending")}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold font-mono">
                {pendingList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>{tReviews("approved")}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {publishedList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>{tReviews("all")}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold font-mono">
                {allList.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
          )}

          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 gap-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className={`h-8 px-3 rounded-lg text-xs gap-1.5 cursor-pointer ${viewMode === "grid" ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" : "text-muted-foreground"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{tReviews("cards")}</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              className={`h-8 px-3 rounded-lg text-xs gap-1.5 cursor-pointer ${viewMode === "table" ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" : "text-muted-foreground"}`}
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>{tReviews("table")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === "grid" ? (
        <ReviewCardGrid data={currentData} isLoading={isLoading} />
      ) : (
        <Card className="border-border/80 shadow-xs bg-card p-4 sm:p-6">
          <ReviewsTable data={currentData} isLoading={isLoading} />
        </Card>
      )}
    </div>
  );
}
