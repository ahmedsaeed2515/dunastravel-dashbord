"use client";

import { useState, useMemo, useEffect } from "react";
import { useContactSubmissions, useUpdateContactSubmissionStatus } from "../hooks/useCommunications";
import { ContactSubmission, ContactSubmissionQueryFilters } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  X,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Archive,
  ArchiveRestore,
  Eye,
  CheckCircle2,
  User,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export function ContactSubmissionsView() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const tCommon = useTranslations("common");
  const tComm = useTranslations("communications");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounce search to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: ContactSubmissionQueryFilters = useMemo(
    () => ({
      page,
      limit: 15,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, selectedStatus, debouncedSearch]
  );

  const { data, isLoading, isFetching, refetch } = useContactSubmissions(filters);
  const updateStatus = useUpdateContactSubmissionStatus();

  const statusTabs = [
    { id: "ALL", labelAr: "جميع الرسائل 📬", labelEn: "All Messages 📬" },
    { id: "NEW", labelAr: "رسائل جديدة ✉️", labelEn: "New (Unread) ✉️" },
    { id: "READ", labelAr: "تمت قراءتها 📖", labelEn: "Read 📖" },
    { id: "ARCHIVED", labelAr: "المؤرشفة 🗄️", labelEn: "Archived 🗄️" },
  ];

  const handleOpenDetails = (sub: ContactSubmission) => {
    setSelectedSubmission(sub);
    setIsDetailOpen(true);
    if (sub.status === "NEW") {
      updateStatus.mutate({ referenceCode: sub.referenceCode, status: "READ" });
    }
  };

  const handleStatusChange = (sub: ContactSubmission, newStatus: string) => {
    updateStatus.mutate(
      { referenceCode: sub.referenceCode, status: newStatus },
      {
        onSuccess: () => {
          if (selectedSubmission?.referenceCode === sub.referenceCode) {
            setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        },
      }
    );
  };

  const getFullName = (sub: ContactSubmission) => {
    const fullName = `${sub.firstName || ""} ${sub.lastName || ""}`.trim();
    return fullName || (sub as any).name || (isAr ? "عميل دوناس" : "Dunas Client");
  };

  const pageCount = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
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

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={
                isAr
                  ? "البحث برقم المرجع، الاسم، البريد الإلكتروني، الموضوع، أو محتوى الرسالة..."
                  : "Search reference, name, email, subject, or message..."
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

      {/* Submissions Table */}
      <Card className="border-border/40 shadow-xs backdrop-blur-xl bg-background/60 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-xs">{isAr ? "المرجع" : "Reference"}</TableHead>
              <TableHead className="font-bold text-xs">{isAr ? "المرسل" : "Sender"}</TableHead>
              <TableHead className="font-bold text-xs">{isAr ? "الموضوع" : "Subject"}</TableHead>
              <TableHead className="font-bold text-xs">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="font-bold text-xs">{isAr ? "تاريخ الاستلام" : "Date"}</TableHead>
              <TableHead className="font-bold text-xs text-center">{isAr ? "الإجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  {isAr ? "جاري تحميل رسائل صندوق الوارد..." : "Loading inbox messages..."}
                </TableCell>
              </TableRow>
            ) : data?.data?.length ? (
              data.data.map((sub: ContactSubmission) => {
                const fullName = getFullName(sub);

                return (
                  <TableRow
                    key={sub.referenceCode}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                    onClick={() => handleOpenDetails(sub)}
                  >
                    <TableCell className="font-mono font-bold text-xs dir-ltr text-start">
                      <span className="text-primary">{sub.referenceCode}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-foreground">{fullName}</span>
                        <span className="text-[11px] font-mono text-muted-foreground dir-ltr text-start">
                          {sub.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <span className="font-bold text-xs text-foreground block truncate">
                          {sub.subject || (isAr ? "بدون موضوع" : "No Subject")}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {sub.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground dir-ltr text-start">
                      {sub.createdAt ? format(new Date(sub.createdAt), "dd/MM/yyyy HH:mm") : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl hover:bg-primary/10 text-primary cursor-pointer"
                          onClick={() => handleOpenDetails(sub)}
                          title={isAr ? "عرض التفاصيل" : "View Details"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {sub.status === "NEW" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            onClick={() => handleStatusChange(sub, "READ")}
                            disabled={updateStatus.isPending}
                            title={isAr ? "تمييز كمقروء" : "Mark as Read"}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : sub.status === "READ" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer"
                            onClick={() => handleStatusChange(sub, "NEW")}
                            disabled={updateStatus.isPending}
                            title={isAr ? "تمييز كغير مقروء" : "Mark as Unread"}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        ) : null}

                        {sub.status !== "ARCHIVED" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => handleStatusChange(sub, "ARCHIVED")}
                            disabled={updateStatus.isPending}
                            title={isAr ? "أرشفة الرسالة" : "Archive"}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 cursor-pointer"
                            onClick={() => handleStatusChange(sub, "READ")}
                            disabled={updateStatus.isPending}
                            title={isAr ? "استعادة من الأرشيف" : "Restore"}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  {isAr ? "لا توجد رسائل واردة مطابقة لبحثك." : "No inbox messages found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between py-4 px-6 border-t border-border/40">
          <div className="text-xs text-muted-foreground font-medium">
            {isAr
              ? `صفحة ${page} من ${Math.max(1, pageCount)}`
              : `Page ${page} of ${Math.max(1, pageCount)}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isLoading || page <= 1}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              {isAr ? "السابق" : "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading || page >= pageCount}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              {isAr ? "التالي" : "Next"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedSubmission && (
            <>
              <SheetHeader className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-primary">
                    {selectedSubmission.referenceCode}
                  </span>
                  <StatusBadge status={selectedSubmission.status} />
                </div>
                <SheetTitle className="text-base font-black text-foreground">
                  {selectedSubmission.subject || (isAr ? "استفسار من نموذج الاتصال" : "Contact Inquiry")}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono">
                  {selectedSubmission.createdAt
                    ? format(new Date(selectedSubmission.createdAt), "dd/MM/yyyy HH:mm:ss")
                    : "—"}
                </SheetDescription>
              </SheetHeader>

              {/* Sender Card */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {getFullName(selectedSubmission)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    <span className="dir-ltr">{selectedSubmission.email}</span>
                  </span>
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(
                      selectedSubmission.subject || "Dunas Travel Inquiry"
                    )}`}
                    className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isAr ? "مراسلة" : "Email"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {selectedSubmission.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="dir-ltr font-mono">{selectedSubmission.phone}</span>
                    </span>
                    <a
                      href={`https://wa.me/${selectedSubmission.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>WhatsApp</span>
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>{isAr ? "نص الرسالة" : "Message Content"}</span>
                </h4>
                <div className="rounded-2xl border border-border/60 bg-card p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans min-h-[140px]">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                {selectedSubmission.status !== "READ" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                    onClick={() => handleStatusChange(selectedSubmission, "READ")}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "تمييز كمقروء" : "Mark as Read"}</span>
                  </Button>
                )}

                {selectedSubmission.status !== "NEW" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                    onClick={() => handleStatusChange(selectedSubmission, "NEW")}
                    disabled={updateStatus.isPending}
                  >
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? "تمييز كغير مقروء" : "Mark as Unread"}</span>
                  </Button>
                )}

                {selectedSubmission.status !== "ARCHIVED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => handleStatusChange(selectedSubmission, "ARCHIVED")}
                    disabled={updateStatus.isPending}
                  >
                    <Archive className="w-4 h-4" />
                    <span>{isAr ? "أرشفة" : "Archive"}</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 text-sky-600 dark:text-sky-400 cursor-pointer"
                    onClick={() => handleStatusChange(selectedSubmission, "READ")}
                    disabled={updateStatus.isPending}
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    <span>{isAr ? "استعادة من الأرشيف" : "Restore"}</span>
                  </Button>
                )}

                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(
                    selectedSubmission.subject || "Dunas Travel Inquiry"
                  )}`}
                  className="ms-auto"
                >
                  <Button size="sm" variant="gold" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    <span>{isAr ? "الرد على العميل" : "Reply via Email"}</span>
                  </Button>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
