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
          <DialogTitle>Link Uploaded Attachment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="mediaAssetId">Media asset ID</Label>
            <Input
              id="mediaAssetId"
              value={mediaAssetId}
              onChange={(e) => setMediaAssetId(e.target.value)}
              placeholder="UUID returned by the media upload"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !mediaAssetId.trim()}>
              {isPending ? "Linking..." : "Link Attachment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
