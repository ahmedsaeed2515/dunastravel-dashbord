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

interface InquiriesTableProps {
  data: Inquiry[];
  isLoading: boolean;
  pageCount: number;
  currentPage?: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function InquiriesTable({ 
  data, 
  isLoading, 
  pageCount, 
  currentPage = 1, 
  total,
  onPageChange 
}: InquiriesTableProps) {
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
              <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                Loading inquiries...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                No inquiries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 border-t border-border/60 bg-card/30">
        <div className="text-xs text-muted-foreground font-mono">
          Page {currentPage} of {Math.max(1, pageCount)} {total !== undefined ? `(${total} total inquiries)` : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isLoading || currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLoading || currentPage >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
