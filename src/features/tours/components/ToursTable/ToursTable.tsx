/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { 
  useTours, 
  useSoftDeleteTour, 
  useBulkUpdateTours,
  useTourStats
} from "../../hooks/useTours";
import { toursApi } from "../../api/toursApi";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { Tour, TourStatus } from "../../types";
import { TourDetailsDrawer } from "../Drawers/TourDetailsDrawer";
import { EditTourDrawer } from "../Drawers/EditTourDrawer";
import { CreateTourWizard } from "../CreateTourWizard/CreateTourWizard";
import { TourCardGrid } from "../TourCardGrid/TourCardGrid";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, CheckSquare, Loader2, Sparkles, Compass, Users, Percent, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";

export function ToursTable() {
  const tTours = useTranslations("tours");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tDashboard = useTranslations("dashboard");
  const currentLocale = useLocale();

  // View mode state (cards/grid vs table)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  
  const queryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(activeTab !== "ALL" ? { status: activeTab } : {})
  };

  const { data, isLoading } = useTours(queryFilters);
  const { data: stats } = useTourStats();
  const deleteTour = useSoftDeleteTour();
  const bulkUpdate = useBulkUpdateTours();
  const [isExporting, setIsExporting] = useState(false);

  // Drawer states
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setEditDrawerOpen] = useState(false);

  // Handlers
  const handleView = (tour: Tour) => {
    setSelectedTour(tour);
    setViewDrawerOpen(true);
  };
  
  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setEditDrawerOpen(true); 
  };

  const handleDelete = async (tour: Tour) => {
    if (window.confirm(`${tCommon("confirm")} ${tCommon("delete")} ${tour.slug}?`)) {
      await deleteTour.mutateAsync(tour.slug);
      toast.success(tCommon("success"));
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await toursApi.exportToursCsv(queryFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tours_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(tCommon("success"));
    } catch (error: any) {
      toast.error(tCommon("error"));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleDelete, tTours, tCommon, currentLocale);
  const toursList: Tour[] = Array.isArray(data) ? data : (data?.data || []);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table ? table.getFilteredSelectedRowModel().rows : [];
    const slugs = selectedRows.map((row: any) => row.original.slug);

    const handleBulkStatus = async (status: TourStatus) => {
      await bulkUpdate.mutateAsync({ slugs, status });
      if (table) table.toggleAllRowsSelected(false);
      toast.success(tCommon("success"));
    };

    const handleBulkFeatured = async (isFeatured: boolean) => {
      await bulkUpdate.mutateAsync({ slugs, isFeatured });
      if (table) table.toggleAllRowsSelected(false);
      toast.success(tCommon("success"));
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Input 
          aria-label={tCommon("search")}
          placeholder={`${tCommon("search")}...`} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="h-8 w-[200px]"
        />
        
        {slugs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger type="button" className="h-8 shadow-sm inline-flex items-center justify-center rounded-md text-sm font-medium px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-1.5">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>{tCommon("actions")} ({slugs.length})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>{tCommon("status")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkStatus("PUBLISHED")}>
                {tStatus("PUBLISHED")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("DRAFT")}>
                {tStatus("DRAFT")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("ARCHIVED")} className="text-red-600">
                {tStatus("ARCHIVED")}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>{tCommon("options")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkFeatured(true)}>
                {tCommon("yes")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkFeatured(false)}>
                {tCommon("no")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* View Switcher Button Group */}
        <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-xs font-semibold"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-xs font-semibold"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Table
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 shadow-sm flex items-center gap-1.5"
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>{tCommon("exportCsv")}</span>
        </Button>

        <CreateTourWizard />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tDashboard("totalTours")}</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.totalTours ?? "23"}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="font-semibold text-foreground">{stats?.publishedTours ?? 20} {tDashboard("publishedTours")}</span>
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tTours("title")}</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.featuredTours ?? "8"}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tDashboard("occupancyRate")}</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {stats?.occupancyRate ? `${stats.occupancyRate}%` : "68%"}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tTours("draft")}</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.draftTours ?? "3"}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>
      </div>

      {/* Toolbar Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-2xl p-4 shadow-sm">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="w-[340px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ALL">{tCommon("all")}</TabsTrigger>
            <TabsTrigger value="PUBLISHED">{tStatus("PUBLISHED")}</TabsTrigger>
            <TabsTrigger value="DRAFT">{tStatus("DRAFT")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {renderToolbarActions(null)}
      </div>

      {/* Body View Rendering */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "grid" ? (
        <TourCardGrid
          tours={toursList}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <DataTable
          columns={columns}
          data={toursList}
          isLoading={isLoading}
          renderToolbarActions={() => null}
          pageCount={Array.isArray(data) ? 1 : (data?.meta?.totalPages || -1)}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={true}
        />
      )}

      {/* Modals & Drawers Layer */}
      <TourDetailsDrawer
        tour={selectedTour}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
      />
      
      <EditTourDrawer
        tour={selectedTour}
        open={isEditDrawerOpen}
        onOpenChange={setEditDrawerOpen}
      />
    </div>
  );
}
