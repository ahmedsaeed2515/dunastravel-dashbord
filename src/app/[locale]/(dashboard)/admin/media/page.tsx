"use client";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { MoveMediaDialog } from "@/features/media/components/MoveMediaDialog";
import { ManageCategoriesDialog } from "@/features/media/components/ManageCategoriesDialog";
import { WebPOptimizerStudio } from "@/features/media/components/WebPOptimizerStudio";
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
  SlidersHorizontal,
  FileImage,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
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
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<string>("createdAt:desc");

  // Category scroll slider state & ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const checkCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const current = Math.abs(scrollLeft);
    setCanScrollLeft(current > 5);
    setCanScrollRight(current < maxScroll - 5);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    checkCategoryScroll();
    el.addEventListener("scroll", checkCategoryScroll, { passive: true });
    window.addEventListener("resize", checkCategoryScroll);
    return () => {
      el.removeEventListener("scroll", checkCategoryScroll);
      window.removeEventListener("resize", checkCategoryScroll);
    };
  }, [checkCategoryScroll]);

  const slideCategories = (direction: "left" | "right") => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const step = 280;
    const sign = isAr ? (direction === "left" ? 1 : -1) : (direction === "left" ? -1 : 1);
    el.scrollBy({ left: sign * step, behavior: "smooth" });
  };

  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [webpStudioOpen, setWebpStudioOpen] = useState(false);
  const [activeAssetForMove, setActiveAssetForMove] = useState<MediaAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Multi-select state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Categories hook
  const { data: categories = [] } = useMediaCategories();

  // Sort resolution
  const [sortBy, sortOrder] = useMemo(() => {
    const [b, o] = sortValue.split(":") as ["createdAt" | "bytes", "asc" | "desc"];
    return [b, o];
  }, [sortValue]);

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
    if (selectedFormat !== "all") {
      q.format = selectedFormat;
    }
    return q;
  }, [page, search, selectedCategory, selectedFormat, sortBy, sortOrder]);

  const { data: result, isLoading, isError, refetch, isRefetching } = useMediaAssets(filters);
  const { data: summary } = useMediaSummary();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  const assets = result?.data ?? [];
  const meta = result?.meta;

  const totalAssetsCount = summary?.total ?? 0;
  const totalStorageBytes = summary?.bytes ?? 0;

  const hasActiveFilters = selectedCategory !== "all" || selectedFormat !== "all" || search.trim() !== "";

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedFormat("all");
    setSearch("");
    setSortValue("createdAt:desc");
    setPage(1);
  };

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
            <PageHelpTooltip description="مكتبة الوسائط — رفع وإدارة الصور والفيديوهات المستخدمة في الجولات والصفحات." />
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
            className="h-9 text-xs font-semibold cursor-pointer rounded-xl"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWebpStudioOpen(true)}
            className="h-9 text-xs font-bold gap-1.5 cursor-pointer border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 rounded-xl"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? "استوديو تحويل WebP ⚡" : "WebP Studio ⚡"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setManageCategoriesOpen(true)}
            className="h-9 text-xs font-bold gap-1.5 cursor-pointer border-amber-500/40 hover:bg-amber-500/10 text-foreground rounded-xl"
          >
            <Tags className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? "إدارة الفئات والمجلدات" : "Manage Categories"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="h-9 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer rounded-xl"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? "إضافة صور / روابط 📸" : "Add Images / URLs 📸"}</span>
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

      {/* 3. Category Filter Tabs Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? "تصفية حسب الفئة / المجلد:" : "Filter by Category / Folder:"}</span>
          </span>
          <button
            onClick={() => setManageCategoriesOpen(true)}
            className="text-[11px] font-extrabold text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Tags className="w-3 h-3" />
            <span>{isAr ? "+ تخصيص الفئات" : "+ Customize Categories"}</span>
          </button>
        </div>

        {/* Smooth Slider Bar with Left / Right Navigation */}
        <div className="relative flex items-center gap-1.5 bg-card/60 p-1.5 rounded-2xl border border-border/70 shadow-xs">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => slideCategories("left")}
            className="h-8 w-8 rounded-xl shrink-0 border-border/80 bg-background/80 hover:bg-amber-500 hover:text-slate-950 shadow-xs cursor-pointer transition-all"
            title={isAr ? "تحريك لليمين" : "Scroll Left"}
          >
            {isAr ? <ChevronRight className="w-4 h-4 stroke-[2.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[2.5]" />}
          </Button>

          <div
            ref={categoryScrollRef}
            onWheel={handleCategoryWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-amber-500/30 hover:scrollbar-thumb-amber-500/60 scrollbar-track-transparent"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm scale-[1.02]"
                  : "bg-background/80 text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
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
                      : "bg-background/80 text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
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

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => slideCategories("right")}
            className="h-8 w-8 rounded-xl shrink-0 border-border/80 bg-background/80 hover:bg-amber-500 hover:text-slate-950 shadow-xs cursor-pointer transition-all"
            title={isAr ? "تحريك لليسار" : "Scroll Right"}
          >
            {isAr ? <ChevronLeft className="w-4 h-4 stroke-[2.5]" /> : <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
          </Button>
        </div>
      </div>

      {/* 4. Toolbar: Search, Format Pills, Sort Selector & Bulk Actions */}
      <Card className="p-4 bg-card border border-border/80 rounded-2xl flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={isAr ? "بحث بالنص البديل، كود الصورة، أو الرابط..." : "Search by alt text, ID, or URL..."}
              className="pl-9 pr-9 rtl:pl-9 rtl:pr-9 h-9 text-xs rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format Selector Pills */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
              {[
                { id: "all", labelEn: "All Formats", labelAr: "كافة الصيغ" },
                { id: "webp", labelEn: "WEBP", labelAr: "WEBP" },
                { id: "jpg", labelEn: "JPG", labelAr: "JPG" },
                { id: "png", labelEn: "PNG", labelAr: "PNG" },
              ].map((f) => {
                const isActive = selectedFormat === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormat(f.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isAr ? f.labelAr : f.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Sort Selector Dropdown */}
            <Select
              value={sortValue}
              onValueChange={(val) => {
                setSortValue(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[170px] text-xs font-bold rounded-xl gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder={isAr ? "الترتيب" : "Sort By"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="createdAt:desc" className="text-xs font-bold">
                  {isAr ? "الأحدث أولاً (Newest)" : "Newest First"}
                </SelectItem>
                <SelectItem value="createdAt:asc" className="text-xs font-bold">
                  {isAr ? "الأقدم أولاً (Oldest)" : "Oldest First"}
                </SelectItem>
                <SelectItem value="bytes:desc" className="text-xs font-bold">
                  {isAr ? "الأكبر حجماً (Largest)" : "Largest Size"}
                </SelectItem>
                <SelectItem value="bytes:asc" className="text-xs font-bold">
                  {isAr ? "الأصغر حجماً (Smallest)" : "Smallest Size"}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Select all toggle */}
            {assets.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="h-9 text-xs font-bold gap-1.5 cursor-pointer rounded-xl"
              >
                {selectedAssetIds.length === assets.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>
                  {selectedAssetIds.length === assets.length
                    ? isAr
                      ? "إلغاء التحديد"
                      : "Deselect All"
                    : isAr
                    ? "تحديد الكل"
                    : "Select All"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 animate-in fade-in">
            <span className="text-[11px] font-bold text-muted-foreground">
              {isAr ? "الفلاتر النشطة:" : "Active Filters:"}
            </span>

            {selectedCategory !== "all" && (
              <Badge
                variant="secondary"
                className="text-[11px] font-bold gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              >
                <span>
                  {isAr ? "الفئة:" : "Category:"}{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.[isAr ? "nameAr" : "nameEn"] || selectedCategory}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setPage(1);
                  }}
                  className="hover:text-destructive cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {selectedFormat !== "all" && (
              <Badge
                variant="secondary"
                className="text-[11px] font-bold gap-1.5 py-1 px-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
              >
                <span>{isAr ? "الصيغة:" : "Format:"} {selectedFormat.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat("all");
                    setPage(1);
                  }}
                  className="hover:text-destructive cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {search.trim() !== "" && (
              <Badge
                variant="secondary"
                className="text-[11px] font-bold gap-1.5 py-1 px-2.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
              >
                <span>{isAr ? "البحث:" : "Search:"} &quot;{search}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="hover:text-destructive cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-6 text-[11px] font-extrabold text-destructive hover:bg-destructive/10 px-2 rounded-lg gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isAr ? "إعادة ضبط الفلاتر" : "Reset All"}</span>
            </Button>
          </div>
        )}
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
              className="h-8 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs rounded-xl"
            >
              <FolderSymlink className="w-3.5 h-3.5" />
              <span>{isAr ? "نقل إلى فئة أخرى..." : "Move to Category..."}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveBulk}
              className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer gap-1.5 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? "حذف المحدد" : "Delete Selected"}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedAssetIds([])}
              className="h-8 text-xs text-muted-foreground cursor-pointer rounded-xl"
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
        <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3 rounded-3xl">
          <p className="text-sm font-bold text-destructive">
            {isAr ? "تعذر تحميل مكتبة الوسائط من الخادم." : "Could not load media assets from backend."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="rounded-xl">
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
              ? "يمكنك إعادة ضبط الفلاتر أو رفع صور جديدة واستيرادها عبر الروابط."
              : "Reset filters or upload new high-res images and import direct URLs."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-semibold rounded-xl gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 rounded-xl shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة صور الآن" : "Add Images Now"}</span>
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

      {/* 11. WebP Optimizer Studio */}
      <WebPOptimizerStudio
        open={webpStudioOpen}
        onOpenChange={setWebpStudioOpen}
        categories={categories}
        isAr={isAr}
      />
    </div>
  );
}
