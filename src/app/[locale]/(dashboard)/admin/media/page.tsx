"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteMedia, useMediaAssets, useUploadMedia } from "@/features/media/hooks/useMedia";

export default function MediaPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const query = useMediaAssets({ page: 1, limit: 100 });
  const upload = useUploadMedia();
  const remove = useDeleteMedia();

  const submit = () => {
    if (!file) return;
    upload.mutate(
      { file, entityType: "GENERAL", altText: altText.trim() || undefined },
      { onSuccess: () => { setFile(null); setAltText(""); } },
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "مكتبة الوسائط" : "Media Library"}
        description={isAr ? "كل الملفات المعروضة مرفوعة ومحفوظة في الباك إند." : "Every displayed asset is uploaded to and stored by the backend."}
        badge={query.data?.meta.total}
      />

      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]">
        <Input type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <Input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder={isAr ? "وصف الملف" : "Asset description"} />
        <Button onClick={submit} disabled={!file || upload.isPending} className="gap-2">
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isAr ? "رفع" : "Upload"}
        </Button>
      </div>

      {query.isError ? (
        <QueryErrorState message={isAr ? "تعذر تحميل الوسائط من الباك إند." : "Media could not be loaded from the backend."} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">{isAr ? "جاري تحميل الوسائط..." : "Loading media..."}</div>
      ) : !query.data?.data.length ? (
        <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground"><ImageIcon className="mx-auto mb-3 h-10 w-10" />{isAr ? "لا توجد وسائط مرفوعة." : "No uploaded media."}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {query.data.data.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-2xl border bg-card">
              <img src={asset.url} alt={asset.altText ?? ""} className="h-44 w-full bg-muted object-cover" />
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="truncate text-xs text-muted-foreground">{asset.altText || asset.entityType}</p>
                <Button size="icon" variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(asset.id)} aria-label={isAr ? "حذف" : "Delete"}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
