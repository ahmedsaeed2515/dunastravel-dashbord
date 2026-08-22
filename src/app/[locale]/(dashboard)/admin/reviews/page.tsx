"use client";

import { useState } from "react";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { ReviewsTable } from "@/features/reviews/components/ReviewsTable";
import { ReviewCardGrid } from "@/features/reviews/components/ReviewCardGrid";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutGrid, Table as TableIcon, Star, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ReviewsPage() {
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");

  const [filterState, setFilterState] = useState<"pending" | "published">("pending");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Pending reviews
  const { data: pendingData, isLoading: pendingLoading } = useReviews({ isPublished: false, limit: 100 });
  
  // Published reviews
  const { data: publishedData, isLoading: publishedLoading } = useReviews({ isPublished: true, limit: 100 });

  const currentData = filterState === "pending"
    ? (Array.isArray(pendingData) ? pendingData : (pendingData?.data || []))
    : (Array.isArray(publishedData) ? publishedData : (publishedData?.data || []));

  const isLoading = filterState === "pending" ? pendingLoading : publishedLoading;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={tReviews("title") || "التقييمات وآراء العملاء"}
        description={tReviews("description") || "إدارة واعتماد ومراجعة تقييمات العملاء لرحلات وتجارب Dunas Travel."}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs defaultValue="pending" className="w-full sm:w-auto" onValueChange={(val) => setFilterState(val as any)}>
          <TabsList className="grid grid-cols-2 w-[280px] bg-muted/60 p-1 border border-border/60">
            <TabsTrigger value="pending" className="text-xs font-semibold">
              {tReviews("pending") || "قيد المراجعة"}
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs font-semibold">
              {tReviews("approved") || "المعتمدة"}
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
              className={`h-8 px-3 rounded-lg text-xs gap-1.5 ${viewMode === "grid" ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" : "text-muted-foreground"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>بطاقات</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              className={`h-8 px-3 rounded-lg text-xs gap-1.5 ${viewMode === "table" ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" : "text-muted-foreground"}`}
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>جدول</span>
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
