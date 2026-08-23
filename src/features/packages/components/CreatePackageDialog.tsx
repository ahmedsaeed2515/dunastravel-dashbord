"use client";

import { useState } from "react";
import { TravelPackage } from "../types";
import { useCreatePackage, useUpdatePackage } from "../hooks/usePackages";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Package as PackageIcon, Loader2 } from "lucide-react";

interface CreatePackageDialogProps {
  packageToEdit?: TravelPackage | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePackageDialog({ packageToEdit, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreatePackageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  const createPkg = useCreatePackage();
  const updatePkg = useUpdatePackage();

  const [form, setForm] = useState<Partial<TravelPackage>>(() => ({
    title: packageToEdit?.title || "",
    slug: packageToEdit?.slug || "",
    destination: packageToEdit?.destination || "",
    duration: packageToEdit?.duration || "",
    price: packageToEdit?.price ?? 0,
    type: packageToEdit?.type || "",
    popular: packageToEdit?.popular ?? false,
    description: packageToEdit?.description || "",
    image: packageToEdit?.image || ""
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    if (packageToEdit?.id) {
      await updatePkg.mutateAsync({ id: packageToEdit.id, payload: form });
    } else {
      await createPkg.mutateAsync(form);
    }
    setOpen(false);
  };

  const isPending = createPkg.isPending || updatePkg.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 rounded-xl shadow-md">
            <Plus className="h-4 w-4" />
            <span>إضافة باكدج جديد</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl bg-card border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <PackageIcon className="h-5 w-5 text-blue-400" />
            <span>{packageToEdit ? "تعديل بيانات الباكدج" : "إضافة باكدج وبرنامج سياحي جديد"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            إدارة برامج الدول المتعددة، باكدجز شهر العسل والرحلات الشاملة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">اسم الباكدج / البرنامج</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} 
              placeholder="مثال: برنامج مصر ودبي الفاخر" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">الوجهة (Destination)</Label>
              <Input 
                value={form.destination} 
                onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))} 
                placeholder="Multi-Country / Egypt / Dubai" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">مدة البرنامج</Label>
              <Input 
                value={form.duration} 
                onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} 
                placeholder="8 أيام / 7 ليالي" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">السعر الإجمالي (USD)</Label>
              <Input 
                type="number" 
                value={form.price} 
                onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">نوع البرنامج</Label>
              <Input 
                value={form.type} 
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} 
                placeholder="Classic / Honeymoon / Adventure" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">رابط صورة الباكدج</Label>
            <Input 
              value={form.image} 
              onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} 
              placeholder="https://..." 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">وصف البرنامج ومميزاته</Label>
            <Textarea 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
              placeholder="شرح مختصر للبرنامج وما يتضمنه من إقامات وجولات..." 
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">باكدج مميز وعالي الطلب (Popular)</span>
              <p className="text-[11px] text-muted-foreground">يظهر في واجهة الموقع مع شارة التميز.</p>
            </div>
            <Switch 
              checked={form.popular} 
              onCheckedChange={(ch) => setForm(f => ({ ...f, popular: ch }))} 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <span>{packageToEdit ? "حفظ التعديلات" : "إضافة الباكدج"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
