"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function getColumns(
  onEdit: (promotion: Promotion) => void,
  onDelete: (promotion: Promotion) => void
): ColumnDef<Promotion>[] {
  return [
    {
      accessorKey: "code",
      header: "Promo Code",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "discountPercent",
      header: "Discount (%)",
      cell: ({ row }) => <span>{row.original.discountPercent}%</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isExpired = new Date(row.original.validUntil) < new Date();
        const maxReached = row.original.currentUses >= row.original.maxUses;
        
        if (!isActive) return <Badge variant="secondary">Inactive</Badge>;
        if (isExpired) return <Badge variant="destructive">Expired</Badge>;
        if (maxReached) return <Badge variant="outline">Max Uses Reached</Badge>;
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
      },
    },
    {
      accessorKey: "usage",
      header: "Usage",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.currentUses} / {row.original.maxUses}
        </span>
      ),
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.validUntil), "MMM d, yyyy")}
        </span>
      ),
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
