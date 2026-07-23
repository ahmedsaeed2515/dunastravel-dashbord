/* eslint-disable react-hooks/set-state-in-effect */
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
          <DialogTitle>Edit Passengers</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 pt-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {passengers.map((p, index) => (
                <div key={index} className="border p-4 rounded-lg relative space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={p.fullName}
                        onChange={(e) => handleChange(index, "fullName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={p.passengerType} onValueChange={(val: any) => handleChange(index, "passengerType", val || "ADULT")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADULT">Adult</SelectItem>
                          <SelectItem value="CHILD">Child</SelectItem>
                          <SelectItem value="INFANT">Infant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Passport Number</Label>
                      <Input
                        value={p.passportNumber || ""}
                        onChange={(e) => handleChange(index, "passportNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input
                        value={p.nationality || ""}
                        onChange={(e) => handleChange(index, "nationality", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {passengers.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No passengers added yet.
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" /> Add Passenger
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
