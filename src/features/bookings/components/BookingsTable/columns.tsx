"use client";

import { ColumnDef } from "@tanstack/react-table";
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
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "CONFIRMED" ? "default" : status === "PENDING" ? "secondary" : "destructive";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM do, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        // Dynamic import to avoid circular dependency in columns definition
        const { BookingRowActions } = require("./BookingRowActions");
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
