"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAddNote } from "../../hooks/useBookings";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface AddNoteDialogProps {
  referenceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ referenceCode, open, onOpenChange }: AddNoteDialogProps) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  
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
          isInternal,
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
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="content">Note Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your note here..."
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="internal"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <Label htmlFor="internal">Internal Note (Hidden from customer)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
