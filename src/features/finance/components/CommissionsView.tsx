"use client";

import { useEffect, useRef, useState } from "react";
import { useCommissions } from "../hooks/useFinance";
import { CommissionQueryFilters, CommissionStatus } from "../types";
import { CommissionsTable } from "./CommissionsTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

export function CommissionsView() {
  const [filters, setFilters] = useState<CommissionQueryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the booking-reference search so we don't fire a request per keystroke
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, bookingReference: value.trim() || undefined, page: 1 }));
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data, isLoading } = useCommissions(filters);

  return (
    <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">عمولات الشركاء والوكلاء (Partner Commissions)</h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الحجز..."
              className="pl-9 bg-background/50 rounded-xl"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => setFilters(f => ({ ...f, status: val === "ALL" || !val ? undefined : val as CommissionStatus, page: 1 }))}
          >
            <SelectTrigger className="w-[160px] bg-background/50 rounded-xl font-bold text-xs">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent className="font-bold text-xs">
              <SelectItem value="ALL">كافة الحالات</SelectItem>
              <SelectItem value="PENDING">قيد الانتظار (Pending)</SelectItem>
              <SelectItem value="APPROVED">معتمدة (Approved)</SelectItem>
              <SelectItem value="PAID">مدفوعة (Paid)</SelectItem>
              <SelectItem value="CANCELLED">ملغاة (Cancelled)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card/50 overflow-hidden">
        <CommissionsTable
          data={data?.data ?? []}
          isLoading={isLoading}
          pageCount={data?.meta?.totalPages ?? 0}
          currentPage={filters.page ?? 1}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        />
      </div>
    </Card>
  );
}
