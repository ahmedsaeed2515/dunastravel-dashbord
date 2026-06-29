"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star, AlertTriangle } from "lucide-react";

export function getColumns(
  onView: (customer: Customer) => void,
  onToggleVip: (customer: Customer) => void,
  onToggleStatus: (customer: Customer) => void
): ColumnDef<Customer>[] {
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
      accessorKey: "customerNumber",
      header: "Customer ID",
      cell: ({ row }) => (
        <div className="font-semibold text-primary flex items-center gap-1.5 cursor-pointer" onClick={() => onView(row.original)}>
          {row.getValue("customerNumber")}
          {row.original.isVip && (
            <span title="VIP Customer"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /></span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Customer Name",
      cell: ({ row }) => (
        <div className="cursor-pointer" onClick={() => onView(row.original)}>
          <div className="font-medium text-gray-900 dark:text-gray-100">{row.getValue("name")}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "ACTIVE" ? "default" : status === "INACTIVE" ? "secondary" : "destructive";
        return <Badge variant={variant} className="text-[10px] uppercase font-bold">{status}</Badge>;
      },
    },
    {
      id: "segmentation",
      header: "Segments & Tags",
      cell: ({ row }) => {
        const segments = row.original.segments || [];
        const tags = row.original.tags || [];
        const combined = [...segments, ...tags];
        if (combined.length === 0) return <span className="text-xs text-gray-400">No tags</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {combined.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-gray-50 dark:bg-gray-800">
                {tag}
              </Badge>
            ))}
            {combined.length > 2 && (
              <Badge variant="outline" className="text-[10px] text-gray-400">
                +{combined.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalSpent"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium text-gray-900 dark:text-gray-100">{formatted}</div>;
      },
    },
    {
      accessorKey: "outstandingBalance",
      header: "Outstanding",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("outstandingBalance"));
        if (amount <= 0) return <span className="text-xs text-gray-400">$0.00</span>;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return (
          <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registered Date",
      cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300">{format(new Date(row.getValue("createdAt")), "MMM do, yyyy")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { CustomerRowActions } = require("./CustomerRowActions");
        return (
          <CustomerRowActions
            customer={row.original}
            onView={onView}
            onToggleVip={onToggleVip}
            onToggleStatus={onToggleStatus}
          />
        );
      },
    },
  ];
}
