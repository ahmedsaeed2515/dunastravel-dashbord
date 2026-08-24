"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tour, TourAvailability, TourAvailabilityStatus } from "../types";
import {
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
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateTourAvailability();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteTourAvailability();
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<TourAvailabilityStatus>('AVAILABLE');
  const [edits, setEdits] = useState<Record<string, { capacity: string; status: TourAvailabilityStatus }>>({});

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
      toast.error("A departure date and a whole-number capacity of at least 1 are required.");
      return;
    }
    createSlot(
      { tourId: tour.id, data: { date, totalCapacity: Number(capacity), status } },
      { onSuccess: () => { setDate(""); setCapacity(""); setStatus('AVAILABLE'); } },
    );
  };

  const save = (slot: TourAvailability) => {
    const edit = editFor(slot);
    if (!/^\d+$/.test(edit.capacity) || Number(edit.capacity) < 1) {
      toast.error("Capacity must be a whole number of at least 1.");
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3 text-sm text-muted-foreground">
        Seats are owned by dated departures. Reserved seats remain server-calculated; changing a departure capacity cannot overwrite booking truth.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end rounded-md border p-3">
        <label className="text-sm space-y-1"><span className="block">Departure date</span><Input aria-label="New departure date" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={isCreating} /></label>
        <label className="text-sm space-y-1"><span className="block">Capacity</span><Input aria-label="New departure capacity" inputMode="numeric" value={capacity} onChange={(event) => setCapacity(event.target.value)} disabled={isCreating} /></label>
        <label className="text-sm space-y-1"><span className="block">Status</span><select aria-label="New departure status" className="w-full h-10 rounded-md border bg-background px-3" value={status} onChange={(event) => setStatus(event.target.value as TourAvailabilityStatus)} disabled={isCreating}>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <Button type="button" onClick={create} disabled={isCreating}>{isCreating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Add departure</Button>
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading departure availability…</div>}
      {isError && <div className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">Could not load departure availability. <Button variant="link" className="h-auto p-0" onClick={() => refetch()}>Retry</Button></div>}
      {!isLoading && !isError && slots?.length === 0 && <div className="rounded-md border p-4 text-sm text-muted-foreground">No dated departures have been created for this tour.</div>}
      {slots?.map((slot) => {
        const edit = editFor(slot);
        return <div key={slot.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_130px_1fr_auto] gap-2 items-center rounded-md border p-3">
          <div><div className="font-medium">{formatDate(slot.date)}</div><div className="text-xs text-muted-foreground">{slot.remainingSeats} remaining · {slot.totalCapacity - slot.remainingSeats} reserved</div></div>
          <Input aria-label={`Capacity for ${slot.date}`} inputMode="numeric" value={edit.capacity} onChange={(event) => setEdits((previous) => ({ ...previous, [slot.id]: { ...edit, capacity: event.target.value } }))} disabled={isUpdating} />
          <select aria-label={`Status for ${slot.date}`} className="h-10 rounded-md border bg-background px-3" value={edit.status} onChange={(event) => setEdits((previous) => ({ ...previous, [slot.id]: { ...edit, status: event.target.value as TourAvailabilityStatus } }))} disabled={isUpdating}>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <Badge variant={slot.status === 'AVAILABLE' ? 'default' : 'secondary'} className="w-fit">{slot.status}</Badge>
          <div className="flex gap-1"><Button size="icon" variant="outline" aria-label="Save departure" onClick={() => save(slot)} disabled={isUpdating}><Save className="w-4 h-4" /></Button><Button size="icon" variant="destructive" aria-label="Remove departure" onClick={() => deleteSlot({ tourId: tour.id, id: slot.id })} disabled={isDeleting}><Trash2 className="w-4 h-4" /></Button></div>
        </div>;
      })}
    </div>
  );
}
