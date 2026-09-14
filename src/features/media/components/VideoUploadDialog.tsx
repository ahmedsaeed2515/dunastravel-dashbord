"use client";

import { useState, useRef, useEffect, useMemo, ChangeEvent } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UploadCloud,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Play,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Film,
  Trash2,
  Globe,
} from "lucide-react";
import { useUploadVideo } from "../hooks/useMedia";
import { MediaAsset } from "../types";
import { toast } from "sonner";

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAr?: boolean;
  defaultAddToShowcase?: boolean;
  categorySlug?: string;
  onSuccess?: (asset: MediaAsset) => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function VideoUploadDialog({
  open,
  onOpenChange,
  isAr = false,
  defaultAddToShowcase = true,
  categorySlug = "showcase",
  onSuccess,
}: VideoUploadDialogProps) {
  const [sourceType, setSourceType] = useState<"file" | "url">("file");

  // File states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // URL states
  const [videoUrl, setVideoUrl] = useState("");

  // Poster states
  const [posterSource, setPosterSource] = useState<"none" | "file" | "url">("none");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterFilePreview, setPosterFilePreview] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState("");
  const posterInputRef = useRef<HTMLInputElement | null>(null);

  // Metadata states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [addToShowcase, setAddToShowcase] = useState(defaultAddToShowcase);

  // Mutation
  const { mutate: uploadVideo, isPending } = useUploadVideo();

  // Reset when dialog opens or closes
  useEffect(() => {
    if (!open) {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      if (posterFilePreview) URL.revokeObjectURL(posterFilePreview);
      setVideoFile(null);
      setFilePreviewUrl(null);
      setVideoUrl("");
      setPosterSource("none");
      setPosterFile(null);
      setPosterFilePreview(null);
      setPosterUrl("");
      setTitle("");
      setDescription("");
      setAltText("");
      setAddToShowcase(defaultAddToShowcase);
      setSourceType("file");
    }
  }, [open, defaultAddToShowcase]);

  // Handle local video selection
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSizeBytes) {
      toast.error(
        isAr
          ? "حجم الفيديو يتجاوز الحد الأقصى (100 ميجابايت)"
          : "Video exceeds maximum size of 100MB"
      );
      return;
    }

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setVideoFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));

    // Auto-fill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }
  };

  // Handle local poster selection
  const handlePosterFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        isAr ? "يرجى اختيار ملف صورة صالح" : "Please select a valid image file"
      );
      return;
    }

    if (posterFilePreview) URL.revokeObjectURL(posterFilePreview);
    setPosterFile(file);
    setPosterFilePreview(URL.createObjectURL(file));
  };

  // URL analysis
  const ytId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);
  const vimeoId = useMemo(() => extractVimeoId(videoUrl), [videoUrl]);
  const isDirectVideo = useMemo(() => {
    if (!videoUrl) return false;
    return /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(videoUrl) || videoUrl.includes("/video/upload/");
  }, [videoUrl]);

  // Use YouTube high-res thumbnail
  const handleUseYouTubePoster = () => {
    if (ytId) {
      const ytPoster = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      setPosterSource("url");
      setPosterUrl(ytPoster);
      toast.success(
        isAr ? "تم تعيين غلاف يوتيوب التلقائي" : "YouTube thumbnail selected"
      );
    }
  };

  // Validation
  const isValid = useMemo(() => {
    if (sourceType === "file") {
      return !!videoFile;
    } else {
      return !!videoUrl.trim() && /^https?:\/\//i.test(videoUrl.trim());
    }
  }, [sourceType, videoFile, videoUrl]);

  // Submit Handler
  const handleSubmit = () => {
    if (!isValid) {
      toast.error(
        isAr
          ? "يرجى توفير ملف فيديو أو رابط صالح"
          : "Please provide a valid video file or URL"
      );
      return;
    }

    uploadVideo(
      {
        file: sourceType === "file" ? videoFile || undefined : undefined,
        videoUrl: sourceType === "url" ? videoUrl.trim() : undefined,
        posterFile: posterSource === "file" ? posterFile || undefined : undefined,
        posterUrl: posterSource === "url" ? posterUrl.trim() || undefined : undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        altText: altText.trim() || undefined,
        categorySlug,
        addToShowcase,
      },
      {
        onSuccess: (data: MediaAsset) => {
          onSuccess?.(data);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-y-auto p-6"
        dir={isAr ? "rtl" : "ltr"}
      >
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Film className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-foreground">
              {isAr ? "إضافة مقطع فيديو جديد" : "Add New Video Asset"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {isAr
              ? "ارفع ملف فيديو مباشر أو أضف رابط فيديو من يوتيوب/فيميو أو رابط مباشر مع معاينة تفاعلية وصورة بوستر اختيارية."
              : "Upload an MP4/WebM video file or add an external URL (YouTube/Vimeo/Direct) with live preview and optional poster."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ================= STEP 1: SOURCE SELECTION ================= */}
          <Tabs
            value={sourceType}
            onValueChange={(val) => setSourceType(val as "file" | "url")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger
                value="file"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-medium transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isAr ? "رفع ملف فيديو من الجهاز" : "Upload Video File"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="url"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-medium transition-all"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{isAr ? "إضافة عبر رابط (URL)" : "Add by Video URL"}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: FILE UPLOAD */}
            <TabsContent value="file" className="space-y-4 pt-3">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                className="hidden"
                onChange={handleVideoFileChange}
              />

              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-blue-500/80 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 group flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      {isAr ? "اضغط لاختيار ملف فيديو من جهازك" : "Click to select a video file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAr
                        ? "الصيغ المدعومة: MP4, WebM, MOV (الرفع المباشر حتى 4.5 ميجابايت، أو استخدم تبويب الرابط للفيديوهات الكبيرة)"
                        : "Supported formats: MP4, WebM, MOV (Direct upload up to 4.5MB, or use Video URL tab for larger videos)"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-foreground truncate">
                          {videoFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {formatBytes(videoFile.size)} • {videoFile.type || "video"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-xs gap-1.5"
                    >
                      {isAr ? "تغيير الملف" : "Change File"}
                    </Button>
                  </div>

                  {/* Size Notice if file is larger than serverless body limit */}
                  {videoFile.size > 4.5 * 1024 * 1024 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {isAr
                            ? `حجم الملف (${formatBytes(videoFile.size)}) أكبر من سعة الرفع المباشر السريعة (4.5 ميجابايت)`
                            : `File size (${formatBytes(videoFile.size)}) exceeds serverless direct upload limit (4.5MB)`}
                        </p>
                        <p className="text-[11px] opacity-90 leading-relaxed">
                          {isAr
                            ? "لمقاطع الفيديو الكبيرة أو عالية الدقة، نوصي باستخدام تبويب 'إضافة عبر رابط (URL)' (مثل يوتيوب أو فيميو أو رابط سحابي مباشر) لتضمينها فوراً دون قيود على الحجم."
                            : "For larger or high-res videos, we recommend using the 'Add by Video URL' tab (YouTube, Vimeo, or direct cloud URL) for instant playback without size limits."}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSourceType("url")}
                          className="h-7 text-[11px] mt-1 gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>{isAr ? "الانتقال إلى إضافة عبر رابط" : "Switch to Video URL"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Video Preview Player */}
                  {filePreviewUrl && (
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-lg">
                      <video
                        src={filePreviewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB: URL INPUT */}
            <TabsContent value="url" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isAr ? "رابط الفيديو المباشر أو التضمين" : "Video URL"}</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder={
                      isAr
                        ? "مثال: https://www.youtube.com/watch?v=... أو رابط مباشر .mp4"
                        : "e.g., https://www.youtube.com/watch?v=... or direct .mp4 URL"
                    }
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="font-mono text-xs pr-10"
                    dir="ltr"
                  />
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Detected Source Badges */}
                {videoUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    {ytId && (
                      <Badge className="bg-red-600 text-white gap-1 text-[11px]">
                        <span>YouTube Video</span>
                      </Badge>
                    )}
                    {vimeoId && (
                      <Badge className="bg-cyan-600 text-white gap-1 text-[11px]">
                        <span>Vimeo Video</span>
                      </Badge>
                    )}
                    {isDirectVideo && (
                      <Badge className="bg-emerald-600 text-white gap-1 text-[11px]">
                        <span>Direct MP4 / Stream</span>
                      </Badge>
                    )}
                    {ytId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseYouTubePoster}
                        className="h-6 text-[11px] gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isAr ? "استخدام غلاف يوتيوب كبوستر" : "Use YouTube Thumbnail as Poster"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* URL Video Preview Player */}
              {videoUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-lg">
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                      title="YouTube Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : vimeoId ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title="Vimeo Preview"
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      onError={() => {
                        // Ignore initial parse errors
                      }}
                    >
                      {isAr ? "تعذر تشغيل المعاينة المباشرة" : "Preview not available"}
                    </video>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* ================= STEP 2: OPTIONAL POSTER IMAGE ================= */}
          <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {isAr ? "صورة الغلاف / البوستر (اختياري)" : "Poster / Cover Image (Optional)"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {isAr
                      ? "صورة المعاينة التي تظهر قبل تشغيل المقطع في السلايدر."
                      : "The preview thumbnail displayed before video playback starts."}
                  </p>
                </div>
              </div>

              {/* Poster Source Toggle */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant={posterSource === "none" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[11px] rounded-lg"
                  onClick={() => {
                    setPosterSource("none");
                    setPosterFile(null);
                    setPosterUrl("");
                  }}
                >
                  {isAr ? "تلقائي" : "Auto"}
                </Button>
                <Button
                  type="button"
                  variant={posterSource === "file" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[11px] rounded-lg gap-1"
                  onClick={() => {
                    setPosterSource("file");
                    setPosterUrl("");
                  }}
                >
                  <UploadCloud className="w-3 h-3" />
                  {isAr ? "رفع صورة" : "Upload File"}
                </Button>
                <Button
                  type="button"
                  variant={posterSource === "url" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[11px] rounded-lg gap-1"
                  onClick={() => {
                    setPosterSource("url");
                    setPosterFile(null);
                  }}
                >
                  <LinkIcon className="w-3 h-3" />
                  {isAr ? "رابط صورة" : "Image URL"}
                </Button>
              </div>
            </div>

            {/* Poster Upload Input */}
            {posterSource === "file" && (
              <div className="space-y-3 pt-2">
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handlePosterFileChange}
                />
                {!posterFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => posterInputRef.current?.click()}
                    className="w-full h-20 border-dashed rounded-xl gap-2 text-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {isAr ? "اختر صورة بوستر من جهازك" : "Select poster image file"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-4 p-2.5 rounded-xl border border-border/60 bg-background">
                    {posterFilePreview && (
                      <img
                        src={posterFilePreview}
                        alt="Poster Preview"
                        className="w-20 h-12 object-cover rounded-lg border"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{posterFile.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {formatBytes(posterFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterFilePreview(null);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Poster URL Input */}
            {posterSource === "url" && (
              <div className="space-y-2 pt-2">
                <Input
                  placeholder={
                    isAr
                      ? "أدخل رابط صورة البوستر (JPG, PNG, WebP)..."
                      : "Enter poster image URL (JPG, PNG, WebP)..."
                  }
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="text-xs font-mono"
                  dir="ltr"
                />
                {posterUrl && (
                  <div className="relative w-36 h-20 rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={posterUrl}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        // ignore broken url
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= STEP 3: METADATA ================= */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-foreground block mb-1">
                {isAr ? "عنوان المقطع" : "Video Title"}
              </Label>
              <Input
                placeholder={
                  isAr ? "مثال: رحلة نيلية في أسوان" : "e.g., Nile Cruise in Aswan"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-foreground block mb-1">
                  {isAr ? "النص البديل (Alt Text)" : "Alt Text"}
                </Label>
                <Input
                  placeholder={
                    isAr ? "نص بديل للوصول وسيو..." : "Alt text for SEO & accessibility..."
                  }
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground block mb-1">
                  {isAr ? "الوصف المختصر" : "Short Description"}
                </Label>
                <Input
                  placeholder={
                    isAr ? "وصف مختصر للمقطع..." : "Brief summary of the clip..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Showcase Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? "إضافة لسلايدر الصفحة الرئيسية" : "Feature on Homepage Showcase"}</span>
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "عرض هذا الفيديو فوراً في قسم 'لحظات لا تُنسى' بالصفحة الرئيسية."
                    : "Display this video clip on the public homepage video showcase carousel."}
                </p>
              </div>
              <Switch checked={addToShowcase} onCheckedChange={setAddToShowcase} />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 pt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isAr
                    ? sourceType === "file"
                      ? "جارٍ رفع الفيديو والمعالجة..."
                      : "جارٍ حفظ الرابط..."
                    : "Processing & Uploading..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAr
                    ? sourceType === "file"
                      ? "بدء الرفع والحفظ"
                      : "إضافة الفيديو"
                    : "Save & Add Video"}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
