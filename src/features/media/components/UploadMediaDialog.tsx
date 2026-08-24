"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { useUploadMedia } from "../hooks/useMedia";
import { toast } from "sonner";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Uploads a real binary file; unverified remote URLs are never added to the library. */
export function UploadMediaDialog({ open, onOpenChange }: UploadMediaDialogProps) {
  const { mutate: uploadMedia, isPending } = useUploadMedia();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

  useEffect(() => {
    if (!open) {
      setFile(null);
      setAltText("");
    }
  }, [open]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("Images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Choose an image before uploading.");
      return;
    }
    uploadMedia(
      { file, entityType: "GENERAL", altText: altText.trim() || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload library image</DialogTitle>
          <DialogDescription>
            Upload a verified JPEG, PNG, or WebP file. Library assets are persisted as general media; attach tour or hotel images from their own editors.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="library-media-file">Image file</Label>
            <Input id="library-media-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} disabled={isPending} required />
            <p className="text-xs text-muted-foreground">Maximum size: 10 MB. File contents are validated on the server.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="library-media-alt">Accessible alt text</Label>
            <Input id="library-media-alt" maxLength={255} value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isPending} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending || !file}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Upload image
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
