"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertPassengers } from "../../hooks/useBookings";
import { toast } from "sonner";
import { Passenger } from "../../types";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditPassengersDialogProps {
  referenceCode: string;
  initialPassengers: Passenger[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPassengersDialog({ referenceCode, initialPassengers, open, onOpenChange }: EditPassengersDialogProps) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  
  useEffect(() => {
    if (open) {
      setPassengers(initialPassengers || []);
    }
  }, [open, initialPassengers]);

  const { mutate: upsertPassengers, isPending } = useUpsertPassengers();

  const handleAdd = () => {
    setPassengers([...passengers, { passengerType: "ADULT", fullName: "" }]);
  };

  const handleRemove = (index: number) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengers.some(p => !p.fullName.trim())) {
      toast.error("All passengers must have a full name");
      return;
    }

    upsertPassengers(
      {
        referenceCode,
        data: { passengers },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg">تعديل بيانات المسافرين والركاب</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 pt-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {passengers.map((p, index) => (
                <div key={index} className="border p-4 rounded-2xl relative space-y-4 bg-muted/20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">الاسم بالكامل</Label>
                      <Input
                        value={p.fullName}
                        onChange={(e) => handleChange(index, "fullName", e.target.value)}
                        placeholder="اسم المسافر"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">نوع المسافر</Label>
                      <Select value={p.passengerType} onValueChange={(val: any) => handleChange(index, "passengerType", val || "ADULT")}>
                        <SelectTrigger className="rounded-xl font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADULT">بالغ (Adult)</SelectItem>
                          <SelectItem value="CHILD">طفل (Child)</SelectItem>
                          <SelectItem value="INFANT">رضيع (Infant)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">رقم جواز السفر</Label>
                      <Input
                        value={p.passportNumber || ""}
                        onChange={(e) => handleChange(index, "passportNumber", e.target.value)}
                        placeholder="A00000000"
                        className="rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">الجنسية</Label>
                      <Input
                        value={p.nationality || ""}
                        onChange={(e) => handleChange(index, "nationality", e.target.value)}
                        placeholder="Saudi, Spanish, Brazilian..."
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {passengers.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-xs font-bold">
                  لا يوجد مسافرون مضافون حتى الآن.
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleAdd} className="gap-2 rounded-xl font-bold">
              <Plus className="w-4 h-4" /> إضافة مسافر ➕
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-xl font-bold">
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
