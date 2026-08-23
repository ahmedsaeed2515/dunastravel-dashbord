"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Company } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Building2, Briefcase, Globe, Award } from "lucide-react";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

export const getColumns = (
  onView: (company: Company) => void,
  tCompanies: (key: string) => string,
  tCommon: (key: string) => string,
  tFinance: (key: string) => string,
  canManage: boolean,
): ColumnDef<Company>[] => {
 const columns: ColumnDef<Company>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() as boolean}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-gray-300 dark:border-gray-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-gray-300 dark:border-gray-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "referenceCode",
    header: "Ref Code",
    cell: ({ row }) => (
      <div className="font-semibold text-primary cursor-pointer hover:text-amber-500 transition-colors flex items-center gap-1.5 dir-ltr inline-flex" onClick={() => onView(row.original)}>
        {row.original.companyType === 'AGENCY' && <Briefcase className="h-3.5 w-3.5" />}
        {row.original.companyType === 'CORPORATE' && <Building2 className="h-3.5 w-3.5" />}
        {row.original.companyType === 'AFFILIATE' && <Globe className="h-3.5 w-3.5" />}
        <span>{row.getValue("referenceCode")}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: tCompanies("companyName"),
    cell: ({ row }) => {
      const isCorporate = row.original.companyType === 'CORPORATE';
      return (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
            {row.getValue("name")}
            {isCorporate && <span><Award className="h-3.5 w-3.5 text-amber-500" /></span>}
          </div>
          <span className="text-[11px] text-muted-foreground dir-ltr text-start">{row.original.email || '—'}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "companyType",
    header: tCommon("type"),
    cell: ({ row }) => {
      const type = row.getValue("companyType") as string;
      return (
        <Badge variant={type === "AGENCY" ? "default" : type === "CORPORATE" ? "secondary" : "outline"} className="text-[10px]">
          {type}
        </Badge>
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
    accessorKey: "commissionRate",
    header: tFinance("rate"),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100 dir-ltr inline-block">
        {row.getValue("commissionRate")}%
      </div>
    ),
  },
  {
    accessorKey: "currentBalance",
    header: () => <div className="text-end">{tFinance("outstandingBalance")}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("currentBalance") as string);
      const isOwed = amount > 0;
      return (
        <div className={`text-end font-medium dir-ltr inline-block ${isOwed ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: tCommon("options"),
    cell: ({ row }) => {
      const tags = row.original.tags || [];
      const segments = row.original.segments || [];
      const combined = [...segments, ...tags];
      if (combined.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
      
      return (
        <div className="flex flex-wrap gap-1">
          {combined.slice(0, 2).map((t, i) => (
            <Badge key={i} variant="outline" className="text-[9px] bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
              {t}
            </Badge>
          ))}
          {combined.length > 2 && (
            <Badge variant="outline" className="text-[9px] bg-gray-50 dark:bg-gray-900">
              +{combined.length - 2}
            </Badge>
          )}
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
          try { formatted = format(d, "MMM do, yyyy"); } catch {}
        }
      }
      return (
        <div className="text-xs text-muted-foreground">
          {formatted}
        </div>
      );
    },
  },
];
 return canManage ? columns : columns.filter((column) => column.id !== "select");
};
