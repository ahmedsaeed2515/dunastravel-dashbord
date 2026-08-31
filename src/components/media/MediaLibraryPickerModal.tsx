"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  Search,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMediaAssets, useUploadMedia } from "@/features/media/hooks/useMedia";
import { MediaAsset, MediaEntityType } from "@/features/media/types";

export interface SelectedMediaAsset {
  id: string;
  url: string;
  altText?: string;
}

export interface MediaLibraryPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: SelectedMediaAsset) => void;
  selectedAssetId?: string | null;
  selectedAssetUrl?: string | null;
  locale?: string;
  defaultCategory?: string;
}

export function MediaLibraryPickerModal({
  open,
  onClose,
  onSelect,
  selectedAssetId,
  selectedAssetUrl,
  locale = "en",
  defaultCategory,
}: MediaLibraryPickerModalProps) {
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(defaultCategory);
  const [selectedAsset, setSelectedAsset] = useState<SelectedMediaAsset | null>(() => {
    if (selectedAssetId || selectedAssetUrl) {
      return {
        id: selectedAssetId || "",
        url: selectedAssetUrl || "",
      };
    }
    return null;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: mediaResponse, isLoading } = useMediaAssets({
    limit: 100,
    category: categoryFilter,
    search: searchQuery || undefined,
  });

  const mediaAssets: MediaAsset[] = useMemo(() => {
    if (!mediaResponse) return [];
    if (Array.isArray((mediaResponse as any).data)) return (mediaResponse as any).data;
    if (Array.isArray(mediaResponse)) return mediaResponse as unknown as MediaAsset[];
    return [];
  }, [mediaResponse]);

  const uploadMutation = useUploadMedia();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." : "Image size must not exceed 10MB.");
      return;
    }

    try {
      const res = await uploadMutation.mutateAsync({
        file,
        entityType: "GENERAL" as MediaEntityType,
        categorySlug: categoryFilter || "fleet",
      });
      const secureUrl = res.secureUrl || res.url;
      const uploaded: SelectedMediaAsset = {
        id: res.id,
        url: secureUrl,
        altText: res.altText || "",
      };
      setSelectedAsset(uploaded);
      onSelect(uploaded);
      toast.success(isAr ? "تم رفع الصورة بنجاح وتعيينها! 📸" : "Photo uploaded and assigned! 📸");
      onClose();
    } catch {
      toast.error(isAr ? "تعذر رفع الصورة، يرجى المحاولة مرة أخرى." : "Failed to upload photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  const filteredAssets = mediaAssets.filter((asset: MediaAsset) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (asset.altText && asset.altText.toLowerCase().includes(q)) ||
      (asset.publicId && asset.publicId.toLowerCase().includes(q)) ||
      (asset.format && asset.format.toLowerCase().includes(q))
    );
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-3xl bg-card">
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
                <FolderOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "مكتبة الوسائط والصور الفاخرة" : "Media Asset Library"}</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  {isAr
                    ? "اختر صورة عالية الجودة من المكتبة أو قم برفع صورة جديدة مباشرة."
                    : "Choose a high-resolution photo from the library or upload a new one directly."}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>{uploadMutation.isPending ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة جديدة 📸" : "Upload New 📸")}</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={isAr ? "البحث في مكتبة الصور (بالاسم أو المعرف)..." : "Search photos by name or tag..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs pr-9 rtl:pr-9 ltr:pl-9 rounded-xl font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {[
                { id: undefined, labelEn: "All Media", labelAr: "جميع الصور" },
                { id: "fleet", labelEn: "Fleet 🚌", labelAr: "الأسطول 🚌" },
                { id: "hotels", labelEn: "Hotels 🏨", labelAr: "فنادق 🏨" },
                { id: "tours", labelEn: "Tours ✈️", labelAr: "رحلات ✈️" },
                { id: "general", labelEn: "General 🌐", labelAr: "عام 🌐" },
              ].map((tab) => {
                const isActive = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.labelEn}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 max-h-[55vh] overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-xs font-bold">{isAr ? "جاري تحميل الصور من مكتبة الوسائط..." : "Loading media assets..."}</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center border-2 border-dashed rounded-3xl p-8">
              <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground">
                  {isAr ? "لم يتم العثور على صور مطابقة" : "No photos found"}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr
                    ? "يمكنك رفع صورة جديدة من جهازك مباشرة بالضغط على الزر بالأعلى."
                    : "You can upload a new photo directly from your device using the upload button above."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-bold border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 rounded-xl"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                <span>{isAr ? "رفع صورة الآن" : "Upload Photo Now"}</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredAssets.map((asset: MediaAsset) => {
                const imgUrl = asset.secureUrl || asset.url;
                const isSelected =
                  selectedAsset?.id === asset.id ||
                  selectedAsset?.url === imgUrl ||
                  selectedAssetId === asset.id ||
                  selectedAssetUrl === imgUrl;

                return (
                  <div
                    key={asset.id}
                    onClick={() =>
                      setSelectedAsset({
                        id: asset.id,
                        url: imgUrl,
                        altText: asset.altText || "",
                      })
                    }
                    onDoubleClick={() => {
                      const chosen = {
                        id: asset.id,
                        url: imgUrl,
                        altText: asset.altText || "",
                      };
                      setSelectedAsset(chosen);
                      onSelect(chosen);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 aspect-4/3 bg-slate-950 flex flex-col justify-end shadow-xs hover:shadow-md ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-500/40 scale-[1.02]"
                        : "border-border/80 hover:border-amber-500/50"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={asset.altText || "Media Asset"}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {isSelected && (
                      <div className="absolute top-2 right-2 rtl:right-2 ltr:left-2 p-1.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2 rtl:left-2 ltr:right-2">
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-bold px-1.5 py-0 bg-slate-950/80 text-amber-400 border border-amber-400/20 backdrop-blur-xs"
                      >
                        {asset.entityType || "MEDIA"}
                      </Badge>
                    </div>

                    <div className="relative p-2 text-slate-200 text-[10px] space-y-0.5">
                      <div className="font-bold truncate" title={asset.altText || asset.publicId}>
                        {asset.altText || asset.publicId.split("/").pop()}
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[9px] font-mono">
                        <span>{asset.format?.toUpperCase() || "JPG"}</span>
                        {asset.bytes > 0 && <span>{(asset.bytes / 1024).toFixed(0)} KB</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 truncate">
            {selectedAsset ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Check className="w-4 h-4" />
                <span>{isAr ? "تم تحديد صورة" : "Photo Selected"}</span>
                <span className="text-muted-foreground text-[10px] font-mono truncate max-w-[200px]">
                  ({selectedAsset.id ? `ID: ${selectedAsset.id.slice(0, 8)}...` : selectedAsset.url.slice(0, 30)})
                </span>
              </span>
            ) : (
              <span>{isAr ? "انقر على صورة لتحديدها، أو انقر نقراً مزدوجاً للتأكيد الفوري." : "Click a photo to select, or double-click to confirm."}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedAsset}
              onClick={handleConfirm}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 rounded-xl shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-3" />
              <span>{isAr ? "تأكيد واستخدام الصورة" : "Use Selected Photo"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
