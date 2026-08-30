"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddAttachment } from "../../hooks/useBookings";
import { toast } from "sonner";

interface AddAttachmentDialogProps {
  referenceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAttachmentDialog({ referenceCode, open, onOpenChange }: AddAttachmentDialogProps) {
  const [mediaAssetId, setMediaAssetId] = useState("");
  
  const { mutate: addAttachment, isPending } = useAddAttachment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaAssetId.trim()) {
      toast.error("Please provide the uploaded media asset ID");
      return;
    }

    addAttachment(
      {
        referenceCode,
        data: {
          mediaAssetId: mediaAssetId.trim(),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setMediaAssetId("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-sm">ربط مرفق أو مستند بالحجز</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="mediaAssetId" className="text-xs font-bold">معرّف الملف المرفوع (Asset ID)</Label>
            <Input
              id="mediaAssetId"
              value={mediaAssetId}
              onChange={(e) => setMediaAssetId(e.target.value)}
              placeholder="معرّف UUID للملف المرفوع"
              className="text-xs font-mono rounded-xl"
              required
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-bold rounded-xl text-xs">
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending || !mediaAssetId.trim()} className="font-bold rounded-xl text-xs">
              {isPending ? "جاري الربط..." : "ربط المرفق 📎"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
