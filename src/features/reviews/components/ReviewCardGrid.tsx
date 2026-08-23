"use client";

import { Review } from "../types";
import { usePublishReview, useRejectReview, useDeleteReview } from "../hooks/useReviews";
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, Calendar, MapPin, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface ReviewCardGridProps {
  data: Review[];
  isLoading: boolean;
}

export function ReviewCardGrid({ data, isLoading }: ReviewCardGridProps) {
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const publish = usePublishReview();
  const reject = useRejectReview();
  const deleteRev = useDeleteReview();

  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm flex items-center justify-center gap-2">
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-card border border-border/70 rounded-3xl p-8 shadow-xs">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground">{tReviews("noPending")}</h3>
        <p className="text-xs text-muted-foreground mt-1">{tReviews("noPendingDesc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((review) => {
        const tourTitle = typeof review.tour?.titleJsonb === "object"
          ? (review.tour?.titleJsonb?.[locale] || review.tour?.titleJsonb?.["en"] || review.tour?.titleJsonb?.["ar"] || review.tour?.slug)
          : review.tour?.slug || "Tour Experience";

        const isApproved = review.status === "APPROVED" || review.isPublished;

        return (
          <div 
            key={review.id}
            className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              {/* Header: User & Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-sm shrink-0">
                    {review.reviewerName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{review.reviewerName || "Dunas Guest"}</h4>
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
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 font-normal">
                "{review.comment || tReviews("noReviews")}"
              </p>

              {/* Admin reply if present */}
              {review.adminReply && (
                <div className="text-[11px] bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 p-2 rounded-xl flex items-start gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Official Reply:</span>
                    <span className="line-clamp-2">{review.adminReply}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
              <Badge 
                variant={isApproved ? "default" : "secondary"} 
                className={`text-[10px] font-bold ${isApproved ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"}`}
              >
                {isApproved ? tReviews("published") : tReviews("pending")}
              </Badge>

              <div className="flex items-center gap-1.5">
                {!isApproved ? (
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 rounded-lg px-2.5 cursor-pointer shadow-xs"
                    onClick={() => publish.mutate(review.id)}
                    disabled={publish.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{tReviews("publish")}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 rounded-lg px-2 cursor-pointer border-rose-500/30"
                    onClick={() => reject.mutate(review.id)}
                    disabled={reject.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{tReviews("reject")}</span>
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => {
                    if (confirm(`${tCommon("confirm")} ${tReviews("delete")}?`)) deleteRev.mutate(review.id);
                  }}
                  title={tReviews("delete")}
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
