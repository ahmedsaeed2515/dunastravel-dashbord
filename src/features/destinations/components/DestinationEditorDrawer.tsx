"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DestinationItem,
  DestinationMutationPayload,
  DestinationTourItem,
} from "../api/destinationsApi";
import {
  useCreateDestination,
  useUpdateDestination,
  usePublishDestination,
  useUnpublishDestination,
  useAttachToursToDestination,
  useDetachTourFromDestination,
  useUpdateDestinationTourRelation,
  useReorderDestinationTours,
} from "../hooks/useDestinationsAdmin";
import { useTours } from "@/features/tours/hooks/useTours";
import { extractToursList } from "@/lib/extract-tours";
import { Tour } from "@/features/tours/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  Image as ImageIcon,
  Layers,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Star,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface DestinationEditorDrawerProps {
  destination: DestinationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCALES = [
  { code: "ar", name: "العربية", flag: "🇪🇬" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export function DestinationEditorDrawer({
  destination,
  open,
  onOpenChange,
}: DestinationEditorDrawerProps) {
  const isCreate = !destination?.id;

  const createMutation = useCreateDestination();
  const updateMutation = useUpdateDestination();
  const publishMutation = usePublishDestination();
  const unpublishMutation = useUnpublishDestination();
  const attachMutation = useAttachToursToDestination();
  const detachMutation = useDetachTourFromDestination();
  const updateRelationMutation = useUpdateDestinationTourRelation();
  const reorderToursMutation = useReorderDestinationTours();

  const { data: allToursData, isLoading: isLoadingAllTours } = useTours({
    limit: 150,
  });
  const allTours: Tour[] = useMemo(
    () => extractToursList(allToursData),
    [allToursData]
  );

  const [activeTab, setActiveTab] = useState<"content" | "media" | "tours" | "seo">("content");
  const [activeLocale, setActiveLocale] = useState("ar");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE">("DRAFT");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Multilingual content states
  const [titleJsonb, setTitleJsonb] = useState<Record<string, string>>({});
  const [subtitleJsonb, setSubtitleJsonb] = useState<Record<string, string>>({});
  const [briefJsonb, setBriefJsonb] = useState<Record<string, string>>({});
  const [descriptionJsonb, setDescriptionJsonb] = useState<Record<string, string>>({});

  // Media
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");

  // SEO
  const [seoTitleJsonb, setSeoTitleJsonb] = useState<Record<string, string>>({});
  const [seoDescriptionJsonb, setSeoDescriptionJsonb] = useState<Record<string, string>>({});
  const [seoKeywordsJsonb, setSeoKeywordsJsonb] = useState<Record<string, string>>({});

  // Tour attachments inside destination
  const [attachedTours, setAttachedTours] = useState<
    NonNullable<DestinationItem["tours"]>
  >([]);
  const [tourSearchQuery, setTourSearchQuery] = useState("");
  const [selectedTourIdToAdd, setSelectedTourIdToAdd] = useState("");

  useEffect(() => {
    if (destination && open) {
      setSlug(destination.slug || "");
      setStatus(destination.status || "DRAFT");
      setIsActive(destination.isActive ?? true);
      setSortOrder(destination.sortOrder ?? 0);
      setTitleJsonb(destination.titleJsonb || {});
      setSubtitleJsonb(destination.subtitleJsonb || {});
      setBriefJsonb(destination.briefJsonb || {});
      setDescriptionJsonb(destination.descriptionJsonb || {});
      setHeroImageUrl(destination.heroImageUrl || "");
      setHeroVideoUrl(destination.heroVideoUrl || "");
      setSeoTitleJsonb(destination.seoTitleJsonb || {});
      setSeoDescriptionJsonb(destination.seoDescriptionJsonb || {});
      setSeoKeywordsJsonb(destination.seoKeywordsJsonb || {});
      setAttachedTours(destination.tours || []);
    } else if (!destination && open) {
      setSlug("");
      setStatus("DRAFT");
      setIsActive(true);
      setSortOrder(0);
      setTitleJsonb({});
      setSubtitleJsonb({});
      setBriefJsonb({});
      setDescriptionJsonb({});
      setHeroImageUrl("");
      setHeroVideoUrl("");
      setSeoTitleJsonb({});
      setSeoDescriptionJsonb({});
      setSeoKeywordsJsonb({});
      setAttachedTours([]);
    }
  }, [destination, open]);

  // Auto slug generation from English or Arabic title if in create mode and slug not touched
  const handleTitleChange = (loc: string, val: string) => {
    setTitleJsonb((prev) => ({ ...prev, [loc]: val }));
    if (isCreate && (!slug || slug === "") && loc === "en" && val.trim()) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSave = async () => {
    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) {
      toast.error("يرجى إدخال المعرف الرابط (Slug) للوجهة.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      toast.error("المعرف الرابط (Slug) يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط بدون مسافات.");
      return;
    }

    const hasTitle =
      Boolean(titleJsonb.en?.trim()) || Boolean(titleJsonb.ar?.trim());
    if (!hasTitle) {
      toast.error("يرجى إدخال اسم الوجهة بالعربية أو الإنجليزية على الأقل.");
      return;
    }

    // Ensure en title is populated (backend requirement)
    const enTitle =
      titleJsonb.en?.trim() ||
      titleJsonb.ar?.trim() ||
      trimmedSlug.replace(/-/g, " ");

    const payload: DestinationMutationPayload = {
      slug: trimmedSlug,
      type: "DESTINATION",
      titleJsonb: {
        ...titleJsonb,
        en: enTitle,
        ar: titleJsonb.ar?.trim() || enTitle,
      },
      subtitleJsonb: Object.keys(subtitleJsonb).length ? subtitleJsonb : null,
      briefJsonb: Object.keys(briefJsonb).length ? briefJsonb : null,
      descriptionJsonb: Object.keys(descriptionJsonb).length ? descriptionJsonb : null,
      heroImageUrl: heroImageUrl.trim() || null,
      heroVideoUrl: heroVideoUrl.trim() || null,
      seoTitleJsonb: Object.keys(seoTitleJsonb).length ? seoTitleJsonb : null,
      seoDescriptionJsonb: Object.keys(seoDescriptionJsonb).length ? seoDescriptionJsonb : null,
      seoKeywordsJsonb: Object.keys(seoKeywordsJsonb).length ? seoKeywordsJsonb : null,
      status,
      isActive,
      sortOrder: Number(sortOrder) || 0,
      expectedUpdatedAt: destination?.updatedAt || undefined,
    };

    try {
      if (isCreate) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({
          idOrSlug: destination.slug || destination.id,
          data: payload,
        });
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Tour attachment handlers
  const handleAttachTour = async () => {
    if (!selectedTourIdToAdd) return;
    if (isCreate) {
      toast.info("يرجى حفظ الوجهة أولاً لتتمكن من ربط الرحلات بها.");
      return;
    }
    const currentSlug = destination?.slug || destination?.id;
    if (!currentSlug) return;

    try {
      const res = await attachMutation.mutateAsync({
        idOrSlug: currentSlug,
        tourIds: [selectedTourIdToAdd],
      });
      if (res.tours) {
        setAttachedTours(res.tours);
      }
      setSelectedTourIdToAdd("");
    } catch {
      // Handled by toast
    }
  };

  const handleDetachTour = async (tourId: string) => {
    const currentSlug = destination?.slug || destination?.id;
    if (!currentSlug) return;
    try {
      await detachMutation.mutateAsync({
        idOrSlug: currentSlug,
        tourId,
      });
      setAttachedTours((prev) => prev.filter((t) => t.tourId !== tourId && t.tour?.id !== tourId));
    } catch {
      // Handled by toast
    }
  };

  const handleToggleFeaturedTour = async (tourRelation: DestinationTourItem) => {
    const currentSlug = destination?.slug || destination?.id;
    if (!currentSlug) return;
    const nextFeatured = !tourRelation.isFeatured;
    try {
      await updateRelationMutation.mutateAsync({
        idOrSlug: currentSlug,
        tourId: tourRelation.tourId,
        payload: {
          isFeatured: nextFeatured,
          isVisible: tourRelation.isVisible,
        },
      });
      setAttachedTours((prev) =>
        prev.map((t) => (t.id === tourRelation.id ? { ...t, isFeatured: nextFeatured } : t))
      );
    } catch {
      // Handled by toast
    }
  };

  const handleToggleVisibleTour = async (tourRelation: DestinationTourItem) => {
    const currentSlug = destination?.slug || destination?.id;
    if (!currentSlug) return;
    const nextVisible = !tourRelation.isVisible;
    try {
      await updateRelationMutation.mutateAsync({
        idOrSlug: currentSlug,
        tourId: tourRelation.tourId,
        payload: {
          isFeatured: tourRelation.isFeatured,
          isVisible: nextVisible,
        },
      });
      setAttachedTours((prev) =>
        prev.map((t) => (t.id === tourRelation.id ? { ...t, isVisible: nextVisible } : t))
      );
    } catch {
      // Handled by toast
    }
  };

  const handleMoveTour = async (index: number, direction: -1 | 1) => {
    const currentSlug = destination?.slug || destination?.id;
    if (!currentSlug) return;
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= attachedTours.length) return;

    const newRelations = [...attachedTours];
    [newRelations[index], newRelations[swapIndex]] = [newRelations[swapIndex], newRelations[index]];
    setAttachedTours(newRelations);

    try {
      await reorderToursMutation.mutateAsync({
        idOrSlug: currentSlug,
        items: newRelations.map((r, order) => ({
          tourId: r.tourId,
          sortOrder: order,
        })),
      });
    } catch {
      // Handled by toast
    }
  };

  // Filter available tours not yet attached
  const availableToursToAdd = useMemo(() => {
    const attachedIds = new Set(attachedTours.map((t) => t.tourId || t.tour?.id));
    return allTours.filter((t) => !attachedIds.has(t.id));
  }, [allTours, attachedTours]);

  const filteredToursToAdd = useMemo(() => {
    if (!tourSearchQuery.trim()) return availableToursToAdd.slice(0, 15);
    const q = tourSearchQuery.toLowerCase().trim();
    return availableToursToAdd.filter(
      (t) =>
        t.slug?.toLowerCase().includes(q) ||
        (typeof t.titleJsonb === "object" &&
          Object.values(t.titleJsonb || {}).some(
            (v) => typeof v === "string" && v.toLowerCase().includes(q)
          ))
    );
  }, [availableToursToAdd, tourSearchQuery]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 bg-background border-l shadow-2xl z-[100]"
      >
        <SheetHeader className="px-6 py-4 border-b bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Globe className="h-5 w-5 text-amber-500" />
                {isCreate
                  ? "إضافة وجهة سياحية جديدة"
                  : `تعديل وجهة: ${titleJsonb.ar || titleJsonb.en || slug}`}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                تحكم في بيانات الوجهة السياحية، الترجمات باللغات الـ 5، الصور والوسائط، والرحلات التابعة لها.
              </SheetDescription>
            </div>
            {!isCreate && (
              <Badge
                variant={status === "PUBLISHED" ? "default" : "secondary"}
                className="font-bold text-xs"
              >
                {status === "PUBLISHED" ? "منشور" : status === "DRAFT" ? "مسودة" : status}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Status Bar */}
        <div className="px-6 py-2.5 bg-muted/30 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="font-bold text-muted-foreground">الحالة:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-8 rounded-lg border bg-background px-2.5 font-bold text-xs"
            >
              <option value="PUBLISHED">منشور (Published)</option>
              <option value="DRAFT">مسودة (Draft)</option>
              <option value="INACTIVE">غير نشط (Inactive)</option>
              <option value="ARCHIVED">مؤرشف (Archived)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="active-switch"
            />
            <label htmlFor="active-switch" className="font-bold text-xs cursor-pointer">
              {isActive ? "نشط على الموقع" : "معطل"}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground">الترتيب:</span>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-16 h-8 text-center text-xs font-bold rounded-lg"
            />
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="px-6 pt-3 border-b bg-background">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("content")}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "content"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-4 w-4" />
              المحتوى واللغات (5)
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "media"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              الصور والوسائط
            </button>
            <button
              onClick={() => setActiveTab("tours")}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "tours"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-4 w-4" />
              الرحلات المرتبطة ({attachedTours.length})
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "seo"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              تحسين محركات البحث (SEO)
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <ScrollArea className="flex-1 px-6 py-4">
          {/* TAB 1: Content & 5 Languages */}
          {activeTab === "content" && (
            <div className="space-y-5">
              {/* Slug */}
              <div className="space-y-1.5 bg-card p-4 rounded-xl border">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>المعرف الرابط (Slug) *</span>
                  <span className="text-[10px] text-muted-foreground">
                    مثال: egypt, turkey, dubai, jordan
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">
                    /destinations/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="egypt"
                    className="pl-28 font-mono text-xs font-bold rounded-xl"
                  />
                </div>
              </div>

              {/* Language Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    ترجمة المحتوى باللغات الـ 5:
                  </span>
                  <div className="flex gap-1">
                    {LOCALES.map((loc) => {
                      const isFilled = Boolean(titleJsonb[loc.code]?.trim());
                      return (
                        <button
                          key={loc.code}
                          type="button"
                          onClick={() => setActiveLocale(loc.code)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            activeLocale === loc.code
                              ? "bg-amber-500 text-black shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <span>{loc.flag}</span>
                          <span>{loc.code.toUpperCase()}</span>
                          {isFilled && <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Language Form */}
                <div className="p-4 rounded-xl border bg-card/50 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-base">{LOCALES.find((l) => l.code === activeLocale)?.flag}</span>
                    <span className="font-bold text-xs">
                      اللغة الحالية: {LOCALES.find((l) => l.code === activeLocale)?.name} ({activeLocale.toUpperCase()})
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      اسم الوجهة ({activeLocale.toUpperCase()}) *
                    </label>
                    <Input
                      value={titleJsonb[activeLocale] || ""}
                      onChange={(e) => handleTitleChange(activeLocale, e.target.value)}
                      placeholder={`اسم الوجهة بـ ${LOCALES.find((l) => l.code === activeLocale)?.name}`}
                      className="text-xs font-bold rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      العنوان الفرعي / الشعار (Subtitle)
                    </label>
                    <Input
                      value={subtitleJsonb[activeLocale] || ""}
                      onChange={(e) =>
                        setSubtitleJsonb((prev) => ({
                          ...prev,
                          [activeLocale]: e.target.value,
                        }))
                      }
                      placeholder="مثال: فخامة حضارة خالدة وأسرار النيل"
                      className="text-xs font-medium rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      نبذة مختصرة (Brief - تظهر في الكروت والقوائم)
                    </label>
                    <Textarea
                      rows={2}
                      value={briefJsonb[activeLocale] || ""}
                      onChange={(e) =>
                        setBriefJsonb((prev) => ({
                          ...prev,
                          [activeLocale]: e.target.value,
                        }))
                      }
                      placeholder="نبذة سريعة تلخص سحر هذه الوجهة في سطرين..."
                      className="text-xs font-medium rounded-xl resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      الوصف الشامل والتفصيلي (Full Description)
                    </label>
                    <Textarea
                      rows={4}
                      value={descriptionJsonb[activeLocale] || ""}
                      onChange={(e) =>
                        setDescriptionJsonb((prev) => ({
                          ...prev,
                          [activeLocale]: e.target.value,
                        }))
                      }
                      placeholder="وصف غني وشامل لمعالم وتجارب الوجهة السياحية..."
                      className="text-xs font-medium rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Media & Visuals */}
          {activeTab === "media" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>رابط صورة الغلاف الرئيسية (Hero Image URL)</span>
                    <span className="text-[10px] text-muted-foreground">
                      يدعم روابط HTTPS أو المسارات المباشرة (/imgs/...)
                    </span>
                  </label>
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... أو /imgs/egyothero.webp"
                    className="text-xs font-mono rounded-xl"
                  />
                </div>

                {/* Hero Image Preview */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">معاينة الغلاف:</span>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                    {heroImageUrl ? (
                      <img
                        src={heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <span className="text-xs text-muted-foreground">لم يتم تعيين صورة غلاف بعد</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t">
                  <label className="text-xs font-bold text-foreground">
                    رابط فيديو تعريفي للغلاف (Hero Video URL - اختياري)
                  </label>
                  <Input
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    placeholder="https://... (رابط فيديو MP4 مباشر أو YouTube)"
                    className="text-xs font-mono rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Attached Tours */}
          {activeTab === "tours" && (
            <div className="space-y-5">
              {isCreate ? (
                <div className="p-6 text-center rounded-xl border border-dashed bg-muted/30">
                  <Package className="h-8 w-8 mx-auto text-amber-500 mb-2 opacity-70" />
                  <p className="text-xs font-bold text-foreground">
                    قم بحفظ الوجهة أولاً لتفعيل ربط وتخصيص الرحلات التابعة لها.
                  </p>
                </div>
              ) : (
                <>
                  {/* Attach Tour Form */}
                  <div className="p-4 rounded-xl border bg-card space-y-3">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>إضافة رحلة من الكتالوج إلى هذه الوجهة:</span>
                      <span className="text-[10px] text-muted-foreground">
                        متاح {availableToursToAdd.length} رحلة للإضافة
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={tourSearchQuery}
                          onChange={(e) => setTourSearchQuery(e.target.value)}
                          placeholder="ابحث بالاسم أو المعرف..."
                          className="pl-8 text-xs rounded-xl"
                        />
                      </div>
                      <select
                        value={selectedTourIdToAdd}
                        onChange={(e) => setSelectedTourIdToAdd(e.target.value)}
                        className="h-10 rounded-xl border bg-background px-3 text-xs font-bold flex-1 max-w-xs"
                      >
                        <option value="">اختر رحلة لإضافتها...</option>
                        {filteredToursToAdd.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.titleJsonb?.ar || t.titleJsonb?.en || t.slug}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={handleAttachTour}
                        disabled={!selectedTourIdToAdd || attachMutation.isPending}
                        className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black cursor-pointer"
                      >
                        {attachMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-1" />
                        )}
                        إضافة
                      </Button>
                    </div>
                  </div>

                  {/* Attached Tours List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                      <span>الرحلات المندرجة تحت الوجهة ({attachedTours.length}):</span>
                      <span>الترتيب والخصائص</span>
                    </div>

                    {attachedTours.length === 0 ? (
                      <div className="p-8 text-center rounded-xl border bg-card/40 text-xs font-bold text-muted-foreground">
                        لا توجد رحلات مرتبطة بهذه الوجهة حالياً. يمكنك إضافة رحلات من القائمة بالأعلى.
                      </div>
                    ) : (
                      attachedTours.map((item, index) => {
                        const tourTitle =
                          item.tour?.titleJsonb?.ar ||
                          item.tour?.titleJsonb?.en ||
                          item.tour?.slug ||
                          "رحلة";
                        const tourHero =
                          item.tour?.images?.[0]?.imageUrl || "/imgs/placeholder.webp";

                        return (
                          <div
                            key={item.id || item.tourId}
                            className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                                <img
                                  src={tourHero}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {tourTitle}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">
                                  /{item.tour?.slug}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Toggle Featured */}
                              <Button
                                type="button"
                                size="sm"
                                variant={item.isFeatured ? "default" : "outline"}
                                onClick={() => handleToggleFeaturedTour(item)}
                                className={`h-7 px-2 text-[10px] font-bold rounded-lg ${
                                  item.isFeatured
                                    ? "bg-amber-500 text-black hover:bg-amber-600"
                                    : ""
                                }`}
                                title="تمييز الرحلة في الوجهة"
                              >
                                <Star className={`h-3 w-3 mr-1 ${item.isFeatured ? "fill-black" : ""}`} />
                                مميزة
                              </Button>

                              {/* Toggle Visible */}
                              <Button
                                type="button"
                                size="sm"
                                variant={item.isVisible ? "ghost" : "destructive"}
                                onClick={() => handleToggleVisibleTour(item)}
                                className="h-7 w-7 p-0 rounded-lg"
                                title={item.isVisible ? "إخفاء الرحلة" : "إظهار الرحلة"}
                              >
                                {item.isVisible ? (
                                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <EyeOff className="h-3.5 w-3.5 text-destructive" />
                                )}
                              </Button>

                              {/* Reorder Up / Down */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={index === 0}
                                onClick={() => handleMoveTour(index, -1)}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={index === attachedTours.length - 1}
                                onClick={() => handleMoveTour(index, 1)}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>

                              {/* Detach */}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDetachTour(item.tourId)}
                                className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                                title="فك الارتباط من الوجهة"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: SEO & Metadata */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-xs font-bold text-foreground">
                    إعدادات SEO باللغة: {LOCALES.find((l) => l.code === activeLocale)?.name}
                  </span>
                  <div className="flex gap-1">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setActiveLocale(loc.code)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          activeLocale === loc.code
                            ? "bg-amber-500 text-black"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {loc.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    عنوان الصفحة للبحث (Meta Title)
                  </label>
                  <Input
                    value={seoTitleJsonb[activeLocale] || ""}
                    onChange={(e) =>
                      setSeoTitleJsonb((prev) => ({
                        ...prev,
                        [activeLocale]: e.target.value,
                      }))
                    }
                    placeholder="مثال: رحلات مصر الفاخرة | دوناس ترافيل"
                    className="text-xs font-medium rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    وصف محركات البحث (Meta Description)
                  </label>
                  <Textarea
                    rows={3}
                    value={seoDescriptionJsonb[activeLocale] || ""}
                    onChange={(e) =>
                      setSeoDescriptionJsonb((prev) => ({
                        ...prev,
                        [activeLocale]: e.target.value,
                      }))
                    }
                    placeholder="وصف جذاب يظهر في نتائج بحث جوجل لجذب الزوار..."
                    className="text-xs font-medium rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    الكلمات المفتاحية (Meta Keywords)
                  </label>
                  <Input
                    value={seoKeywordsJsonb[activeLocale] || ""}
                    onChange={(e) =>
                      setSeoKeywordsJsonb((prev) => ({
                        ...prev,
                        [activeLocale]: e.target.value,
                      }))
                    }
                    placeholder="مصر, أهرامات, سياحة فاخرة, نيل"
                    className="text-xs font-medium rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t bg-card/90 backdrop-blur-md flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold text-xs"
          >
            إلغاء
          </Button>

          <div className="flex items-center gap-2">
            {!isCreate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.open(`/destinations/${slug}`, "_blank");
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                معاينة في الموقع
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black px-6 text-xs cursor-pointer shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : isCreate ? (
                "إنشاء الوجهة ➕"
              ) : (
                "حفظ التعديلات 💾"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
