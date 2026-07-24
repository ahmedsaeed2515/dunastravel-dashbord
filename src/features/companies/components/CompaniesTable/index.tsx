"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Company, CompanyQueryFilters } from "../../types";
import { getColumns } from "./columns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight, Loader2, Building2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useBulkUpdateCompanies } from "../../hooks/useCompanies";
import { companiesApi } from "../../api/companiesApi";
import { useTranslations } from "next-intl";

interface CompaniesTableProps {
  data: Company[];
  total: number;
  isLoading: boolean;
  filters: CompanyQueryFilters;
  onFilterChange: (newFilters: CompanyQueryFilters) => void;
  onViewCompany: (company: Company) => void;
}

export function CompaniesTable({ data, total, isLoading, filters, onFilterChange, onViewCompany }: CompaniesTableProps) {
  const tCompanies = useTranslations("companies");
  const tCommon = useTranslations("common");
  const tFinance = useTranslations("finance");

  const [rowSelection, setRowSelection] = useState({});
  const columns = getColumns(onViewCompany, tCompanies, tCommon, tFinance);
  const { mutate: bulkUpdate, isPending: isUpdating } = useBulkUpdateCompanies();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(r => r.original.id);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleBulkStatus = (status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED') => {
    if (selectedIds.length === 0) return;
    bulkUpdate({ companyIds: selectedIds, status });
    setRowSelection({});
  };

  const handleExport = () => {
    window.location.href = companiesApi.exportCsvUrl(filters);
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800/50 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`${tCommon("search")}...`} 
            value={filters.search || ""}
            onChange={handleSearch}
            className="ps-9 h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger type="button" className="h-9 font-medium text-primary inline-flex items-center justify-center rounded-md text-sm px-3 shadow-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 me-2 animate-spin" /> : null}
                {tCommon("actions")} ({selectedIds.length})
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{tCommon("status")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleBulkStatus('ACTIVE')}>Set as Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatus('INACTIVE')}>Set as Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatus('BLACKLISTED')} className="text-rose-600">Blacklist</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              <span>{tCommon("exportCsv")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
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
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-gray-100 dark:border-gray-800/50 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('button') && !target.closest('input')) {
                      onViewCompany(row.original);
                    }
                  }}
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
                    <Building2 className="h-10 w-10 mb-3 opacity-20" />
                    <span className="text-sm font-medium">{tCompanies("noCompanies")}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
        <div className="text-xs text-muted-foreground">
          {data.length} {tCommon("total")}
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={filters.page === 1}
            onClick={() => onFilterChange({ ...filters, page: filters.page! - 1 })}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={filters.page! * filters.limit! >= total}
            onClick={() => onFilterChange({ ...filters, page: filters.page! + 1 })}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
