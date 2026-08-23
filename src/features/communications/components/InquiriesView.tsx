"use client";

import { useState } from "react";
import { useInquiries } from "../hooks/useCommunications";
import { InquiryQueryFilters } from "../types";
import { InquiriesTable } from "./InquiriesTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { InquiryDetailsDrawer } from "./InquiryDetailsDrawer";

export function InquiriesView() {
  const tInquiries = useTranslations("inquiries");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");

  const [filters, setFilters] = useState<InquiryQueryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  });
  const [selectedReferenceCode, setSelectedReferenceCode] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useInquiries(filters);

  const inquiriesList = Array.isArray(data) ? data : (data?.data || []);
  const totalPages = (data as any)?.meta?.totalPages ?? (data as any)?.totalPages ?? 1;
  const totalCount = (data as any)?.meta?.total ?? (data as any)?.total ?? inquiriesList.length;

  if (isError) {
    return <QueryErrorState message="تعذر تحميل الاستفسارات من الباك إند." onRetry={() => void refetch()} />;
  }

  return (
    <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{tInquiries("title")}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
            {totalCount} Total
          </span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={`${tCommon("search")}...`} 
              className="ps-9 bg-background/50"
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value || undefined, page: 1 }))}
            />
          </div>

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => setFilters(f => ({ ...f, status: val === "ALL" || !val ? undefined : val, page: 1 }))}
          >
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder={tCommon("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tCommon("all")}</SelectItem>
              <SelectItem value="NEWLY_RECEIVED">{tStatus("NEW", { defaultValue: "New" })}</SelectItem>
              <SelectItem value="IN_PROGRESS">{tStatus("IN_PROGRESS")}</SelectItem>
              <SelectItem value="QUOTED">Quoted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="CONVERTED_TO_BOOKING">Converted to booking</SelectItem>
              <SelectItem value="CLOSED">{tStatus("CLOSED")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card/50 overflow-hidden">
        <InquiriesTable 
          data={inquiriesList} 
          isLoading={isLoading} 
          currentPage={filters.page || 1}
          total={totalCount}
          pageCount={totalPages}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
          onView={(inquiry) => setSelectedReferenceCode(inquiry.referenceCode)}
        />
      </div>
      <InquiryDetailsDrawer
        referenceCode={selectedReferenceCode}
        open={Boolean(selectedReferenceCode)}
        onOpenChange={(open) => { if (!open) setSelectedReferenceCode(null); }}
      />
    </Card>
  );
}
