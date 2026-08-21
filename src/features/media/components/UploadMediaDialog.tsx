"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Image as ImageIcon, Video, Play, Sparkles, Eye } from "lucide-react";
import { useParams } from "next/navigation";

interface AddMediaUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMedia?: (newMedia: any) => void;
  initialType?: "photo" | "video";
}

export function UploadMediaDialog({
  open,
  onOpenChange,
  onAddMedia,
  initialType = "photo",
}: AddMediaUrlDialogProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  const [mediaType, setMediaType] = useState<"photo" | "video">(initialType);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setMediaType(initialType);
  }, [initialType, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const newMedia = {
      id: `media-${Date.now()}`,
      title: title || (mediaType === "photo" ? "صورة جديدة" : "فيديو جديد"),
      category: isAr ? "مكتبة الوسائط" : "Media Library",
      url: url.trim(),
      resolution: mediaType === "photo" ? "3840x2160 (4K)" : undefined,
      duration: mediaType === "video" ? "03:30" : undefined,
      size: mediaType === "photo" ? "3.5 MB" : "120 MB",
      badge: mediaType === "photo" ? "جديد ✨" : "فيديو 🎥",
      tag: "Media-Asset",
      type: mediaType,
    };

    if (onAddMedia) {
      onAddMedia(newMedia);
    }

    // Reset & Close
    onOpenChange(false);
    setTitle("");
    setUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 bg-card border border-amber-500/30 text-foreground rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-amber-500">
            <Link2 className="w-5 h-5" />
            <DialogTitle className="text-lg font-black">
              {isAr ? "إضافة وسيط عبر رابط مباشر (Media URL)" : "Add Media Asset via Direct Link"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            {isAr
              ? "أدخل عنوان ورابط الصورة أو الفيديو مباشرة واستعرض المعاينة الفورية قبل الحفظ."
              : "Enter asset title and direct image/video URL to preview and add instantly."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Type Selector (Photo / Video) */}
          <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1.5 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setMediaType("photo")}
              className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mediaType === "photo"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isAr ? "رابط صورة (Photo URL)" : "Photo Link"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mediaType === "video"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isAr ? "رابط فيديو (Video URL)" : "Video Link"}</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">{isAr ? "عنوان الوسيط / اسم الملف" : "Asset Title"}</Label>
            <Input
              placeholder={isAr ? "مثال: كروز النيل الأقصر - رحلة الغروب" : "e.g. Luxor Nile Cruise Sunset"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/40 border-border rounded-xl text-xs font-bold"
              required
            />
          </div>

          {/* Direct Media URL Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold flex items-center justify-between">
              <span>{mediaType === "photo" ? (isAr ? "رابط الصورة المباشر (Image URL)" : "Direct Image URL") : (isAr ? "رابط الفيديو المباشر (Video URL / YouTube)" : "Direct Video URL / YouTube")}</span>
              <span className="text-[10px] text-amber-500 font-semibold dir-ltr">https://...</span>
            </Label>
            <Input
              placeholder={mediaType === "photo" ? "https://images.unsplash.com/photo-..." : "https://www.youtube.com/watch?v=..."}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-muted/40 border-border rounded-xl text-xs font-mono dir-ltr text-start"
              required
            />
          </div>

          {/* Live Preview Box */}
          {url.trim() && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? "المعاينة الفورية المباشرة:" : "Live Instant Preview:"}</span>
              </Label>
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center">
                {mediaType === "photo" ? (
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                    <img
                      src={url.includes("unsplash") ? url : "https://images.unsplash.com/photo-1572252821128-4ef864c7ecfa?auto=format&fit=crop&w=800&q=80"}
                      alt="Video Preview"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute p-4 rounded-full bg-amber-500 text-slate-950 shadow-xl">
                      <Play className="w-6 h-6 fill-slate-950 text-slate-950 me-0.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-bold"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs px-5 gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              disabled={!url.trim()}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "إضافة وتثبيت في المكتبة 🚀" : "Add to Gallery 🚀"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
