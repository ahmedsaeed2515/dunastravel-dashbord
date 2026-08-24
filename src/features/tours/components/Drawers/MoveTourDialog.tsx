"use client";

import { useEffect, useState } from "react";
import { Tour } from "../../types";
import { useUpdateTour } from "../../hooks/useTours";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRightLeft,
  MapPin,
  Building2,
  FolderTree,
  Globe,
  Loader2,
  CheckCircle2,
  Sparkles,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { getTourTitle } from "../ToursTable/columns";

interface MoveTourDialogProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveTourDialog({
  tour,
  open,
  onOpenChange,
}: MoveTourDialogProps) {
  const tCommon = useTranslations("common");
  const currentLocale = useLocale();
  const updateTourMutation = useUpdateTour();

  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when tour changes
  useEffect(() => {
    if (!tour || !open) return;
    const timeout = setTimeout(() => {
      setCountry(tour.country || "");
      setCity(tour.city || "");
      setCategory(tour.category || "");
    }, 0);
    return () => clearTimeout(timeout);
  }, [tour, open]);

  if (!tour) return null;

  const tourTitle = getTourTitle(tour, currentLocale);
  const currentCountry = tour.country || "Unassigned";
  const currentCity = tour.city || "Unassigned";
  const currentCategory = tour.category || "General";

  const handleConfirmMove = async () => {
    try {
      setIsSubmitting(true);

      // 1. Update tour's location/destination/category
      await updateTourMutation.mutateAsync({
        slug: tour.slug,
        data: {
          country,
          city,
          category,
        },
      });

      toast.success(
        currentLocale === "ar"
          ? `تم نقل الرحلة "${tourTitle}" إلى ${country} (${city}) بنجاح!`
          : `Successfully moved "${tourTitle}" to ${country} (${city})!`,
      );
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        currentLocale === "ar"
          ? "حدث خطأ أثناء نقل الرحلة. يرجى المحاولة مرة أخرى."
          : "Failed to move tour. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged =
    country !== currentCountry ||
    city !== currentCity ||
    category !== currentCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* Header Banner with Gradient */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-primary/10 via-amber-500/10 to-primary/5 border-b relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0 shadow-sm">
              <ArrowRightLeft className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <span>
                  {currentLocale === "ar"
                    ? "نقل الرحلة إلى مكان / قسم جديد"
                    : "Move Tour Location & Category"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {currentLocale === "ar"
                  ? "تغيير الوجهة الرئيسية، الدولة، المدينة، والتصنيف لهذه الرحلة."
                  : "Change primary destination, country, city, or category for this tour."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Selected Tour Target Card */}
          <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background border rounded-lg text-primary">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground line-clamp-1">
                  {tourTitle}
                </h4>
                <p className="text-xs font-mono text-muted-foreground">
                  /{tour.slug}
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md font-semibold shrink-0">
              {Number.isFinite(Number(tour.basePriceUsd)) ? `$${Number(tour.basePriceUsd).toFixed(2)}` : currentLocale === "ar" ? "السعر غير محدد" : "Price not set"}
            </span>
          </div>

          {/* Visual Before & After Preview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border bg-linear-to-br from-card to-muted/20 relative overflow-hidden">
            {/* Current Location */}
            <div className="space-y-1.5 p-3 rounded-xl bg-background border shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {currentLocale === "ar"
                  ? "📍 المكان الحالي"
                  : "📍 Current Location"}
              </span>
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{currentCountry}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentCity}</span> •{" "}
                <FolderTree className="w-3.5 h-3.5" />{" "}
                <span>{currentCategory}</span>
              </p>
            </div>

            {/* Target Location */}
            <div className="space-y-1.5 p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-xs">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center justify-between">
                <span>
                  {currentLocale === "ar"
                    ? "✨ المكان المستهدف"
                    : "✨ Target Location"}
                </span>
                {isChanged && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                )}
              </span>
              <div className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{country || "Select Country"}</span>
              </div>
              <p className="text-xs text-primary/80 flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>{city || "Select City"}</span> •{" "}
                <FolderTree className="w-3.5 h-3.5" /> <span>{category}</span>
              </p>
            </div>
          </div>

          {/* Form Selection Controls */}
          <div className="space-y-4 pt-2">
            {/* Country / Main Destination Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span>
                  {currentLocale === "ar"
                    ? "الدولة / الوجهة الرئيسية"
                    : "Country / Main Destination"}
                </span>
              </Label>
              <Input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country stored for this tour"
                className="h-10 text-sm"
                maxLength={100}
              />
            </div>

            {/* City / Region Selection & Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>
                    {currentLocale === "ar"
                      ? "المدينة / المنطقة"
                      : "City / Region"}
                  </span>
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Cairo, Istanbul..."
                  className="h-10 text-sm"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <span>
                    {currentLocale === "ar"
                      ? "التصنيف / القسم"
                      : "Category / Section"}
                  </span>
                </Label>
                <Input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Category stored for this tour"
                  className="h-10 text-sm"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 text-xs font-semibold px-4"
          >
            {tCommon("cancel")}
          </Button>

          <Button
            type="button"
            onClick={handleConfirmMove}
            disabled={
              isSubmitting ||
              !isChanged ||
              !country.trim() ||
              !city.trim() ||
              !category.trim()
            }
            className="h-10 text-xs font-bold px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {currentLocale === "ar"
                    ? "جاري نقل الرحلة..."
                    : "Moving Tour..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentLocale === "ar"
                    ? "تأكيد نقل الرحلة"
                    : "Confirm Move Tour"}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
