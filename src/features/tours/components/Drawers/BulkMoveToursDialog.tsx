"use client";

import { useState } from "react";
import { useBulkUpdateTours } from "../../hooks/useTours";
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
import { Input } from "@/components/ui/input";
import {
  ArrowRightLeft,
  Globe,
  FolderTree,
  Loader2,
  CheckCircle2,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface BulkMoveToursDialogProps {
  slugs: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkMoveToursDialog({
  slugs,
  open,
  onOpenChange,
  onSuccess,
}: BulkMoveToursDialogProps) {
  const tCommon = useTranslations("common");
  const currentLocale = useLocale();
  const bulkUpdateMutation = useBulkUpdateTours();

  const [country, setCountry] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          : `Successfully moved ${slugs.length} tours to ${country} (${category})`,
      );

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        currentLocale === "ar"
          ? "حدث خطأ أثناء نقل الرحلات المحددة."
          : "Failed to bulk move tours.",
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
                {currentLocale === "ar"
                  ? "نقل الرحلات المحددة"
                  : "Bulk Move Selected Tours"}
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
              <span>
                {currentLocale === "ar"
                  ? "الرحلات المحددة للنقل:"
                  : "Selected Tours:"}
              </span>
            </span>
            <span className="text-xs font-bold font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-md">
              {slugs.length} {currentLocale === "ar" ? "رحلة" : "Tours"}
            </span>
          </div>

          {/* Destination Country Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              <span>
                {currentLocale === "ar"
                  ? "الوجهة / الدولة الجديدة"
                  : "Target Country / Destination"}
              </span>
            </Label>
            <Input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Country to store on selected tours"
              maxLength={100}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-primary" />
              <span>
                {currentLocale === "ar"
                  ? "التصنيف / القسم الجديد"
                  : "Target Category"}
              </span>
            </Label>
            <Input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category to store on selected tours"
              maxLength={100}
            />
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
            disabled={isSubmitting || !country.trim() || !category.trim()}
            className="h-10 text-xs font-bold px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {currentLocale === "ar" ? "جاري النقل..." : "Moving..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentLocale === "ar"
                    ? "نقل الرحلات الآن"
                    : "Move Selected Tours"}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
