"use client";

import { useState, useMemo, useEffect } from "react";
import { useInquiries, useInquiryMetrics } from "../hooks/useCommunications";
import { InquiryQueryFilters } from "../types";
import { InquiriesTable } from "./InquiriesTable";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Sparkles,
  Inbox,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export function InquiriesView() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || searchParams?.get("ref") || "";
  const urlHighlight = searchParams?.get("highlight") || urlSearch;

  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(urlHighlight || null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Sync URL search params
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
      setPage(1);
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
        setDebouncedSearch(detail.referenceCode);
        setActiveHighlight(detail.referenceCode);
        setPage(1);
      } else if (detail?.highlightId) {
        setActiveHighlight(detail.highlightId);
      }
    };
    window.addEventListener("dunas:notification-highlight", handleHighlightEvent);
    return () => window.removeEventListener("dunas:notification-highlight", handleHighlightEvent);
  }, []);

  // Debounce the search input to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination whenever search query or status filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus]);

  const filters: InquiryQueryFilters = useMemo(
    () => ({
      page,
      limit: 15,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, selectedStatus, debouncedSearch]
  );

  const { data, isLoading, isFetching, refetch } = useInquiries(filters);
  const { data: metricsData } = useInquiryMetrics();

  // Combine live backend metrics with local fallback
  const stats = useMemo(() => {
    if (metricsData) {
      return metricsData;
    }
    const list = data?.data || [];
    const total = data?.meta?.total ?? list.length;
    const newlyReceived = list.filter((i) => i.status === "NEWLY_RECEIVED").length;
    const inProgress = list.filter((i) => i.status === "IN_PROGRESS").length;
    const quoted = list.filter((i) => i.status === "QUOTED").length;
    const approved = list.filter((i) => i.status === "APPROVED").length;
    const converted = list.filter((i) => i.status === "CONVERTED_TO_BOOKING").length;
    const closed = list.filter((i) => i.status === "CLOSED").length;

    const pipelineValue = list.reduce((acc, curr) => {
      const val = curr.quotedAmountUsd || curr.budgetAmount || 0;
      return acc + Number(val);
    }, 0);

    return {
      total,
      newlyReceived,
      inProgress,
      quoted,
      approved,
      converted,
      closed,
      pipelineValue,
    };
  }, [metricsData, data]);

  const statusTabs = [
    { id: "ALL", labelAr: "جميع الطلبات 📋", labelEn: "All Inquiries 📋" },
    { id: "NEWLY_RECEIVED", labelAr: "جديد بانتظار المراجعة ⏳", labelEn: "New / Pending ⏳" },
    { id: "IN_PROGRESS", labelAr: "قيد المتابعة والتحضير 📝", labelEn: "In Progress 📝" },
    { id: "QUOTED", labelAr: "تم تقديم العرض 💰", labelEn: "Quote Sent 💰" },
    { id: "APPROVED", labelAr: "موافقة العميل ✨", labelEn: "Client Approved ✨" },
    { id: "CONVERTED_TO_BOOKING", labelAr: "تم التحويل لحجز رسمي 🎟️", labelEn: "Converted to Booking 🎟️" },
    { id: "CLOSED", labelAr: "مغلق 🔒", labelEn: "Closed 🔒" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Pipeline Metrics Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "إجمالي الاستفسارات" : "Total Requests"}</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "طلب رحلة مخصصة" : "Tailor-made leads"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>{isAr ? "طلبات جديدة" : "New / Pending"}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.newlyReceived}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "بانتظار التعيين والمراجعة" : "Requires triage"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
            <span>{isAr ? "قيد المتابعة" : "In Progress"}</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.inProgress}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "جاري تجهيز العرض" : "Designing itinerary"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
            <span>{isAr ? "عروض مرسلة" : "Quotes Sent"}</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.quoted}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "بانتظار موافقة العميل" : "Awaiting approval"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{isAr ? "حجوزات مؤكدة" : "Converted"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.converted + stats.approved}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "تم تحويلها لحجوزات" : "Won contracts"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{isAr ? "قيمة خط الفرص" : "Pipeline Value"}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ${stats.pipelineValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "إجمالي العروض التقديرية" : "Estimated pipeline"}</div>
        </Card>
      </div>

      {/* 2. Filters & Search Toolbar */}
      <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-4">
        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                selectedStatus === tab.id
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={
                isAr
                  ? "البحث برقم المرجع، اسم العميل، البريد الإلكتروني، الوجهة، أو كود الشريك..."
                  : "Search reference, client name, email, destination, partner code..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 text-xs pr-9 rtl:pr-9 ltr:pl-9 rounded-2xl font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-2xl h-10 text-xs font-bold gap-2 border-border cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-500" : ""}`} />
              <span>{isAr ? "تحديث" : "Refresh"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Inquiries Table */}
      <div className="rounded-3xl border bg-card shadow-xs overflow-hidden">
        <InquiriesTable
          data={data?.data ?? []}
          isLoading={isLoading}
          pageCount={data?.meta?.totalPages ?? 0}
          currentPage={page}
          onPageChange={(p) => setPage(p)}
          highlightId={activeHighlight}
        />
      </div>
    </div>
  );
}
