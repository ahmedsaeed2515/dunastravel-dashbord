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
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, CheckSquare, RefreshCw, Loader2, Sparkles, Compass, Users, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export function ToursTable() {
  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
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
    if (window.confirm(`Are you sure you want to archive tour package ${tour.slug}?`)) {
      await deleteTour.mutateAsync(tour.slug);
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
      toast.success("Tours exported successfully");
    } catch (error: any) {
      toast.error("Failed to export tours CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleDelete);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const slugs = selectedRows.map((row: any) => row.original.slug);

    const handleBulkStatus = async (status: TourStatus) => {
      await bulkUpdate.mutateAsync({ slugs, status });
      table.toggleAllRowsSelected(false);
    };

    const handleBulkActive = async (isActive: boolean) => {
      await bulkUpdate.mutateAsync({ slugs, isActive });
      table.toggleAllRowsSelected(false);
    };

    const handleBulkFeatured = async (isFeatured: boolean) => {
      await bulkUpdate.mutateAsync({ slugs, isFeatured });
      table.toggleAllRowsSelected(false);
    };

    return (
      <div className="flex items-center gap-2">
        <Input 
          aria-label="Search tours"
          placeholder="Search tours..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="h-8 w-[200px]"
        />
        {slugs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="secondary" size="sm" className="h-8 shadow-sm flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>Bulk Actions ({slugs.length})</span>
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkStatus("PUBLISHED")}>
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("DRAFT")}>
                Revert to Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("ARCHIVED")} className="text-red-600">
                Archive Tours
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Marketing Flags</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkFeatured(true)}>
                Mark as Featured
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkFeatured(false)}>
                Remove Featured
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 shadow-sm flex items-center gap-1.5"
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>Export CSV</span>
        </Button>

        <CreateTourWizard />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Luxury SaaS Premium Statistics Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Travel Products</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.totalTours ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="font-semibold text-foreground">{stats?.publishedTours ?? 0} active</span> across client portals
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Products</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.featuredTours ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Top priority placement on executive dashboard
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Occupancy Rate</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {stats?.occupancyRate ? `${stats.occupancyRate}%` : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.seatsSold ?? 0} seats booked of {stats?.totalCapacity ?? 0} capacity
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Draft & Curating</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.draftTours ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pending editorial review & pricing surge rules
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ALL">All Tours</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
            <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : (data?.data || [])}
        isLoading={isLoading}
        renderToolbarActions={renderToolbarActions}
        pageCount={Array.isArray(data) ? 1 : (data?.meta?.totalPages || -1)}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
      />
      
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
