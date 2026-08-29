"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { useUploadMedia } from "../hooks/useMedia";
import { MediaCategoryItem, MediaEntityType } from "../types";
import { toast } from "sonner";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: MediaCategoryItem[];
  defaultCategorySlug?: string;
  isAr?: boolean;
}

export function UploadMediaDialog({
  open,
  onOpenChange,
  categories = [],
  defaultCategorySlug = "general",
  isAr = false,
}: UploadMediaDialogProps) {
  const { mutate: uploadMedia, isPending } = useUploadMedia();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [targetCategory, setTargetCategory] = useState<string>(defaultCategorySlug);
  const [customEntityId, setCustomEntityId] = useState("");

  useEffect(() => {
    if (!open) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setAltText("");
      setTargetCategory(defaultCategorySlug || "general");
      setCustomEntityId("");
    } else {
      setTargetCategory(defaultCategorySlug || "general");
    }
  }, [open, defaultCategorySlug]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      toast.error(isAr ? "يرجى اختيار صورة بصيغة JPEG أو PNG أو WebP." : "Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "يجب ألا يتجاوز حجم الصورة 10 ميجابايت." : "Images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error(isAr ? "يرجى تحديد ملف صورة أولاً." : "Choose an image before uploading.");
      return;
    }

    let entityType: MediaEntityType = "GENERAL";
    let entityId: string | undefined = undefined;
    let categorySlug: string | undefined = undefined;

    if (targetCategory === "tours") {
      entityType = "TOUR";
      entityId = customEntityId.trim() || undefined;
    } else if (targetCategory === "hotels") {
      entityType = "HOTEL";
      entityId = customEntityId.trim() || undefined;
    } else {
      entityType = "GENERAL";
      categorySlug = targetCategory !== "general" ? targetCategory : undefined;
      entityId = categorySlug;
    }

    uploadMedia(
      {
        file,
        entityType,
        entityId,
        categorySlug,
        altText: altText.trim() || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-transparent border-b">
          <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span>{isAr ? "رفع صورة جديدة للمكتبة" : "Upload Library Image"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {isAr
              ? "اختر صورة عالية الدقة بصيغة JPEG أو PNG أو WebP وحدد الفئة المناسبة لها."
              : "Upload high-resolution verified JPEG, PNG, or WebP file and assign it to a category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* File input & Drag drop box */}
          <div className="space-y-2">
            <Label className="text-xs font-extrabold text-foreground">
              {isAr ? "ملف الصورة *" : "Image file *"}
            </Label>

            {!file ? (
              <label
                htmlFor="library-media-file"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-center group"
              >
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform mb-2">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "انقر لاختيار صورة من جهازك" : "Click to select an image from your device"}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 font-mono">
                  JPEG, PNG, WebP (Max 10 MB)
                </span>
                <Input
                  id="library-media-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectFile}
                  disabled={isPending}
                  required
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3 rounded-2xl bg-muted/40 border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {previewUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB · {file.type.split("/")[1]?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => {
                    setFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Target Category */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-extrabold text-foreground">
                {isAr ? "الفئة / المجلد المستهدف *" : "Target Category / Folder *"}
              </Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger className="h-10 text-xs font-bold">
                  <SelectValue placeholder={isAr ? "اختر فئة" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug} className="text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tour/Hotel ID if applicable */}
          {(targetCategory === "tours" || targetCategory === "hotels") && (
            <div className="space-y-1.5 animate-in fade-in">
              <Label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                <span>
                  {targetCategory === "tours"
                    ? (isAr ? "معرف أو رابط الرحلة (Tour Slug / ID)" : "Tour Slug / ID")
                    : (isAr ? "معرف أو رابط الفندق (Hotel Slug / ID)" : "Hotel Slug / ID")}
                </span>
                <span className="text-[10px] text-muted-foreground">{isAr ? "اختياري" : "Optional"}</span>
              </Label>
              <Input
                placeholder={targetCategory === "tours" ? "e.g. cairo-luxor-aswan" : "e.g. sol-pyramid-hotel"}
                value={customEntityId}
                onChange={(e) => setCustomEntityId(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>
          )}

          {/* Alt text input */}
          <div className="space-y-1.5">
            <Label htmlFor="library-media-alt" className="text-xs font-extrabold text-foreground">
              {isAr ? "النص البديل / وصف الصورة (Alt text)" : "Accessible alt text"}
            </Label>
            <Input
              id="library-media-alt"
              maxLength={255}
              placeholder={isAr ? "وصف موجز لمحتوى الصورة لسهولة البحث..." : "Short description of image content for search..."}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              disabled={isPending}
              className="h-10 text-xs"
            />
          </div>

          <DialogFooter className="p-0 pt-2 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !file}
              className="h-9 text-xs font-bold px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 cursor-pointer shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? "جاري الرفع..." : "Uploading..."}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isAr ? "رفع الصورة الآن" : "Upload Image"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
