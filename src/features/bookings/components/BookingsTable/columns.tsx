"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingRowActions } from './BookingRowActions';
import { Booking } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export function getColumns(
  onView: (booking: Booking) => void,
  onEdit: (booking: Booking) => void,
  onDelete: (booking: Booking) => void
): ColumnDef<Booking>[] {
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
      accessorKey: "referenceCode",
      header: "Ref Code",
      cell: ({ row }) => <div className="font-medium">{row.getValue("referenceCode")}</div>,
    },
    {
      accessorKey: "tourSlug",
      header: "Tour",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.tourNameEn || row.original.tourSlug || "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "PENDING";
        const variant = status === "CONFIRMED" || status === "COMPLETED" ? "default" : status === "PENDING" ? "secondary" : "destructive";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const rawAmount = row.getValue("totalAmount");
        const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "0"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.original.currency || "USD",
        }).format(isNaN(amount) ? 0 : amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        const val = row.getValue("createdAt");
        if (!val) return "—";
        const dateObj = new Date(val as string);
        return isNaN(dateObj.getTime()) ? "—" : format(dateObj, "MMM do, yyyy");
      },
      meta: { className: "hidden lg:table-cell" }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <BookingRowActions
            booking={row.original}

            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
