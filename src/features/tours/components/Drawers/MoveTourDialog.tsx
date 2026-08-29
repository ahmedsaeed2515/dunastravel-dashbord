"use client";

import { useEffect, useState } from "react";
import { Tour } from "../../types";
import { landingPagesApi, TourLandingPage } from "../../api/landingPagesApi";
import { toursApi } from "../../api/toursApi";
import { LANDING_PAGES_QUERY_KEY } from "../../hooks/useLandingPages";
import { useQueryClient } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Egypt: ["Cairo", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh", "Alexandria"],
  Turkey: ["Istanbul", "Cappadocia", "Antalya", "Bodrum", "Pamukkale", "Fethiye"],
  Jordan: ["Amman", "Petra", "Wadi Rum", "Dead Sea", "Aqaba"],
  Morocco: ["Marrakech", "Casablanca", "Fes", "Chefchaouen", "Tangier"],
  Dubai: ["Dubai", "Abu Dhabi", "Sharjah"],
  Tunisia: ["Tunis", "Hammamet", "Sousse", "Djerba"],
  Greece: ["Athens", "Santorini", "Mykonos", "Crete"],
  "Multi-Country": ["Cairo & Istanbul", "Jordan & Egypt", "Morocco & Spain", "Dubai & Maldives"],
};

export function MoveTourDialog({ tour, open, onOpenChange }: MoveTourDialogProps) {
  const tCommon = useTranslations("common");
  const currentLocale = useLocale();
  const queryClient = useQueryClient();

  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [selectedLandingPage, setSelectedLandingPage] = useState<string>("NONE");
  const [landingPages, setLandingPages] = useState<TourLandingPage[]>([]);
  const [isLoadingLandingPages, setIsLoadingLandingPages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load available tour landing page interfaces
  useEffect(() => {
    if (open) {
      setIsLoadingLandingPages(true);
      landingPagesApi
        .getLandingPages({ limit: 50 })
        .then((res) => {
          setLandingPages(res.data);
        })
        .catch(() => {})
        .finally(() => setIsLoadingLandingPages(false));
    }
  }, [open]);

  // Sync state when tour changes
  useEffect(() => {
    if (tour && open) {
      setCountry(tour.country || "Egypt");
      setCity(tour.city || "");
      setCategory(tour.category || "Multi-Country");
      
      // Find matching initial landing page if attached
      const attachedPage = tour.landingPages?.find((page) => page.type === "DESTINATION")?.slug;
      setSelectedLandingPage(attachedPage || "NONE");
    }
  }, [tour, open]);

  if (!tour) return null;

  const tourTitle = getTourTitle(tour, currentLocale);
  const currentCountry = tour.country || "Unassigned";
  const currentCity = tour.city || "Unassigned";
  const currentCategory = tour.category || "General";

  const handleCountryChange = (val: string | null) => {
    const nextCountry = val || "Egypt";
    setCountry(nextCountry);
    const suggestedCities = CITIES_BY_COUNTRY[nextCountry];
    if (suggestedCities && suggestedCities.length > 0) {
      setCity(suggestedCities[0]);
    }
    const destinationSlugByCountry: Record<string, string> = {
      Egypt: "egypt",
      Turkey: "turkey",
      Jordan: "jordan",
      Morocco: "morocco",
      Dubai: "dubai",
      Tunisia: "tunisia",
      Greece: "greece",
      "Multi-Country": "multi-country",
    };
    const destinationSlug = destinationSlugByCountry[nextCountry];
    const matchingPage = landingPages.find(
      (page) => page.type === "DESTINATION" && page.slug.toLowerCase() === destinationSlug,
    );
    if (matchingPage) setSelectedLandingPage(matchingPage.slug);
  };

  const handleConfirmMove = async () => {
    try {
      setIsSubmitting(true);

      const destinationSlugByCountry: Record<string, string> = {
        Egypt: "egypt",
        Turkey: "turkey",
        Jordan: "jordan",
        Morocco: "morocco",
        Dubai: "dubai",
        Tunisia: "tunisia",
        Greece: "greece",
        "Multi-Country": "multi-country",
      };

      const fallbackSlug = destinationSlugByCountry[country] || country.toLowerCase().replace(/\s+/g, "-");
      const selectedPage = selectedLandingPage === "NONE"
        ? landingPages.find((page) => page.type === "DESTINATION" && page.slug.toLowerCase() === fallbackSlug)
        : landingPages.find((page) => page.slug === selectedLandingPage && page.type === "DESTINATION");

      const destinationSlug = selectedPage ? selectedPage.slug : fallbackSlug;

      await toursApi.moveTour(tour.slug, {
        destinationSlug,
        country,
        city: city || undefined,
        category: category || undefined,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tours"] }),
        queryClient.invalidateQueries({ queryKey: ["tours", "catalog-overview"] }),
        queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY }),
      ]);

      toast.success(
        currentLocale === "ar"
          ? `تم نقل الرحلة "${tourTitle}" إلى ${country} (${city || ""}) بنجاح!`
          : `Successfully moved "${tourTitle}" to ${country} (${city || ""})!`
      );
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      toast.error(
        msg || (currentLocale === "ar"
          ? "حدث خطأ أثناء نقل الرحلة. يرجى المحاولة مرة أخرى."
          : "Failed to move tour. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged =
    country !== currentCountry ||
    city !== currentCity ||
    category !== currentCategory ||
    selectedLandingPage !== "NONE";

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
                <span>{currentLocale === "ar" ? "نقل الرحلة إلى مكان / قسم جديد" : "Move Tour Location & Category"}</span>
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
                <h4 className="font-bold text-sm text-foreground line-clamp-1">{tourTitle}</h4>
                <p className="text-xs font-mono text-muted-foreground">/{tour.slug}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md font-semibold shrink-0">
              {tour.basePriceUsd ? `$${tour.basePriceUsd}` : "Free"}
            </span>
          </div>

          {/* Visual Before & After Preview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border bg-linear-to-br from-card to-muted/20 relative overflow-hidden">
            {/* Current Location */}
            <div className="space-y-1.5 p-3 rounded-xl bg-background border shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {currentLocale === "ar" ? "📍 المكان الحالي" : "📍 Current Location"}
              </span>
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{currentCountry}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentCity}</span> • <FolderTree className="w-3.5 h-3.5" /> <span>{currentCategory}</span>
              </p>
            </div>

            {/* Target Location */}
            <div className="space-y-1.5 p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-xs">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center justify-between">
                <span>{currentLocale === "ar" ? "✨ المكان المستهدف" : "✨ Target Location"}</span>
                {isChanged && <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
              </span>
              <div className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{country || "Select Country"}</span>
              </div>
              <p className="text-xs text-primary/80 flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>{city || "Select City"}</span> • <FolderTree className="w-3.5 h-3.5" /> <span>{category}</span>
              </p>
            </div>
          </div>

          {/* Form Selection Controls */}
          <div className="space-y-4 pt-2">
            {/* Country / Main Destination Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span>{currentLocale === "ar" ? "الدولة / الوجهة الرئيسية" : "Country / Main Destination"}</span>
              </Label>
              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="h-10 text-sm font-medium">
                  <SelectValue placeholder="Select Destination Country" />
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

            {/* City / Region Selection & Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{currentLocale === "ar" ? "المدينة / المنطقة" : "City / Region"}</span>
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Cairo, Istanbul..."
                  className="h-10 text-sm"
                />
                {CITIES_BY_COUNTRY[country] && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {CITIES_BY_COUNTRY[country].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCity(c)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          city === c
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <span>{currentLocale === "ar" ? "التصنيف / القسم" : "Category / Section"}</span>
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

            {/* Optional Landing Page Interface Attachment */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>
                  {currentLocale === "ar"
                    ? "الربط بالواجهة / صفحة الهبوط (اختياري)"
                    : "Attach to Tour Landing Page Interface (Optional)"}
                </span>
              </Label>
              <Select value={selectedLandingPage} onValueChange={(val: any) => setSelectedLandingPage(val || "NONE")}>
                <SelectTrigger className="h-10 text-sm font-medium">
                  <SelectValue placeholder="Select Interface Page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">
                    {currentLocale === "ar" ? "بدون صفحة هبوط خاصة" : "None (Default Library Only)"}
                  </SelectItem>
                  {landingPages.filter((page) => page.type === "DESTINATION").map((page) => (
                    <SelectItem key={page.id} value={page.slug}>
                      {page.titleJsonb?.en || page.slug} (/{page.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {currentLocale === "ar"
                  ? "ربط الرحلة بصفحة هبوط تسويقية مخصصة كـ /egypt-tours أو /nile-cruises."
                  : "Link this tour to a targeted marketing landing page."}
              </p>
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
            disabled={isSubmitting || !isChanged}
            className="h-10 text-xs font-bold px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentLocale === "ar" ? "جاري نقل الرحلة..." : "Moving Tour..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentLocale === "ar" ? "تأكيد نقل الرحلة" : "Confirm Move Tour"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
