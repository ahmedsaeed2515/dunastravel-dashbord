"use client";

import { useState } from "react";
import { UploadMediaDialog } from "@/features/media/components/UploadMediaDialog";
import { useMediaAssets, useUploadMedia, useDeleteMedia } from "@/features/media/hooks/useMedia";
import { MediaQueryFilters, UploadMediaPayload } from "@/features/media/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Film, 
  Image as ImageIcon, 
  Video, 
  Search, 
  PlusCircle, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  RefreshCw, 
  HardDrive, 
  Globe2, 
  Sparkles,
  MapPin,
  Play,
  Share2,
  Download,
  Filter,
  Sliders,
  Tv,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowUpDown
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function MediaPage() {
  const tMedia = useTranslations("media");
  const params = useParams();
  const isAr = params?.locale === "ar";

  const [filters, setFilters] = useState<MediaQueryFilters>({ page: 1, limit: 20 });
  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "homepage">("photos");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialType, setUploadInitialType] = useState<"photo" | "video">("photo");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<any | null>(null);

  const { data, isLoading, refetch, isRefetching } = useMediaAssets(filters);
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  // High-Res Photos State Matching Vercel Dashboard
  const [photoAssets, setPhotoAssets] = useState([
    {
      id: "ph-1",
      title: isAr ? "كروز النيل الأقصر - مرسى الكروان" : "Luxor Nile Cruise - Al Karawan Dock",
      category: isAr ? "الأقصر وأسوان" : "Luxor & Aswan",
      url: "https://images.unsplash.com/photo-1572252821128-4ef864c7ecfa?auto=format&fit=crop&w=800&q=80",
      resolution: "3840x2160 (4K)",
      size: "3.4 MB",
      badge: "VIP 👑",
      tag: "Luxor-Nile-01",
    },
    {
      id: "ph-2",
      title: isAr ? "أهرامات الجيزة - بانوراما أبو الهول" : "Giza Pyramids Panorama & Sphinx",
      category: isAr ? "القاهرة والأهرامات" : "Cairo & Pyramids",
      url: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
      resolution: "4096x2730 (HD)",
      size: "4.1 MB",
      badge: "الأكثر استخداماً ⭐",
      tag: "Pyramids-Main",
    },
    {
      id: "ph-3",
      title: isAr ? "الغردقة - منتجع الشاطئ الذهبي والرياضات البحرية" : "Hurghada Gold Beach & Scuba Diving",
      category: isAr ? "البحر الأحمر والغردقة" : "Hurghada & Red Sea",
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      resolution: "3840x2160 (4K)",
      size: "2.9 MB",
      badge: "البحر الأحمر 🏖️",
      tag: "Hurghada-Resort",
    },
    {
      id: "ph-4",
      title: isAr ? "كابادوكيا - رحلة المناطيد عند الشروق" : "Cappadocia Sunrise Balloons Tour",
      category: isAr ? "تركيا وكابادوكيا" : "Turkey & Cappadocia",
      url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
      resolution: "3840x2160 (4K)",
      size: "3.8 MB",
      badge: "عالمي 🎈",
      tag: "Cappadocia-Balloons",
    },
    {
      id: "ph-5",
      title: isAr ? "البتراء - الخزنة الأثرية والسيق" : "Petra Al-Khazneh Treasury & Siq",
      category: isAr ? "الأردن والبتراء" : "Jordan & Petra",
      url: "https://images.unsplash.com/photo-1579606032821-4f67d26fb511?auto=format&fit=crop&w=800&q=80",
      resolution: "3840x2160 (4K)",
      size: "3.2 MB",
      badge: "ثقافي 🏛️",
      tag: "Jordan-Petra-01",
    },
    {
      id: "ph-6",
      title: isAr ? "معبد فيلة - أسوان عند الغروب" : "Philae Temple Aswan Sunset View",
      category: isAr ? "الأقصر وأسوان" : "Luxor & Aswan",
      url: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80",
      resolution: "4096x2304 (4K)",
      size: "4.5 MB",
      badge: "تاريخي 🌅",
      tag: "Aswan-Philae",
    },
  ]);

  // Merge live server media assets seamlessly
  const serverPhotos = ((): any[] => {
    const rawList = Array.isArray(data) ? data : (data?.data || []);
    if (!rawList || rawList.length === 0) return photoAssets;
    
    return rawList.map((item: any) => {
      const publicIdName = item.publicId ? item.publicId.split('/').pop() : null;
      const title = item.altText || (publicIdName ? `Tour Asset #${publicIdName}` : `Media Asset #${item.id?.slice(0, 6)}`);
      const url = item.secureUrl || item.url || '';
      
      return {
        id: item.id,
        title: title,
        category: item.entityType === 'TOUR' ? (isAr ? 'رحلات وتورز' : 'Tour Media') : (item.entityType || 'General'),
        url: url,
        resolution: item.width && item.height ? `${item.width}x${item.height}` : 'HD 1080p',
        size: item.bytes ? `${(item.bytes / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
        badge: item.provenance === 'SEEDED' ? 'SEEDED ⭐' : 'UPLOADED 🚀',
        tag: item.entityId ? `Tour-${item.entityId.slice(0, 6)}` : (item.publicId || 'Media'),
      };
    });
  })();

  const totalPhotosCount = (data as any)?.meta?.total ?? (Array.isArray(data) ? data.length : serverPhotos.length);

  // Videos State Matching Vercel Dashboard
  const [videoAssets, setVideoAssets] = useState([
    {
      id: "vd-1",
      title: isAr ? "فيديو ترويجي لكروز النيل الذهبي (HD 4K)" : "Nile Cruise Promo Video (4K Ultra HD)",
      category: isAr ? "الأقصر وأسوان" : "Luxor & Aswan",
      url: "https://images.unsplash.com/photo-1572252821128-4ef864c7ecfa?auto=format&fit=crop&w=800&q=80",
      duration: "03:45",
      size: "148 MB",
      badge: "فيديو ترويجي 🎥",
      tag: "Nile-Cruise-Promo-4K",
    },
    {
      id: "vd-2",
      title: isAr ? "فيلم وثائقي قصير: سحر الأهرامات والمتحف الكبير" : "Documentary: Magic of Pyramids & Grand Museum",
      category: isAr ? "القاهرة والأهرامات" : "Cairo & Pyramids",
      url: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
      duration: "05:12",
      size: "210 MB",
      badge: "وثائقي 🏛️",
      tag: "Cairo-Pyramids-Docu",
    },
    {
      id: "vd-3",
      title: isAr ? "رحلات الغوص والاسترخاء في البحر الأحمر" : "Red Sea Diving & Coral Reefs Adventure",
      category: isAr ? "البحر الأحمر والغردقة" : "Hurghada & Red Sea",
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      duration: "02:30",
      size: "95 MB",
      badge: "رياضات بحرية 🤿",
      tag: "RedSea-Diving-4K",
    },
  ]);

  // Homepage Hero Media Slider State
  const [homepageSlides, setHomepageSlides] = useState([
    {
      id: "hp-1",
      title: isAr ? "سحر كروز النيل في الأقصر وأسوان" : "Magical Nile Cruise Luxor & Aswan",
      subtitle: isAr ? "استمتع بأفخم الرحلات النيلية عبر 8 واجهات سياحية باللغات الـ 5" : "Enjoy luxury Nile Cruises across 8 destinations in 5 languages",
      url: "https://images.unsplash.com/photo-1572252821128-4ef864c7ecfa?auto=format&fit=crop&w=1200&q=80",
      type: "IMAGE",
      badge: "سلايد 1 • السلايدر الرئيسي 🌟",
      order: 1,
      isActive: true,
    },
    {
      id: "hp-2",
      title: isAr ? "بانوراما الأهرامات والمتحف المصري الكبير" : "Giza Pyramids & Grand Egyptian Museum",
      subtitle: isAr ? "استكشف أقدم الحضارات البشرية مع برامجنا الفاخرة المترجمة" : "Explore ancient history with luxury translated itineraries",
      url: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
      type: "VIDEO_BG",
      badge: "فيديو ترويجي 🎥",
      order: 2,
      isActive: true,
    },
    {
      id: "hp-3",
      title: isAr ? "شواطئ الغردقة والمنتجعات الذهبية" : "Hurghada Gold Beaches & Luxury Resorts",
      subtitle: isAr ? "عروض الاسترخاء، والغوص في البحر الأحمر، والرياضات المائية" : "Relaxation offers, Red Sea diving & marine sports",
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      type: "IMAGE",
      badge: "سلايد 3 🏖️",
      order: 3,
      isActive: true,
    },
    {
      id: "hp-4",
      title: isAr ? "خدمات VIP والطيران الخاص لكبار الشخصيات" : "VIP Private Jets & Executive Transfers",
      subtitle: isAr ? "برامج خاصة ومجهزة بأعلى معايير الرفاهية والأمان" : "Executive programs tailored to highest luxury standards",
      url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
      type: "IMAGE",
      badge: "VIP 👑",
      order: 4,
      isActive: false,
    },
  ]);

  const handleAddMedia = (newMedia: any) => {
    if (newMedia.type === "video") {
      setVideoAssets((prev) => [newMedia, ...prev]);
      setActiveTab("videos");
    } else {
      setPhotoAssets((prev) => [newMedia, ...prev]);
      setActiveTab("photos");
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPhotoDialog = () => {
    setUploadInitialType("photo");
    setIsUploadOpen(true);
  };

  const handleOpenVideoDialog = () => {
    setUploadInitialType("video");
    setIsUploadOpen(true);
  };

  const toggleSlideStatus = (id: string) => {
    setHomepageSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, isActive: !slide.isActive } : slide
      )
    );
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header Banner matching Vercel 1:1 */}
      <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0">
              <Film className="w-7 h-7 text-amber-500 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>{isAr ? "مكتبة الصور والفيديوهات (Media Gallery)" : "Media Gallery Assets"}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
                {isAr
                  ? "إدارة كاملة لمعرض الصور والفيديوهات الخاصة بالشرايط المتحركة."
                  : "Full management of photos and videos gallery for interactive sliders."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              onClick={handleOpenPhotoDialog}
              variant="gold"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 text-xs px-4 py-2 rounded-xl gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? "إضافة صورة جديدة 📸" : "Add New Photo 📸"}</span>
            </Button>

            <Button
              onClick={handleOpenVideoDialog}
              variant="outline"
              className="bg-slate-900/80 dark:bg-slate-800 text-white border-slate-700 text-xs px-4 py-2 rounded-xl gap-2 cursor-pointer hover:bg-slate-800"
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "إضافة فيديو جديد 🎥" : "Add New Video 🎥"}</span>
            </Button>

            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="icon"
              disabled={isRefetching}
              className="rounded-xl border border-border text-muted-foreground hover:text-foreground"
              title={isAr ? "تحديث المكتبة" : "Refresh Gallery"}
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Total Photos */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "إجمالي الصور بالمكتبة" : "Total Photos"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalPhotosCount} <span className="text-xs font-bold text-amber-500">{isAr ? "صورة 📸" : "Assets 📸"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <ImageIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        {/* Card 2: Total Videos */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "مقاطع الفيديو المرفقة" : "Attached Videos"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              42 <span className="text-xs font-bold text-sky-500">{isAr ? "فيديو 🎥" : "Videos 🎥"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <Video className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        {/* Card 3: Storage Used */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "المساحة المستخدمة" : "Storage Used"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              4.2 <span className="text-xs font-bold text-purple-500">GB / 20 GB 💾</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <HardDrive className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 3. Classification Tabs Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-card border border-border/80 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "photos"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isAr ? "معرض الصور" : "Photos Gallery"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-extrabold">{serverPhotos.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "videos"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{isAr ? "معرض الفيديوهات" : "Videos Gallery"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-extrabold">{videoAssets.length}</span>
          </button>
        </div>

        <div className="text-xs font-bold text-muted-foreground px-3 hidden sm:block">
          {activeTab === "photos" ? (isAr ? `عرض ${serverPhotos.length} صورة عالية الدقة 📸` : `Showing ${serverPhotos.length} Photos`) :
           activeTab === "videos" ? (isAr ? `عرض ${videoAssets.length} فيديو 🎥` : `Showing ${videoAssets.length} Videos`) :
           (isAr ? `متحكم سكرول وسلايدر الصفحة الرئيسية 🎡` : `Homepage Hero Carousel Manager 🎡`)}
        </div>
      </div>

      {/* 4. Photos Gallery Grid */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {serverPhotos.map((asset) => (
              <Card key={asset.id} className="overflow-hidden bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col justify-between group">
                <div>
                  {/* Thumbnail Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Badge */}
                    <span className="absolute top-3 end-3 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow-md font-mono">
                      {asset.badge}
                    </span>

                    {/* Category Pill */}
                    <span className="absolute bottom-3 end-3 text-[11px] font-extrabold text-white flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {asset.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-black text-foreground group-hover:text-amber-500 transition-colors line-clamp-1">
                      {asset.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{asset.resolution}</span>
                      <span>{asset.size}</span>
                    </div>

                    {/* URL Bar & Copy Button */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-xl border border-border">
                      <input
                        type="text"
                        readOnly
                        value={asset.url}
                        className="w-full bg-transparent text-[11px] font-mono text-muted-foreground focus:outline-none truncate dir-ltr"
                      />
                      <button
                        onClick={() => handleCopyUrl(asset.id, asset.url)}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                        title={isAr ? "نسخ الرابط" : "Copy URL"}
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 mt-1 flex items-center justify-between border-t border-border/40">
                  <button
                    onClick={() => setPreviewMedia(asset)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? "معاينة مكبرة 🔍" : "Preview 🔍"}</span>
                  </button>

                  <Button
                    onClick={() => {
                      if (confirm(isAr ? "هل أنت متأكد من حذف هذه الصورة؟" : "Delete photo?")) {
                        deleteMedia(asset.id);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-bold gap-1 rounded-xl"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "حذف" : "Delete"}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border border-border/70 rounded-2xl flex items-center justify-between bg-card">
            <div className="text-xs text-muted-foreground font-mono">
              {isAr
                ? `صفحة ${filters.page || 1} من ${(data as any)?.meta?.totalPages || 2} (إجمالي ${totalPhotosCount} ملف ميديا)`
                : `Page ${filters.page || 1} of ${(data as any)?.meta?.totalPages || 2} (${totalPhotosCount} total assets)`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-semibold"
                disabled={(filters.page || 1) <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                {isAr ? "السابق" : "Previous"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-semibold"
                disabled={(filters.page || 1) >= ((data as any)?.meta?.totalPages || 2)}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                {isAr ? "التالي" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Videos Gallery Grid */}
      {activeTab === "videos" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videoAssets.map((video) => (
            <Card key={video.id} className="overflow-hidden bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col justify-between group">
              <div>
                {/* Video Preview Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-amber-500/90 text-slate-950 shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-slate-950 text-slate-950 me-0.5" />
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow-md">
                    {video.badge}
                  </span>

                  {/* Duration Pill */}
                  <span className="absolute bottom-3 right-3 text-[11px] font-extrabold text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-xs dir-ltr">
                    ⏱️ {video.duration}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-black text-foreground group-hover:text-amber-500 transition-colors line-clamp-1">
                    {video.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>{video.category}</span>
                    <span>{video.size}</span>
                  </div>

                  {/* URL Bar & Copy */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-xl border border-border">
                    <input
                      type="text"
                      readOnly
                      value={video.url}
                      className="w-full bg-transparent text-[11px] font-mono text-muted-foreground focus:outline-none truncate dir-ltr"
                    />
                    <button
                      onClick={() => handleCopyUrl(video.id, video.url)}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      title={isAr ? "نسخ الرابط" : "Copy URL"}
                    >
                      {copiedId === video.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-4 py-3 mt-1 flex items-center justify-between border-t border-border/40">
                <button
                  onClick={() => setPreviewMedia(video)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? "معاينة وتشغيل 🎬" : "Play Preview 🎬"}</span>
                </button>

                <Button
                  onClick={() => {
                    if (confirm(isAr ? "هل أنت تأكد من حذف هذا الفيديو؟" : "Delete video?")) {
                      deleteMedia(video.id);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-bold gap-1 rounded-xl"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? "حذف" : "Delete"}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}



      {/* Lightbox / Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="sm:max-w-175 p-0 overflow-hidden bg-slate-950 border border-amber-500/40 text-white">
          {previewMedia && (
            <div>
              <div className="relative h-80 sm:h-96 w-full bg-black flex items-center justify-center">
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 space-y-4 bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400 block mb-1">
                      {previewMedia.category || previewMedia.badge} • {previewMedia.resolution || previewMedia.duration || "Hero Slide"}
                    </span>
                    <h2 className="text-lg font-black text-white">{previewMedia.title}</h2>
                    {previewMedia.subtitle && (
                      <p className="text-xs text-slate-300 font-semibold mt-1">{previewMedia.subtitle}</p>
                    )}
                  </div>

                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? "تحميل" : "Download"}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 dir-ltr">
                  <input
                    type="text"
                    readOnly
                    value={previewMedia.url}
                    className="w-full bg-transparent text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyUrl(previewMedia.id, previewMedia.url)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 hover:bg-amber-500/30 transition-colors cursor-pointer"
                  >
                    {copiedId === previewMedia.id ? (
                      <span className="text-emerald-400 font-bold">{isAr ? "تم النسخ ✓" : "Copied ✓"}</span>
                    ) : (
                      <span>{isAr ? "نسخ الرابط" : "Copy URL"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Media via Direct URL Dialog */}
      <UploadMediaDialog 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onAddMedia={handleAddMedia}
        initialType={uploadInitialType}
      />
    </div>
  );
}
