"use client";

import { useState } from "react";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { useMediaAssets, useUploadMedia, useDeleteMedia } from "@/features/media/hooks/useMedia";
import { MediaQueryFilters, UploadMediaPayload } from "@/features/media/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

export default function MediaPage() {
  const tMedia = useTranslations("media");
  const tCommon = useTranslations("common");

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tMedia("title")}
        description={tMedia("description")}
        actions={
          <Button onClick={() => setIsUploadOpen(true)} size="sm" variant="gold" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>{tMedia("uploadAsset")}</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p>{tCommon("loading")}</p>
        </div>
      ) : (Array.isArray(data) ? data : (data?.data || [])).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
          <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
          <h3 className="font-semibold text-foreground mb-1">{tMedia("noMedia")}</h3>
          <p className="text-sm">{tMedia("noMediaDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(Array.isArray(data) ? data : (data?.data || [])).map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-xl border border-border overflow-hidden bg-muted/40 aspect-square shadow-xs hover:border-amber-500/40 transition-all duration-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={asset.url} 
                alt={asset.altText || "Media asset"} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <StatusBadge status={asset.entityType || "GENERAL"} />
                  <Button 
                    variant="ghost" 
                    size="icon-xs" 
                    className="text-white hover:bg-destructive hover:text-white"
                    onClick={() => {
                      if (confirm(`${tCommon("confirm")} ${tCommon("delete")}?`)) {
                        deleteMedia(asset.id);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-white">
                  <p className="text-xs font-medium truncate">{asset.altText || "No alt text"}</p>
                  <p className="text-[10px] text-slate-300">{formatDate(asset.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {data && (Array.isArray(data) ? 1 : (data.meta?.totalPages || 1)) > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
          >
            {tCommon("previous")}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={filters.page === (Array.isArray(data) ? 1 : data.meta?.totalPages)}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
          >
            {tCommon("next")}
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
