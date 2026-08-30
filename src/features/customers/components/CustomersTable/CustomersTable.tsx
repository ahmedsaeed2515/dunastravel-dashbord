"use client";

import { useState } from "react";
import { 
  useCustomers, 
  useBulkUpdateCustomers,
  useUpdateCustomerCrm 
} from "../../hooks/useCustomers";
import { customersApi } from "../../api/customersApi";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { Customer } from "../../types";
import { CustomerProfileModal } from "../CustomerProfile/CustomerProfileModal";
import { EditCustomerDialog } from "../EditCustomerDialog";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Download, CheckSquare, Star, Layers, Loader2, Search, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function CustomersTable() {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");

  // Filters state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [vipFilter, setVipFilter] = useState<string>("ALL");

  const queryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(vipFilter === "VIP" ? { isVip: "true" } : vipFilter === "STANDARD" ? { isVip: "false" } : {}),
  };

  const { data, isLoading, refetch, isFetching } = useCustomers(queryFilters);
  const bulkUpdate = useBulkUpdateCustomers();
  const updateCrm = useUpdateCustomerCrm();
  const [isExporting, setIsExporting] = useState(false);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handlers
  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsProfileModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };
  
  const handleToggleVip = async (customer: Customer) => {
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { isVip: !customer.isVip }
    });
  };

  const handleToggleStatus = async (customer: Customer) => {
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { status: customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
    });
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await customersApi.exportCustomersCsv(queryFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_crm_export_${new Date().toISOString().split("T")[0]}.csv`;
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

  const columns = getColumns(handleView, handleEdit, handleToggleVip, handleToggleStatus, tCustomers, tCommon);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const userIds = selectedRows.map((row: any) => row.original.id);

    const handleBulkSegment = async (segment: string) => {
      await bulkUpdate.mutateAsync({ userIds, segments: [segment] });
      table.toggleAllRowsSelected(false);
    };

    const handleBulkVip = async (isVip: boolean) => {
      await bulkUpdate.mutateAsync({ userIds, isVip });
      table.toggleAllRowsSelected(false);
    };

    const handleBulkStatus = async (status: string) => {
      await bulkUpdate.mutateAsync({ userIds, status });
      table.toggleAllRowsSelected(false);
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            aria-label={tCommon("search")}
            placeholder={`${tCommon("search")}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 ps-8 text-xs rounded-lg"
          />
        </div>

        {/* Quick Filter: All vs VIP */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/80 text-xs">
          <button
            type="button"
            onClick={() => {
              setVipFilter("ALL");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              vipFilter === "ALL"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tCommon("all")}
          </button>
          <button
            type="button"
            onClick={() => {
              setVipFilter("VIP");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              vipFilter === "VIP"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>VIP</span>
          </button>
        </div>

        {/* Quick Filter: Status */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/80 text-xs">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`px-2 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ALL"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tCommon("all")}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ACTIVE");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`px-2 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            النشطة
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("INACTIVE");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`px-2 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "INACTIVE"
                ? "bg-red-500/15 text-red-600 dark:text-red-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            المعطلة
          </button>
        </div>

        {userIds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-bold transition-colors h-8 px-3 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 cursor-pointer">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>{tCommon("actions")} ({userIds.length})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 font-medium text-xs">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase font-bold">{tCommon("category")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkSegment("VIP Luxury")}>
                <Layers className="me-2 h-3.5 w-3.5 text-amber-500" /> VIP Luxury
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkSegment("Corporate Partner")}>
                <Layers className="me-2 h-3.5 w-3.5 text-blue-500" /> Corporate Partner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkSegment("Repeat Traveler")}>
                <Layers className="me-2 h-3.5 w-3.5 text-purple-500" /> Repeat Traveler
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase font-bold">{tCommon("options")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkVip(true)}>
                <Star className="me-2 h-3.5 w-3.5 text-amber-500 fill-amber-500" /> تعيين VIP
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkVip(false)}>
                <Star className="me-2 h-3.5 w-3.5 text-muted-foreground" /> إلغاء VIP
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleBulkStatus("INACTIVE")} className="text-red-600 dark:text-red-400">
                تعطيل الحسابات المحددة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-xs font-bold rounded-lg"
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span>{tCommon("exportCsv")}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 px-2 rounded-lg"
          title="تحديث البيانات"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
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
        searchKey="name"
        renderToolbarActions={renderToolbarActions}
      />
      
      {/* 360° Customer Profile Pop-up Modal */}
      <CustomerProfileModal
        customer={selectedCustomer}
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onCustomerUpdated={() => refetch()}
      />

      {/* Edit Customer Pop-up Dialog */}
      <EditCustomerDialog
        customer={selectedCustomer}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
