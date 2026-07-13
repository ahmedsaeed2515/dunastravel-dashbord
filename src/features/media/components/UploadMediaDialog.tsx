"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadMediaPayload } from "../types";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: UploadMediaPayload) => void;
  isUploading: boolean;
}

export function UploadMediaDialog({ open, onOpenChange, onUpload, isUploading }: UploadMediaDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [entityType, setEntityType] = useState<'TOUR' | 'GENERAL'>('GENERAL');
  const [altText, setAltText] = useState("");
  const [entityId, setEntityId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    onUpload({
      file,
      entityType,
      altText: altText || undefined,
      entityId: entityType === 'TOUR' && entityId ? entityId : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) {
        setFile(null);
        setEntityType('GENERAL');
        setAltText("");
        setEntityId("");
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Image File</Label>
            <Input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={entityType} onValueChange={(val) => { if(val) setEntityType(val as 'TOUR' | 'GENERAL') }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General Asset</SelectItem>
                <SelectItem value="TOUR">Tour Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entityType === 'TOUR' && (
            <div className="space-y-2">
              <Label>Tour ID (Optional)</Label>
              <Input 
                placeholder="UUID of the tour" 
                value={entityId} 
                onChange={(e) => setEntityId(e.target.value)} 
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Alt Text (Optional)</Label>
            <Input 
              placeholder="Describe the image" 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)} 
              maxLength={255}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
