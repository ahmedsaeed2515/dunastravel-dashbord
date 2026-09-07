"use client";

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
}

export function InquiriesTable({ data, isLoading, pageCount, currentPage = 1, onPageChange }: InquiriesTableProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
