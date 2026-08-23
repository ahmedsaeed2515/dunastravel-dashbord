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
  tCommon: (key: string) => string,
  canManage: boolean,
): ColumnDef<Booking>[] {
  const columns: ColumnDef<Booking>[] = [
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
        if (rawAmount === undefined || rawAmount === null || rawAmount === "" || !row.original.currency) {
          return <div className="font-medium">—</div>;
        }
        const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
        if (!Number.isFinite(amount)) return <div className="font-medium">—</div>;
        let formatted: string;
        try {
          formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: row.original.currency,
          }).format(amount);
        } catch {
          formatted = `${amount.toLocaleString("en-US")} ${row.original.currency}`;
        }
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
            canManage={canManage}
          />
        );
      },
    },
  ];
  return canManage ? columns : columns.filter((column) => column.id !== "select");
}
