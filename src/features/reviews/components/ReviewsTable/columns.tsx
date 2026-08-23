"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Review } from "../../types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle, XCircle, Star, Trash2 } from "lucide-react";
import { usePublishReview, useRejectReview, useDeleteReview } from "../../hooks/useReviews";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "tour",
    header: "Tour",
    cell: ({ row }) => {
      const tourTitle = typeof row.original.tour?.titleJsonb === "object"
        ? (row.original.tour?.titleJsonb?.["en"] || row.original.tour?.titleJsonb?.["ar"] || row.original.tour?.slug)
        : row.original.tour?.slug || "—";
      return (
        <div className="font-semibold text-xs max-w-[200px] truncate text-foreground">
          🧭 {tourTitle}
        </div>
      );
    },
  },
  {
    accessorKey: "reviewerName",
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-xs text-foreground">{row.original.reviewerName || "Anonymous Guest"}</span>
        {row.original.user && (
          <span className="text-[11px] text-muted-foreground dir-ltr text-start">{row.original.user.email}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-amber-500 dir-ltr inline-flex px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold">
        <span>{row.original.rating ?? 5}</span>
        <Star className="h-3 w-3 fill-amber-500" />
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-[320px] text-xs text-muted-foreground line-clamp-2">
        "{row.original.comment || "—"}"
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.original.status === "APPROVED" || row.original.isPublished;
      return (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${isApproved ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"}`}>
          {isApproved ? "APPROVED" : "PENDING"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      if (!val) return <div className="text-muted-foreground text-xs font-mono">—</div>;
      const d = new Date(val);
      return (
        <div className="text-muted-foreground text-xs font-mono">
          {isNaN(d.getTime()) ? "—" : format(d, "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell review={row.original} />,
  },
];

function ActionCell({ review }: { review: Review }) {
  const { mutate: publishReview, isPending: isPublishing } = usePublishReview();
  const { mutate: rejectReview, isPending: isRejecting } = useRejectReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const tCommon = useTranslations("common");
  const isApproved = review.status === "APPROVED" || review.isPublished;

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {!isApproved ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 h-7 text-xs px-2 cursor-pointer font-semibold"
          onClick={() => publishReview(review.id)}
          disabled={isPublishing || isDeleting}
        >
          <CheckCircle className="h-3 w-3 me-1" /> Approve
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-rose-500/40 text-rose-500 hover:bg-rose-500/10 h-7 text-xs px-2 cursor-pointer font-semibold"
          onClick={() => rejectReview(review.id)}
          disabled={isRejecting || isDeleting}
        >
          <XCircle className="h-3 w-3 me-1" /> Unpublish
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        onClick={() => {
          if (confirm(`${tCommon("confirm")} ${tCommon("delete")}?`)) deleteReview(review.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
