"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMediaAssets, useUploadMedia } from "@/features/media/hooks/useMedia";
import {
  Image as ImageIcon,
  Search,
  Upload,
  Check,
  Loader2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  onSelectMultiple,
  title = "اختيار صورة من مكتبة الوسائط",
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: mediaData, isLoading } = useMediaAssets({
    limit: 60,
    search: search.trim() || undefined,
  });

  const uploadMediaMutation = useUploadMedia();

  const handleToggleSelect = (url: string) => {
    if (!multiple) {
      onSelect(url);
      onClose();
      return;
    }

    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple && selectedUrls.length > 0) {
      onSelectMultiple(selectedUrls);
      setSelectedUrls([]);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 10 ميغابايت.");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadMediaMutation.mutateAsync({
        file,
        entityType: "GENERAL",
        altText: file.name.replace(/\.[^/.]+$/, ""),
        categorySlug: "general",
      });
      const newUrl = res.secureUrl || res.url;
      if (newUrl) {
        toast.success("تم رفع الصورة بنجاح واختيارها!");
        onSelect(newUrl);
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[94vw] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border border-border/80 rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  اختر من الصور المرفوعة مسبقاً أو ارفع صورة جديدة مباشرة للسحابة.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all">
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    رفع صورة جديدة
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو الوسم في مكتبة الصور..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl text-xs bg-background/50 h-9"
            />
          </div>
        </DialogHeader>

        {/* Gallery Grid */}
        <ScrollArea className="flex-1 p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">جاري تحميل مكتبة الوسائط...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {mediaData?.data?.map((asset: any) => {
                const imgUrl = asset.secureUrl || asset.url;
                const isSelected = selectedUrls.includes(imgUrl);
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleToggleSelect(imgUrl)}
                    className={`group relative rounded-2xl overflow-hidden border cursor-pointer aspect-video bg-slate-950 transition-all ${
                      isSelected
                        ? "ring-3 ring-amber-500 border-amber-500 shadow-md scale-98"
                        : "border-border/60 hover:border-amber-500/50 hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={asset.altText || asset.titleEn || "Media asset"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay metadata */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-white truncate">
                        {asset.altText || asset.titleEn || asset.filename || "Image"}
                      </span>
                      {asset.category && (
                        <span className="text-[9px] text-amber-400 font-medium">
                          {asset.category.nameEn || asset.category.nameAr}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {(!mediaData?.data || mediaData.data.length === 0) && (
                <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-2xl">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">لا توجد صور مطابقة في مكتبة الوسائط.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {multiple && (
          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 shrink-0 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              تم تحديد <strong>{selectedUrls.length}</strong> صورة
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmMultiple}
                disabled={selectedUrls.length === 0}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
              >
                إضافة الصور المحددة ({selectedUrls.length})
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
