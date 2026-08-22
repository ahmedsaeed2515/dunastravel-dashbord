"use client";

import { useState } from "react";
import { TransportVehicle } from "../types";
import { useCreateVehicle, useUpdateVehicle } from "../hooks/useTransportation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bus, Loader2 } from "lucide-react";

interface CreateTransportDialogProps {
  vehicleToEdit?: TransportVehicle | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTransportDialog({ vehicleToEdit, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreateTransportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  const createVeh = useCreateVehicle();
  const updateVeh = useUpdateVehicle();

  const [form, setForm] = useState<Partial<TransportVehicle>>(() => ({
    name: vehicleToEdit?.name || "",
    category: vehicleToEdit?.category || "bus",
    seats: vehicleToEdit?.seats || 48,
    doors: vehicleToEdit?.doors || 2,
    rating: vehicleToEdit?.rating || 4.9,
    pricePerDay: vehicleToEdit?.pricePerDay || 300,
    image: vehicleToEdit?.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    features: vehicleToEdit?.features || ["تكييف هوائي كامل", "واي فاي مجاني", "سائق محترف"]
  }));

  const [featuresStr, setFeaturesStr] = useState(() => (form.features || []).join(", "));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    const payload = {
      ...form,
      features: featuresStr.split(",").map(s => s.trim()).filter(Boolean)
    };

    if (vehicleToEdit?.id) {
      await updateVeh.mutateAsync({ id: vehicleToEdit.id, payload });
    } else {
      await createVeh.mutateAsync(payload);
    }
    setOpen(false);
  };

  const isPending = createVeh.isPending || updateVeh.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 rounded-xl shadow-md">
            <Plus className="h-4 w-4" />
            <span>إضافة مركبة جديدة</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl bg-card border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Bus className="h-5 w-5 text-purple-400" />
            <span>{vehicleToEdit ? "تعديل بيانات المركبة" : "إضافة مركبة لأسطول Dunas"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            إضافة حافلات سياحية، سيارات VIP أو سيارات دفع رباعي لأسطول النقل.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">اسم وطراز المركبة</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} 
              placeholder="مثال: Mercedes-Benz Tourismo VIP" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">فئة المركبة</Label>
              <Select value={form.category || "bus"} onValueChange={(val) => { if (val) setForm(f => ({ ...f, category: val as any })); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus">حافلة سياحية كبيرة (Bus)</SelectItem>
                  <SelectItem value="van">ميني باص فان VIP (Van)</SelectItem>
                  <SelectItem value="luxury_sedan">سيارة سيدان فاخرة (Luxury Sedan)</SelectItem>
                  <SelectItem value="suv">سيارة دفع رباعي سفاري (4x4 SUV)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">عدد المقاعد (Seats)</Label>
              <Input 
                type="number" 
                value={form.seats} 
                onChange={(e) => setForm(f => ({ ...f, seats: Number(e.target.value) }))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">عدد الأبواب</Label>
              <Input 
                type="number" 
                value={form.doors} 
                onChange={(e) => setForm(f => ({ ...f, doors: Number(e.target.value) }))} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">التكلفة / يوم (USD)</Label>
              <Input 
                type="number" 
                value={form.pricePerDay} 
                onChange={(e) => setForm(f => ({ ...f, pricePerDay: Number(e.target.value) }))} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">التقييم</Label>
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
            <Label className="text-xs font-semibold">رابط صورة المركبة</Label>
            <Input 
              value={form.image} 
              onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} 
              placeholder="https://..." 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">المميزات (مفصولة بفواصل)</Label>
            <Input 
              value={featuresStr} 
              onChange={(e) => setFeaturesStr(e.target.value)} 
              placeholder="تكييف هوائي، واي فاي، مقاعد جلدية، شاشات عرض" 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <span>{vehicleToEdit ? "حفظ التعديلات" : "إضافة للأسطول"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
