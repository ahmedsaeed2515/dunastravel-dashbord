"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Crown, AlertTriangle, Star, Mail, Phone } from "lucide-react";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { CustomerRowActions } from "./CustomerRowActions";

export function getColumns(
  onView: (customer: Customer) => void,
  onEdit: (customer: Customer) => void,
  onToggleVip: (customer: Customer) => void,
  onToggleStatus: (customer: Customer) => void,
  tCustomers: (key: string) => string,
  tCommon: (key: string) => string
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
      header: "ID",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div
            className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 cursor-pointer dir-ltr inline-flex"
            onClick={() => onView(customer)}
          >
            #{customer.customerNumber || customer.id.slice(0, 8)}
            {customer.isVip && (
              <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: tCustomers("customerName"),
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onView(customer)}
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-sm shrink-0 group-hover:scale-105 transition-transform">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors truncate">
                {customer.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate dir-ltr text-start">
                {customer.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      id: "segmentation",
      header: tCommon("category"),
      cell: ({ row }) => {
        const segments = row.original.segments || [];
        const tags = row.original.tags || [];
        const combined = [...segments, ...tags];
        if (combined.length === 0) return <span className="text-xs text-muted-foreground/60">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {combined.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-muted/40 font-medium">
                #{tag}
              </Badge>
            ))}
            {combined.length > 2 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                +{combined.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalSpent",
      header: tCustomers("totalSpent"),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalSpent")) || 0;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-mono font-bold text-sm text-foreground dir-ltr inline-block">{formatted}</div>;
      },
    },
    {
      accessorKey: "outstandingBalance",
      header: tCommon("total"),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("outstandingBalance")) || 0;
        if (amount <= 0) return <span className="text-xs text-muted-foreground font-mono dir-ltr inline-block">$0.00</span>;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return (
          <div className="font-mono font-bold text-xs text-rose-500 flex items-center gap-1 dir-ltr inline-flex bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        let formatted = "—";
        if (val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "yyyy-MM-dd"); } catch {}
          }
        }
        return <span className="font-mono text-xs text-muted-foreground">{formatted}</span>;
      },
      meta: { className: "hidden lg:table-cell" },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <CustomerRowActions
            customer={row.original}
            onView={onView}
            onEdit={onEdit}
            onToggleVip={onToggleVip}
            onToggleStatus={onToggleStatus}
          />
        );
      },
    },
  ];
}
