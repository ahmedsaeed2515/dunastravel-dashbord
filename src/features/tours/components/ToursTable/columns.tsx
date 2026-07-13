"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { TourRowActions } from "./TourRowActions";

export function getColumns(
  onView: (tour: Tour) => void,
  onEdit: (tour: Tour) => void,
  onDelete: (tour: Tour) => void
): ColumnDef<Tour>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "slug",
      header: "Tour Slug / Code",
      cell: ({ row }) => <div className="font-mono font-semibold text-primary">{row.getValue("slug")}</div>,
    },
    {
      accessorKey: "titleJsonb",
      header: "Tour Title",
      cell: ({ row }) => {
        const titleObj: any = row.getValue("titleJsonb") || {};
        const title = titleObj["en"] || row.original.slug;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {row.original.isFeatured && (
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal uppercase tracking-wider text-xs">
          {row.getValue("category") || "Uncategorized"}
        </Badge>
      ),
      meta: { className: "hidden lg:table-cell" }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "PUBLISHED" ? "default" : status === "DRAFT" ? "secondary" : "destructive";
        return <Badge variant={variant} className="font-semibold">{status}</Badge>;
      },
    },
    {
      accessorKey: "basePriceUsd",
      header: "Base Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("basePriceUsd") || "0");
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-semibold text-foreground">{formatted}</div>;
      },
    },
    {
      accessorKey: "remainingSeats",
      header: "Occupancy",
      cell: ({ row }) => {
        const remaining = row.original.remainingSeats || 0;
        const capacity = row.original.capacity || 0;
        const sold = capacity - remaining;
        const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
        return (
          <div className="text-sm">
            <span className="font-medium">{sold}/{capacity}</span> 
            <span className="text-muted-foreground ml-1.5">({percent}%)</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.getValue("createdAt")), "MMM do, yyyy")}</span>,
      meta: { className: "hidden lg:table-cell" }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <TourRowActions
            tour={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
