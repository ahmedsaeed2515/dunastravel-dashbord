"use client";

import { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { Inquiry } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { useLocale } from "next-intl";

interface InquiriesTableProps {
  data: Inquiry[];
  isLoading: boolean;
  pageCount: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
  highlightId?: string | null;
}

export function InquiriesTable({ data, isLoading, pageCount, currentPage = 1, onPageChange, highlightId }: InquiriesTableProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Auto-scroll to highlighted inquiry if matched
  useEffect(() => {
    if (highlightId && data.length > 0) {
      const normalized = highlightId.trim().toLowerCase();
      const match = data.find(
        (i) =>
          i.id.toLowerCase() === normalized ||
          i.referenceCode?.toLowerCase() === normalized ||
          i.referenceCode?.toLowerCase().includes(normalized)
      );
      if (match) {
        const rowId = `inquiry-row-${match.referenceCode || match.id}`;
        const timer = setTimeout(() => {
          const el = document.getElementById(rowId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightId, data]);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground font-medium">
                {isAr ? "جاري تحميل الطلبات والاستفسارات..." : "Loading inquiries..."}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const rowKey = row.original.referenceCode || row.original.id;
              const isHighlighted = Boolean(
                highlightId &&
                (row.original.id.toLowerCase() === highlightId.toLowerCase() ||
                 row.original.referenceCode?.toLowerCase() === highlightId.toLowerCase() ||
                 row.original.referenceCode?.toLowerCase().includes(highlightId.toLowerCase()))
              );

              return (
                <TableRow 
                  key={row.id}
                  id={`inquiry-row-${rowKey}`}
                  className={isHighlighted ? "notification-target-glow bg-amber-500/10 dark:bg-amber-500/20 ring-2 ring-amber-500/80 transition-all duration-300" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground font-medium">
                {isAr ? "لا توجد استفسارات مطابقة لخيارات البحث الحالية." : "No inquiries found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between py-4 px-4 border-t">
        <div className="text-xs text-muted-foreground font-medium">
          {isAr
            ? `صفحة ${currentPage} من ${Math.max(1, pageCount)}`
            : `Page ${currentPage} of ${Math.max(1, pageCount)}`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
            disabled={isLoading || currentPage <= 1}
            className="rounded-xl text-xs font-bold cursor-pointer"
          >
            {isAr ? "السابق" : "Previous"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLoading || currentPage >= pageCount}
            className="rounded-xl text-xs font-bold cursor-pointer"
          >
            {isAr ? "التالي" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
