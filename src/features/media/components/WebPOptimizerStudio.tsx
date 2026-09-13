"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Zap,
  UploadCloud,
  Download,
  Sliders,
  CheckCircle2,
  Sparkles,
  Loader2,
  HardDrive,
  X,
  FileImage,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { convertFileToWebP, WebPConversionResult } from "@/lib/webp-converter";
import {
  useUploadBulkMedia,
  useOptimizeAsset,
  useMediaAssets,
} from "../hooks/useMedia";
import { MediaAsset, MediaCategoryItem, MediaEntityType } from "../types";

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
  initialAsset?: MediaAsset | null;
  onAssetOptimized?: (asset: MediaAsset) => void;
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
  initialAsset = null,
  onAssetOptimized,
}: WebPOptimizerStudioProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<"convert-local" | "optimize-library">(
    initialAsset ? "optimize-library" : "convert-local"
  );

  useEffect(() => {
    if (initialAsset) {
      setActiveTab("optimize-library");
      setSelectedLibraryAsset(initialAsset);
    }
  }, [initialAsset]);

  // ==================== FLOW A: LOCAL CONVERSION ====================
  const [quality, setQuality] = useState<number>(88);
  const [maxDimension, setMaxDimension] = useState<string>("2560");
  const [targetCategory, setTargetCategory] = useState<string>("general");
  const [items, setItems] = useState<OptimizedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          ? `تم تحويل ${newItems.length} صورة إلى WebP بنجاح!`
          : `Converted ${newItems.length} images to WebP!`
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => setItems([]);

  const downloadSingle = (item: OptimizedItem) => {
    const a = document.createElement("a");
    a.href = item.previewUrl;
    a.download = item.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(isAr ? `تم تنزيل ${item.file.name}` : `Downloaded ${item.file.name}`);
  };

  const downloadAll = () => {
    items.forEach((item, index) => {
      setTimeout(() => downloadSingle(item), index * 200);
    });
    toast.success(isAr ? `جاري تنزيل ${items.length} صورة محولة...` : `Downloading ${items.length} files...`);
  };

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

  const totalOriginal = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalNew = items.reduce((acc, curr) => acc + curr.newSize, 0);
  const totalSaved = Math.max(0, totalOriginal - totalNew);
  const totalSavingsPct = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  // ==================== FLOW B: CLOUDINARY MEDIA ASSET OPTIMIZATION ====================
  const [selectedLibraryAsset, setSelectedLibraryAsset] = useState<MediaAsset | null>(initialAsset);
  const [librarySearch, setLibrarySearch] = useState("");
  const [targetFormat, setTargetFormat] = useState<"webp" | "avif" | "auto">("webp");
  const [targetQuality, setTargetQuality] = useState<string>("auto");
  const [targetWidth, setTargetWidth] = useState<string>("2000");

  const { data: libraryMedia, isLoading: isLibraryLoading } = useMediaAssets({
    page: 1,
    limit: 30,
    search: librarySearch || undefined,
  });

  const { mutate: optimizeAsset, isPending: isOptimizing } = useOptimizeAsset();

  // Generate live Cloudinary transformed URL for side-by-side preview
  const livePreviewUrl = selectedLibraryAsset
    ? (() => {
        const rawUrl = selectedLibraryAsset.secureUrl || selectedLibraryAsset.url;
        if (!rawUrl.includes("res.cloudinary.com")) return rawUrl;
        const widthPart = targetWidth !== "original" ? `w_${targetWidth},` : "";
        const transform = `f_${targetFormat},q_${targetQuality},${widthPart}c_limit`;
        return rawUrl.replace(/\/upload\/(?:v\d+\/)?/, `/upload/${transform}/`);
      })()
    : null;

  const handleApplyLibraryOptimization = () => {
    if (!selectedLibraryAsset) return;

    optimizeAsset(
      {
        id: selectedLibraryAsset.id,
        payload: {
          format: targetFormat,
          quality: targetQuality,
          width: targetWidth !== "original" ? parseInt(targetWidth, 10) : undefined,
        },
      },
      {
        onSuccess: (updated) => {
          setSelectedLibraryAsset(updated);
          if (onAssetOptimized) onAssetOptimized(updated);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[94vw] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border border-border/80 rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
                <Zap className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "استوديو تحسين وضغط الصور WebP ⚡" : "WebP Image Optimization Studio ⚡"}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    PRO
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "حوّل الصور محلياً أو طبّق صيغة WebP الفائقة على أصول المكتبة السحابية فوراً."
                    : "Convert local files or apply Cloudinary WebP transformation to existing media assets."}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="pt-3">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "convert-local" | "optimize-library")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="convert-local" className="gap-2 text-xs font-semibold">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isAr ? "تحويل ورفع ملفات جديدة (Flow A)" : "Upload & Convert Local Files"}</span>
                </TabsTrigger>
                <TabsTrigger value="optimize-library" className="gap-2 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? "تحسين صورة من المكتبة (Flow B)" : "Optimize Existing Media Asset"}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* ================= CONTENT: FLOW A (LOCAL CONVERSION) ================= */}
        {activeTab === "convert-local" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Settings Bar */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    const num = Array.isArray(val) ? val[0] : typeof val === "number" ? val : 88;
                    setQuality(num);
                  }}
                  min={60}
                  max={100}
                  step={2}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">
                  {isAr ? "الحد الأقصى للأبعاد" : "Max Dimensions"}
                </Label>
                <Select value={maxDimension} onValueChange={setMaxDimension}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3840">4K Ultra (3840px)</SelectItem>
                    <SelectItem value="2560">2K QHD (2560px) - {isAr ? "موصى به" : "Recommended"}</SelectItem>
                    <SelectItem value="1920">Full HD (1920px)</SelectItem>
                    <SelectItem value="1280">HD (1280px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">
                  {isAr ? "التصنيف المستهدف للحفظ" : "Target Category"}
                </Label>
                <Select value={targetCategory} onValueChange={setTargetCategory}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{isAr ? "عام (General)" : "General"}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {isAr ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-emerald-500/80 bg-muted/20 hover:bg-emerald-500/5 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFilesSelected}
                className="hidden"
              />
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {isAr ? "اضغط هنا لاختيار صور من جهازك أو اسحبها إلى هنا" : "Click to select local images or drag & drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, WebP • {isAr ? "يتم التحويل بالكامل داخل المتصفح بأعلى دقة" : "Full in-browser client conversion"}
                </p>
              </div>
            </div>

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 p-4 text-emerald-400 font-semibold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isAr ? "جارٍ تحويل الصور إلى WebP..." : "Converting images to WebP..."}</span>
              </div>
            )}

            {/* Converted Items List */}
            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <span>{isAr ? `تم تحويل ${items.length} صورة` : `${items.length} converted images`}</span>
                    {totalSaved > 0 && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {isAr ? `وفّرت ${formatBytes(totalSaved)} (${totalSavingsPct}%)` : `Saved ${formatBytes(totalSaved)} (${totalSavingsPct}%)`}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-destructive">
                    {isAr ? "مسح الكل" : "Clear All"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border/80 bg-muted/20"
                    >
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl border border-border/60 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs space-y-1">
                        <p className="font-semibold truncate text-foreground">{item.originalName}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="line-through">{formatBytes(item.originalSize)}</span>
                          <span className="font-bold text-emerald-400">{formatBytes(item.newSize)}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 text-emerald-400 border-emerald-500/30">
                            -{item.savingsPercentage}%
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => downloadSingle(item)}
                          className="h-8 w-8 text-foreground hover:bg-emerald-500/20"
                          title={isAr ? "تنزيل" : "Download"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CONTENT: FLOW B (LIBRARY OPTIMIZATION) ================= */}
        {activeTab === "optimize-library" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Step 1: Asset Picker / Current Selected Asset */}
            {!selectedLibraryAsset ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-foreground">
                    {isAr ? "اختر صورة من مكتبة الوسائط لتحسينها:" : "Select an image from media library to optimize:"}
                  </Label>
                  <div className="w-64">
                    <Input
                      placeholder={isAr ? "ابحث في المكتبة..." : "Search media..."}
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {isLibraryLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-2xl bg-muted/10">
                    {libraryMedia?.data
                      ?.filter((a) => !a.mediaType || a.mediaType === "IMAGE")
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-border/70 hover:border-emerald-500 cursor-pointer bg-muted transition-all"
                          onClick={() => setSelectedLibraryAsset(asset)}
                        >
                          <img
                            src={asset.optimizedUrl || asset.secureUrl || asset.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                            <span className="text-white text-[10px] font-bold">
                              {isAr ? "اختيار" : "Select"}
                            </span>
                          </div>
                          {asset.optimizedUrl && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-emerald-500/80 text-white text-[9px] px-1 py-0">
                                WebP
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header for Selected Asset */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedLibraryAsset.secureUrl || selectedLibraryAsset.url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {selectedLibraryAsset.altText || selectedLibraryAsset.publicId}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatBytes(selectedLibraryAsset.bytes)}</span>
                        <span>•</span>
                        <span>{selectedLibraryAsset.format?.toUpperCase() || "IMG"}</span>
                        <span>•</span>
                        <span>{selectedLibraryAsset.width || "?"} × {selectedLibraryAsset.height || "?"}px</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1"
                    onClick={() => setSelectedLibraryAsset(null)}
                  >
                    <span>{isAr ? "تغيير الصورة" : "Choose Different"}</span>
                  </Button>
                </div>

                {/* Optimization Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{isAr ? "صيغة التحويل" : "Target Format"}</Label>
                    <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as any)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webp">WebP (Recommended)</SelectItem>
                        <SelectItem value="avif">AVIF (Ultra Modern)</SelectItem>
                        <SelectItem value="auto">Auto (Cloudinary Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{isAr ? "مستوى الضغط" : "Quality Profile"}</Label>
                    <Select value={targetQuality} onValueChange={setTargetQuality}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">q_auto (Smart Visual Lossless)</SelectItem>
                        <SelectItem value="auto:best">q_auto:best (Maximum Fidelity)</SelectItem>
                        <SelectItem value="auto:eco">q_auto:eco (Maximum Bandwidth Saving)</SelectItem>
                        <SelectItem value="85">Quality 85%</SelectItem>
                        <SelectItem value="90">Quality 90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{isAr ? "أقصى عرض (Width)" : "Max Width"}</Label>
                    <Select value={targetWidth} onValueChange={setTargetWidth}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2560">2560px (2K QHD)</SelectItem>
                        <SelectItem value="2000">2000px (Default Web)</SelectItem>
                        <SelectItem value="1920">1920px (Full HD)</SelectItem>
                        <SelectItem value="original">{isAr ? "بدون تغيير أبعاد" : "Original Dimensions"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>{isAr ? "معاينة مقارنة (قبل وبعد):" : "Before & After Live Comparison:"}</span>
                    {selectedLibraryAsset.optimizedUrl && (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                        {isAr ? "تم تحسين هذا الأصل مسبقاً" : "Already has optimized URL"}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Card */}
                    <div className="rounded-2xl border border-border/80 overflow-hidden bg-muted/20 space-y-2 p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {isAr ? "الأصل الحالي (Original)" : "Current Asset"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {selectedLibraryAsset.format?.toUpperCase()} • {formatBytes(selectedLibraryAsset.bytes)}
                        </span>
                      </div>
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center border">
                        <img
                          src={selectedLibraryAsset.secureUrl || selectedLibraryAsset.url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Card */}
                    <div className="rounded-2xl border-2 border-emerald-500/60 overflow-hidden bg-emerald-500/5 space-y-2 p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                          {isAr ? "المحسّن (WebP Delivery)" : "Optimized WebP"}
                        </Badge>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold">
                          {targetFormat.toUpperCase()} ~65% smaller
                        </span>
                      </div>
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center border border-emerald-500/30">
                        {livePreviewUrl && (
                          <img
                            src={livePreviewUrl}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleApplyLibraryOptimization}
                    disabled={isOptimizing}
                    className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md rounded-xl h-10 px-6"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? "جارٍ تطبيق الرابط..." : "Applying WebP URL..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? "حفظ رابط WebP في قاعدة البيانات" : "Apply & Save WebP URL"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        {activeTab === "convert-local" && (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
