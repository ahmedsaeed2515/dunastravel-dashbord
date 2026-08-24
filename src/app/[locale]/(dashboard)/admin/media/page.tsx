"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { useDeleteMedia, useMediaAssets, useMediaSummary } from "@/features/media/hooks/useMedia";
import { MediaAsset, MediaEntityType, MediaQueryFilters } from "@/features/media/types";
import { Copy, Image as ImageIcon, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const entityTypes: Array<{ value: MediaEntityType | "ALL"; label: string }> = [
  { value: "ALL", label: "All assets" },
  { value: "GENERAL", label: "Library" },
  { value: "TOUR", label: "Tours" },
  { value: "HOTEL", label: "Hotels" },
];

function bytesLabel(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function EntityBadge({ entityType }: { entityType: MediaEntityType }) {
  const className = entityType === "TOUR" ? "bg-sky-500/10 text-sky-700" : entityType === "HOTEL" ? "bg-violet-500/10 text-violet-700" : "bg-amber-500/10 text-amber-700";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${className}`}>{entityType.toLowerCase()}</span>;
}

function AssetCard({ asset, deleting, onDelete }: { asset: MediaAsset; deleting: boolean; onDelete: (asset: MediaAsset) => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asset.secureUrl);
      toast.success("Media URL copied.");
    } catch {
      toast.error("Unable to copy the media URL.");
    }
  };
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted"><img src={asset.secureUrl} alt={asset.altText || "Media asset"} className="h-full w-full object-cover" /></div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3"><EntityBadge entityType={asset.entityType} /><span className="text-xs text-muted-foreground">{bytesLabel(asset.bytes)}</span></div>
        <p className="line-clamp-2 text-sm font-medium">{asset.altText || "Untitled media asset"}</p>
        <p className="truncate text-xs text-muted-foreground" title={asset.secureUrl}>{asset.secureUrl}</p>
        <div className="flex gap-2"><Button type="button" size="sm" variant="outline" className="flex-1" onClick={copy}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy URL</Button><Button type="button" size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onDelete(asset)} disabled={deleting}><Trash2 className="h-3.5 w-3.5" /></Button></div>
      </div>
    </Card>
  );
}

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<MediaEntityType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'createdAt' | 'bytes'>('createdAt');
  const [uploadOpen, setUploadOpen] = useState(false);
  const filters = useMemo<MediaQueryFilters>(() => ({ page, limit: PAGE_SIZE, search: search.trim() || undefined, sortBy, sortOrder: 'desc', ...(entityType !== "ALL" ? { entityType } : {}) }), [entityType, page, search, sortBy]);
  const { data: result, isLoading, isError, refetch, isRefetching } = useMediaAssets(filters);
  const { data: summary } = useMediaSummary();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();
  const assets = result?.data ?? [];
  const remove = (asset: MediaAsset) => {
    if (!window.confirm(`Delete this ${asset.entityType.toLowerCase()} media asset? This cannot be undone from the library.`)) return;
    deleteMedia(asset.id);
  };
  const meta = result?.meta;
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h1 className="text-2xl font-bold">Media library</h1><p className="mt-1 text-sm text-muted-foreground">Persisted provider assets only. Tour and hotel uploads remain attached to their source entity.</p></div><div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching} aria-label="Refresh media library"><RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /></Button><Button onClick={() => setUploadOpen(true)}><UploadCloud className="mr-2 h-4 w-4" />Upload image</Button></div></div>
      <div className="grid gap-4 sm:grid-cols-3"><Card className="p-4"><p className="text-sm text-muted-foreground">Assets</p><p className="mt-1 text-2xl font-semibold">{summary?.total ?? "—"}</p></Card><Card className="p-4"><p className="text-sm text-muted-foreground">Provider storage</p><p className="mt-1 text-2xl font-semibold">{summary ? bytesLabel(summary.bytes) : "—"}</p></Card><Card className="p-4"><p className="text-sm text-muted-foreground">Attached assets</p><p className="mt-1 text-2xl font-semibold">{summary ? summary.byEntityType.TOUR + summary.byEntityType.HOTEL : "—"}</p></Card></div>
      <div className="flex flex-col gap-3 sm:flex-row"><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by alt text or provider ID" className="sm:max-w-md" /><div className="flex flex-wrap gap-2">{entityTypes.map((option) => <Button key={option.value} size="sm" type="button" variant={entityType === option.value ? "default" : "outline"} onClick={() => { setEntityType(option.value); setPage(1); }}>{option.label}</Button>)}<Button size="sm" type="button" variant="outline" onClick={() => { setSortBy((current) => current === 'createdAt' ? 'bytes' : 'createdAt'); setPage(1); }}>Sort: {sortBy === 'createdAt' ? 'newest' : 'largest'}</Button></div></div>
      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div> : isError ? <Card className="p-8 text-center"><p>Media could not be loaded.</p><Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button></Card> : assets.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{assets.map((asset) => <AssetCard key={asset.id} asset={asset} deleting={isDeleting} onDelete={remove} />)}</div> : <Card className="p-12 text-center"><ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">No persisted media matches these filters.</p></Card>}
      {meta && meta.totalPages > 1 && <div className="flex items-center justify-end gap-3"><span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span><Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
      <UploadMediaDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
