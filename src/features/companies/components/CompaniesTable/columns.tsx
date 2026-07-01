"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Company } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Building2, Briefcase, Globe, Award } from "lucide-react";

export const getColumns = (onView: (company: Company) => void): ColumnDef<Company>[] => [
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
      <div className="font-semibold text-primary cursor-pointer hover:text-amber-500 transition-colors flex items-center gap-1.5" onClick={() => onView(row.original)}>
        {row.original.companyType === 'AGENCY' && <Briefcase className="h-3.5 w-3.5" />}
        {row.original.companyType === 'CORPORATE' && <Building2 className="h-3.5 w-3.5" />}
        {row.original.companyType === 'AFFILIATE' && <Globe className="h-3.5 w-3.5" />}
        <span>{row.getValue("referenceCode")}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Company Name",
    cell: ({ row }) => {
      const isCorporate = row.original.companyType === 'CORPORATE';
      return (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
            {row.getValue("name")}
            {isCorporate && <span><Award className="h-3.5 w-3.5 text-amber-500" /></span>}
          </div>
          <span className="text-[11px] text-muted-foreground">{row.original.email || 'No email provided'}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "companyType",
    header: "Type",
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
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusStyle = (s: string) => {
        switch (s) {
          case "ACTIVE": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
          case "INACTIVE": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
          case "BLACKLISTED": return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
          default: return "bg-gray-100 text-gray-800";
        }
      };
      return (
        <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${getStatusStyle(status)}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "commissionRate",
    header: "Commission",
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {row.getValue("commissionRate")}%
      </div>
    ),
  },
  {
    accessorKey: "currentBalance",
    header: () => <div className="text-right">Ledger Balance</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("currentBalance") as string);
      const isOwed = amount > 0;
      return (
        <div className={`text-right font-medium ${isOwed ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags & Segments",
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
    header: "Partner Since",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(row.getValue("createdAt")), "MMM do, yyyy")}
      </div>
    ),
  },
];
