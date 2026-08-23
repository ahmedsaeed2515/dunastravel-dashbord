"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Promotion, PromotionQueryFilters } from "../../types";
import { getColumns } from "./columns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

interface PromotionsTableProps {
  data: Promotion[];
  total: number;
  isLoading: boolean;
  filters: PromotionQueryFilters;
  onFilterChange: (newFilters: PromotionQueryFilters) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
  canManage: boolean;
}

export function PromotionsTable({ data, total, isLoading, filters, onFilterChange, onEdit, onDelete, canManage }: PromotionsTableProps) {
  const tPromotions = useTranslations("promotions");
  const tCommon = useTranslations("common");
  const columns = getColumns(onEdit, onDelete, tPromotions, tCommon, canManage);

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const effectiveTotal = total;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border/70 flex justify-between items-center gap-4 bg-muted/20">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`${tCommon("search")}...`} 
            value={filters.search || ""}
            onChange={handleSearch}
            className="ps-9 h-9 text-xs sm:text-sm bg-background border-border rounded-xl"
          />
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          {effectiveTotal} {tCommon("total")}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/70">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-muted-foreground h-11 px-4">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                    <span className="text-sm">{tCommon("loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/40 border-border/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 px-4 text-xs sm:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Tag className="h-10 w-10 mb-3 opacity-20" />
                    <span className="text-sm font-medium">{tPromotions("noPromotions")}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border/70 flex items-center justify-between bg-muted/20">
        <div className="text-xs text-muted-foreground font-mono">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 rounded-lg text-xs font-semibold gap-1"
            disabled={page <= 1}
            onClick={() => onFilterChange({ ...filters, page: page - 1 })}
          >
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>Previous</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 rounded-lg text-xs font-semibold gap-1"
            disabled={page >= totalPages}
            onClick={() => onFilterChange({ ...filters, page: page + 1 })}
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
