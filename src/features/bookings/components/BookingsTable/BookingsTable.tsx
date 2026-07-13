"use client";

import { useState } from "react";
import { 
  useBookings, 
  useSoftDeleteBooking, 
  useBulkUpdateBookings 
} from "../../hooks/useBookings";
import { bookingsApi } from "../../api/bookingsApi";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { Booking, BookingStatus, BookingQueryFilters } from "../../types";
import { BookingDetailsDrawer } from "../Drawers/BookingDetailsDrawer";
import { EditBookingDrawer } from "../Drawers/EditBookingDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, CheckSquare, Trash, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BookingsTable() {
  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const queryFilters: BookingQueryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };
  
  const { data, isLoading } = useBookings(queryFilters);
  const deleteBooking = useSoftDeleteBooking();
  const bulkUpdate = useBulkUpdateBookings();
  const [isExporting, setIsExporting] = useState(false);

  // Drawer states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setEditDrawerOpen] = useState(false);

  // Handlers
  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewDrawerOpen(true);
  };
  
  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditDrawerOpen(true);
  };

  const handleDelete = async (booking: Booking) => {
    if (window.confirm(`Are you sure you want to delete booking ${booking.referenceCode}?`)) {
      await deleteBooking.mutateAsync(booking.referenceCode);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await bookingsApi.exportBookingsCsv(queryFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Bookings exported successfully");
    } catch (error: any) {
      toast.error("Failed to export bookings CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleDelete);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const referenceCodes = selectedRows.map((row: any) => row.original.referenceCode);

    const handleBulkStatus = async (status: BookingStatus) => {
      await bulkUpdate.mutateAsync({ referenceCodes, status });
      table.toggleAllRowsSelected(false);
    };

    const handleBulkPriority = async (priority: string) => {
      await bulkUpdate.mutateAsync({ referenceCodes, priority });
      table.toggleAllRowsSelected(false);
    };

    return (
      <div className="flex items-center gap-2">
        <Input 
          aria-label="Search bookings"
          placeholder="Search bookings..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="h-8 w-[200px]"
        />
        
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "")}>
          <SelectTrigger className="h-8 w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        {referenceCodes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 gap-1.5">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>Bulk Actions ({referenceCodes.length})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkStatus("CONFIRMED")}>
                Mark as Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("PENDING")}>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("COMPLETED")}>
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("CANCELLED")} className="text-red-600">
                Mark as Cancelled
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkPriority("LOW")}>
                Priority: Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkPriority("NORMAL")}>
                Priority: Normal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkPriority("HIGH")}>
                Priority: High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkPriority("URGENT")}>
                Priority: Urgent
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
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        renderToolbarActions={renderToolbarActions}
        pageCount={data?.meta?.totalPages || -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
      />
      
      {/* Modals & Drawers Layer */}
      <BookingDetailsDrawer
        booking={selectedBooking}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
      />

      <EditBookingDrawer
        booking={selectedBooking}
        open={isEditDrawerOpen}
        onOpenChange={setEditDrawerOpen}
      />
    </div>
  );
}
