"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useInquiry, useUpdateInquiry } from "../hooks/useCommunications";
import { Loader2 } from "lucide-react";

const transitions: Record<string, string[]> = {
  NEWLY_RECEIVED: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["QUOTED", "CLOSED"],
  QUOTED: ["APPROVED", "CLOSED"],
  APPROVED: ["CONVERTED_TO_BOOKING", "CLOSED"],
  CONVERTED_TO_BOOKING: ["CLOSED"],
  CLOSED: [],
};

interface InquiryDetailsDrawerProps {
  referenceCode: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InquiryDetailsDrawer({ referenceCode, open, onOpenChange }: InquiryDetailsDrawerProps) {
  const query = useInquiry(referenceCode ?? "", open);
  const update = useUpdateInquiry();
  const [nextStatus, setNextStatus] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const detail = query.data;
  const allowedStatuses = useMemo(() => transitions[detail?.status ?? ""] ?? [], [detail?.status]);

  const submit = () => {
    if (!referenceCode || (!nextStatus && !internalNote.trim())) return;
    update.mutate(
      {
        referenceCode,
        payload: {
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(internalNote.trim() ? { internalNote: internalNote.trim() } : {}),
        },
      },
      { onSuccess: () => { setNextStatus(""); setInternalNote(""); } },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl" dir="rtl">
        <SheetHeader className="text-start">
          <SheetTitle>تفاصيل الاستفسار {referenceCode ?? ""}</SheetTitle>
          <SheetDescription>بيانات حقيقية من سجل الاستفسار في الباك إند.</SheetDescription>
        </SheetHeader>

        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : query.isError || !detail ? (
          <div className="mt-6"><QueryErrorState message="تعذر تحميل تفاصيل الاستفسار من الخادم." onRetry={() => void query.refetch()} /></div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="font-semibold">{[detail.firstName, detail.lastName].filter(Boolean).join(" ") || detail.name || "—"}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{detail.email || "—"}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{detail.phone || "—"}</p>
              </div>
              <StatusBadge status={detail.status} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">عدد المسافرين</dt><dd className="font-medium">{detail.numberOfTravelers ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">الميزانية</dt><dd className="font-medium">{detail.budget || "—"}</dd></div>
              <div><dt className="text-muted-foreground">تاريخ المغادرة</dt><dd className="font-medium">{detail.departureDate?.slice(0, 10) || "—"}</dd></div>
              <div><dt className="text-muted-foreground">تاريخ العودة</dt><dd className="font-medium">{detail.returnDate?.slice(0, 10) || "—"}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">الوجهات</dt><dd className="font-medium">{detail.destinations?.join("، ") || "—"}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">الطلب</dt><dd className="whitespace-pre-wrap font-medium">{detail.message || "—"}</dd></div>
            </dl>

            <div className="space-y-2">
              <Label>نقل الحالة</Label>
              <Select value={nextStatus} onValueChange={(value) => setNextStatus(value ?? "")} disabled={allowedStatuses.length === 0}>
                <SelectTrigger><SelectValue placeholder={allowedStatuses.length ? "اختر الحالة التالية" : "لا توجد انتقالات متاحة"} /></SelectTrigger>
                <SelectContent>{allowedStatuses.map((status) => <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-internal-note">ملاحظة داخلية</Label>
              <Textarea id="inquiry-internal-note" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} maxLength={5000} />
            </div>
            <Button className="w-full" onClick={submit} disabled={update.isPending || (!nextStatus && !internalNote.trim())}>
              {update.isPending ? "جارٍ الحفظ..." : "حفظ التحديث"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
