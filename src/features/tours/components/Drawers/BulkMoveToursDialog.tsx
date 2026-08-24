"use client";

import { useEffect, useState } from "react";
import { useBulkUpdateTours } from "../../hooks/useTours";
import { landingPagesApi, TourLandingPage } from "../../api/landingPagesApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  Globe,
  FolderTree,
  Loader2,
  CheckCircle2,
  CheckSquare,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface BulkMoveToursDialogProps {
  slugs: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DESTINATION_OPTIONS = [
  { value: "Egypt", label: "Egypt (مصر)" },
  { value: "Turkey", label: "Turkey (تركيا)" },
  { value: "Jordan", label: "Jordan (الأردن)" },
  { value: "Morocco", label: "Morocco (المغرب)" },
  { value: "Dubai", label: "Dubai & UAE (دبي والإمارات)" },
  { value: "Tunisia", label: "Tunisia (تونس)" },
  { value: "Greece", label: "Greece (اليونان)" },
  { value: "Multi-Country", label: "Multi-Country (برامج مشتركة)" },
];

const CATEGORY_OPTIONS = [
  "Multi-Country",
  "Cultural Tours",
  "Luxury Voyages",
  "Nile Cruise",
  "Desert Safari",
  "Beach & Resorts",
  "Family Packages",
  "Custom Itinerary",
];

export function BulkMoveToursDialog({
  slugs,
  open,
  onOpenChange,
  onSuccess,
}: BulkMoveToursDialogProps) {
  const tCommon = useTranslations("common");
  const currentLocale = useLocale();
  const bulkUpdateMutation = useBulkUpdateTours();

  const [country, setCountry] = useState<string>("Egypt");
  const [category, setCategory] = useState<string>("Multi-Country");
  const [selectedLandingPage, setSelectedLandingPage] = useState<string>("NONE");
  const [landingPages, setLandingPages] = useState<TourLandingPage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      landingPagesApi
        .getLandingPages({ limit: 50 })
        .then((res) => {
          setLandingPages(res.data);
        })
        .catch(() => {});
    }
  }, [open]);

  if (slugs.length === 0) return null;

  const handleConfirmBulkMove = async () => {
    try {
      setIsSubmitting(true);

      // 1. Bulk update country & category for selected tour slugs
      await bulkUpdateMutation.mutateAsync({
        slugs,
        country,
        category,
      });

      toast.success(
        currentLocale === "ar"
          ? `تم نقل ${slugs.length} رحلة بنجاح إلى ${country} (${category})`
          : `Successfully moved ${slugs.length} tours to ${country} (${category})`
      );

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        currentLocale === "ar"
          ? "حدث خطأ أثناء نقل الرحلات المحددة."
          : "Failed to bulk move tours."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-primary/10 via-blue-500/10 to-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0 shadow-sm">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {currentLocale === "ar" ? "نقل الرحلات المحددة" : "Bulk Move Selected Tours"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {currentLocale === "ar"
                  ? `نقل عدد (${slugs.length}) رحلات مختارة إلى وجهة وتصنيف جديد دفعة واحدة.`
                  : `Move ${slugs.length} selected tours to a new destination and category.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Selected Count Indicator */}
          <div className="p-3 rounded-xl border bg-muted/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              <span>{currentLocale === "ar" ? "الرحلات المحددة للنقل:" : "Selected Tours:"}</span>
            </span>
            <span className="text-xs font-bold font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-md">
              {slugs.length} {currentLocale === "ar" ? "رحلة" : "Tours"}
            </span>
          </div>

          {/* Destination Country Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              <span>{currentLocale === "ar" ? "الوجهة / الدولة الجديدة" : "Target Country / Destination"}</span>
            </Label>
            <Select value={country} onValueChange={(val: any) => setCountry(val || "Egypt")}>
              <SelectTrigger className="h-10 text-sm font-medium">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_OPTIONS.map((dest) => (
                  <SelectItem key={dest.value} value={dest.value}>
                    {dest.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-primary" />
              <span>{currentLocale === "ar" ? "التصنيف / القسم الجديد" : "Target Category"}</span>
            </Label>
            <Select value={category} onValueChange={(val: any) => setCategory(val || "Multi-Country")}>
              <SelectTrigger className="h-10 text-sm font-medium">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onClick={handleConfirmBulkMove}
            disabled={isSubmitting}
            className="h-10 text-xs font-bold px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentLocale === "ar" ? "جاري النقل..." : "Moving..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentLocale === "ar" ? "نقل الرحلات الآن" : "Move Selected Tours"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
