"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAddNote } from "../../hooks/useBookings";
import { toast } from "sonner";

interface AddNoteDialogProps {
  referenceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ referenceCode, open, onOpenChange }: AddNoteDialogProps) {
  const [content, setContent] = useState("");
  
  const { mutate: addNote, isPending } = useAddNote();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter a note");
      return;
    }

    addNote(
      {
        referenceCode,
        data: {
          content,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setContent("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-sm">إضافة ملاحظة على الحجز</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="content" className="text-xs font-bold">محتوى الملاحظة</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب ملاحظاتك وتفاصيل المتابعة هنا..."
              className="min-h-[100px] text-xs rounded-xl"
              required
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-bold rounded-xl text-xs">
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending} className="font-bold rounded-xl text-xs">
              {isPending ? "جاري الإضافة..." : "حفظ الملاحظة ✍️"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
