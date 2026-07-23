"use client";

import { useState } from "react";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { useMediaAssets, useUploadMedia, useDeleteMedia } from "@/features/media/hooks/useMedia";
import { MediaQueryFilters, UploadMediaPayload } from "@/features/media/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function MediaPage() {
  const [filters, setFilters] = useState<MediaQueryFilters>({ page: 1, limit: 20 });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data, isLoading } = useMediaAssets(filters);
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  const handleUpload = (payload: UploadMediaPayload) => {
    uploadMedia(payload, {
      onSuccess: () => setIsUploadOpen(false),
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return format(d, "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Media Library</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage images for tours, banners, and general content.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadOpen(true)} className="gap-2 bg-primary">
            <PlusCircle className="h-4 w-4" />
            Upload Asset
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p>Loading media library...</p>
        </div>
      ) : (Array.isArray(data) ? data : (data?.data || [])).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-white dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="font-semibold text-foreground mb-1">No media found</h3>
          <p className="text-sm">Upload some images to populate your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(Array.isArray(data) ? data : (data?.data || [])).map((asset) => (
            <div key={asset.id} className="group relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={asset.url} 
                alt={asset.altText || "Media asset"} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {asset.entityType || "GENERAL"}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-white hover:bg-destructive hover:text-white"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this image?")) {
                        deleteMedia(asset.id);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-white">
                  <p className="text-xs font-medium truncate">{asset.altText || "No alt text"}</p>
                  <p className="text-[10px] text-gray-300">{formatDate(asset.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Pagination for Gallery */}
      {data && (Array.isArray(data) ? 1 : (data.meta?.totalPages || 1)) > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            disabled={filters.page === (Array.isArray(data) ? 1 : data.meta?.totalPages)}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      <UploadMediaDialog 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
