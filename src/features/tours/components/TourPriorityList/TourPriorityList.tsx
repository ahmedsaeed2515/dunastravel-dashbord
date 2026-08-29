"use client";

import { useState, useEffect, useId, useMemo } from "react";
import { Tour } from "../../types";
import { useReorderTours, useToggleFeatured } from "../../hooks/useTours";
import { useLandingPages, useReorderLandingPageTours } from "../../hooks/useLandingPages";
import { getTourTitle } from "../ToursTable/columns";
import {
  DESTINATIONS_LIST,
  DEST_FLAGS,
  resolveTourDestination,
  destinationForCountry,
} from "@/lib/tour-destinations";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Star,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  RotateCcw,
  Sparkles,
  Search,
  MapPin,
  Loader2,
  Info,
  Globe2,
  Layers,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocale } from "next-intl";
import { toast } from "sonner";

interface TourPriorityListProps {
  initialTours: Tour[];
  onClose?: () => void;
}

interface SortableTourItemProps {
  tour: Tour;
  index: number;
  total: number;
  currentLocale: string;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleFeatured: (tour: Tour) => void;
  isTogglingFeatured: boolean;
}

function SortableTourItem({
  tour,
  index,
  total,
  currentLocale,
  onMoveUp,
  onMoveDown,
  onToggleFeatured,
  isTogglingFeatured,
}: SortableTourItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tour.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const title = getTourTitle(tour, currentLocale);
  const heroImg =
    tour.heroImage ||
    (tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : null);

  const amount = parseFloat(tour.basePriceUsd || "0");
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

  const destName = resolveTourDestination(tour);
  const destSlug = destinationForCountry(destName);
  const flag = DEST_FLAGS[destSlug] || "🗺️";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
        isDragging
          ? "bg-amber-500/15 border-amber-500 shadow-xl ring-2 ring-amber-500/40"
          : tour.isFeatured
          ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60 shadow-xs"
          : "bg-card border-border/80 hover:border-amber-500/40 hover:shadow-xs"
      }`}
    >
      {/* Left: Drag handle + Index + Image + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 transition-colors"
          title="اسحب لإعادة الترتيب (Drag to reorder)"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Position rank badge */}
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border shadow-xs ${
            index < 3
              ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          #{index + 1}
        </div>

        {/* Tour thumbnail */}
        <div className="relative h-12 w-16 rounded-xl overflow-hidden bg-muted border shrink-0">
          {heroImg ? (
            <img
              src={heroImg}
              alt={title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-secondary text-muted-foreground text-xs">
              🖼️
            </div>
          )}
          {tour.isFeatured && (
            <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
              <Star className="h-2.5 w-2.5 fill-white text-white" />
            </div>
          )}
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground truncate">
              {title}
            </span>
            {tour.isFeatured && (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] py-0 px-2 font-bold shrink-0"
              >
                ⭐ مميزة
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="font-mono text-[11px] text-muted-foreground/80">
              /{tour.slug}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md bg-muted/60 text-foreground">
              <span>{flag}</span>
              <span>{destName}</span>
            </span>
            <span>·</span>
            <span className="font-mono text-amber-500 font-bold">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions (Featured Toggle + Move Up/Down) */}
      <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
        {/* Toggle Featured Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onToggleFeatured(tour)}
          disabled={isTogglingFeatured}
          className={`h-8 px-3 text-xs font-bold gap-1.5 rounded-xl transition-all cursor-pointer ${
            tour.isFeatured
              ? "bg-amber-500/15 text-amber-500 border-amber-500/40 hover:bg-amber-500/25"
              : "text-muted-foreground hover:text-foreground border-border/70"
          }`}
          title={tour.isFeatured ? "إلغاء التمييز" : "تثبيت وتمييز في الصدارة"}
        >
          <Star
            className={`h-3.5 w-3.5 ${
              tour.isFeatured ? "fill-amber-400 text-amber-500" : ""
            }`}
          />
          <span className="hidden sm:inline">
            {tour.isFeatured ? "مميزة ⭐" : "تثبيت"}
          </span>
        </Button>

        {/* Up Arrow */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          title="تحريك لأعلى"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>

        {/* Down Arrow */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={index === total - 1}
          onClick={() => onMoveDown(index)}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          title="تحريك لأسفل"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TourPriorityList({
  initialTours,
  onClose,
}: TourPriorityListProps) {
  const currentLocale = useLocale();
  const isAr = currentLocale === "ar";
  const dndId = useId();

  const [selectedInterface, setSelectedInterface] = useState<string>("ALL");
  const [filterQuery, setFilterQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch dynamic landing pages
  const { data: landingPagesData } = useLandingPages({ type: "DESTINATION", limit: 50 });

  const reorderGlobalMutation = useReorderTours();
  const reorderInterfaceMutation = useReorderLandingPageTours();
  const toggleFeaturedMutation = useToggleFeatured();

  // Build interface list with count
  const interfaceList = useMemo(() => {
    const pages = landingPagesData?.data || [];
    const baseList = [
      { slug: "ALL", nameEn: "All Interfaces", nameAr: "جميع الواجهات", flag: "🌐" },
      { slug: "egypt", nameEn: "Egypt", nameAr: "مصر", flag: "🇪🇬" },
      { slug: "turkey", nameEn: "Turkey", nameAr: "تركيا", flag: "🇹🇷" },
      { slug: "jordan", nameEn: "Jordan", nameAr: "الأردن", flag: "🇯🇴" },
      { slug: "dubai", nameEn: "Dubai & UAE", nameAr: "دبي والإمارات", flag: "🇦🇪" },
      { slug: "morocco", nameEn: "Morocco", nameAr: "المغرب", flag: "🇲🇦" },
      { slug: "tunisia", nameEn: "Tunisia", nameAr: "تونس", flag: "🇹🇳" },
      { slug: "greece", nameEn: "Greece", nameAr: "اليونان", flag: "🇬🇷" },
      { slug: "multi-country", nameEn: "Multi-Country", nameAr: "برامج مشتركة", flag: "🌍" },
      { slug: "religious", nameEn: "Religious", nameAr: "دينية", flag: "🕊️" },
    ];

    // Add any custom landing pages
    pages.forEach((p) => {
      if (!baseList.some((b) => b.slug === p.slug)) {
        baseList.push({
          slug: p.slug,
          nameEn: p.titleJsonb?.en || p.slug,
          nameAr: p.titleJsonb?.ar || p.titleJsonb?.en || p.slug,
          flag: "🏖️",
        });
      }
    });

    return baseList;
  }, [landingPagesData]);

  // Helper to check if tour matches interface
  const isTourInInterface = (tour: Tour, ifaceSlug: string): boolean => {
    if (ifaceSlug === "ALL") return true;

    // 1. Check landingPages relations
    if (tour.landingPages && tour.landingPages.length > 0) {
      const matchRelation = tour.landingPages.some(
        (lp: any) => lp.slug?.toLowerCase() === ifaceSlug.toLowerCase()
      );
      if (matchRelation) return true;
    }

    // 2. Check resolved destination
    const resolved = resolveTourDestination(tour);
    const resolvedSlug = destinationForCountry(resolved);
    if (resolvedSlug === ifaceSlug.toLowerCase()) return true;

    // 3. Check direct country
    const countrySlug = destinationForCountry(tour.country);
    if (countrySlug === ifaceSlug.toLowerCase()) return true;

    return false;
  };

  // Calculate counts per interface
  const interfaceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    interfaceList.forEach((iface) => {
      counts[iface.slug] = initialTours.filter((t) => isTourInInterface(t, iface.slug)).length;
    });
    return counts;
  }, [initialTours, interfaceList]);

  // Tours currently active for the selected interface
  const [currentTours, setCurrentTours] = useState<Tour[]>([]);

  // When initialTours or selectedInterface changes, reset list
  useEffect(() => {
    const filtered = initialTours.filter((t) => isTourInInterface(t, selectedInterface));
    // Sort by sortOrder from landingPage if applicable, otherwise displayOrder
    const sorted = [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    setCurrentTours(sorted);
    setHasChanges(false);
  }, [initialTours, selectedInterface]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCurrentTours((items) => {
      const oldIndex = items.findIndex((item) => item.slug === active.id);
      const newIndex = items.findIndex((item) => item.slug === over.id);
      const updated = arrayMove(items, oldIndex, newIndex);
      setHasChanges(true);
      return updated;
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setCurrentTours((items) => {
      const updated = arrayMove(items, index, index - 1);
      setHasChanges(true);
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === currentTours.length - 1) return;
    setCurrentTours((items) => {
      const updated = arrayMove(items, index, index + 1);
      setHasChanges(true);
      return updated;
    });
  };

  const handleToggleFeatured = async (tour: Tour) => {
    try {
      await toggleFeaturedMutation.mutateAsync({
        slug: tour.slug,
        isFeatured: !tour.isFeatured,
      });
      setCurrentTours((items) =>
        items.map((t) =>
          t.slug === tour.slug ? { ...t, isFeatured: !t.isFeatured } : t
        )
      );
    } catch {
      // Error handled by mutation
    }
  };

  const activeInterfaceObj = interfaceList.find((i) => i.slug === selectedInterface) || interfaceList[0];
  const activeInterfaceLabel = isAr ? activeInterfaceObj.nameAr : activeInterfaceObj.nameEn;

  const handleSaveOrder = async () => {
    try {
      const items = currentTours.map((tour, index) => ({
        tourId: tour.id,
        slug: tour.slug,
        sortOrder: index * 10,
      }));

      if (selectedInterface !== "ALL") {
        // Save to specific landing page interface
        await reorderInterfaceMutation.mutateAsync({
          slug: selectedInterface,
          items,
        });
      }

      // Also sync global tour display priority
      await reorderGlobalMutation.mutateAsync(
        items.map((it) => ({ slug: it.slug, displayOrder: it.sortOrder }))
      );

      setHasChanges(false);
      toast.success(
        isAr
          ? `تم حفظ ترتيب واجهة "${activeInterfaceLabel}" (${currentTours.length} رحلة) بنجاح!`
          : `Saved display priority for "${activeInterfaceLabel}" (${currentTours.length} tours) successfully!`
      );
    } catch (err: any) {
      toast.error(
        err?.message || (isAr ? "حدث خطأ أثناء حفظ الترتيب" : "Failed to save priority order")
      );
    }
  };

  const handleResetOrder = () => {
    const filtered = initialTours.filter((t) => isTourInInterface(t, selectedInterface));
    const sorted = [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    setCurrentTours(sorted);
    setHasChanges(false);
    toast.info(isAr ? "تمت استعادة الترتيب الأصلي" : "Reset to original order");
  };

  // Filtered view if search input is active
  const displayedTours = filterQuery.trim()
    ? currentTours.filter((t) => {
        const title = getTourTitle(t, currentLocale).toLowerCase();
        const slug = t.slug.toLowerCase();
        const country = (t.country || "").toLowerCase();
        const q = filterQuery.toLowerCase();
        return title.includes(q) || slug.includes(q) || country.includes(q);
      })
    : currentTours;

  const isPending = reorderGlobalMutation.isPending || reorderInterfaceMutation.isPending;

  return (
    <div className="space-y-5">
      {/* 1. Header Banner with Instructions & Actions */}
      <Card className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {isAr
                    ? "إدارة أولوية وترتيب ظهور الرحلات داخل الواجهات"
                    : "Per-Interface Tour Display Priority & Featured Manager"}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                  <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>
                    {isAr
                      ? "اختر الواجهة المطلوبة (مصر، تركيا، الأردن...) لرؤية رحلاتها وترتيب ظهورها المخصص على الموقع."
                      : "Select an interface/destination below to manage its custom tour ordering and featured pins."}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetOrder}
                className="gap-1.5 text-xs rounded-xl font-bold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isAr ? "إلغاء التغييرات" : "Reset"}</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSaveOrder}
              disabled={isPending || !hasChanges}
              className={`h-10 px-5 text-xs font-black gap-2 rounded-2xl shadow-md transition-all cursor-pointer ${
                hasChanges
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25 animate-pulse scale-[1.02]"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4 stroke-[2.5]" />
              )}
              <span>
                {isAr
                  ? hasChanges
                    ? `حفظ ترتيب واجهة ${activeInterfaceLabel} (${currentTours.length} رحلة) 💾`
                    : `ترتيب واجهة ${activeInterfaceLabel} محفوظ ✓`
                  : hasChanges
                  ? `Save Order for ${activeInterfaceLabel} (${currentTours.length} Tours)`
                  : `Order for ${activeInterfaceLabel} Saved ✓`}
              </span>
            </Button>
          </div>
        </div>

        {/* 2. Destination / Interface Selector Pills Bar */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? "اختر الواجهة لترتيب رحلاتها:" : "Select Interface to Reorder:"}</span>
            </span>
            <span className="text-[11px] font-bold text-amber-500">
              {currentTours.length} {isAr ? "رحلة داخل الواجهة" : "tours in interface"}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {interfaceList.map((iface) => {
              const count = interfaceCounts[iface.slug] ?? 0;
              const isSelected = selectedInterface === iface.slug;
              const label = isAr ? iface.nameAr : iface.nameEn;

              return (
                <button
                  key={iface.slug}
                  type="button"
                  onClick={() => {
                    if (hasChanges) {
                      if (!window.confirm(isAr ? "لديك تغييرات غير محفوظة في الترتيب، هل تريد الانتقال لواجهة أخرى وتجاهلها؟" : "You have unsaved changes. Switch interface anyway?")) return;
                    }
                    setSelectedInterface(iface.slug);
                    setFilterQuery("");
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/25 shadow-md scale-[1.03]"
                      : "bg-muted/40 text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <span className="text-sm">{iface.flag}</span>
                  <span>{label}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-slate-950/20 text-slate-950 font-mono"
                        : "bg-background text-muted-foreground border font-mono"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search Filter Inside Priority List */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={
              isAr
                ? `ابحث بالاسم أو السعر داخل واجهة ${activeInterfaceLabel}...`
                : `Search tours within ${activeInterfaceLabel}...`
            }
            className="pl-10 text-xs h-10 rounded-2xl bg-background border-border/80"
          />
        </div>
      </Card>

      {/* 4. Drag & Drop Sortable List */}
      {displayedTours.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl bg-card border border-border/80 space-y-2">
          <Compass className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h4 className="text-sm font-bold text-foreground">
            {isAr ? `لا توجد رحلات داخل واجهة "${activeInterfaceLabel}"` : `No tours found in "${activeInterfaceLabel}"`}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "يمكنك نقل وتعيين رحلات إلى هذه الواجهة باستخدام زر (نقل الرحلة 🔄)."
              : "You can transfer tours to this destination interface using the Transfer Tour action."}
          </p>
        </Card>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayedTours.map((t) => t.slug)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {displayedTours.map((tour, index) => (
                <SortableTourItem
                  key={tour.slug}
                  tour={tour}
                  index={index}
                  total={displayedTours.length}
                  currentLocale={currentLocale}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggleFeatured={handleToggleFeatured}
                  isTogglingFeatured={toggleFeaturedMutation.isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
