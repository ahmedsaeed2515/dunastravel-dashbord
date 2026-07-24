"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingRowActions } from './BookingRowActions';
import { Booking } from "../../types";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export function getColumns(
  onView: (booking: Booking) => void,
  onEdit: (booking: Booking) => void,
  onDelete: (booking: Booking) => void,
  tBookings: (key: string) => string,
  tCommon: (key: string) => string
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
      header: tBookings("bookingId"),
      cell: ({ row }) => <div className="font-medium dir-ltr inline-block">{row.getValue("referenceCode")}</div>,
    },
    {
      accessorKey: "tourSlug",
      header: tBookings("tour"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.tourNameEn || row.original.tourSlug || "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "PENDING";
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "totalAmount",
      header: tCommon("amount"),
      cell: ({ row }) => {
        const rawAmount = row.getValue("totalAmount");
        const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "0"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.original.currency || "USD",
        }).format(isNaN(amount) ? 0 : amount);
        return <div className="font-medium dir-ltr inline-block">{formatted}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
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
