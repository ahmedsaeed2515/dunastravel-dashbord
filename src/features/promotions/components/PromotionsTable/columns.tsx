"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "../../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

export function getColumns(
  onEdit: (promotion: Promotion) => void,
  onDelete: (promotion: Promotion) => void,
  tPromotions: (key: string) => string,
  tCommon: (key: string) => string
): ColumnDef<Promotion>[] {
  return [
    {
      accessorKey: "code",
      header: tPromotions("promoCode"),
      cell: ({ row }) => (
        <span className="font-semibold text-primary dir-ltr inline-block font-mono">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "discountPercent",
      header: tPromotions("discountValue"),
      cell: ({ row }) => <span className="dir-ltr inline-block">{row.original.discountPercent}%</span>,
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isExpired = new Date(row.original.validUntil) < new Date();
        const maxReached = row.original.currentUses >= row.original.maxUses;
        
        let status = "ACTIVE";
        if (!isActive) status = "INACTIVE";
        else if (isExpired) status = "EXPIRED";
        else if (maxReached) status = "COMPLETED";

        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "usage",
      header: tPromotions("usedCount"),
      cell: ({ row }) => (
        <span className="text-muted-foreground dir-ltr inline-block font-mono">
          {row.original.currentUses} / {row.original.maxUses}
        </span>
      ),
    },
    {
      accessorKey: "validUntil",
      header: tPromotions("validUntil"),
      cell: ({ row }) => {
        let formatted = "—";
        if (row.original.validUntil) {
          const d = new Date(row.original.validUntil);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "MMM d, yyyy"); } catch {}
          }
        }
        return <span className="text-muted-foreground">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
