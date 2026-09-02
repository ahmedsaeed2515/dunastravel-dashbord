"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  UploadCloud,
  Download,
  Trash2,
  Sliders,
  CheckCircle2,
  FileCheck,
  ImageIcon,
  Sparkles,
  Loader2,
  ArrowRight,
  HardDrive,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { convertFileToWebP, WebPConversionResult } from "@/lib/webp-converter";
import { useUploadBulkMedia } from "../hooks/useMedia";
import { MediaCategoryItem, MediaEntityType } from "../types";

interface OptimizedItem extends WebPConversionResult {
  id: string;
  originalName: string;
  previewUrl: string;
  selectedAltText: string;
}

interface WebPOptimizerStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: MediaCategoryItem[];
  isAr?: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function WebPOptimizerStudio({
  open,
  onOpenChange,
  categories = [],
  isAr = true,
}: WebPOptimizerStudioProps) {
  // Settings
  const [quality, setQuality] = useState<number>(88);
  const [maxDimension, setMaxDimension] = useState<string>("2560");
  const [targetCategory, setTargetCategory] = useState<string>("general");

  // Queue
  const [items, setItems] = useState<OptimizedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mutation
  const { mutate: uploadBulkMedia, isPending: isSavingToMedia } = useUploadBulkMedia();

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setIsProcessing(true);
    const newItems: OptimizedItem[] = [];
    const maxDim = parseInt(maxDimension, 10) || 2560;
    const qValue = quality / 100;

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      if (!file.type.startsWith("image/")) continue;

      try {
        const result = await convertFileToWebP(file, {
          quality: qValue,
          maxWidth: maxDim,
          maxHeight: maxDim,
        });

        const previewUrl = URL.createObjectURL(result.file);
        const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        newItems.push({
          ...result,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          originalName: file.name,
          previewUrl,
          selectedAltText: alt,
        });
      } catch (err) {
        console.error("Failed to convert image:", err);
      }
    }

    setIsProcessing(false);

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      toast.success(
        isAr
          ? `تم تحويل ${newItems.length} صورة إلى صيغة WEBP بنجاح!`
          : `Converted ${newItems.length} image(s) to WebP!`
      );
    }

    if (e.target) e.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
  };

  // Download single item
  const downloadSingle = (item: OptimizedItem) => {
    const a = document.createElement("a");
    a.href = item.previewUrl;
    a.download = item.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(isAr ? `تم تنزيل ${item.file.name}` : `Downloaded ${item.file.name}`);
  };

  // Download all items sequentially
  const downloadAll = () => {
    items.forEach((item, index) => {
      setTimeout(() => {
        downloadSingle(item);
      }, index * 200);
    });
    toast.success(isAr ? `جاري تنزيل ${items.length} صورة محولة...` : `Downloading ${items.length} files...`);
  };

  // Save all to Media Library
  const handleSaveToMediaLibrary = () => {
    if (items.length === 0) return;

    uploadBulkMedia(
      {
        files: items.map((item) => item.file),
        entityType: "GENERAL" as MediaEntityType,
        categorySlug: targetCategory,
      },
      {
        onSuccess: () => {
          toast.success(
            isAr
              ? `تم حفظ ${items.length} صورة WebP في مكتبة الوسائط بنجاح!`
              : `Saved ${items.length} WebP images to Media Library!`
          );
          clearAll();
          onOpenChange(false);
        },
      }
    );
  };

  // Summary stats
  const totalOriginal = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalNew = items.reduce((acc, curr) => acc + curr.newSize, 0);
  const totalSaved = Math.max(0, totalOriginal - totalNew);
  const totalSavingsPct = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[94vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border border-border/80 rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
                <Zap className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "استوديو تحويل وضغط الصور WebP ⚡" : "WebP Image Optimization Studio ⚡"}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    PRO
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "حوّل صورك إلى صيغة WebP فائقة السرعة مع تقليل الحجم حتى 85% وتوفير استهلاك البيانات."
                    : "Convert images to ultra-fast WebP format, saving up to 85% file size with zero quality loss."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Settings Bar */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "نسبة الجودة والنقاء" : "Image Quality"}:</span>
                </Label>
                <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-400 border-emerald-500/30">
                  {quality}% {quality >= 85 ? (isAr ? "(فائقة)" : "(High)") : (isAr ? "(متوازنة)" : "(Balanced)")}
                </Badge>
              </div>
              <Slider
                value={[quality]}
                onValueChange={(val: any) => {
                  const num = Array.isArray(val) ? val[0] : typeof val === 'number' ? val : 88;
                  setQuality(num);
                }}
                min={60}
                max={100}
                step={2}
                className="cursor-pointer"
              />
            </div>

            {/* Max Resolution */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {isAr ? "أقصى دقة للأبعاد" : "Max Resolution"}
              </Label>
              <Select value={maxDimension} onValueChange={setMaxDimension}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920">1080p (1920px Full HD)</SelectItem>
                  <SelectItem value="2560">2K (2560px QHD - موصى به)</SelectItem>
                  <SelectItem value="3840">4K (3840px Ultra HD)</SelectItem>
                  <SelectItem value="99999">{isAr ? "الدقة الأصلية بالكامل" : "Original Full Resolution"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {isAr ? "فئة الحفظ بالمكتبة" : "Save Category"}
              </Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{isAr ? "المكتبة العامة (General)" : "General Library"}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {isAr ? c.nameAr || c.nameEn : c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
            disabled={isProcessing}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/40 rounded-3xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer text-center group"
          >
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform mb-3">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Zap className="w-8 h-8 stroke-[2]" />
              )}
            </div>
            <span className="text-sm font-black text-foreground">
              {isProcessing
                ? (isAr ? "جاري تحويل وضغط الصور بالمتصفح..." : "Processing & converting images...")
                : (isAr ? "اسحب وأفلت الصور هنا أو انقر لاختيارها من جهازك" : "Drag & drop images here or click to browse")}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-mono">
              JPEG, PNG, TIFF, BMP · Supports multi-select · Instant 0ms conversion
            </span>
          </div>

          {/* 3. Converted Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? `الصور المحولة جاهزة (${items.length}):` : `Converted Images (${items.length}):`}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {isAr ? "مسح القائمة" : "Clear List"}
                </Button>
              </div>

              {/* Total Metrics Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">{isAr ? "الحجم الأصلي: " : "Original: "}</span>
                    <span className="font-bold font-mono text-foreground">{formatBytes(totalOriginal)}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">{isAr ? "الحجم بعد WebP: " : "WebP: "}</span>
                    <span className="font-bold font-mono text-emerald-400">{formatBytes(totalNew)}</span>
                  </div>
                </div>

                <Badge className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 shadow-sm">
                  {isAr ? `وفرت ${totalSavingsPct}% (${formatBytes(totalSaved)}) 🔥` : `Saved ${totalSavingsPct}% (${formatBytes(totalSaved)}) 🔥`}
                </Badge>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between gap-3 animate-in fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-border/60">
                        <img
                          src={item.previewUrl}
                          alt="WebP preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-muted-foreground line-through font-mono">
                            {formatBytes(item.originalSize)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">
                            {formatBytes(item.newSize)}
                          </span>
                          {item.savingsPercentage > 0 && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              -{item.savingsPercentage}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadSingle(item)}
                        title={isAr ? "تنزيل لجهازك" : "Download"}
                        className="h-8 w-8 text-foreground hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground font-mono">
            {items.length > 0 ? (
              <span>{isAr ? `${items.length} ملف جاهز` : `${items.length} ready files`}</span>
            ) : (
              <span>{isAr ? "لم يتم تحديد أي ملفات بعد" : "No files selected yet"}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAll}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? "تنزيل الكل لجهازي" : "Download All WebP"}</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSaveToMediaLibrary}
              disabled={items.length === 0 || isSavingToMedia}
              className="h-9 text-xs font-bold gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md rounded-xl"
            >
              {isSavingToMedia ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? "جاري الحفظ في المكتبة..." : "Saving to library..."}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? "حفظ الكل في مكتبة الوسائط ☁️" : "Save to Media Library ☁️"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
