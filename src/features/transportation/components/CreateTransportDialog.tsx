"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  const params = useParams();
  const isAr = params?.locale === "ar";

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
    features: vehicleToEdit?.features || ["Full A/C", "Free 5G Wi-Fi", "Professional Driver"]
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
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 rounded-xl shadow-md cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>{isAr ? "إضافة مركبة جديدة" : "Add New Vehicle"}</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl bg-card border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Bus className="h-5 w-5 text-purple-400" />
            <span>{vehicleToEdit ? (isAr ? "تعديل بيانات المركبة" : "Edit Fleet Vehicle") : (isAr ? "إضافة مركبة لأسطول Dunas" : "Add Vehicle to Dunas Fleet")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAr
              ? "إضافة حافلات سياحية، سيارات VIP أو سيارات دفع رباعي لأسطول النقل."
              : "Add tourist coaches, luxury VIP sedans, or 4x4 safari vehicles to the fleet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{isAr ? "اسم وطراز المركبة" : "Vehicle Make & Model"}</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} 
              placeholder={isAr ? "مثال: Mercedes-Benz Tourismo VIP" : "e.g. Mercedes-Benz Tourismo VIP"} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "فئة المركبة" : "Category"}</Label>
              <Select value={form.category || "bus"} onValueChange={(val) => { if (val) setForm(f => ({ ...f, category: val as any })); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus">{isAr ? "حافلة سياحية (Bus)" : "Tour Coach (Bus)"}</SelectItem>
                  <SelectItem value="van">{isAr ? "ميني باص / فان (Van)" : "Executive Van (Van)"}</SelectItem>
                  <SelectItem value="luxury_sedan">{isAr ? "سيدان VIP (Sedan)" : "Luxury Sedan (Sedan)"}</SelectItem>
                  <SelectItem value="suv">{isAr ? "دفع رباعي سفاري (SUV)" : "Safari 4x4 (SUV)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "السعر لليوم ($)" : "Daily Rate ($)"}</Label>
              <Input 
                type="number" 
                value={form.pricePerDay || ""} 
                onChange={(e) => setForm(f => ({ ...f, pricePerDay: Number(e.target.value) }))} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "عدد المقاعد" : "Seats"}</Label>
              <Input 
                type="number" 
                value={form.seats || ""} 
                onChange={(e) => setForm(f => ({ ...f, seats: Number(e.target.value) }))} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "عدد الأبواب" : "Doors"}</Label>
              <Input 
                type="number" 
                value={form.doors || ""} 
                onChange={(e) => setForm(f => ({ ...f, doors: Number(e.target.value) }))} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "التقييم (1-5)" : "Rating (1-5)"}</Label>
              <Input 
                type="number" 
                step="0.05" 
                value={form.rating || ""} 
                onChange={(e) => setForm(f => ({ ...f, rating: Number(e.target.value) }))} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{isAr ? "رابط الصورة" : "Image URL"}</Label>
            <Input 
              value={form.image} 
              onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} 
              placeholder="https://..." 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{isAr ? "الميزات (مفصولة بفواصل)" : "Features (comma separated)"}</Label>
            <Input 
              value={featuresStr} 
              onChange={(e) => setFeaturesStr(e.target.value)} 
              placeholder={isAr ? "تكييف, واي فاي, مقاعد جلدية..." : "Air Conditioning, Free 5G Wi-Fi, Leather Seats..."} 
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isPending} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
              {isPending && <Loader2 className="h-4 w-4 animate-spin me-1.5" />}
              {vehicleToEdit ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المركبة" : "Add Vehicle")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
