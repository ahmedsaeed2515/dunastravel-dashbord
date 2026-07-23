"use client";

import { useState } from "react";
import { useInquiries } from "../hooks/useCommunications";
import { InquiryQueryFilters } from "../types";
import { InquiriesTable } from "./InquiriesTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

export function InquiriesView() {
  const [filters, setFilters] = useState<InquiryQueryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  });

  const { data, isLoading } = useInquiries(filters);

  return (
    <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Tailor-Made Inquiries</h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reference code..." 
              className="pl-9 bg-background/50"
              onChange={(e) => setFilters(f => ({ ...f, referenceCode: e.target.value || undefined, page: 1 } as any))}
            />
          </div>

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => setFilters(f => ({ ...f, status: val === "ALL" || !val ? undefined : val, page: 1 }))}
          >
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card/50 overflow-hidden">
        <InquiriesTable 
          data={Array.isArray(data) ? data : (data?.data || [])} 
          isLoading={isLoading} 
          pageCount={Array.isArray(data) ? 1 : (data?.meta?.totalPages || 1)}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        />
      </div>
    </Card>
  );
}
