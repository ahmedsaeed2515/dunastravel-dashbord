"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddAttachment } from "../../hooks/useBookings";
import { toast } from "sonner";

interface AddAttachmentDialogProps {
  referenceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAttachmentDialog({ referenceCode, open, onOpenChange }: AddAttachmentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("DOCUMENT");
  
  const { mutate: addAttachment, isPending } = useAddAttachment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    addAttachment(
      {
        referenceCode,
        data: {
          file,
          documentType,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFile(null);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Attachment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={(val: any) => setDocumentType(val || "DOCUMENT")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASSPORT">Passport</SelectItem>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="TICKET">Ticket</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="DOCUMENT">Other Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !file}>
              {isPending ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
