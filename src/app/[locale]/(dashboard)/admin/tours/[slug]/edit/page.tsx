"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTour } from "@/features/tours/hooks/useTours";
import { TripEditForm } from "@/components/trips/TripEditForm";
import { tourToTripModel } from "@/features/tours/lib/tripEditorPayload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Pencil, Sparkles } from "lucide-react";

export const TOUR_EDITOR_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية (Arabic)", dir: "rtl" },
  { code: "es", name: "Español (Spanish)", dir: "ltr" },
  { code: "pt", name: "Português (Portuguese)", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
];

export default function EditTourPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const router = useRouter();
  const { data: tour, isLoading, error } = useTour(slug);

  const isAr = locale === "ar";

  const tripModel = useMemo(() => {
    if (!tour) return null;
    return tourToTripModel(tour);
  }, [tour]);

  const goBack = () => router.push(`/${locale}/admin/tours`);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm text-muted-foreground font-semibold">
          {isAr ? "جاري فتح محرر الرحلة الفاخر والترجمات الـ 5..." : "Opening the luxury trip editor..."}
        </p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-destructive">
          {isAr ? "لم يتم العثور على الرحلة" : "Tour not found"}
        </h2>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 me-2" />
            {isAr ? "العودة لقائمة الرحلات" : "Back to tours"}
          </Button>
        </Link>
      </div>
    );
  }

  const statusLabel =
    tour.status === "PUBLISHED"
      ? (isAr ? "منشورة" : "Published")
      : tour.status === "ARCHIVED"
        ? (isAr ? "مؤرشفة" : "Archived")
        : (isAr ? "مسودة" : "Draft");

  return (
    <div className="space-y-4">
      {/* Page header — pinned flush to the top of the scroll area (negative top cancels the
          dashboard scroll container's p-3/sm:p-6/lg:p-8 padding so it stays truly fixed) */}
      <div className="sticky -top-3 sm:-top-6 lg:-top-8 z-30 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-3 bg-[#0d1117]/95 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              className="rounded-xl text-xs gap-1.5 shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? "العودة للرحلات" : "Back to tours"}</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2 truncate">
                <Pencil className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">
                  {isAr ? "تعديل الرحلة:" : "Edit trip:"} {tripModel?.title || tour.slug}
                </span>
              </h1>
              <p className="hidden sm:block text-[11px] text-muted-foreground font-semibold truncate">
                {isAr
                  ? "عدّل كل التفاصيل، الأيام، الفنادق والصور في صفحة واحدة مريحة."
                  : "Edit every detail, day, hotel and image on one comfortable page."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="hidden sm:inline-flex rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px] font-black gap-1"
            >
              <Sparkles className="w-3 h-3" /> {isAr ? "5 لغات" : "5 Languages"}
            </Badge>
            <Badge variant="outline" className="rounded-xl text-[11px] font-black">
              {statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Full-page trip editor */}
      <TripEditForm
        trip={tripModel}
        mode="page"
        onClose={goBack}
        onSuccess={goBack}
      />
    </div>
  );
}
