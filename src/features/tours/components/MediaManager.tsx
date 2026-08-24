"use client";

import { ChangeEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tour, TourImage } from "../types";
import {
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
import { Check, Loader2, Save, Trash, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

interface MediaManagerProps {
  tour: Tour;
}

/** The media endpoint atomically stores the provider asset and its TourImage projection. */
export function MediaManager({ tour }: MediaManagerProps) {
  const queryClient = useQueryClient();
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: removeImage, isPending: isRemoving } = useRemoveTourImage();
  const { mutate: reorderImage, isPending: isReordering } = useReorderTourImage();
  const { mutate: setHeroImage, isPending: isSettingHero } = useSetTourHeroImage();
  const [isAddingNew, setIsAddingNew] = useState(false);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg">Media & Asset Management</h3>
          <p className="text-sm text-muted-foreground">Upload a real tour asset; files are never replaced with placeholder media.</p>
        </div>
        {!isAddingNew && <Button size="sm" onClick={() => setIsAddingNew(true)}><UploadCloud className="h-4 w-4 mr-2" /> Upload Image</Button>}
      </div>

      {isAddingNew && (
        <div className="border rounded-xl p-4 bg-muted/30 space-y-4 shadow-sm relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" type="button" onClick={resetUpload}><X className="h-4 w-4" /></Button>
          <h4 className="font-semibold text-sm">Upload New Image</h4>
          <div className="space-y-1">
            <Label htmlFor="tour-image-file" className="text-xs font-medium">Image file</Label>
            <Input id="tour-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={isUploading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tour-image-alt" className="text-xs font-medium">Accessible alt text</Label>
            <Input id="tour-image-alt" maxLength={255} value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isUploading} />
          </div>
          <Button size="sm" type="button" onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
            {isUploading ? "Uploading…" : "Upload Image"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedImages.length > 0 ? sortedImages.map((image, index) => (
          <div key={image.id || image.imageUrl} className="group relative border rounded-xl overflow-hidden bg-muted shadow-sm aspect-video flex items-center justify-center">
            <img src={image.imageUrl} alt={image.altText || "Tour asset"} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 space-y-2">
              <div className="flex items-center gap-1">
                <Input aria-label={`Sort order for image ${index + 1}`} className="h-7 bg-background text-xs" value={sortOrders[image.id || ''] ?? String(image.sortOrder)} onChange={(event) => image.id && setSortOrders((previous) => ({ ...previous, [image.id!]: event.target.value }))} disabled={!image.id || isReordering} />
                <Button size="icon" variant="secondary" className="h-7 w-7" aria-label="Save image order" onClick={() => saveSortOrder(image)} disabled={!image.id || isReordering}><Save className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex justify-between items-center gap-1">
                <Button size="xs" variant={image.isHero ? "default" : "secondary"} onClick={() => image.id && setHeroImage({ slug: tour.slug, imageId: image.id })} disabled={!image.id || image.isHero || isSettingHero}>{image.isHero ? <><Check className="h-3 w-3 mr-1" /> Hero</> : "Make Hero"}</Button>
                <Button size="icon" variant="destructive" className="h-7 w-7" aria-label="Remove image" onClick={() => image.id && removeImage({ slug: tour.slug, imageId: image.id })} disabled={!image.id || isRemoving}><Trash className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            {image.isHero && <div className="absolute top-2 left-2 z-10"><Badge className="text-xs"><Check className="h-3 w-3 mr-1" /> Hero</Badge></div>}
          </div>
        )) : !isAddingNew && <div className="col-span-full text-center text-muted-foreground py-12 border rounded-xl bg-card">No images or media assets attached.</div>}
      </div>
    </div>
  );
}
