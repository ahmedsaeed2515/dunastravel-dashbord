"use client";

import { useState } from "react";
import { Tour } from "../types";
import { useAddTourImage, useRemoveTourImage } from "../hooks/useTours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash, UploadCloud, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MediaManagerProps {
  tour: Tour;
}

export function MediaManager({ tour }: MediaManagerProps) {
  const { mutate: addImage, isPending: isAdding } = useAddTourImage();
  const { mutate: removeImage, isPending: isRemoving } = useRemoveTourImage();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [url, setUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(tour.images?.length ? tour.images.length + 1 : 1);

  const resetForm = () => {
    setUrl("");
    setPublicId("");
    setIsHero(false);
    setSortOrder(tour.images?.length ? tour.images.length + 1 : 1);
    setIsAddingNew(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addImage({
      slug: tour.slug,
      data: {
        url,
        publicId: publicId || `mock_id_${Math.random().toString(36).substring(7)}`,
        isHero,
        sortOrder
      }
    }, {
      onSuccess: resetForm
    });
  };

  const sortedImages = [...(tour.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Media & Asset Management</h3>
        {!isAddingNew && (
          <Button size="sm" onClick={() => setIsAddingNew(true)}>
            <UploadCloud className="h-4 w-4 mr-2" /> Upload Image
          </Button>
        )}
      </div>

      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="border rounded-xl p-4 bg-muted/30 space-y-4 shadow-sm relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" type="button" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
          <h4 className="font-semibold text-sm">Add New Image</h4>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Image URL</label>
            <Input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://source.unsplash.com/random/800x600/?travel" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Public ID (Optional)</label>
              <Input value={publicId} onChange={(e) => setPublicId(e.target.value)} placeholder="cloudinary_id_123" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sort Order</label>
              <Input required type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="isHero" checked={isHero} onCheckedChange={(checked) => setIsHero(checked as boolean)} />
            <label htmlFor="isHero" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Set as Hero Image
            </label>
          </div>

          <Button size="sm" type="submit" disabled={isAdding}>
            {isAdding ? "Uploading..." : "Save Image"}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedImages.length > 0 ? (
          sortedImages.map((img, i) => (
            <div key={img.id || i} className="group relative border rounded-xl overflow-hidden bg-muted shadow-sm aspect-video flex items-center justify-center">
              <img src={img.imageUrl} alt={img.altText || "Tour asset"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="sm" className="h-8 shadow-lg" onClick={() => removeImage({ slug: tour.slug, imageId: img.id! })} disabled={isRemoving}>
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>

              {img.isHero && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-primary text-primary-foreground text-xs shadow-md border-none flex items-center gap-1">
                    <Check className="h-3 w-3" /> Hero
                  </Badge>
                </div>
              )}
            </div>
          ))
        ) : !isAddingNew && (
          <div className="col-span-full text-center text-muted-foreground py-12 border rounded-xl bg-card">
            No images or media assets attached.
          </div>
        )}
      </div>
    </div>
  );
}
