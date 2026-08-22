"use client";

import { Review } from "../types";
import { usePublishReview, useDeleteReview } from "../hooks/useReviews";
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReviewCardGridProps {
  data: Review[];
  isLoading: boolean;
}

export function ReviewCardGrid({ data, isLoading }: ReviewCardGridProps) {
  const publish = usePublishReview();
  const deleteRev = useDeleteReview();

  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        جاري تحميل تقييمات وآراء العملاء...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-card border rounded-2xl p-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground">لا توجد تقييمات في هذا القسم</h3>
        <p className="text-xs text-muted-foreground mt-1">سيتم عرض آراء العملاء الجديدة فور وصولها.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((review) => {
        const tourTitle = typeof review.tour?.titleJsonb === "object"
          ? (review.tour?.titleJsonb?.ar || review.tour?.titleJsonb?.en || review.tour?.slug)
          : review.tour?.slug || "رحلة عامة";

        return (
          <div 
            key={review.id}
            className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: User & Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-sm shrink-0">
                    {review.reviewerName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{review.reviewerName || "عميل Dunas"}</h4>
                    <span className="text-[11px] text-muted-foreground font-mono">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-xs">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span>{review.rating}</span>
                </div>
              </div>

              {/* Tour badge */}
              <div className="inline-block px-2.5 py-1 rounded-lg bg-secondary/80 text-[11px] font-medium text-foreground max-w-full truncate border border-border/60">
                🧭 {tourTitle}
              </div>

              {/* Comment text */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                "{review.comment || "لا يوجد تعليق نصي مكتوب."}"
              </p>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
              <Badge variant={review.isPublished ? "default" : "secondary"} className="text-[10px] font-bold">
                {review.isPublished ? "معتمد ومنشور" : "قيد المراجعة"}
              </Badge>

              <div className="flex items-center gap-1.5">
                {!review.isPublished ? (
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 rounded-lg px-2.5"
                    onClick={() => publish.mutate(review.id)}
                    disabled={publish.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>اعتماد ونشر</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 rounded-lg px-2"
                    onClick={() => deleteRev.mutate(review.id)}
                    disabled={deleteRev.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>حذف / إلغاء</span>
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("هل تريد حذف هذا التقييم نهائياً؟")) deleteRev.mutate(review.id);
                  }}
                  title="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
