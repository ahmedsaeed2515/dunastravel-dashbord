"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { MediaAsset, MediaCategoryItem, MediaEntityType } from "../types";
import { useBulkMoveMedia, useUpdateMedia } from "../hooks/useMedia";
import { FolderSymlink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface MoveMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: MediaAsset | null;
  selectedAssetIds?: string[];
  categories: MediaCategoryItem[];
  isAr?: boolean;
}

export function MoveMediaDialog({
  open,
  onOpenChange,
  asset,
  selectedAssetIds = [],
  categories,
  isAr = false,
}: MoveMediaDialogProps) {
  const isBulk = selectedAssetIds.length > 1;
  const count = isBulk ? selectedAssetIds.length : asset ? 1 : 0;

  const [targetCategory, setTargetCategory] = useState<string>("general");
  const [altText, setAltText] = useState<string>("");
  const [customEntityId, setCustomEntityId] = useState<string>("");

  const updateMutation = useUpdateMedia();
  const bulkMoveMutation = useBulkMoveMedia();

  useEffect(() => {
    if (asset) {
      setAltText(asset.altText || "");
      if (asset.entityType === "TOUR") {
        setTargetCategory("tours");
        setCustomEntityId(asset.entityId || "");
      } else if (asset.entityType === "HOTEL") {
        setTargetCategory("hotels");
        setCustomEntityId(asset.entityId || "");
      } else {
        setTargetCategory(asset.entityId || "general");
        setCustomEntityId("");
      }
    } else {
      setTargetCategory("general");
      setAltText("");
      setCustomEntityId("");
    }
  }, [asset, open]);

  const isPending = updateMutation.isPending || bulkMoveMutation.isPending;

  const handleSave = async () => {
    let entityType: MediaEntityType = "GENERAL";
    let entityId: string | null = null;

    const cleanEntityId = (customEntityId || "").trim() || null;
    const cleanAltText = (altText || "").trim();

    if (targetCategory === "tours") {
      entityType = "TOUR";
      entityId = cleanEntityId;
    } else if (targetCategory === "hotels") {
      entityType = "HOTEL";
      entityId = cleanEntityId;
    } else {
      entityType = "GENERAL";
      entityId = targetCategory === "general" ? null : targetCategory;
    }

    if (isBulk) {
      await bulkMoveMutation.mutateAsync({
        assetIds: selectedAssetIds,
        entityType,
        entityId,
        categorySlug: targetCategory !== "tours" && targetCategory !== "hotels" ? targetCategory : undefined,
      });
    } else if (asset) {
      await updateMutation.mutateAsync({
        id: asset.id,
        payload: {
          entityType,
          entityId,
          altText: cleanAltText || undefined,
        },
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-transparent border-b">
          <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <FolderSymlink className="w-5 h-5" />
            </div>
            <span>
              {isBulk
                ? (isAr ? `نقل ${count} صور إلى فئة أخرى` : `Move ${count} Images to Category`)
                : (isAr ? "نقل الصورة إلى فئة أخرى" : "Move Image to Another Category")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Image Preview for single move */}
          {!isBulk && asset && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={asset.secureUrl}
                  alt={asset.altText || "Preview"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {asset.altText || (isAr ? "صورة بدون عنوان" : "Untitled asset")}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                  {asset.format.toUpperCase()} · {(asset.bytes / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}

          {/* Target Category Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-extrabold text-foreground">
              {isAr ? "اختر الفئة المستهدفة *" : "Select Target Category *"}
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
                      {cat.count !== undefined && (
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          ({cat.count})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* If Tour or Hotel is selected, optional ID input */}
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

          {/* Alt text editor for single asset */}
          {!isBulk && (
            <div className="space-y-1.5">
              <Label className="text-xs font-extrabold text-foreground">
                {isAr ? "النص البديل / وصف الصورة (Alt text)" : "Accessible Alt Text"}
              </Label>
              <Input
                placeholder="Descriptive text for accessibility..."
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t flex flex-row items-center justify-end gap-2">
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
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-9 text-xs font-bold px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 cursor-pointer shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isAr ? "جاري النقل..." : "Moving..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? "تأكيد النقل" : "Confirm Move"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
