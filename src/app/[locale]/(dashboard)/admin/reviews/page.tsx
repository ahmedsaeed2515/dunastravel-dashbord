"use client";

import { useState } from "react";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { ReviewsTable } from "@/features/reviews/components/ReviewsTable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function ReviewsPage() {
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");

  const [filterState, setFilterState] = useState<"pending" | "published">("pending");
  
  // Pending reviews
  const { data: pendingData, isLoading: pendingLoading } = useReviews({ isPublished: false, limit: 100 });
  
  // Published reviews
  const { data: publishedData, isLoading: publishedLoading } = useReviews({ isPublished: true, limit: 100 });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tReviews("title")}
        description={tReviews("description")}
      />

      <Card className="border-border/80 shadow-xs bg-card p-4 sm:p-6">
        <Tabs defaultValue="pending" className="w-full" onValueChange={(val) => setFilterState(val as any)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-2 w-[280px] bg-muted/60 p-1 border border-border/60">
              <TabsTrigger value="pending" className="text-xs font-semibold">{tReviews("pending")}</TabsTrigger>
              <TabsTrigger value="published" className="text-xs font-semibold">{tReviews("approved")}</TabsTrigger>
            </TabsList>
            
            {(pendingLoading || publishedLoading) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="mt-2">
            {filterState === "pending" ? (
              <ReviewsTable data={pendingData?.data ?? []} isLoading={pendingLoading} />
            ) : (
              <ReviewsTable data={publishedData?.data ?? []} isLoading={publishedLoading} />
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
