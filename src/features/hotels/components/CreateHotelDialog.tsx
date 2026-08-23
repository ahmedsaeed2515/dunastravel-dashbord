"use client";

import { useState } from "react";
import { HotelItem } from "../types";
import { useCreateHotel, useUpdateHotel } from "../hooks/useHotels";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Hotel, Edit, Loader2 } from "lucide-react";

interface CreateHotelDialogProps {
  hotelToEdit?: HotelItem | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateHotelDialog({ hotelToEdit, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreateHotelDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();

  const [form, setForm] = useState<Partial<HotelItem>>(() => ({
    name: hotelToEdit?.name || "",
    destination: hotelToEdit?.destination || "",
    city: hotelToEdit?.city || "",
    stars: hotelToEdit?.stars ?? 0,
    rating: hotelToEdit?.rating ?? 0,
    pricePerNight: hotelToEdit?.pricePerNight ?? 0,
    image: hotelToEdit?.image || "",
    description: hotelToEdit?.description || "",
    amenities: hotelToEdit?.amenities || []
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    if (hotelToEdit?.id) {
      await updateHotel.mutateAsync({ id: hotelToEdit.id, payload: form });
    } else {
      await createHotel.mutateAsync(form);
    }
    setOpen(false);
  };

  const isPending = createHotel.isPending || updateHotel.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2 rounded-xl shadow-md">
            <Plus className="h-4 w-4" />
            <span>إضافة فندق جديد</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl bg-card border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Hotel className="h-5 w-5 text-amber-500" />
            <span>{hotelToEdit ? "تعديل بيانات الفندق" : "إضافة فندق معتمد جديد"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            إدخال وتخصيص تفاصيل الفندق، عدد النجوم، الأسعار، والمميزات الفندقية.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">اسم الفندق</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} 
              placeholder="مثال: Four Seasons Hotel Cairo" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">الوجهة (الدولة)</Label>
              <Select value={form.destination || "egypt"} onValueChange={(val) => { if (val) setForm(f => ({ ...f, destination: val })); }}>
                <SelectTrigger><SelectValue placeholder="اختر الوجهة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="egypt">مصر (Egypt)</SelectItem>
                  <SelectItem value="turkey">تركيا (Turkey)</SelectItem>
                  <SelectItem value="jordan">الأردن (Jordan)</SelectItem>
                  <SelectItem value="morocco">المغرب (Morocco)</SelectItem>
                  <SelectItem value="greece">اليونان (Greece)</SelectItem>
                  <SelectItem value="dubai">دبي (Dubai)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">المدينة</Label>
              <Input 
                value={form.city} 
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} 
                placeholder="مثال: Cairo / Luxor" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">النجوم</Label>
              <Select value={form.stars ? String(form.stars) : undefined} onValueChange={(val) => { if (val) setForm(f => ({ ...f, stars: Number(val) })); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 نجوم ⭐⭐⭐⭐⭐</SelectItem>
                  <SelectItem value="4">4 نجوم ⭐⭐⭐⭐</SelectItem>
                  <SelectItem value="3">3 نجوم ⭐⭐⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">سعر الليلة (USD)</Label>
              <Input 
                type="number" 
                value={form.pricePerNight} 
                onChange={(e) => setForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">التقييم (1-5)</Label>
              <Input 
                type="number" 
                step="0.1" 
                max="5" 
                value={form.rating} 
                onChange={(e) => setForm(f => ({ ...f, rating: Number(e.target.value) }))} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">رابط صورة الفندق</Label>
            <Input 
              value={form.image} 
              onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} 
              placeholder="https://..." 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">الوصف</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
              placeholder="وصف تفصيلي للخدمات والموقع..." 
              className="h-20 text-xs" 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <span>{hotelToEdit ? "حفظ التعديلات" : "إضافة الفندق"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
