"use client";

import React, { useEffect, useState } from 'react';
import { Edit, Hotel, MapPin, Plus, Search, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateHotel, useDeleteHotel, useHotels, useUpdateHotel } from '@/features/hotels/hooks/useHotels';
import { AdminHotel, HotelPayload, HotelStatus } from '@/features/hotels/types';

type HotelForm = {
  slug: string; name: string; description: string; destinationSlug: string; city: string;
  stars: string; rating: string; currency: string; heroMediaId: string; status: HotelStatus; isActive: boolean;
};

const emptyForm = (): HotelForm => ({
  slug: '', name: '', description: '', destinationSlug: '', city: '', stars: '', rating: '',
  currency: 'USD', heroMediaId: '', status: 'DRAFT', isActive: false,
});

const formFor = (hotel: AdminHotel): HotelForm => ({
  slug: hotel.slug, name: hotel.nameJsonb.en ?? '', description: hotel.descriptionJsonb?.en ?? '',
  destinationSlug: hotel.destinationSlug, city: hotel.city, stars: String(hotel.stars),
  rating: hotel.rating === null ? '' : String(hotel.rating), currency: hotel.currency,
  heroMediaId: hotel.heroMediaId ?? '', status: hotel.status, isActive: hotel.isActive,
});

const payloadFor = (form: HotelForm): HotelPayload | null => {
  const stars = Number(form.stars);
  const rating = form.rating.trim() ? Number(form.rating) : undefined;
  if (!form.slug || !form.name || !form.destinationSlug || !form.city || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    toast.error('Slug, English name, destination, city, and 1–5 stars are required.');
    return null;
  }
  if (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    toast.error('Rating must be between 0 and 5.');
    return null;
  }
  return {
    slug: form.slug, nameJsonb: { en: form.name },
    ...(form.description.trim() ? { descriptionJsonb: { en: form.description } } : {}),
    destinationSlug: form.destinationSlug, city: form.city, stars,
    ...(rating !== undefined ? { rating } : {}), currency: form.currency.toUpperCase(),
    ...(form.heroMediaId.trim() ? { heroMediaId: form.heroMediaId.trim() } : {}),
    status: form.status, isActive: form.isActive,
  };
};

export const HotelsManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminHotel | null>(null);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useHotels({ page: 1, limit: 100, search: search || undefined });
  const remove = useDeleteHotel();
  const openNew = () => { setSelected(null); setOpen(true); };
  const openEdit = (hotel: AdminHotel) => { setSelected(hotel); setOpen(true); };
  const archive = (hotel: AdminHotel) => {
    if (window.confirm(`Archive ${hotel.nameJsonb.en ?? hotel.slug}? This removes it from the public catalog.`)) remove.mutate(hotel.id);
  };

  return <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:flex-row sm:items-center">
      <div className="flex items-center gap-3"><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500"><Hotel className="h-6 w-6" /></div><div><h2 className="font-heading text-xl font-bold">Hotels</h2><p className="text-xs text-muted-foreground">Canonical hotel inventory, publication state, and linked media.</p></div></div>
      <Button onClick={openNew} className="gap-2 rounded-2xl bg-emerald-500 px-6 font-bold text-slate-950 hover:bg-emerald-600"><Plus className="h-4 w-4" /> Add hotel</Button>
    </div>
    <div className="relative w-full sm:w-80"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slug or city…" className="rounded-2xl pe-9 text-xs" /></div>
    {isLoading && <p className="text-sm text-muted-foreground">Loading hotels from the backend…</p>}
    {isError && <p className="text-sm text-destructive">The hotel inventory could not be loaded.</p>}
    {!isLoading && !isError && data?.data.length === 0 && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hotel records match this query.</p>}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{data?.data.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} onEdit={openEdit} onArchive={archive} />)}</div>
    <HotelDialog hotel={selected} open={open} onOpenChange={setOpen} />
  </div>;
};

function HotelCard({ hotel, onEdit, onArchive }: { hotel: AdminHotel; onEdit: (hotel: AdminHotel) => void; onArchive: (hotel: AdminHotel) => void }) {
  const lowestRate = hotel.rooms.length ? Math.min(...hotel.rooms.map((room) => room.ratePerNight)) : null;
  return <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs sm:flex-row">
    <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-2xl border border-dashed bg-muted/40 text-center text-xs text-muted-foreground sm:w-36">{hotel.heroImageUrl ? 'Hero media linked' : 'No hero media'}</div>
    <div className="min-w-0 flex-1 space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-1 text-xs font-bold text-emerald-600"><MapPin className="h-3 w-3" /> {hotel.city} · {hotel.destinationSlug}</p><h3 className="truncate font-bold">{hotel.nameJsonb.en ?? hotel.slug}</h3><p className="text-xs text-muted-foreground">/{hotel.slug}</p></div><Badge variant={hotel.status === 'PUBLISHED' && hotel.isActive ? 'default' : 'secondary'}>{hotel.status}{hotel.isActive ? ' · active' : ''}</Badge></div>
      <div className="flex items-center justify-between border-t pt-3 text-xs"><span className="flex items-center gap-1 text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /> {hotel.stars} stars{hotel.rating !== null ? ` · ${hotel.rating}` : ''}</span><span className="font-semibold text-emerald-600">{lowestRate === null ? 'No active room rate' : `${hotel.currency} ${lowestRate} / night`}</span><span className="flex gap-1"><Button size="icon-sm" variant="ghost" onClick={() => onEdit(hotel)} aria-label={`Edit ${hotel.slug}`}><Edit className="h-4 w-4" /></Button><Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onArchive(hotel)} aria-label={`Archive ${hotel.slug}`}><Trash2 className="h-4 w-4" /></Button></span></div></div>
  </div>;
}

function HotelDialog({ hotel, open, onOpenChange }: { hotel: AdminHotel | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState<HotelForm>(emptyForm);
  const create = useCreateHotel();
  const update = useUpdateHotel();
  const saving = create.isPending || update.isPending;
  useEffect(() => { if (open) setForm(hotel ? formFor(hotel) : emptyForm()); }, [hotel, open]);
  const set = <K extends keyof HotelForm>(key: K, value: HotelForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    const payload = payloadFor(form);
    if (!payload) return;
    try { if (hotel) await update.mutateAsync({ id: hotel.id, payload }); else await create.mutateAsync(payload); onOpenChange(false); } catch { /* mutation toast already explains the failure */ }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl"><DialogHeader><DialogTitle>{hotel ? 'Edit hotel' : 'Add hotel'}</DialogTitle><DialogDescription>Values are saved to the Hotel database model. A hotel only appears publicly when it is both published and active.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2">
    <Field label="English hotel name *"><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field><Field label="Slug *"><Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="nile-palace-luxor" /></Field>
    <Field label="Destination slug *"><Input value={form.destinationSlug} onChange={(e) => set('destinationSlug', e.target.value)} placeholder="luxor" /></Field><Field label="City *"><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
    <Field label="Stars *"><Input type="number" min="1" max="5" value={form.stars} onChange={(e) => set('stars', e.target.value)} /></Field><Field label="Rating (0–5)"><Input type="number" min="0" max="5" step="0.01" value={form.rating} onChange={(e) => set('rating', e.target.value)} /></Field>
    <Field label="Currency"><Input value={form.currency} maxLength={3} onChange={(e) => set('currency', e.target.value.toUpperCase())} /></Field><Field label="Hero media ID"><Input value={form.heroMediaId} onChange={(e) => set('heroMediaId', e.target.value)} placeholder="Media asset UUID" /></Field>
    <Field label="Publication status"><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => set('status', e.target.value as HotelStatus)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></Field><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active on public catalog</label>
    <div className="sm:col-span-2"><Field label="English description"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} /></Field></div>
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save hotel'}</Button></DialogFooter></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-medium">{label}{children}</label>; }
