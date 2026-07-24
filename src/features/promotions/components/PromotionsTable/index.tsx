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
}

export function PromotionsTable({ data, total, isLoading, filters, onFilterChange, onEdit, onDelete }: PromotionsTableProps) {
  const tPromotions = useTranslations("promotions");
  const tCommon = useTranslations("common");
  const columns = getColumns(onEdit, onDelete, tPromotions, tCommon);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800/50 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`${tCommon("search")}...`} 
            value={filters.search || ""}
            onChange={handleSearch}
            className="ps-9 h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground h-10">
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
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-gray-100 dark:border-gray-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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

      <div className="p-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
        <div className="text-xs text-muted-foreground">
          {data.length} {tCommon("total")}
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={(filters.page || 1) === 1}
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={(filters.page || 1) * (filters.limit || 10) >= total}
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
