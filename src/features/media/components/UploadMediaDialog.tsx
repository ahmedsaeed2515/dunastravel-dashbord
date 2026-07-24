"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadMediaPayload } from "../types";
import { useTranslations } from "next-intl";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: UploadMediaPayload) => void;
  isUploading: boolean;
}

export function UploadMediaDialog({ open, onOpenChange, onUpload, isUploading }: UploadMediaDialogProps) {
  const tMedia = useTranslations("media");
  const tCommon = useTranslations("common");

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
          <DialogTitle>{tMedia("uploadAsset")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{tMedia("title")}</Label>
            <Input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{tCommon("type")}</Label>
            <Select value={entityType} onValueChange={(val) => { if(val) setEntityType(val as 'TOUR' | 'GENERAL') }}>
              <SelectTrigger>
                <SelectValue placeholder={tCommon("selectOption")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General Asset</SelectItem>
                <SelectItem value="TOUR">Tour Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entityType === 'TOUR' && (
            <div className="space-y-2">
              <Label>Tour ID</Label>
              <Input 
                placeholder="UUID" 
                className="dir-ltr text-start"
                value={entityId} 
                onChange={(e) => setEntityId(e.target.value)} 
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{tCommon("description")}</Label>
            <Input 
              placeholder={tCommon("description")} 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)} 
              maxLength={255}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? tMedia("uploading") : tMedia("uploadAsset")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
