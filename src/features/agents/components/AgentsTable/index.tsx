"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Agent, AgentQueryFilters } from "../../types";
import { getColumns } from "./columns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";

interface AgentsTableProps {
  data: Agent[];
  total: number;
  isLoading: boolean;
  filters: AgentQueryFilters;
  onFilterChange: (newFilters: AgentQueryFilters) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentsTable({ data, total, isLoading, filters, onFilterChange, onEdit, onDelete }: AgentsTableProps) {
  const columns = getColumns(onEdit, onDelete);

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search agents..." 
            value={filters.search || ""}
            onChange={handleSearch}
            className="pl-9 h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
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
                    <span className="text-sm">Loading agents...</span>
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
                    <User className="h-10 w-10 mb-3 opacity-20" />
                    <span className="text-sm font-medium">No agents found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-gray-900 dark:text-gray-100">{data.length > 0 ? ((filters.page || 1) - 1) * (filters.limit || 10) + 1 : 0}</span> to <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min((filters.page || 1) * (filters.limit || 10), total)}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{total}</span> agents
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={(filters.page || 1) === 1}
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={(filters.page || 1) * (filters.limit || 10) >= total}
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
