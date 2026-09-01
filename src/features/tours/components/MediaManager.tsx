"use client";

import { ChangeEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tour, TourImage } from "../types";
import {
  useAddTourImage,
  useRemoveTourImage,
  useReorderTourImage,
  useSetTourHeroImage,
} from "../hooks/useTours";
import { useUploadMedia } from "@/features/media/hooks/useMedia";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, FolderOpen, Loader2, Save, Sparkles, Trash, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryPickerModal, SelectedMediaAsset } from "@/components/media/MediaLibraryPickerModal";

interface MediaManagerProps {
  tour: Tour;
}

/** The media endpoint atomically stores the provider asset and its TourImage projection. */
export function MediaManager({ tour }: MediaManagerProps) {
  const queryClient = useQueryClient();
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: addTourImage, isPending: isAddingFromLibrary } = useAddTourImage();
  const { mutate: removeImage, isPending: isRemoving } = useRemoveTourImage();
  const { mutate: reorderImage, isPending: isReordering } = useReorderTourImage();
  const { mutate: setHeroImage, isPending: isSettingHero } = useSetTourHeroImage();
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [sortOrders, setSortOrders] = useState<Record<string, string>>({});

  const sortedImages = [...(tour.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const resetUpload = () => {
    setFile(null);
    setAltText("");
    setIsAddingNew(false);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("Images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Choose an image before uploading.");
      return;
    }
    uploadMedia(
      { file, entityType: 'TOUR', entityId: tour.id, altText: altText.trim() || undefined },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(tour.slug) });
          resetUpload();
        },
      },
    );
  };

  const handleSelectFromLibrary = (selected: SelectedMediaAsset) => {
    if (!selected?.url) return;
    const isHero = sortedImages.length === 0;
    const nextSortOrder = sortedImages.length > 0 ? sortedImages[sortedImages.length - 1].sortOrder + 1 : 0;

    addTourImage(
      {
        slug: tour.slug,
        data: {
          url: selected.url,
          publicId: selected.id || `media-${Date.now()}`,
          isHero,
          sortOrder: nextSortOrder,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(tour.slug) });
          toast.success("تمت إضافة الصورة من مكتبة الوسائط بنجاح! 📸");
        },
      }
    );
  };

  const saveSortOrder = (image: TourImage) => {
    if (!image.id) return;
    const value = sortOrders[image.id] ?? String(image.sortOrder);
    if (!/^\d+$/.test(value)) {
      toast.error("Sort order must be a whole number.");
      return;
    }
    reorderImage({ slug: tour.slug, imageId: image.id, data: { sortOrder: Number(value) } });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">معرض صور وميديا الرحلة (Media Gallery)</h3>
          <p className="text-xs text-muted-foreground">رفع وإدارة صور الرحلة أو الربط المباشر مع مكتبة الوسائط المركزية.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMediaPickerOpen(true)}
            disabled={isAddingFromLibrary}
            className="font-bold gap-1.5 rounded-xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer shadow-xs"
          >
            {isAddingFromLibrary ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
            <span>اختيار من مكتبة الوسائط 🖼️</span>
          </Button>

          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="font-bold gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>رفع ملف جديد 📸</span>
            </Button>
          )}
        </div>
      </div>

      {isAddingNew && (
        <div className="border rounded-2xl p-4 bg-muted/30 space-y-4 shadow-sm relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" type="button" onClick={resetUpload}><X className="h-4 w-4" /></Button>
          <h4 className="font-bold text-sm">رفع صورة جديدة للرحلة (Upload Tour Image)</h4>
          <div className="space-y-1">
            <Label htmlFor="tour-image-file" className="text-xs font-bold">Image file / ملف الصورة (JPG, PNG, WebP)</Label>
            <Input id="tour-image-file" aria-label="Image file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={isUploading} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tour-image-alt" className="text-xs font-bold">Alt Text / النص البديل المعبر</Label>
            <Input id="tour-image-alt" maxLength={255} value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isUploading} placeholder="e.g. Giza Pyramids at sunset" className="rounded-xl" />
          </div>
          <Button size="sm" type="button" aria-label="Upload image" onClick={handleUpload} disabled={isUploading || !file} className="font-bold gap-1.5 rounded-xl cursor-pointer">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {isUploading ? "جاري الرفع…" : "Upload Image"}
          </Button>
        </div>
      )}

      {/* Media Library Picker Modal */}
      <MediaLibraryPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleSelectFromLibrary}
        defaultCategory="tours"
        locale="ar"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedImages.length > 0 ? sortedImages.map((image, index) => (
          <div key={image.id || image.imageUrl} className="group relative border rounded-2xl overflow-hidden bg-muted shadow-sm aspect-video flex items-center justify-center">
            <img src={image.imageUrl} alt={image.altText || "Tour asset"} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-2 space-y-2">
              <div className="flex items-center gap-1">
                <Input aria-label={`Sort order for image ${index + 1}`} className="h-7 bg-background text-xs rounded-lg font-bold" value={sortOrders[image.id || ''] ?? String(image.sortOrder)} onChange={(event) => image.id && setSortOrders((previous) => ({ ...previous, [image.id!]: event.target.value }))} disabled={!image.id || isReordering} />
                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg cursor-pointer" aria-label="Save image order" onClick={() => saveSortOrder(image)} disabled={!image.id || isReordering}><Save className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex justify-between items-center gap-1">
                <Button size="xs" variant={image.isHero ? "default" : "secondary"} onClick={() => image.id && setHeroImage({ slug: tour.slug, imageId: image.id })} disabled={!image.id || image.isHero || isSettingHero} className="text-[11px] font-bold rounded-lg cursor-pointer">{image.isHero ? <><Check className="h-3 w-3 mr-1" /> الرئيسية</> : "تعيين كرئيسية"}</Button>
                <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg cursor-pointer" aria-label="حذف الصورة" onClick={() => image.id && removeImage({ slug: tour.slug, imageId: image.id })} disabled={!image.id || isRemoving}><Trash className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            {image.isHero && <div className="absolute top-2 right-2 z-10"><Badge className="text-xs bg-amber-500 text-slate-950 font-bold"><Check className="h-3 w-3 mr-1" /> صورة الغلاف</Badge></div>}
          </div>
        )) : !isAddingNew && <div className="col-span-full text-center text-muted-foreground py-12 border rounded-2xl bg-card text-xs font-bold">لا توجد صور أو وسائط مرفقة بهذه الرحلة حتى الآن. انقر على &quot;اختيار من مكتبة الوسائط&quot; أو &quot;رفع ملف جديد&quot;.</div>}
      </div>
    </div>
  );
}

