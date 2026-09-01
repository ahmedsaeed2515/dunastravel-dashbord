"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Plus, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tour, TourAvailability, TourAvailabilityStatus } from "../types";
import {
  useCreateBatchTourAvailability,
  useCreateTourAvailability,
  useDeleteTourAvailability,
  useTourAvailabilities,
  useUpdateTourAvailability,
} from "../hooks/useTours";

const STATUSES: TourAvailabilityStatus[] = ['AVAILABLE', 'LIMITED', 'SOLD_OUT', 'CLOSED'];

interface AvailabilityManagerProps {
  tour: Tour;
  locale: string;
}

export function AvailabilityManager({ tour, locale }: AvailabilityManagerProps) {
  const { data: slots, isLoading, isError, refetch } = useTourAvailabilities(tour.id);
  const { mutate: createSlot, isPending: isCreating } = useCreateTourAvailability();
  const { mutate: createBatch, isPending: isBatchGenerating } = useCreateBatchTourAvailability();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateTourAvailability();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteTourAvailability();
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<TourAvailabilityStatus>('AVAILABLE');
  const [edits, setEdits] = useState<Record<string, { capacity: string; status: TourAvailabilityStatus }>>({});

  const isAr = locale === 'ar';

  const editFor = (slot: TourAvailability) => edits[slot.id] ?? {
    capacity: String(slot.totalCapacity),
    status: slot.status,
  };
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));

  const create = () => {
    if (!date || !/^\d+$/.test(capacity) || Number(capacity) < 1) {
      toast.error(isAr ? "يرجى تحديد تاريخ وسعة عددية صحيحة (1 على الأقل)." : "A departure date and a whole-number capacity of at least 1 are required.");
      return;
    }
    createSlot(
      { tourId: tour.id, data: { date, totalCapacity: Number(capacity), status } },
      { onSuccess: () => { setDate(""); setCapacity(""); setStatus('AVAILABLE'); } },
    );
  };

  const handleGenerateYearlyBatch = () => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setDate(today.getDate() + 365);

    const startDate = today.toISOString().split('T')[0];
    const endDate = nextYear.toISOString().split('T')[0];

    createBatch({
      tourId: tour.id,
      data: {
        startDate,
        endDate,
        totalCapacity: 25,
      },
    });
  };

  const save = (slot: TourAvailability) => {
    const edit = editFor(slot);
    if (!/^\d+$/.test(edit.capacity) || Number(edit.capacity) < 1) {
      toast.error(isAr ? "يجب أن تكون السعة رقماً صحيحاً لا يقل عن 1." : "Capacity must be a whole number of at least 1.");
      return;
    }
    updateSlot({
      tourId: tour.id,
      id: slot.id,
      data: {
        totalCapacity: Number(edit.capacity),
        status: edit.status,
        expectedUpdatedAt: slot.updatedAt,
      },
    });
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: isAr ? 'متاح (Available)' : 'Available',
    LIMITED: isAr ? 'محدود (Limited)' : 'Limited',
    SOLD_OUT: isAr ? 'مكتمل (Sold Out)' : 'Sold Out',
    CLOSED: isAr ? 'مغلق (Closed)' : 'Closed',
    ON_REQUEST: isAr ? 'عند الطلب (On Request)' : 'On Request',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 text-xs bg-muted/20">
        <div className="text-muted-foreground leading-relaxed">
          {isAr
            ? `تخصيص وإدارة تواريخ المغادرة والسعة الاستيعابية للمقاعد وتحديث الحالات التشغيلية (${slots?.length ?? 0} موعد مسجل).`
            : `Configure and manage departure dates, seat capacity, and operational statuses (${slots?.length ?? 0} departures active).`}
        </div>
        <Button
          type="button"
          onClick={handleGenerateYearlyBatch}
          disabled={isBatchGenerating}
          variant="outline"
          className="rounded-xl font-bold gap-2 shrink-0 border-primary/30 hover:bg-primary/10 text-primary"
        >
          {isBatchGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAr ? "توليد جدول 365 يوماً تلقائياً" : "Generate 365-Day Calendar"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-2xl border p-4 bg-card">
        <label className="text-xs font-bold space-y-1">
          <span className="block">{isAr ? "تاريخ المغادرة" : "Departure Date"}</span>
          <Input aria-label={isAr ? "تاريخ المغادرة" : "New departure date"} type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={isCreating} className="rounded-xl" />
        </label>
        <label className="text-xs font-bold space-y-1">
          <span className="block">{isAr ? "السعة الكلية (مقاعد)" : "Total Capacity (Seats)"}</span>
          <Input aria-label={isAr ? "السعة" : "New departure capacity"} inputMode="numeric" value={capacity} onChange={(event) => setCapacity(event.target.value)} disabled={isCreating} className="rounded-xl" />
        </label>
        <label className="text-xs font-bold space-y-1">
          <span className="block">{isAr ? "الحالة" : "Status"}</span>
          <select aria-label={isAr ? "حالة المغادرة" : "Departure status"} className="w-full h-10 rounded-xl border bg-background px-3 text-xs font-bold" value={status} onChange={(event) => setStatus(event.target.value as TourAvailabilityStatus)} disabled={isCreating}>
            {STATUSES.map((item) => <option key={item} value={item}>{statusLabels[item] || item}</option>)}
          </select>
        </label>
        <Button type="button" onClick={create} disabled={isCreating} className="rounded-xl font-bold gap-1.5">
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {isAr ? "إضافة موعد مغادرة" : "Add Departure"}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground p-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> {isAr ? "جاري تحميل مواعيد المغادرة المتاحة…" : "Loading available departures..."}
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-destructive/40 p-4 text-xs font-bold text-destructive">
          {isAr ? "تعذر تحميل بيانات مواعيد المغادرة." : "Failed to load departure dates."} <Button variant="link" className="h-auto p-0 font-bold" onClick={() => refetch()}>{isAr ? "إعادة المحاولة" : "Retry"}</Button>
        </div>
      )}
      {!isLoading && !isError && slots?.length === 0 && (
        <div className="rounded-2xl border p-6 text-center text-xs font-bold text-muted-foreground">
          {isAr ? "لا توجد مواعيد مغادرة محددة لهذه الرحلة حتى الآن." : "No dated departures have been created for this tour."}
        </div>
      )}
      {slots?.map((slot) => {
        const edit = editFor(slot);
        return (
          <div key={slot.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_130px_1fr_auto] gap-3 items-center rounded-2xl border p-3.5 bg-card">
            <div>
              <div className="font-bold text-sm">{formatDate(slot.date)}</div>
              <div className="text-xs text-muted-foreground font-semibold">
                {isAr
                  ? `${slot.remainingSeats} مقعد متبقي · ${slot.totalCapacity - slot.remainingSeats} محجوز`
                  : `${slot.remainingSeats} seats remaining · ${slot.totalCapacity - slot.remainingSeats} booked`}
              </div>
            </div>
            <Input aria-label={`السعة لـ ${slot.date}`} inputMode="numeric" value={edit.capacity} onChange={(event) => setEdits((previous) => ({ ...previous, [slot.id]: { ...edit, capacity: event.target.value } }))} disabled={isUpdating} className="rounded-xl font-bold" />
            <select aria-label={`الحالة لـ ${slot.date}`} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold" value={edit.status} onChange={(event) => setEdits((previous) => ({ ...previous, [slot.id]: { ...edit, status: event.target.value as TourAvailabilityStatus } }))} disabled={isUpdating}>
              {STATUSES.map((item) => <option key={item} value={item}>{statusLabels[item] || item}</option>)}
            </select>
            <Badge variant={slot.status === 'AVAILABLE' ? 'default' : 'secondary'} className="w-fit font-bold">{statusLabels[slot.status] || slot.status}</Badge>
            <div className="flex gap-1.5">
              <Button size="icon" variant="outline" aria-label={isAr ? "حفظ" : "Save"} onClick={() => save(slot)} disabled={isUpdating} className="rounded-xl"><Save className="w-4 h-4" /></Button>
              <Button size="icon" variant="destructive" aria-label={isAr ? "حذف" : "Delete"} onClick={() => deleteSlot({ tourId: tour.id, id: slot.id })} disabled={isDeleting} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
