"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { MoveMediaDialog } from "@/features/media/components/MoveMediaDialog";
import { ManageCategoriesDialog } from "@/features/media/components/ManageCategoriesDialog";
import {
  useDeleteMedia,
  useMediaAssets,
  useMediaSummary,
  useMediaCategories,
} from "@/features/media/hooks/useMedia";
import { MediaAsset, MediaCategoryItem, MediaQueryFilters } from "@/features/media/types";
import {
  Copy,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  FolderSymlink,
  Tags,
  Search,
  Eye,
  CheckCircle2,
  Maximize2,
  HardDrive,
  Layers,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 24;

function bytesLabel(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function MediaPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "bytes">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [activeAssetForMove, setActiveAssetForMove] = useState<MediaAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Multi-select state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Categories hook
  const { data: categories = [] } = useMediaCategories();

  // Media query filters
  const filters = useMemo<MediaQueryFilters>(() => {
    const q: MediaQueryFilters = {
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    };
    if (selectedCategory !== "all") {
      q.category = selectedCategory;
    }
    return q;
  }, [page, search, selectedCategory, sortBy, sortOrder]);

  const { data: result, isLoading, isError, refetch, isRefetching } = useMediaAssets(filters);
  const { data: summary } = useMediaSummary();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  const assets = result?.data ?? [];
  const meta = result?.meta;

  const totalAssetsCount = summary?.total ?? 0;
  const totalStorageBytes = summary?.bytes ?? 0;

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Select all on current page
  const handleSelectAll = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  // Open move modal for single asset
  const handleOpenMoveSingle = (asset: MediaAsset) => {
    setActiveAssetForMove(asset);
    setSelectedAssetIds([asset.id]);
    setMoveDialogOpen(true);
  };

  // Open move modal for bulk selection
  const handleOpenMoveBulk = () => {
    if (!selectedAssetIds.length) return;
    setActiveAssetForMove(null);
    setMoveDialogOpen(true);
  };

  // Delete single asset
  const handleRemoveSingle = (asset: MediaAsset) => {
    if (
      !window.confirm(
        isAr
          ? "هل أنت متأكد من حذف هذه الصورة نهائياً من المكتبة؟"
          : `Delete this ${asset.entityType.toLowerCase()} media asset? This cannot be undone.`,
      )
    )
      return;
    deleteMedia(asset.id);
  };

  // Delete bulk selected assets
  const handleRemoveBulk = async () => {
    if (!selectedAssetIds.length) return;
    if (
      !window.confirm(
        isAr
          ? `هل أنت متأكد من حذف ${selectedAssetIds.length} صورة محددة؟`
          : `Delete ${selectedAssetIds.length} selected assets? This cannot be undone.`,
      )
    )
      return;
    for (const id of selectedAssetIds) {
      deleteMedia(id);
    }
    setSelectedAssetIds([]);
  };

  // Copy URL with toast
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(isAr ? "تم نسخ رابط الصورة إلى الحافظة." : "Media URL copied to clipboard.");
    } catch {
      toast.error(isAr ? "تعذر نسخ الرابط." : "Unable to copy media URL.");
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <span>{isAr ? "مكتبة الوسائط والصور" : "Media Library & Digital Assets"}</span>
            <Badge variant="outline" className="text-amber-500 font-mono border-amber-500/30 text-xs px-2.5 py-0.5">
              Cloudinary Pro
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? "إدارة الصور، تنظيم الفئات، نقل الصور بين الأقسام، واستخراج الروابط المباشرة بجودة فائقة."
              : "Manage verified media assets, organize custom categories, transfer images, and grab direct CDNs."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setManageCategoriesOpen(true)}
            className="h-9 text-xs font-bold gap-1.5 cursor-pointer border-amber-500/40 hover:bg-amber-500/10 text-foreground"
          >
            <Tags className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? "إدارة الفئات والمجلدات" : "Manage Categories"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="h-9 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? "رفع صورة جديدة" : "Upload Image"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الصور" : "Total Assets"}</span>
            <div className="text-2xl font-black font-mono text-foreground">{totalAssetsCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "المساحة المستهلكة" : "Storage Used"}</span>
            <div className="text-2xl font-black font-mono text-foreground">{bytesLabel(totalStorageBytes)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "الفئات والمجلدات" : "Active Categories"}</span>
            <div className="text-2xl font-black font-mono text-foreground">{categories.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "صور الرحلات والفنادق" : "Attached Entity Media"}</span>
            <div className="text-2xl font-black font-mono text-foreground">
              {summary ? (summary.byEntityType.TOUR || 0) + (summary.byEntityType.HOTEL || 0) : 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {isAr ? "تصفية حسب الفئة / المجلد:" : "Filter by Category / Folder:"}
          </span>
          <button
            onClick={() => setManageCategoriesOpen(true)}
            className="text-[11px] font-extrabold text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Tags className="w-3 h-3" />
            <span>{isAr ? "+ تخصيص الفئات" : "+ Customize Categories"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm scale-[1.02]"
                : "bg-card text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
            }`}
          >
            <span>{isAr ? "كافة الصور" : "All Assets"}</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-bold">
              {totalAssetsCount}
            </Badge>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm scale-[1.02]"
                    : "bg-card text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                }`}
              >
                <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                {cat.count !== undefined && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-bold">
                    {cat.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Toolbar: Search, Sort & Bulk Selection */}
      <Card className="p-3.5 bg-card border border-border/80 rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={isAr ? "بحث بالنص البديل أو كود الصورة..." : "Search by alt text or public ID..."}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Select all toggle */}
          {assets.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
            >
              {selectedAssetIds.length === assets.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Square className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span>{selectedAssetIds.length === assets.length ? (isAr ? "إلغاء تحديد الكل" : "Deselect All") : (isAr ? "تحديد الكل" : "Select All")}</span>
            </Button>
          )}

          {/* Sort order toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSortBy((prev) => (prev === "createdAt" ? "bytes" : "createdAt"));
              setPage(1);
            }}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {sortBy === "createdAt"
                ? (isAr ? "الترتيب: الأحدث" : "Sort: Newest")
                : (isAr ? "الترتيب: الحجم" : "Sort: Size")}
            </span>
          </Button>
        </div>
      </Card>

      {/* Floating Bulk Action Bar */}
      {selectedAssetIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-extrabold text-foreground">
              {isAr
                ? `تم تحديد ${selectedAssetIds.length} صورة`
                : `${selectedAssetIds.length} images selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenMoveBulk}
              className="h-8 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs"
            >
              <FolderSymlink className="w-3.5 h-3.5" />
              <span>{isAr ? "نقل إلى فئة أخرى..." : "Move to Category..."}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveBulk}
              className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? "حذف المحدد" : "Delete Selected"}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedAssetIds([])}
              className="h-8 text-xs text-muted-foreground cursor-pointer"
            >
              {isAr ? "إلغاء" : "Clear"}
            </Button>
          </div>
        </div>
      )}

      {/* 5. Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr ? "جاري تحميل أصول ومكتبة الصور..." : "Loading media assets from cloud storage..."}
          </p>
        </div>
      ) : isError ? (
        <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3">
          <p className="text-sm font-bold text-destructive">
            {isAr ? "تعذر تحميل مكتبة الوسائط من الخادم." : "Could not load media assets from backend."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {isAr ? "إعادة المحاولة" : "Retry"}
          </Button>
        </Card>
      ) : assets.length === 0 ? (
        <Card className="p-16 text-center border-dashed rounded-3xl space-y-3">
          <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center text-muted-foreground/60">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "لا توجد صور مطابقة لهذا التصنيف أو البحث." : "No media assets match these filters."}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isAr
              ? "يمكنك رفع صور جديدة أو تغيير الفئة لعرض المزيد من الأصول الرقمية."
              : "Upload high-res images or reset your search filters to explore assets."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSearch("");
                setPage(1);
              }}
              className="text-xs font-semibold"
            >
              {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
            </Button>
            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isAr ? "رفع صورة الآن" : "Upload Image"}</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            const categoryLabel =
              asset.entityType === "TOUR"
                ? (isAr ? "رحلة" : "Tour")
                : asset.entityType === "HOTEL"
                ? (isAr ? "فندق" : "Hotel")
                : asset.entityId
                ? asset.entityId
                : (isAr ? "عامة" : "General");

            return (
              <Card
                key={asset.id}
                className={`group rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-lg ${
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
                    : "border-border/80 bg-card hover:border-amber-500/40"
                }`}
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="aspect-video relative overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setPreviewAsset(asset)}>
                    <img
                      src={asset.secureUrl}
                      alt={asset.altText || "Media asset"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top floating overlay */}
                    <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between bg-linear-to-b from-slate-950/80 via-slate-950/40 to-transparent">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(asset.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card/90 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-950 border-white/40"
                      />

                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-xs">
                          {categoryLabel}
                        </Badge>
                      </div>
                    </div>

                    {/* Bottom floating size overlay */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-slate-300 backdrop-blur-xs">
                      {asset.format.toUpperCase()} · {bytesLabel(asset.bytes)}
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="p-3.5 space-y-2">
                    <p className="text-xs font-bold text-foreground line-clamp-1" title={asset.altText || ""}>
                      {asset.altText || (isAr ? "صورة بدون عنوان بديل" : "Untitled media asset")}
                    </p>

                    <p className="text-[10px] text-muted-foreground font-mono truncate" title={asset.publicId}>
                      ID: {asset.publicId}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 pt-0 border-t border-border/40 mt-2 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-[11px] font-bold gap-1 cursor-pointer"
                    onClick={() => copyUrl(asset.secureUrl)}
                    title={isAr ? "نسخ الرابط المباشر" : "Copy Direct CDN Link"}
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? "نسخ الرابط" : "Copy URL"}</span>
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                    onClick={() => handleOpenMoveSingle(asset)}
                    title={isAr ? "نقل إلى فئة أخرى..." : "Move to Category..."}
                  >
                    <FolderSymlink className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setPreviewAsset(asset)}
                    title={isAr ? "معاينة التفاصيل" : "Inspect Asset"}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => handleRemoveSingle(asset)}
                    disabled={isDeleting}
                    title={isAr ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 6. Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs font-semibold text-muted-foreground">
            {isAr
              ? `صفحة ${meta.page} من ${meta.totalPages} (إجمالي ${meta.total} صورة)`
              : `Page ${meta.page} of ${meta.totalPages} (${meta.total} total assets)`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              {isAr ? "السابق" : "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              {isAr ? "التالي" : "Next"}
            </Button>
          </div>
        </div>
      )}

      {/* 7. Image Lightbox & Inspector Modal */}
      {previewAsset && (
        <Dialog open={Boolean(previewAsset)} onOpenChange={() => setPreviewAsset(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
            <div className="aspect-video relative bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={previewAsset.secureUrl}
                alt={previewAsset.altText || "Preview"}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-foreground">
                    {previewAsset.altText || (isAr ? "صورة بدون عنوان بديل" : "Untitled Media Asset")}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Public ID: <span className="text-foreground">{previewAsset.publicId}</span>
                  </p>
                </div>

                <Badge className="bg-amber-500 text-slate-950 font-bold uppercase text-xs">
                  {previewAsset.entityType}
                </Badge>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-muted/40 border text-xs">
                <div>
                  <span className="text-muted-foreground font-bold">{isAr ? "الحجم:" : "File Size:"}</span>
                  <p className="font-mono font-black text-foreground">{bytesLabel(previewAsset.bytes)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">{isAr ? "الصيغة:" : "Format:"}</span>
                  <p className="font-mono font-black text-foreground">{previewAsset.format.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">{isAr ? "الفئة الحالية:" : "Category:"}</span>
                  <p className="font-bold text-foreground">{previewAsset.entityId || "general"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">{isAr ? "المزود:" : "Provider:"}</span>
                  <p className="font-bold text-amber-500">Cloudinary</p>
                </div>
              </div>

              {/* Direct CDN Link Box */}
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-foreground">{isAr ? "رابط الـ CDN المباشر:" : "Direct CDN URL:"}</span>
                <div className="flex items-center gap-2">
                  <Input readOnly value={previewAsset.secureUrl} className="h-9 text-xs font-mono bg-muted/20" />
                  <Button
                    size="sm"
                    onClick={() => copyUrl(previewAsset.secureUrl)}
                    className="h-9 text-xs font-bold px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    {isAr ? "نسخ" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleOpenMoveSingle(previewAsset);
                    setPreviewAsset(null);
                  }}
                  className="h-9 text-xs font-bold gap-1.5 text-amber-500 border-amber-500/40 cursor-pointer"
                >
                  <FolderSymlink className="w-3.5 h-3.5" />
                  <span>{isAr ? "نقل إلى فئة أخرى..." : "Move to Category..."}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewAsset(null)}
                  className="h-9 text-xs font-semibold cursor-pointer"
                >
                  {isAr ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 8. Move Media Dialog */}
      <MoveMediaDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        asset={activeAssetForMove}
        selectedAssetIds={selectedAssetIds}
        categories={categories}
        isAr={isAr}
      />

      {/* 9. Manage Categories Dialog */}
      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        categories={categories}
        isAr={isAr}
      />

      {/* 10. Upload Media Dialog */}
      <UploadMediaDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        categories={categories}
        defaultCategorySlug={selectedCategory !== "all" ? selectedCategory : "general"}
        isAr={isAr}
      />
    </div>
  );
}
