"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
  key: string;
  label: string;
  type: "select" | "date-range" | "search";
  options?: { label: string; value: string }[];
}

interface FilterEngineProps {
  filters: FilterOption[];
  onFilterChange: (filters: Record<string, any>) => void;
}

export function FilterEngine({ filters, onFilterChange }: FilterEngineProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilter("search", e.target.value);
            }}
            className="pl-9 bg-background shadow-sm"
          />
        </div>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" className="shadow-sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {Object.keys(activeFilters).length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1 rounded-sm">
                  {Object.keys(activeFilters).length}
                </Badge>
              )}
            </Button>
          } />
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Filter Results</h4>
              {/* Render dynamic filters here based on `filters` prop */}
              <div className="text-sm text-muted-foreground">Advanced filters scaffolding...</div>
            </div>
          </PopoverContent>
        </Popover>

        {Object.keys(activeFilters).length > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Chips */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (key === "search" && !value) return null;
            return (
              <Badge key={key} variant="secondary" className="px-3 py-1 text-sm font-normal flex items-center gap-2">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="font-medium">{value}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-foreground" 
                  onClick={() => updateFilter(key, null)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
