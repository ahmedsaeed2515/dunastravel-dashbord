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
import { CustomerProfileDrawer } from "../CustomerProfile/CustomerProfileDrawer";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, CheckSquare, Star, Tag, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export function CustomersTable() {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");

  // Filters state
  const [filters, setFilters] = useState({ page: 1, limit: 10, isVip: undefined, status: undefined });
  const { data, isLoading, isError, refetch } = useCustomers(filters);
  const bulkUpdate = useBulkUpdateCustomers();
  const updateCrm = useUpdateCustomerCrm();
  const [isExporting, setIsExporting] = useState(false);

  // Drawer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Handlers
  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsProfileDrawerOpen(true);
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
      const blob = await customersApi.exportCustomersCsv(filters);
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

  const columns = getColumns(handleView, handleToggleVip, handleToggleStatus, tCustomers, tCommon);

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const userIds = selectedRows.map((row: any) => row.original.id);

    const handleBulkTag = async (tag: string) => {
      await bulkUpdate.mutateAsync({ userIds, tags: [tag] });
      table.toggleAllRowsSelected(false);
    };

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
      <div className="flex items-center gap-2">
        {userIds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 shadow-sm flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              <CheckSquare className="h-4 w-4" />
              <span>{tCommon("actions")} ({userIds.length})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-bold">{tCommon("category")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkSegment("VIP Luxury")}>
                <Layers className="me-2 h-3.5 w-3.5" /> VIP Luxury
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkSegment("Corporate Partner")}>
                <Layers className="me-2 h-3.5 w-3.5" /> Corporate Partner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkSegment("Repeat Traveler")}>
                <Layers className="me-2 h-3.5 w-3.5" /> Repeat Traveler
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-bold">{tCommon("options")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkVip(true)}>
                <Star className="me-2 h-3.5 w-3.5 text-amber-500 fill-amber-500" /> VIP
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkVip(false)}>
                <Star className="me-2 h-3.5 w-3.5" /> Standard
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleBulkStatus("INACTIVE")} className="text-red-600">
                {tCommon("deleting")}
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
          <span>{tCommon("exportCsv")}</span>
        </Button>
      </div>
    );
  };

  if (isError) {
    return <QueryErrorState message="تعذر تحميل سجل العملاء من الباك إند." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : (data?.data || [])}
        isLoading={isLoading}
        searchKey="name"
        renderToolbarActions={renderToolbarActions}
      />
      
      {/* 360° Customer Profile Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
      />
    </div>
  );
}
