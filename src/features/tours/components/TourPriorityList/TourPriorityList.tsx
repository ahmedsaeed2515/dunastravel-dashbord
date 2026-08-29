"use client";

import { useState, useId } from "react";
import { Tour } from "../../types";
import { useReorderTours, useToggleFeatured } from "../../hooks/useTours";
import { getTourTitle } from "../ToursTable/columns";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
        isDragging
          ? "bg-primary/10 border-primary shadow-lg ring-2 ring-primary/30"
          : tour.isFeatured
          ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60 shadow-xs"
          : "bg-card border-border hover:border-primary/40 hover:shadow-xs"
      }`}
    >
      {/* Left: Drag handle + Index + Image + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 transition-colors"
          title="اسحب لإعادة الترتيب (Drag to reorder)"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Position rank badge */}
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
            index < 3
              ? "bg-amber-500/20 text-amber-600 border-amber-500/40"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          #{index + 1}
        </div>

        {/* Tour thumbnail */}
        <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted border shrink-0">
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
            <div className="absolute top-0.5 right-0.5 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
              <Star className="h-2.5 w-2.5 fill-white text-white" />
            </div>
          )}
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">
              {title}
            </span>
            {tour.isFeatured && (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] py-0 px-1.5 font-bold shrink-0"
              >
                ⭐ مميزة
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="font-mono text-[11px] text-muted-foreground/80">
              {tour.slug}
            </span>
            {tour.country && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {tour.country}
              </span>
            )}
            <span>·</span>
            <span className="font-mono text-primary font-semibold">
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
          className={`h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all ${
            tour.isFeatured
              ? "bg-amber-500/15 text-amber-600 border-amber-500/40 hover:bg-amber-500/25"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={tour.isFeatured ? "إلغاء التمييز" : "تثبيت وتمييز في المقدمة"}
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
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
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

  const [tours, setTours] = useState<Tour[]>(() => [...initialTours]);
  const [filterQuery, setFilterQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const reorderMutation = useReorderTours();
  const toggleFeaturedMutation = useToggleFeatured();

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

    setTours((items) => {
      const oldIndex = items.findIndex((item) => item.slug === active.id);
      const newIndex = items.findIndex((item) => item.slug === over.id);
      const updated = arrayMove(items, oldIndex, newIndex);
      setHasChanges(true);
      return updated;
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setTours((items) => {
      const updated = arrayMove(items, index, index - 1);
      setHasChanges(true);
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === tours.length - 1) return;
    setTours((items) => {
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
      setTours((items) =>
        items.map((t) =>
          t.slug === tour.slug ? { ...t, isFeatured: !t.isFeatured } : t
        )
      );
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleSaveOrder = async () => {
    // Generate orders with step of 10 for clean spacing
    const orders = tours.map((tour, index) => ({
      slug: tour.slug,
      displayOrder: index * 10,
    }));

    try {
      await reorderMutation.mutateAsync(orders);
      setHasChanges(false);
      toast.success(
        isAr
          ? `تم حفظ أولوية ظهور ${orders.length} رحلة بنجاح!`
          : `Saved display priority for ${orders.length} tours successfully!`
      );
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleResetOrder = () => {
    setTours([...initialTours]);
    setHasChanges(false);
    toast.info(isAr ? "تمت استعادة الترتيب الأصلي" : "Reset to original order");
  };

  // Filtered view if search is active
  const filteredTours = filterQuery.trim()
    ? tours.filter((t) => {
        const title = getTourTitle(t, currentLocale).toLowerCase();
        const slug = t.slug.toLowerCase();
        const country = (t.country || "").toLowerCase();
        const q = filterQuery.toLowerCase();
        return title.includes(q) || slug.includes(q) || country.includes(q);
      })
    : tours;

  return (
    <div className="space-y-4">
      {/* Header Banner with Instructions & Actions */}
      <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {isAr
                  ? "إدارة أولوية ظهور الرحلات والتمييز (Tour Priority & Featured)"
                  : "Tour Display Priority & Featured Manager"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {isAr
                  ? "اسحب الرحلات أو استخدم الأسهم لترتيب ظهورها في الموقع. الرحلات المميزة ⭐ تظهر دائماً في صدارة الصفحة."
                  : "Drag tours or use arrows to control public display order. Featured ⭐ tours always appear at the top."}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetOrder}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isAr ? "إلغاء التغييرات" : "Reset"}</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSaveOrder}
              disabled={reorderMutation.isPending || !hasChanges}
              className={`h-9 px-4 text-xs font-bold gap-1.5 shadow-sm transition-all ${
                hasChanges
                  ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {reorderMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
              <span>
                {isAr
                  ? hasChanges
                    ? `حفظ الترتيب الجديد (${tours.length} رحلة) 💾`
                    : "الترتيب محفوظ"
                  : hasChanges
                  ? `Save New Order (${tours.length} Tours)`
                  : "Order Saved"}
              </span>
            </Button>
          </div>
        </div>

        {/* Search inside priority list */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={
              isAr
                ? "ابحث بالاسم أو الدولة لتحديد مكان رحلة معينة..."
                : "Search by title or country to locate a specific tour..."
            }
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Drag and drop sortable list */}
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTours.map((t) => t.slug)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {filteredTours.map((tour, index) => (
              <SortableTourItem
                key={tour.slug}
                tour={tour}
                index={index}
                total={filteredTours.length}
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
    </div>
  );
}
