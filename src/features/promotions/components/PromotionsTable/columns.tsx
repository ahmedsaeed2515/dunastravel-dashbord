"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "../../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { toast } from "sonner";

function CodeCell({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-amber-500 dark:text-amber-400 font-mono tracking-wider text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
        {code}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Copy coupon code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function getColumns(
  onEdit: (promotion: Promotion) => void,
  onDelete: (promotion: Promotion) => void,
  tPromotions: (key: string) => string,
  tCommon: (key: string) => string
): ColumnDef<Promotion>[] {
  return [
    {
      accessorKey: "code",
      header: tPromotions("promoCode"),
      cell: ({ row }) => <CodeCell code={row.original.code} />,
    },
    {
      accessorKey: "discountPercent",
      header: tPromotions("discountValue"),
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
          {row.original.discountPercent}% OFF
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isExpired = row.original.validUntil && new Date(row.original.validUntil) < new Date();
        const maxReached = row.original.currentUses >= row.original.maxUses;
        
        let status = "ACTIVE";
        if (!isActive) status = "INACTIVE";
        else if (isExpired) status = "EXPIRED";
        else if (maxReached) status = "COMPLETED";

        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "usage",
      header: tPromotions("usedCount"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="font-bold text-foreground">{row.original.currentUses}</span>
          <span className="text-border">/</span>
          <span>{row.original.maxUses}</span>
        </div>
      ),
    },
    {
      accessorKey: "validUntil",
      header: tPromotions("validUntil"),
      cell: ({ row }) => {
        let formatted = "—";
        if (row.original.validUntil) {
          const d = new Date(row.original.validUntil);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "MMM d, yyyy"); } catch {}
          }
        }
        return <span className="text-xs text-muted-foreground font-medium">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-400"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
              title="Edit coupon"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
              title="Delete coupon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
