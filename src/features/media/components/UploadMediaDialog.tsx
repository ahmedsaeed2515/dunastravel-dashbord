"use client";

import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Sparkles,
  Layers,
  FileCheck,
  Zap,
} from "lucide-react";
import { useUploadBulkMedia, useImportMediaUrls } from "../hooks/useMedia";
import { MediaCategoryItem, MediaEntityType, MediaUrlItem } from "../types";
import { toast } from "sonner";
import { convertFileToWebP } from "@/lib/webp-converter";
import { Switch } from "@/components/ui/switch";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: MediaCategoryItem[];
  defaultCategorySlug?: string;
  isAr?: boolean;
}

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
  originalSize?: number;
  newSize?: number;
  savingsPercentage?: number;
  converted?: boolean;
}

interface QueuedUrl {
  id: string;
  url: string;
  altText: string;
  status: "idle" | "validating" | "valid" | "invalid";
  dimensions?: { width: number; height: number };
  errorMessage?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function UploadMediaDialog({
  open,
  onOpenChange,
  categories = [],
  defaultCategorySlug = "general",
  isAr = false,
}: UploadMediaDialogProps) {
  const [activeTab, setActiveTab] = useState<"files" | "urls">("files");

  // Category & Entity settings
  const [targetCategory, setTargetCategory] = useState<string>(defaultCategorySlug);
  const [customEntityId, setCustomEntityId] = useState("");
  const [globalAltText, setGlobalAltText] = useState("");
  const [enableWebPConversion, setEnableWebPConversion] = useState<boolean>(true);

  // Files Queue state
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // URLs Queue state
  const [urlRawInput, setUrlRawInput] = useState("");
  const [queuedUrls, setQueuedUrls] = useState<QueuedUrl[]>([]);
  const [isValidatingUrls, setIsValidatingUrls] = useState(false);

  // Mutations
  const { mutate: uploadBulkMedia, isPending: isUploadingFiles } = useUploadBulkMedia();
  const { mutate: importMediaUrls, isPending: isImportingUrls } = useImportMediaUrls();
  const isPending = isUploadingFiles || isImportingUrls;

  // Cleanup on open/close
  useEffect(() => {
    if (!open) {
      queuedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setQueuedFiles([]);
      setQueuedUrls([]);
      setUrlRawInput("");
      setGlobalAltText("");
      setTargetCategory(defaultCategorySlug || "general");
      setCustomEntityId("");
    } else {
      setTargetCategory(defaultCategorySlug || "general");
    }
  }, [open, defaultCategorySlug]);

  // ---------------- File Selection Handling ----------------
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedList = event.target.files;
    if (!selectedList || selectedList.length === 0) return;

    const maxSizeBytes = 15 * 1024 * 1024;
    const newItems: QueuedFile[] = [];
    let rejectedCount = 0;
    let totalSavedBytes = 0;

    for (let i = 0; i < selectedList.length; i++) {
      const rawFile = selectedList[i];
      if (!rawFile.type.startsWith("image/")) {
        rejectedCount++;
        continue;
      }
      if (rawFile.size > maxSizeBytes) {
        rejectedCount++;
        continue;
      }

      if (enableWebPConversion) {
        // Convert to WebP and compress on client side for maximum speed & quality
        const result = await convertFileToWebP(rawFile, { quality: 0.88, maxWidth: 2560, maxHeight: 2560 });
        const finalFile = result.file;
        const defaultAlt = finalFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        if (result.converted && result.savingsPercentage > 0) {
          totalSavedBytes += Math.max(0, result.originalSize - result.newSize);
        }

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: finalFile,
          previewUrl: URL.createObjectURL(finalFile),
          altText: defaultAlt,
          originalSize: result.originalSize,
          newSize: result.newSize,
          savingsPercentage: result.savingsPercentage,
          converted: result.converted,
        });
      } else {
        const defaultAlt = rawFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: rawFile,
          previewUrl: URL.createObjectURL(rawFile),
          altText: defaultAlt,
          originalSize: rawFile.size,
          newSize: rawFile.size,
          savingsPercentage: 0,
          converted: false,
        });
      }
    }

    if (rejectedCount > 0) {
      toast.warning(
        isAr
          ? `تم استبعاد ${rejectedCount} ملف(ات) لتجاوز الحجم (15MB) أو لعدم توافق صيغة الصورة.`
          : `${rejectedCount} file(s) skipped (must be image under 15MB).`,
      );
    }

    if (newItems.length > 0) {
      setQueuedFiles((prev) => [...prev, ...newItems]);
      const savedMsg = totalSavedBytes > 0
        ? (isAr ? ` (تم توفير ${formatBytes(totalSavedBytes)} بفضل صيغة WEBP)` : ` (Saved ${formatBytes(totalSavedBytes)} via WEBP)`)
        : "";
      toast.success(
        isAr
          ? `تمت إضافة ${newItems.length} صورة بنجاح${savedMsg}!`
          : `Added ${newItems.length} image(s) successfully${savedMsg}!`,
      );
    }

    if (event.target) event.target.value = "";
  };

  const convertAllQueuedToWebP = async () => {
    let convertedCount = 0;
    let totalSaved = 0;
    const updated = await Promise.all(
      queuedFiles.map(async (item) => {
        if (item.converted) return item;
        const result = await convertFileToWebP(item.file, { quality: 0.88, maxWidth: 2560, maxHeight: 2560 });
        if (result.converted) {
          convertedCount++;
          totalSaved += Math.max(0, result.originalSize - result.newSize);
          URL.revokeObjectURL(item.previewUrl);
          return {
            ...item,
            file: result.file,
            previewUrl: URL.createObjectURL(result.file),
            originalSize: result.originalSize,
            newSize: result.newSize,
            savingsPercentage: result.savingsPercentage,
            converted: true,
          };
        }
        return item;
      })
    );
    setQueuedFiles(updated);
    toast.success(
      isAr
        ? `تم تحويل ${convertedCount} صورة إلى WebP وتوفير ${formatBytes(totalSaved)}!`
        : `Converted ${convertedCount} file(s) to WebP, saving ${formatBytes(totalSaved)}!`
    );
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFileAltText = (id: string, text: string) => {
    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, altText: text } : f)),
    );
  };

  // ---------------- URL Parsing & Validation ----------------
  const handleParseUrls = async () => {
    const lines = urlRawInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && /^https?:\/\//i.test(l));

    if (lines.length === 0) {
      toast.error(
        isAr
          ? "يرجى إدخال روابط صور صحيحة تبدأ بـ http:// أو https://"
          : "Please enter valid image URLs starting with http:// or https://",
      );
      return;
    }

    setIsValidatingUrls(true);
    const newUrls: QueuedUrl[] = [];

    for (const url of lines) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      newUrls.push({
        id,
        url,
        altText: url.split("/").pop()?.split("?")[0] || "",
        status: "validating",
      });
    }

    setQueuedUrls((prev) => [...prev, ...newUrls]);
    setUrlRawInput("");

    // Validate images in parallel
    for (const item of newUrls) {
      validateSingleUrl(item);
    }
    setIsValidatingUrls(false);
  };

  const validateSingleUrl = (item: QueuedUrl) => {
    const img = new Image();
    img.onload = () => {
      setQueuedUrls((prev) =>
        prev.map((u) =>
          u.id === item.id
            ? {
                ...u,
                status: "valid",
                dimensions: { width: img.naturalWidth, height: img.naturalHeight },
              }
            : u,
        ),
      );
    };
    img.onerror = () => {
      setQueuedUrls((prev) =>
        prev.map((u) =>
          u.id === item.id
            ? {
                ...u,
                status: "invalid",
                errorMessage: isAr ? "تعذر تحميل الصورة" : "Could not load image",
              }
            : u,
        ),
      );
    };
    img.src = item.url;
  };

  const removeQueuedUrl = (id: string) => {
    setQueuedUrls((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUrlAltText = (id: string, text: string) => {
    setQueuedUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, altText: text } : u)),
    );
  };

  // ---------------- Submit Actions ----------------
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    if (activeTab === "files") {
      if (queuedFiles.length === 0) {
        toast.error(isAr ? "يرجى اختيار ملف صورة واحد على الأقل." : "Select at least one image file.");
        return;
      }

      const files = queuedFiles.map((q) => q.file);
      const altTextsMap: Record<string, string> = {};
      queuedFiles.forEach((q) => {
        if (q.altText.trim()) altTextsMap[q.file.name] = q.altText.trim();
      });

      uploadBulkMedia(
        {
          files,
          entityType,
          entityId,
          categorySlug,
          altText: globalAltText.trim() || undefined,
          altTextsMap,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      const validUrls = queuedUrls.filter((u) => u.status !== "invalid");
      if (validUrls.length === 0) {
        toast.error(
          isAr
            ? "لا توجد روابط صور صالحة للاستيراد. يرجى إدخال ومعاينة الروابط أولاً."
            : "No valid image URLs to import. Validate URLs before importing.",
        );
        return;
      }

      const items: MediaUrlItem[] = validUrls.map((u) => ({
        url: u.url,
        altText: u.altText.trim() || globalAltText.trim() || undefined,
      }));

      importMediaUrls(
        {
          items,
          entityType,
          entityId,
          categorySlug,
          defaultAltText: globalAltText.trim() || undefined,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  };

  const totalFilesBytes = queuedFiles.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-transparent border-b shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-xs">
                <UploadCloud className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "إضافة وسائط وصور للمكتبة" : "Add Media & Digital Assets"}</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "ارفع صوراً من جهازك أو استوردها عبر الروابط المباشرة مع المعاينة الفورية والتخزين السحابي."
                    : "Upload images from device or import via direct URLs with live preview and cloud storage."}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Dual Tabs Bar */}
          <div className="flex items-center gap-2 mt-4 bg-muted/40 p-1 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "files"
                  ? "bg-card text-foreground shadow-xs border border-border/80 font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UploadCloud className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "📁 رفع ملفات من الجهاز" : "📁 Upload from Device"}</span>
              {queuedFiles.length > 0 && (
                <Badge className="px-1.5 py-0 text-[10px] bg-amber-500 text-slate-950 font-mono font-black">
                  {queuedFiles.length}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("urls")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "urls"
                  ? "bg-card text-foreground shadow-xs border border-border/80 font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "🔗 استيراد عبر روابط (URLs)" : "🔗 Import via URLs"}</span>
              {queuedUrls.length > 0 && (
                <Badge className="px-1.5 py-0 text-[10px] bg-amber-500 text-slate-950 font-mono font-black">
                  {queuedUrls.length}
                </Badge>
              )}
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: UPLOAD FILES FROM DEVICE */}
          {activeTab === "files" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isPending}
              />

              {/* WebP Feature Banner & Toggle */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-400">
                      {isAr ? "تحويل وضغط تلقائي إلى WebP ⚡" : "Auto WebP Optimization ⚡"}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr
                        ? "يوفر حتى 80% من مساحة الصور ويرفع سرعة تصفح الموقع بأعلى نقاء للجودة."
                        : "Saves up to 80% bandwidth and boosts site loading speed with high quality."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-emerald-400">
                    {enableWebPConversion ? (isAr ? "مفعّل" : "ON") : (isAr ? "معطّل" : "OFF")}
                  </span>
                  <Switch
                    checked={enableWebPConversion}
                    onCheckedChange={(val) => {
                      setEnableWebPConversion(val);
                      if (val && queuedFiles.some((f) => !f.converted)) {
                        convertAllQueuedToWebP();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Drag & drop upload target */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-500/40 rounded-3xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer text-center group"
              >
                <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform mb-2">
                  <ImageIcon className="w-7 h-7 stroke-[2]" />
                </div>
                <span className="text-xs font-black text-foreground">
                  {isAr
                    ? "انقر لاختيار صورة أو مجموعة صور من جهازك (يدعم التحديد المتعدد)"
                    : "Click to choose single or multiple images from device"}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 font-mono">
                  All Image Formats · Auto-converted to WEBP · Max 15 MB
                </span>
              </div>

              {/* Files Queue List */}
              {queuedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? `الصور المحددة للرفع (${queuedFiles.length}):` : `Selected Images (${queuedFiles.length}):`}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatBytes(totalFilesBytes)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          queuedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                          setQueuedFiles([]);
                        }}
                        className="h-6 text-[10px] text-destructive hover:bg-destructive/10 px-2 rounded-lg"
                      >
                        {isAr ? "مسح الكل" : "Clear All"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {queuedFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 animate-in fade-in"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-border/60">
                            <img
                              src={item.previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-foreground truncate max-w-[180px]">
                                {item.file.name}
                              </p>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                WEBP {item.savingsPercentage && item.savingsPercentage > 0 ? `(-${item.savingsPercentage}%)` : "✓"}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground">
                                {formatBytes(item.file.size)}
                              </Badge>
                            </div>
                            <Input
                              placeholder={isAr ? "نص بديل مخصص لهذه الصورة..." : "Custom Alt text for this image..."}
                              value={item.altText}
                              onChange={(e) => updateFileAltText(item.id, e.target.value)}
                              className="h-7 text-[11px] bg-background/60 rounded-lg"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeQueuedFile(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT VIA DIRECT URLS */}
          {activeTab === "urls" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                  <span>{isAr ? "أدخل رابط أو قائمة روابط الصور المباشرة (رابط لكل سطر) *" : "Enter Direct Image URLs (one per line) *"}</span>
                  <span className="text-[10px] text-muted-foreground">HTTP / HTTPS direct links</span>
                </Label>
                <textarea
                  rows={3}
                  value={urlRawInput}
                  onChange={(e) => setUrlRawInput(e.target.value)}
                  placeholder={
                    isAr
                      ? "https://example.com/photo1.jpg\nhttps://example.com/photo2.webp"
                      : "https://example.com/photo1.jpg\nhttps://example.com/photo2.webp"
                  }
                  className="w-full rounded-2xl border border-border/80 bg-background/60 p-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleParseUrls}
                  disabled={isValidatingUrls || !urlRawInput.trim()}
                  className="h-8 text-xs font-bold gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 rounded-xl"
                >
                  {isValidatingUrls ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isAr ? "فحص ومعاينة الروابط 🔍" : "Verify & Preview URLs 🔍"}</span>
                </Button>
              </div>

              {/* URLs Validation & Preview Grid */}
              {queuedUrls.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? `معاينة الروابط (${queuedUrls.length}):` : `Validated URLs (${queuedUrls.length}):`}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQueuedUrls([])}
                      className="h-6 text-[10px] text-destructive hover:bg-destructive/10 px-2 rounded-lg"
                    >
                      {isAr ? "مسح الكل" : "Clear All"}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {queuedUrls.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in ${
                          item.status === "invalid"
                            ? "bg-destructive/10 border-destructive/40"
                            : item.status === "valid"
                            ? "bg-muted/40 border-emerald-500/30"
                            : "bg-muted/30 border-border/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-border/60 relative flex items-center justify-center">
                            {item.status === "validating" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                            ) : item.status === "invalid" ? (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            ) : (
                              <img
                                src={item.url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono font-semibold text-foreground truncate max-w-[200px]" title={item.url}>
                                {item.url}
                              </p>
                              {item.status === "valid" && (
                                <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                                  {item.dimensions ? `${item.dimensions.width}x${item.dimensions.height}` : "Valid"}
                                </Badge>
                              )}
                              {item.status === "invalid" && (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                                  {item.errorMessage || "Invalid"}
                                </Badge>
                              )}
                            </div>
                            <Input
                              placeholder={isAr ? "نص بديل لهذا الرابط..." : "Alt text for this URL..."}
                              value={item.altText}
                              onChange={(e) => updateUrlAltText(item.id, e.target.value)}
                              className="h-7 text-[11px] bg-background/60 rounded-lg"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeQueuedUrl(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common Settings: Target Category & Entity Slug */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "إعدادات الفئة والربط التلقائي:" : "Category & Entity Destination:"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Select */}
              {categories.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground">
                    {isAr ? "الفئة / المجلد *" : "Target Category *"}
                  </Label>
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger className="h-9 text-xs font-bold rounded-xl">
                      <SelectValue placeholder={isAr ? "اختر فئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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

              {/* General Alt Text */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground">
                  {isAr ? "نص بديل افتراضي عام" : "Default Global Alt Text"}
                </Label>
                <Input
                  placeholder={isAr ? "وصف عام لصور المجموعة..." : "Default description for batch..."}
                  value={globalAltText}
                  onChange={(e) => setGlobalAltText(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Tour/Hotel ID if applicable */}
            {(targetCategory === "tours" || targetCategory === "hotels") && (
              <div className="space-y-1 pt-1 animate-in fade-in">
                <Label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                  <span>
                    {targetCategory === "tours"
                      ? isAr
                        ? "معرف الرحلة (Tour ID or Slug)"
                        : "Tour ID or Slug"
                      : isAr
                      ? "معرف الفندق (Hotel ID or Slug)"
                      : "Hotel ID or Slug"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{isAr ? "اختياري" : "Optional"}</span>
                </Label>
                <Input
                  placeholder={targetCategory === "tours" ? "e.g. cairo-luxor-aswan" : "e.g. sol-pyramid-hotel"}
                  value={customEntityId}
                  onChange={(e) => setCustomEntityId(e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl"
                />
              </div>
            )}
          </div>

          <DialogFooter className="p-0 pt-2 flex flex-row items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                (activeTab === "files" ? queuedFiles.length === 0 : queuedUrls.length === 0)
              }
              className="h-9 text-xs font-black px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 rounded-xl cursor-pointer shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {activeTab === "files"
                      ? isAr
                        ? "جاري رفع الصور..."
                        : "Uploading files..."
                      : isAr
                      ? "جاري استيراد الروابط..."
                      : "Importing URLs..."}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    {activeTab === "files"
                      ? isAr
                        ? `تأكيد ورفع ${queuedFiles.length} صورة`
                        : `Upload ${queuedFiles.length} Image(s)`
                      : isAr
                      ? `تأكيد واستيراد ${queuedUrls.filter((u) => u.status !== "invalid").length} رابط`
                      : `Import ${queuedUrls.filter((u) => u.status !== "invalid").length} URL(s)`}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
