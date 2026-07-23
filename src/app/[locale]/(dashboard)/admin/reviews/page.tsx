"use client";

import { useState } from "react";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { ReviewsTable } from "@/features/reviews/components/ReviewsTable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const [filterState, setFilterState] = useState<"pending" | "published">("pending");
  
  // Pending reviews
  const { data: pendingData, isLoading: pendingLoading } = useReviews({ isPublished: false, limit: 100 });
  
  // Published reviews
  const { data: publishedData, isLoading: publishedLoading } = useReviews({ isPublished: true, limit: 100 });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary">Review Moderation</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Approve or reject customer reviews before they appear on the public site.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6">
        <Tabs defaultValue="pending" className="w-full" onValueChange={(val) => setFilterState(val as any)}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-2 w-[300px]">
              <TabsTrigger value="pending">Pending Moderation</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            
            {(pendingLoading || publishedLoading) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="mt-4">
            {filterState === "pending" ? (
              <ReviewsTable data={Array.isArray(pendingData) ? pendingData : (pendingData?.data || [])} isLoading={pendingLoading} />
            ) : (
              <ReviewsTable data={Array.isArray(publishedData) ? publishedData : (publishedData?.data || [])} isLoading={publishedLoading} />
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
