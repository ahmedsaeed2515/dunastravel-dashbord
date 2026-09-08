"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  renderToolbarActions?: (table: Table<TData>) => React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  renderToolbarActions,
}: DataTableToolbarProps<TData>) {
  const tCommon = useTranslations("common");
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchKey && (
          <Input
            aria-label={tCommon("searchTable")}
            placeholder={`${tCommon("search")}...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-37.5 lg:w-62.5"
          />
        )}
        {renderToolbarActions && renderToolbarActions(table)}
        {/* Additional Filters can be injected here */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {tCommon("reset")}
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
