"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Review } from "../../types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { usePublishReview, useDeleteReview } from "../../hooks/useReviews";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "tour",
    header: "Tour",
    cell: ({ row }) => (
      <div className="font-medium text-primary">
        {(row.original.tour as any)?.titleJsonb?.["en"] || (row.original as any).tourNameEn || (row.original.tour as any)?.title || "—"}
      </div>
    ),
  },
  {
    accessorKey: "reviewerName",
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.reviewerName || "Anonymous"}</span>
        {row.original.user && (
          <span className="text-xs text-muted-foreground dir-ltr text-start">{row.original.user.email}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-amber-500 dir-ltr inline-flex">
        <span className="font-semibold">{row.original.rating ?? 5}</span>
        <Star className="h-4 w-4 fill-amber-500" />
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-sm">
        {row.original.comment || "—"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      if (!val) return <div className="text-muted-foreground text-sm">—</div>;
      const d = new Date(val);
      return (
        <div className="text-muted-foreground text-sm">
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
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const tCommon = useTranslations("common");

  if (review.isPublished) {
    return <StatusBadge status="PUBLISHED" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 h-8"
        onClick={() => publishReview(review.id)}
        disabled={isPublishing || isDeleting}
      >
        <CheckCircle className="h-3.5 w-3.5 me-1" /> {tCommon("confirm")}
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        className="h-8"
        onClick={() => deleteReview(review.id)}
        disabled={isPublishing || isDeleting}
      >
        <XCircle className="h-3.5 w-3.5 me-1" /> {tCommon("delete")}
      </Button>
    </div>
  );
}
