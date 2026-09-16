"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  useBookings, 
  useSoftDeleteBooking
} from "../../hooks/useBookings";
import { bookingsApi } from "../../api/bookingsApi";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { Booking, BookingQueryFilters } from "../../types";
import { BookingDetailsDrawer } from "../Drawers/BookingDetailsDrawer";
import { EditBookingDrawer } from "../Drawers/EditBookingDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { BookingsHeaderStats } from "@/features/bookings/components/BookingsHeaderStats";

export function BookingsTable() {
  const tBookings = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");

  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("ref") || "";
  const urlHighlight = searchParams.get("highlight") || urlSearch;

  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState(urlSearch);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(urlHighlight || null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Sync from URL search params
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }
    if (urlHighlight) {
      setActiveHighlight(urlHighlight);
    }
  }, [urlSearch, urlHighlight]);

  // Sync from cross-component event for instant highlighting
  useEffect(() => {
    const handleHighlightEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.referenceCode) {
        setSearch(detail.referenceCode);
        setActiveHighlight(detail.referenceCode);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
      } else if (detail?.highlightId) {
        setActiveHighlight(detail.highlightId);
      }
    };
    window.addEventListener("dunas:notification-highlight", handleHighlightEvent);
    return () => window.removeEventListener("dunas:notification-highlight", handleHighlightEvent);
  }, []);

  const queryFilters: BookingQueryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {})
  };

  const { data, isLoading } = useBookings(queryFilters);
  const deleteBooking = useSoftDeleteBooking();
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
    if (window.confirm(`${tCommon("confirm")} ${tCommon("delete")} ${booking.referenceCode}?`)) {
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
      toast.success(tCommon("success"));
    } catch (error: any) {
      toast.error(tCommon("error"));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleDelete, tBookings, tCommon);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Input 
          aria-label={tCommon("search")}
          placeholder={`${tCommon("search")}...`} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="h-8 w-[200px]"
        />
        
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "")}>
          <SelectTrigger className="h-8 w-[150px]" aria-label={tCommon("status")}>
            <SelectValue placeholder={tCommon("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon("all")}</SelectItem>
            <SelectItem value="PENDING">{tStatus("PENDING")}</SelectItem>
            <SelectItem value="CONFIRMED">{tStatus("CONFIRMED")}</SelectItem>
            <SelectItem value="CANCELLED">{tStatus("CANCELLED")}</SelectItem>
            <SelectItem value="COMPLETED">{tStatus("COMPLETED")}</SelectItem>
          </SelectContent>
        </Select>



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
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        renderToolbarActions={renderToolbarActions}
        pageCount={data?.meta?.totalPages ?? -1}
        highlightId={activeHighlight}
        getRowId={(b: any) => b.referenceCode || b.id}
      />

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
