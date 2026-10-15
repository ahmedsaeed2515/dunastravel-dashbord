"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { TripEditForm } from "@/components/trips/TripEditForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

export default function NewTourPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();

  const isAr = locale === "ar";

  const goBack = () => router.push(`/${locale}/admin/tours`);

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
                <Plus className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">
                  {isAr ? "إضافة رحلة جديدة" : "Add new trip"}
                </span>
              </h1>
              <p className="hidden sm:block text-[11px] text-muted-foreground font-semibold truncate">
                {isAr
                  ? "أدخل كل التفاصيل، الأيام، الفنادق والصور ثم اترجمها لـ 5 لغات في صفحة واحدة مريحة."
                  : "Add every detail, day, hotel and image, then translate to 5 languages on one comfortable page."}
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
              {isAr ? "مسودة جديدة" : "New Draft"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Full-page trip create form */}
      <TripEditForm
        mode="page"
        onClose={goBack}
        onSuccess={goBack}
      />
    </div>
  );
}
