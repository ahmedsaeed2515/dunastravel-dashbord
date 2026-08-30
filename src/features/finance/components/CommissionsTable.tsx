"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { Commission } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CommissionsTableProps {
  data: Commission[];
  isLoading: boolean;
  pageCount: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
}

export function CommissionsTable({
  data,
  isLoading,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
}: CommissionsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, pageCount);
  const page = Math.min(Math.max(1, currentPage), totalPages);

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
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-bold">
                جاري تحميل سجلات العمولات...
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
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-bold">
                لا توجد سجلات عمولات مسجلة حالياً.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-4 px-4 border-t text-xs">
        <div className="text-muted-foreground font-bold">
          إجمالي العمولات المعروضة: {data.length} عملية
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground ml-2">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={isLoading || page <= 1}
            className="rounded-xl font-bold cursor-pointer"
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={isLoading || page >= totalPages}
            className="rounded-xl font-bold cursor-pointer"
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
