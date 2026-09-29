"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useShowcaseMedia,
  useAssignShowcase,
  useAssignBulkShowcase,
  useUpdateShowcaseItem,
  useReorderShowcase,
  useRemoveFromShowcase,
  useUploadVideo,
  useMediaAssets,
  useMediaCategories,
  useSyncEntities,
} from "@/features/media/hooks/useMedia";
import { MediaAsset } from "@/features/media/types";
import { VideoUploadDialog } from "@/features/media/components/VideoUploadDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Play,
  Loader2,
  RefreshCw,
  Clock,
  ExternalLink,
  Layers,
  UploadCloud,
  Film,
  GripVertical,
  Check,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter,
  FolderOpen,
  Shuffle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getCloudNameFromUrl(url?: string | null) {
  if (!url) return "u7xf91gp";
  const match = url.match(/cloudinary\.com\/([^/]+)\//);
  return match ? match[1] : "u7xf91gp";
}

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  try {
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
      const parsed = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
    }
  } catch {
    // Fall through
  }
  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|v\/|watch\?(?:.*&)?v=))([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

function extractVimeoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.trim().match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/i);
  return match ? match[1] : null;
}

interface SortablePhotoCardProps {
  item: MediaAsset;
  idx: number;
  total: number;
  isAr: boolean;
  isReordering: boolean;
  isRemoving: boolean;
  onToggleActive: (item: MediaAsset) => void;
  onMove: (section: "PHOTO" | "VIDEO", index: number, direction: "up" | "down") => void;
  onEdit: (item: MediaAsset) => void;
  onRemove: (id: string) => void;
}

function SortableShowcasePhotoCard({
  item,
  idx,
  total,
  isAr,
  isReordering,
  isRemoving,
  onToggleActive,
  onMove,
  onEdit,
  onRemove,
}: SortablePhotoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden transition-all duration-200 border ${
        isDragging ? "ring-2 ring-amber-500 shadow-xl" : ""
      } ${item.isActive ? "border-border/80 shadow-sm" : "opacity-60 border-dashed"}`}
    >
      <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden group">
        <img
          src={item.optimizedUrl || item.secureUrl || item.url}
          alt={item.altText || item.title || "Showcase Photo"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <Badge className="bg-slate-900/80 text-white font-mono text-xs backdrop-blur-sm border border-white/10">
            #{idx + 1}
          </Badge>
          {item.optimizedUrl && (
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              WebP
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-hidden"
            title={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
            aria-label={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 text-white"
            onClick={() => window.open(item.secureUrl || item.url, "_blank")}
            title={isAr ? "عرض الصورة الأصلية" : "View original"}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate">
              {item.title || (isAr ? "بدون عنوان" : "Untitled")}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {item.altText || item.entityType || "Dunas Travel"}
            </p>
          </div>
          <Badge
            variant={item.isActive ? "default" : "secondary"}
            className="cursor-pointer text-xs shrink-0"
            onClick={() => onToggleActive(item)}
          >
            {item.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={idx === 0 || isReordering}
              onClick={() => onMove("PHOTO", idx, "up")}
              title={isAr ? "تحريك لأعلى" : "Move up"}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={idx === total - 1 || isReordering}
              onClick={() => onMove("PHOTO", idx, "down")}
              title={isAr ? "تحريك لأسفل" : "Move down"}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(item)}
              title={isAr ? "تعديل التفاصيل" : "Edit details"}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              disabled={isRemoving}
              onClick={() => onRemove(item.id)}
              title={isAr ? "إزالة من المعرض" : "Remove from showcase"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableVideoCardProps {
  item: MediaAsset;
  idx: number;
  total: number;
  isAr: boolean;
  isReordering: boolean;
  isRemoving: boolean;
  onToggleActive: (item: MediaAsset) => void;
  onMove: (section: "PHOTO" | "VIDEO", index: number, direction: "up" | "down") => void;
  onEdit: (item: MediaAsset) => void;
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}

function SortableShowcaseVideoCard({
  item,
  idx,
  total,
  isAr,
  isReordering,
  isRemoving,
  onToggleActive,
  onMove,
  onEdit,
  onRemove,
  onPreview,
}: SortableVideoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : undefined,
  };

  const videoUrl = item.secureUrl || item.url;
  const ytId = extractYouTubeId(videoUrl);
  const vimeoId = extractVimeoId(videoUrl);
  const cloudName = getCloudNameFromUrl(videoUrl);
  const thumbnail =
    item.thumbnailUrl ||
    (ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : item.publicId
      ? `https://res.cloudinary.com/${cloudName}/video/upload/w_600,h_400,c_fill,so_0,f_jpg/${item.publicId}.jpg`
      : "/images/placeholder.jpg");

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden transition-all duration-200 border ${
        isDragging ? "ring-2 ring-blue-500 shadow-xl" : ""
      } ${item.isActive ? "border-border/80 shadow-sm" : "opacity-60 border-dashed"}`}
    >
      <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden group">
        <img
          src={thumbnail}
          alt={item.title || "Showcase Video"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors cursor-pointer"
          onClick={() => onPreview(videoUrl)}
        >
          <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <Badge className="bg-slate-900/80 text-white font-mono text-xs backdrop-blur-sm border border-white/10">
            #{idx + 1}
          </Badge>
          {ytId && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-1.5 py-0 border-0 shadow-xs">
              YouTube
            </Badge>
          )}
          {vimeoId && (
            <Badge className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] px-1.5 py-0 border-0 shadow-xs">
              Vimeo
            </Badge>
          )}
          {item.duration && (
            <Badge variant="outline" className="bg-black/60 text-white border-white/20 text-[10px] gap-1">
              <Clock className="w-3 h-3" />
              {Math.round(item.duration)}s
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-hidden"
            title={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
            aria-label={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate">
              {item.title || (isAr ? "مقطع فيديو بدون عنوان" : "Untitled Video")}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {item.description || item.altText || "Dunas Travel Experience"}
            </p>
          </div>
          <Badge
            variant={item.isActive ? "default" : "secondary"}
            className="cursor-pointer text-xs shrink-0"
            onClick={() => onToggleActive(item)}
          >
            {item.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={idx === 0 || isReordering}
              onClick={() => onMove("VIDEO", idx, "up")}
              title={isAr ? "تحريك لأعلى" : "Move up"}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={idx === total - 1 || isReordering}
              onClick={() => onMove("VIDEO", idx, "down")}
              title={isAr ? "تحريك لأسفل" : "Move down"}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(item)}
              title={isAr ? "تعديل التفاصيل" : "Edit details"}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              disabled={isRemoving}
              onClick={() => onRemove(item.id)}
              title={isAr ? "إزالة من المعرض" : "Remove from showcase"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaShowcasePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const { data: showcaseData, isLoading, refetch } = useShowcaseMedia();
  const { mutate: assignShowcase, isPending: isAssigning } = useAssignShowcase();
  const { mutate: assignBulkShowcase, isPending: isAssigningBulk } = useAssignBulkShowcase();
  const { mutate: updateShowcaseItem, isPending: isUpdating } = useUpdateShowcaseItem();
  const { mutate: reorderShowcase, isPending: isReordering } = useReorderShowcase();
  const { mutate: removeFromShowcase, isPending: isRemoving } = useRemoveFromShowcase();
  const { mutate: syncEntities, isPending: isSyncing } = useSyncEntities();

  // Modals
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaAsset | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedAssetsMap, setSelectedAssetsMap] = useState<Record<string, MediaAsset>>({});

  // Library Picker state for Photo & Video
  const [libraryPage, setLibraryPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: libraryCategories = [] } = useMediaCategories();

  const { data: libraryMedia, isLoading: isLibraryLoading } = useMediaAssets({
    page: libraryPage,
    limit: 100,
    category: categoryFilter,
    search: (searchQuery || "").trim() || undefined,
  });

  const photos = showcaseData?.photos || [];
  const videos = showcaseData?.videos || [];

  const toggleSelectAssetObj = (asset: MediaAsset) => {
    setSelectedAssetIds((prev) => {
      const exists = prev.includes(asset.id);
      if (exists) {
        const nextMap = { ...selectedAssetsMap };
        delete nextMap[asset.id];
        setSelectedAssetsMap(nextMap);
        return prev.filter((item) => item !== asset.id);
      } else {
        setSelectedAssetsMap((prevMap) => ({ ...prevMap, [asset.id]: asset }));
        return [...prev, asset.id];
      }
    });
  };

  const handleConfirmAddSelected = () => {
    if (selectedAssetIds.length === 0) return;

    const payloads = selectedAssetIds.map((id) => {
      const asset = selectedAssetsMap[id] || libraryMedia?.data?.find((a) => a.id === id);
      return {
        assetId: id,
        mediaId: id,
        section: isAddPhotoOpen ? ("PHOTO" as const) : ("VIDEO" as const),
        title: String(asset?.altText || asset?.title || "Showcase Item").trim(),
      };
    });

    assignBulkShowcase(payloads, {
      onSuccess: () => {
        const count = selectedAssetIds.length;
        toast.success(
          isAr
            ? `تمت إضافة ${count} ${isAddPhotoOpen ? "صورة" : "فيديو"} إلى معرض الواجهة الرئيسية بنجاح`
            : `Successfully added ${count} item(s) to showcase`
        );
        setIsAddPhotoOpen(false);
        setIsAddVideoOpen(false);
        setSelectedAssetIds([]);
        setSelectedAssetsMap({});
        setLibraryPage(1);
      },
    });
  };

  const handleShufflePhotos = () => {
    if (photos.length === 0) return;
    const shuffled = [...photos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const items = shuffled.map((item, idx) => ({ id: item.id, position: idx + 1 }));
    reorderShowcase(
      { section: "PHOTO", items },
      {
        onSuccess: () => {
          toast.success(
            isAr
              ? "تمت إعادة تدوير وتبديل عروض الصور بنجاح! سيظهر 15 صورة جديدة ومتنوعة على الواجهة الرئيسية."
              : "Showcase photos successfully rotated! 15 items featured on homepage."
          );
        },
      }
    );
  };

  // Handlers for Reordering
  const handleMove = (section: "PHOTO" | "VIDEO", index: number, direction: "up" | "down") => {
    const list = section === "PHOTO" ? [...photos] : [...videos];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const items = list.map((item, idx) => ({ id: item.id, position: idx + 1 }));
    reorderShowcase({ section, items });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePhotoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((item) => item.id === active.id);
    const newIndex = photos.findIndex((item) => item.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(photos, oldIndex, newIndex);
      const items = reordered.map((item, idx) => ({ id: item.id, position: idx + 1 }));
      reorderShowcase({ section: "PHOTO", items });
    }
  };

  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((item) => item.id === active.id);
    const newIndex = videos.findIndex((item) => item.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(videos, oldIndex, newIndex);
      const items = reordered.map((item, idx) => ({ id: item.id, position: idx + 1 }));
      reorderShowcase({ section: "VIDEO", items });
    }
  };

  // Toggle Active
  const handleToggleActive = (item: MediaAsset) => {
    updateShowcaseItem({
      id: item.id,
      payload: { isActive: !item.isActive },
    });
  };

  // Handle Edit Save
  const handleSaveEdit = () => {
    if (!editingItem) return;
    const cleanTitle = (editingItem.title || "").trim();
    const cleanAlt = (editingItem.altText || "").trim();
    const cleanDesc = (editingItem.description || "").trim();
    updateShowcaseItem({
      id: editingItem.id,
      payload: {
        title: cleanTitle || undefined,
        altText: cleanAlt || undefined,
        description: cleanDesc || undefined,
      },
    });
    setEditingItem(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50" dir={isAr ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {isAr ? "معرض الواجهة الرئيسية (Showcase)" : "Homepage Media Showcase"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "تحكّم في الصور والفيديوهات المعروضة في سلايدرات الصفحة الرئيسية وترتيبها وحالتها."
              : "Manage curated photos and videos displayed on the public homepage carousels."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncEntities()}
            disabled={isSyncing}
            className="gap-2"
            title={isAr ? "مزامنة صور الرحلات المسجلة في النظام" : "Sync tour images to media assets"}
          >
            <Layers className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isAr ? "مزامنة صور الرحلات" : "Sync Tour Images"}
          </Button>
        </div>
      </div>

      {/* Tabs for Photos & Videos */}
      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="photos" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>{isAr ? "معرض الصور" : "Photo Showcase"}</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {photos.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <VideoIcon className="w-4 h-4" />
            <span>{isAr ? "معرض الفيديو" : "Video Showcase"}</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {videos.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ================= SECTION A: PHOTO SHOWCASE ================= */}
        <TabsContent value="photos" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-foreground">
                  {isAr ? "صور قسم 'لمحات عن رحلتك'" : "Photo Carousel Items"}
                </h2>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px] py-0.5">
                  <Clock className="w-3 h-3" />
                  {isAr ? "تدوير تلقائي 24h (عرض 15 صورة)" : "24h Auto-Rotate (15 Photos)"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "يتم تدوير وحساب 15 صورة عشوائية ومختلفة تلقائياً كل 24 ساعة على الواجهة الرئيسية من بين جميع الصور المضافة هنا."
                  : "15 unique featured photos rotate automatically every 24 hours on the homepage carousel from your collection."}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleShufflePhotos}
                disabled={isReordering || photos.length === 0}
                className="gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                title={isAr ? "تبديل وتدوير ترتيب الصور فورياً" : "Instantly rotate and shuffle photos"}
              >
                <Shuffle className={`w-4 h-4 ${isReordering ? "animate-spin" : ""}`} />
                {isAr ? "تدوير وتبديل الصور الآن" : "Rotate & Shuffle Now"}
              </Button>
              <Button
                onClick={() => setIsAddPhotoOpen(true)}
                className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {isAr ? "إضافة صورة من المكتبة" : "Add Photo from Library"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : photos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {isAr ? "لا توجد صور في المعرض بعد" : "No Showcase Photos Yet"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {isAr
                    ? "اختر صوراً مميزة من مكتبة الوسائط لعرضها في سلايدر الصفحة الرئيسية."
                    : "Add highlight photos from your media library to feature them on the homepage."}
                </p>
                <Button onClick={() => setIsAddPhotoOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {isAr ? "إضافة صورة الآن" : "Add Photo Now"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
              <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((item, idx) => (
                    <SortableShowcasePhotoCard
                      key={item.id}
                      item={item}
                      idx={idx}
                      total={photos.length}
                      isAr={isAr}
                      isReordering={isReordering}
                      isRemoving={isRemoving}
                      onToggleActive={handleToggleActive}
                      onMove={handleMove}
                      onEdit={setEditingItem}
                      onRemove={removeFromShowcase}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {/* ================= SECTION B: VIDEO SHOWCASE ================= */}
        <TabsContent value="videos" className="mt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isAr ? "فيديوهات قسم 'لحظات لا تُنسى'" : "Video Carousel Items"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تظهر هذه الفيديوهات في سلايدر الفيديو المباشر أسفل معرض الصور مع تشغيل تلقائي صامت ومودال تشغيل كامل."
                  : "These videos appear in the dedicated homepage video carousel below the photo showcase."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddVideoOpen(true)}
                className="gap-2"
              >
                <Film className="w-4 h-4" />
                {isAr ? "اختيار من المكتبة" : "Pick from Library"}
              </Button>
              <Button
                onClick={() => setIsUploadVideoOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                {isAr ? "رفع فيديو جديد" : "Upload New Video"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : videos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                  <VideoIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {isAr ? "لا توجد فيديوهات في المعرض بعد" : "No Showcase Videos Yet"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {isAr
                    ? "ارفع مقاطع فيديو قصيرة أو اختر من المكتبة لتفعيل سلايدر الفيديو على الصفحة الرئيسية."
                    : "Upload short clips or select existing videos to activate the homepage video showcase."}
                </p>
                <Button onClick={() => setIsUploadVideoOpen(true)} className="gap-2">
                  <UploadCloud className="w-4 h-4" />
                  {isAr ? "رفع فيديو الآن" : "Upload Video Now"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVideoDragEnd}>
              <SortableContext items={videos.map((v) => v.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((item, idx) => (
                    <SortableShowcaseVideoCard
                      key={item.id}
                      item={item}
                      idx={idx}
                      total={videos.length}
                      isAr={isAr}
                      isReordering={isReordering}
                      isRemoving={isRemoving}
                      onToggleActive={handleToggleActive}
                      onMove={handleMove}
                      onEdit={setEditingItem}
                      onRemove={removeFromShowcase}
                      onPreview={setPreviewVideoUrl}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>

      {/* ================= MODAL: ADD FROM LIBRARY ================= */}
      <Dialog
        open={isAddPhotoOpen || isAddVideoOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddPhotoOpen(false);
            setIsAddVideoOpen(false);
            setSelectedAssetIds([]);
            setSelectedAssetsMap({});
            setSearchQuery("");
            setCategoryFilter(undefined);
            setLibraryPage(1);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {isAddPhotoOpen
                  ? (isAr ? "إضافة صور من المكتبة" : "Add Photos from Library")
                  : (isAr ? "إضافة فيديوهات من المكتبة" : "Add Videos from Library")}
              </span>
            </DialogTitle>
            <DialogDescription>
              {isAr
                ? "اختر من المكتبة العامة أو التصنيفات المتاحة لإضافة صورة أو عدة صور مباشرة إلى الصفحة الرئيسية."
                : "Select from the general media library or categories to feature photos or videos on the homepage."}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const availableAssets = (libraryMedia?.data || []).filter((asset) => {
              const isImage = !asset.mediaType || asset.mediaType === "IMAGE";
              const isVideo = asset.mediaType === "VIDEO" || String(asset.mimeType).startsWith("video/");
              if (isAddPhotoOpen) return isImage;
              if (isAddVideoOpen) return isVideo;
              return true;
            });

            const allVisibleSelected =
              availableAssets.length > 0 &&
              availableAssets.every((a) => selectedAssetIds.includes(a.id));

            const handleToggleSelectAll = () => {
              if (allVisibleSelected) {
                const visibleIds = availableAssets.map((a) => a.id);
                setSelectedAssetIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
              } else {
                availableAssets.forEach((asset) => {
                  setSelectedAssetsMap((prevMap) => ({ ...prevMap, [asset.id]: asset }));
                });
                const visibleIds = availableAssets.map((a) => a.id);
                setSelectedAssetIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
              }
            };

            const totalPages = libraryMedia?.meta?.totalPages || 1;
            const totalAssets = libraryMedia?.meta?.total ?? availableAssets.length;

            return (
              <>
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      placeholder={isAr ? "ابحث في مكتبة الوسائط..." : "Search media library..."}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setLibraryPage(1);
                      }}
                      className="flex-1"
                    />

                    {/* Category Filter Selector */}
                    <div className="relative shrink-0">
                      <select
                        value={categoryFilter || "all"}
                        onChange={(e) => {
                          setCategoryFilter(e.target.value === "all" ? undefined : e.target.value);
                          setLibraryPage(1);
                        }}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="all">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
                        {libraryCategories.map((cat) => (
                          <option key={cat.id || cat.slug} value={cat.slug}>
                            {isAr ? cat.nameAr || cat.nameEn : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                    {selectedAssetIds.length > 0 && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-1">
                        {isAr ? `تم تحديد ${selectedAssetIds.length}` : `${selectedAssetIds.length} selected`}
                      </Badge>
                    )}
                    {availableAssets.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleSelectAll}
                        className="h-8 text-xs gap-1.5 shrink-0"
                      >
                        {allVisibleSelected ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            {isAr ? "إلغاء تحديد الصفّ" : "Deselect Page"}
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" />
                            {isAr ? "تحديد هذا الصفّ" : "Select Page"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub-header with Total Counter & Page Pagination */}
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground pb-1 border-b border-border/40">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    {isAr
                      ? `إجمالي عناصر المكتبة: ${totalAssets}`
                      : `Total library assets: ${totalAssets}`}
                  </span>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={libraryPage <= 1}
                        onClick={() => setLibraryPage((p) => Math.max(1, p - 1))}
                        title={isAr ? "الصفحة السابقة" : "Previous page"}
                      >
                        {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      </Button>
                      <span className="font-mono text-[11px] px-1">
                        {libraryPage} / {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={libraryPage >= totalPages}
                        onClick={() => setLibraryPage((p) => p + 1)}
                        title={isAr ? "الصفحة التالية" : "Next page"}
                      >
                        {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto min-h-[340px] max-h-[460px] border rounded-lg p-3 mt-2">
                  {isLibraryLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  ) : availableAssets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {isAr ? "لا توجد نتائج مطابقة في المكتبة" : "No matching assets found in library"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {availableAssets.map((asset) => {
                        const isSelected = selectedAssetIds.includes(asset.id);
                        const isAlreadyInShowcase = isAddPhotoOpen
                          ? photos.some((p) => p.id === asset.id || (p as any).mediaId === asset.id)
                          : videos.some((v) => v.id === asset.id || (v as any).mediaId === asset.id);

                        return (
                          <div
                            key={asset.id}
                            className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer bg-muted transition-all select-none ${
                              isSelected
                                ? "border-amber-500 ring-2 ring-amber-500/80 shadow-md scale-[0.98]"
                                : "border-border/70 hover:border-amber-500/70"
                            }`}
                            onClick={() => toggleSelectAssetObj(asset)}
                          >
                            <img
                              src={asset.optimizedUrl || asset.thumbnailUrl || asset.secureUrl || asset.url}
                              alt={asset.altText || asset.title || ""}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />

                            {/* Top left badge if already in showcase */}
                            {isAlreadyInShowcase && (
                              <div className="absolute top-1.5 left-1.5 z-10">
                                <Badge className="bg-black/75 backdrop-blur-xs text-amber-400 border border-amber-500/40 text-[10px] px-1.5 py-0.5">
                                  {isAr ? "مضاف" : "Added"}
                                </Badge>
                              </div>
                            )}

                            {/* Top right check mark indicator */}
                            <div className="absolute top-1.5 right-1.5 z-10">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-amber-500 text-white shadow-xs scale-110"
                                    : "bg-black/40 text-white/70 group-hover:bg-black/60"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full border border-white/60" />
                                )}
                              </div>
                            </div>

                            {/* Hover label overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4 text-center text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {asset.title || asset.altText || (isAr ? "بدون عنوان" : "Untitled")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddPhotoOpen(false);
                      setIsAddVideoOpen(false);
                      setSelectedAssetIds([]);
                      setSelectedAssetsMap({});
                      setLibraryPage(1);
                    }}
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={handleConfirmAddSelected}
                    disabled={selectedAssetIds.length === 0 || isAssigningBulk}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm"
                  >
                    {isAssigningBulk ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isAr ? "جاري الإضافة..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {isAddPhotoOpen
                          ? isAr
                            ? `إضافة الصور المختارة (${selectedAssetIds.length})`
                            : `Add Selected Photos (${selectedAssetIds.length})`
                          : isAr
                          ? `إضافة الفيديوهات المختارة (${selectedAssetIds.length})`
                          : `Add Selected Videos (${selectedAssetIds.length})`}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: UPLOAD NEW VIDEO ================= */}
      <VideoUploadDialog
        open={isUploadVideoOpen}
        onOpenChange={setIsUploadVideoOpen}
        isAr={isAr}
        defaultAddToShowcase={true}
        categorySlug="showcase"
      />

      {/* ================= MODAL: EDIT SHOWCASE ITEM ================= */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل تفاصيل العنصر" : "Edit Showcase Item"}</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isAr ? "العنوان" : "Title"}
                </label>
                <Input
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isAr ? "النص البديل (Alt Text)" : "Alt Text"}
                </label>
                <Input
                  value={editingItem.altText || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, altText: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isAr ? "الوصف" : "Description"}
                </label>
                <Input
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isAr ? "حفظ التعديلات" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: VIDEO PREVIEW ================= */}
      <Dialog open={!!previewVideoUrl} onOpenChange={(open) => !open && setPreviewVideoUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black rounded-3xl aspect-video flex items-center justify-center border border-white/15">
          {(() => {
            if (!previewVideoUrl) return null;
            const ytId = extractYouTubeId(previewVideoUrl);
            const vimeoId = extractVimeoId(previewVideoUrl);

            if (ytId) {
              return (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                  title="YouTube Video Player"
                  className="w-full h-full aspect-video border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              );
            }

            if (vimeoId) {
              return (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
                  title="Vimeo Video Player"
                  className="w-full h-full aspect-video border-0 bg-black"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              );
            }

            return (
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[75vh] object-contain bg-black"
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
