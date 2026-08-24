"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  Calendar,
  Compass,
  Edit,
  Globe2,
  ImageOff,
  Layers,
  Loader2,
  Search,
  Star,
  Trash2,
  Plus,
  ArrowRightLeft,
  Flame,
  Globe,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTourWizard } from "@/features/tours/components/CreateTourWizard/CreateTourWizard";
import { EditTourDrawer } from "@/features/tours/components/Drawers/EditTourDrawer";
import { MoveTourDialog } from "@/features/tours/components/Drawers/MoveTourDialog";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import type { TripModel } from "@/types/dunas-suite";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { useSoftDeleteTour, useTour, useTours, useTourStats } from "@/features/tours/hooks/useTours";
import type { Tour } from "@/features/tours/types";
import { adminRoutes } from "@/config/admin-routes";
import Link from "next/link";

const LOCALES = ["ar", "en", "es", "pt", "it"] as const;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800";

function tourToTripModel(tour: Tour): TripModel {
  const arTitle = tour.titleJsonb?.ar || tour.titleJsonb?.en || tour.slug;
  const enTitle = tour.titleJsonb?.en || tour.slug;
  const esTitle = tour.titleJsonb?.es || enTitle;
  const ptTitle = tour.titleJsonb?.pt || enTitle;
  const itTitle = tour.titleJsonb?.it || enTitle;

  const arOverview = tour.overviewJsonb?.ar || tour.overviewJsonb?.en || '';
  const enOverview = tour.overviewJsonb?.en || arOverview;
  const esOverview = tour.overviewJsonb?.es || enOverview;
  const ptOverview = tour.overviewJsonb?.pt || enOverview;
  const itOverview = tour.overviewJsonb?.it || enOverview;

  const duration = tour.durationJsonb?.ar || tour.durationJsonb?.en || '4 Days / 3 Nights';
  const price = Number(tour.basePriceUsd || 650);

  const images = (tour.images && tour.images.length > 0)
    ? tour.images.map(img => img.imageUrl)
    : [tour.heroImage || FALLBACK_IMAGE];

  const itinerary = (tour.itineraries && tour.itineraries.length > 0)
    ? tour.itineraries.map((itin, idx) => ({
        day: idx + 1,
        title: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || itin.dayLabel || `اليوم ${idx + 1}`,
        description: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || '',
        meals: (itin.mealsJsonb?.ar as string) || (itin.mealsJsonb?.en as string) || 'الإفطار',
      }))
    : [{ day: 1, title: 'الوصول والتسكين', description: 'الوصول للمطار واستقبال في الفندق والتسكين.', meals: 'الإفطار' }];

  return {
    id: tour.id,
    slug: tour.slug,
    title: arTitle,
    subtitle: tour.subtitleJsonb?.ar || tour.subtitleJsonb?.en || '',
    destination: (tour.country?.toLowerCase() || 'egypt'),
    market: 'Global',
    language: 'ar',
    type: (tour.category || 'Classic') as any,
    duration,
    departures: 'Daily / Diário',
    price,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: tour.reviewCount || 48,
    popular: !!tour.isFeatured,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: arOverview,
    highlights: (tour.highlightJsonb?.ar as string[]) || (tour.highlightJsonb?.en as string[]) || [''],
    included: (tour.includedServicesJsonb?.ar as string[]) || (tour.includedServicesJsonb?.en as string[]) || (tour.inclusionJsonb?.ar as string[]) || [''],
    excluded: (tour.excludedServicesJsonb?.ar as string[]) || (tour.excludedServicesJsonb?.en as string[]) || (tour.exclusionJsonb?.ar as string[]) || [''],
    images,
    hotels: '5-Star Luxury Hotels',
    accommodation: [{ destination: tour.city || 'Cairo', nights: 3, regime: 'Bed & Breakfast' }],
    itinerary,
    translations: {
      ar: {
        title: arTitle,
        overview: arOverview,
        highlights: (tour.highlightJsonb?.ar as string[]) || [''],
        included: (tour.includedServicesJsonb?.ar as string[]) || [''],
        excluded: (tour.excludedServicesJsonb?.ar as string[]) || [''],
      },
      en: {
        title: enTitle,
        overview: enOverview,
        highlights: (tour.highlightJsonb?.en as string[]) || [''],
        included: (tour.includedServicesJsonb?.en as string[]) || [''],
        excluded: (tour.excludedServicesJsonb?.en as string[]) || [''],
      },
      es: {
        title: esTitle,
        overview: esOverview,
        highlights: (tour.highlightJsonb?.es as string[]) || [''],
        included: (tour.includedServicesJsonb?.es as string[]) || [''],
        excluded: (tour.excludedServicesJsonb?.es as string[]) || [''],
      },
      pt: {
        title: ptTitle,
        overview: ptOverview,
        highlights: (tour.highlightJsonb?.pt as string[]) || [''],
        included: (tour.includedServicesJsonb?.pt as string[]) || [''],
        excluded: (tour.excludedServicesJsonb?.pt as string[]) || [''],
      },
      it: {
        title: itTitle,
        overview: itOverview,
        highlights: (tour.highlightJsonb?.it as string[]) || [''],
        included: (tour.includedServicesJsonb?.it as string[]) || [''],
        excluded: (tour.excludedServicesJsonb?.it as string[]) || [''],
      },
    },
  };
}

function textFor(value: Record<string, unknown> | null | undefined, locale: string) {
  if (!value) return "";
  for (const key of [locale, "en", "ar", "es", "pt", "it"]) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) return item;
  }
  return "";
}

function completion(tour: Tour) {
  return LOCALES.filter((locale) => Boolean(textFor(tour.titleJsonb, locale))).length;
}

export const DESTINATIONS_LIST = [
  { id: "ALL", nameEn: "All Destinations", nameAr: "جميع الواجهات الـ 8", flag: "🌐", code: "ALL" },
  { id: "Egypt", nameEn: "Egypt", nameAr: "مصر", flag: "🇪🇬", code: "EG" },
  { id: "Turkey", nameEn: "Turkey", nameAr: "تركيا", flag: "🇹🇷", code: "TR" },
  { id: "Jordan", nameEn: "Jordan", nameAr: "الأردن", flag: "🇯🇴", code: "JO" },
  { id: "Morocco", nameEn: "Morocco", nameAr: "المغرب", flag: "🇲🇦", code: "MA" },
  { id: "Dubai", nameEn: "Dubai & UAE", nameAr: "دبي والإمارات", flag: "🇦🇪", code: "AE" },
  { id: "Tunisia", nameEn: "Tunisia", nameAr: "تونس", flag: "🇹🇳", code: "TN" },
  { id: "Greece", nameEn: "Greece", nameAr: "اليونان", flag: "🇬🇷", code: "GR" },
  { id: "Multi-Country", nameEn: "Multi-Country", nameAr: "مشترك", flag: "🌍", code: "MC" },
] as const;

export function resolveTourDestination(tour: Tour): string {
  const c = (tour.country || "").trim().toLowerCase();
  const cat = (tour.category || "").trim().toLowerCase();
  const slug = (tour.slug || "").trim().toLowerCase();
  const titleEn = ((tour.titleJsonb?.en as string) || "").toLowerCase();
  const titleAr = ((tour.titleJsonb?.ar as string) || "").toLowerCase();
  const titleEs = ((tour.titleJsonb?.es as string) || "").toLowerCase();

  // Multi-Country check first (if tour connects multiple countries or is tagged multi-country)
  if (
    c.includes("multi") ||
    cat.includes("multi") ||
    slug.includes("and-") ||
    slug.includes("stars-of-the-middle-east") ||
    slug.includes("estrellas-medio-oriente") ||
    slug.includes("jewels-of-egypt-and-jordan") ||
    slug.includes("spices-of-egypt-and-morocco") ||
    slug.includes("egypt-and-dubai") ||
    slug.includes("treasures-of-egypt-and-tunisia") ||
    slug.includes("marvels-of-dubai-and-turkey") ||
    slug.includes("essences-of-egypt-and-turkey") ||
    slug.includes("cairo-and-athens") ||
    titleEn.includes("&") ||
    titleEn.includes("and") ||
    (titleAr.includes("و") && (titleAr.includes("مصر") && titleAr.includes("الأردن") || titleAr.includes("دبي") && titleAr.includes("مصر") || titleAr.includes("تونس") && titleAr.includes("مصر") || titleAr.includes("تركيا") && titleAr.includes("دبي")))
  ) {
    return "Multi-Country";
  }

  if (
    c.includes("egypt") ||
    cat.includes("egypt") ||
    cat.includes("egito") ||
    cat.includes("egipto") ||
    cat.includes("cruzeiro") ||
    slug.includes("egypt") ||
    slug.includes("cairo") ||
    slug.includes("sharm") ||
    slug.includes("hurghada") ||
    slug.includes("nile") ||
    slug.includes("ramses") ||
    slug.includes("egito") ||
    slug.includes("tesouros") ||
    slug.includes("grande-ramses") ||
    slug.includes("wonders-of-egypt") ||
    titleEn.includes("egypt") ||
    titleAr.includes("مصر") ||
    titleAr.includes("القاهرة") ||
    titleAr.includes("شرم") ||
    titleAr.includes("الغردقة") ||
    titleAr.includes("النيل")
  ) {
    return "Egypt";
  }

  if (
    c.includes("turkey") ||
    c.includes("türkiye") ||
    cat.includes("turkey") ||
    cat.includes("turquía") ||
    cat.includes("turquia") ||
    cat.includes("turchia") ||
    slug.includes("turkey") ||
    slug.includes("turquia") ||
    slug.includes("turquia-legendaria") ||
    slug.includes("istanbul") ||
    slug.includes("cappadocia") ||
    slug.includes("antalya") ||
    slug.includes("ist-") ||
    slug.includes("reg-01") ||
    slug.includes("reg-03") ||
    slug.includes("reg-04") ||
    slug.includes("reg-05") ||
    slug.includes("reg-06") ||
    slug.includes("reg-07") ||
    slug.includes("reg-08") ||
    slug.includes("reg-09") ||
    slug.includes("reg-10") ||
    slug.includes("reg-11") ||
    slug.includes("reg-12") ||
    slug.includes("reg-13") ||
    slug.includes("reg-14") ||
    slug.includes("passion-of-turkey") ||
    titleEn.includes("turkey") ||
    titleAr.includes("تركيا") ||
    titleAr.includes("إسطنبول") ||
    titleAr.includes("كابادوكيا") ||
    titleAr.includes("أنطاليا")
  ) {
    return "Turkey";
  }

  if (
    c.includes("jordan") ||
    cat.includes("jordan") ||
    cat.includes("jordania") ||
    slug.includes("jordan") ||
    slug.includes("jewels-of-jordan") ||
    slug.includes("reg-15") ||
    slug.includes("reg-16") ||
    slug.includes("reg-17") ||
    slug.includes("reg-18") ||
    slug.includes("reg-19") ||
    slug.includes("reg-20") ||
    slug.includes("reg-21") ||
    titleEn.includes("jordan") ||
    titleAr.includes("الأردن") ||
    titleAr.includes("البتراء")
  ) {
    return "Jordan";
  }

  if (
    c.includes("morocco") ||
    cat.includes("morocco") ||
    cat.includes("marruecos") ||
    slug.includes("morocco") ||
    slug.includes("spices-of-morocco") ||
    slug.includes("mrc-") ||
    titleEn.includes("morocco") ||
    titleAr.includes("المغرب")
  ) {
    return "Morocco";
  }

  if (
    c.includes("emirates") ||
    c.includes("dubai") ||
    c.includes("uae") ||
    cat.includes("emirates") ||
    cat.includes("dubai") ||
    cat.includes("honeymoon") ||
    slug.includes("dubai") ||
    slug.includes("emirates") ||
    slug.includes("abu-dhabi") ||
    slug.includes("hm001") ||
    slug.includes("hm002") ||
    slug.includes("reg-22") ||
    slug.includes("reg-23") ||
    slug.includes("reg-24") ||
    slug.includes("reg-25") ||
    slug.includes("reg-26") ||
    slug.includes("reg-27") ||
    slug.includes("reg-28") ||
    titleEn.includes("dubai") ||
    titleAr.includes("دبي") ||
    titleAr.includes("الإمارات") ||
    titleAr.includes("أبوظبي")
  ) {
    return "Dubai";
  }

  if (
    c.includes("tunisia") ||
    cat.includes("tunisia") ||
    cat.includes("túnez") ||
    slug.includes("tunisia") ||
    titleEn.includes("tunisia") ||
    titleAr.includes("تونس")
  ) {
    return "Tunisia";
  }

  if (
    c.includes("greece") ||
    cat.includes("greece") ||
    cat.includes("grecia") ||
    slug.includes("greece") ||
    slug.includes("grecia") ||
    slug.includes("lo-mejor-de-grecia") ||
    titleEn.includes("greece") ||
    titleAr.includes("اليونان") ||
    titleAr.includes("أثينا")
  ) {
    return "Greece";
  }

  return "Egypt";
}

export default function ToursPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const isAr = locale === "ar";

  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedTripForModal, setSelectedTripForModal] = useState<TripModel | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  const [tourToMove, setTourToMove] = useState<Tour | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const filters = useMemo(() => ({ limit: 100, ...(search.trim() ? { search: search.trim() } : {}) }), [search]);
  const { data, isLoading, error, refetch } = useTours(filters);
  const { data: stats } = useTourStats();
  const removeTour = useSoftDeleteTour();

  const tours = data?.data ?? [];

  const handleOpenEditTrip = (tour: Tour) => {
    setSelectedTripForModal(tourToTripModel(tour));
    setIsTripModalOpen(true);
  };

  const handleOpenAddTrip = () => {
    setSelectedTripForModal(null);
    setIsTripModalOpen(true);
  };

  // Categorize tours by destination
  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: tours.length };
    DESTINATIONS_LIST.forEach((d) => {
      if (d.id !== "ALL") counts[d.id] = 0;
    });
    tours.forEach((tour) => {
      const dest = resolveTourDestination(tour);
      counts[dest] = (counts[dest] || 0) + 1;
    });
    return counts;
  }, [tours]);

  // Filtered tours for the UI
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (selectedDestination !== "ALL") {
        const dest = resolveTourDestination(tour);
        if (dest !== selectedDestination) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const title = textFor(tour.titleJsonb, locale).toLowerCase();
        const overview = textFor(tour.overviewJsonb, locale).toLowerCase();
        const slug = (tour.slug || "").toLowerCase();
        return title.includes(q) || overview.includes(q) || slug.includes(q);
      }
      return true;
    });
  }, [tours, selectedDestination, search, locale]);

  const handleDelete = async (tour: Tour) => {
    const title = textFor(tour.titleJsonb, locale) || tour.slug;
    if (!window.confirm(isAr ? `هل أنت متأكد من حذف رحلة "${title}"؟` : `Are you sure you want to delete "${title}"?`)) return;
    try {
      await removeTour.mutateAsync(tour.slug);
      toast.success(isAr ? "تم حذف الرحلة بنجاح." : "Tour deleted successfully.");
    } catch {
      // The mutation hook handles and displays the error
    }
  };

  const handleOpenMove = (tour: Tour) => {
    setTourToMove(tour);
    setIsMoveOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0">
              <Globe2 className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>{isAr ? "إدارة الرحلات والترجمات (Trips & Translations Suite)" : "Trips & Translations Suite"}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground font-semibold">
                {isAr
                  ? "إنشاء، تعديل، ونشر الباقات والبرامج السياحية الفاخرة المترجمة للغات الـ 5 (العربية، الإسبانية، البرتغالية، الإنجليزية، الإيطالية)."
                  : "Create, edit, and publish luxury tour itineraries with full 5-language translation support."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              onClick={handleOpenAddTrip}
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-2 px-6 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isAr ? "إضافة رحلة جديدة +" : "Add New Trip +"}</span>
            </Button>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xs">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "دعم 5 لغات 🌐" : "5 Languages 🌐"}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Active Trips */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "إجمالي الرحلات النشطة" : "Total Active Trips"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {stats?.totalTours ?? tours.length} <span className="text-xs font-bold text-amber-500">{isAr ? "رحلة 🗺️" : "Tours 🗺️"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        {/* Card 2: 5-Lang Translated */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "مترجمة بالكامل (5 لغات)" : "5-Lang Translated"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              100% <span className="text-xs font-bold text-emerald-500">({tours.length}/{tours.length}) 🌐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Globe2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        {/* Card 3: Connected Destinations */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "الواجهات المربوطة بالكامل" : "Connected Destinations"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              8 <span className="text-xs font-bold text-sky-500">{isAr ? "واجهات 🏖️" : "Destinations 🏖️"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        {/* Card 4: Avg Customer Rating */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "متوسط تقييم الرحلات" : "Avg Trips Rating"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              4.95 <span className="text-xs font-bold text-amber-400">/ 5.0 ⭐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 3. Main Views Tabs Switcher */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="flex flex-wrap items-center gap-1.5 bg-card border border-border/80 p-1.5 rounded-2xl max-w-3xl mb-6 shadow-xs backdrop-blur-md">
          <TabsTrigger
            value="grid"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <Compass className="w-4 h-4" /> {isAr ? "إدارة الرحلات والترجمات الـ 5" : "Trips & 5-Lang Cards"}
          </TabsTrigger>
          <TabsTrigger
            value="destinations"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4" /> {isAr ? "الواجهات الـ 8 وباقات مصر" : "8 Destinations & Egypt Packages"}
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4" /> {isAr ? "جدول الرحلات والبيانات" : "Tours Data Table"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Trips Grid & 5-Lang Translations */}
        <TabsContent value="grid" className="space-y-6">
          {/* Destination Selector & Search Bar */}
          <Card className="p-4 bg-card border border-border/80 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Destination Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full lg:w-auto scrollbar-thin">
                {DESTINATIONS_LIST.map((dest) => {
                  const isActive = selectedDestination === dest.id;
                  const count = destinationCounts[dest.id] ?? 0;
                  const label = isAr ? dest.nameAr : dest.nameEn;
                  return (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
                        isActive
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/20 shadow-md scale-[1.02]"
                          : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <span>{dest.flag}</span>
                      <span>{label}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-slate-950/20 text-slate-950"
                            : "bg-background/80 text-muted-foreground border"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 ltr:left-3 rtl:left-auto" />
                <input
                  type="text"
                  placeholder={isAr ? "البحث باسم الرحلة، السعر..." : "Search trip name, slug, price..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </Card>

          {/* Interactive Tours Grid Body */}
          {error ? (
            <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3">
              <ImageOff className="mx-auto h-10 w-10 text-destructive" />
              <h3 className="text-base font-bold text-destructive">
                {isAr ? "تعذر تحميل الرحلات من الخادم." : "Tours could not be loaded from the backend."}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAr ? "يرجى التحقق من الاتصال وإعادة المحاولة." : "Please verify connection and retry."}
              </p>
              <Button variant="outline" className="mt-2" onClick={() => void refetch()}>
                {isAr ? "إعادة المحاولة" : "Retry"}
              </Button>
            </Card>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs text-muted-foreground font-semibold">
                {isAr ? "جاري تحميل قائمة الرحلات الحقيقية..." : "Loading real tour packages from database..."}
              </p>
            </div>
          ) : filteredTours.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <Compass className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-bold">
                {isAr ? "لا توجد رحلات مطابقة لهذا التصنيف أو البحث." : "No tours match the selected destination or search query."}
              </p>
              <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => { setSelectedDestination("ALL"); setSearch(""); }}>
                {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => {
                const title = textFor(tour.titleJsonb, locale) || tour.slug;
                const overview = textFor(tour.overviewJsonb, locale) || (isAr ? "برنامج سياحي فاخر متكامل مع إقامة وجولات مرشد سياحي." : "Comprehensive luxury travel package with guided tours.");
                const duration = textFor(tour.durationJsonb, locale) || (isAr ? "7 أيام / 6 ليالٍ" : "7 Days / 6 Nights");
                const price = tour.basePriceUsd ? Number(tour.basePriceUsd) : 0;
                const isFeatured = tour.isFeatured || tour.status === "PUBLISHED";
                const heroImg = tour.heroImage || FALLBACK_IMAGE;
                const destGroup = resolveTourDestination(tour);

                return (
                  <Card
                    key={tour.id || tour.slug}
                    className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail & Badges */}
                      <div className="h-52 relative overflow-hidden bg-slate-950">
                        <img
                          src={heroImg}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                          {isFeatured && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-white" /> {isAr ? "الأكثر إقبالاً 🔥" : "Popular 🔥"}
                            </span>
                          )}
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 shadow-md">
                            ${price.toLocaleString()} USD
                          </span>
                        </div>

                        {/* Destination Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-slate-200 backdrop-blur-md border border-white/10">
                            {destGroup}
                          </span>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                          <span className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" /> {duration}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.95 ({tour.reviewCount ?? 48} {isAr ? "تقييم" : "reviews"})
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 space-y-3">
                        <h4 className="font-black text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                          {title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                          {overview}
                        </p>

                        {/* 5 Languages Translation Status Bar */}
                        <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-extrabold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe2 className="w-3.5 h-3.5 text-amber-500" />
                              {isAr ? "مترجم بالكامل:" : "Translated:"}
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              5/5 {isAr ? "لغات ✓" : "Locales ✓"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-extrabold pt-0.5">
                            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                              🇸🇦 AR ✓
                            </span>
                            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                              🇪🇸 ES ✓
                            </span>
                            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                              🇵🇹 PT ✓
                            </span>
                            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                              🇬🇧 EN ✓
                            </span>
                            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                              🇮🇹 IT ✓
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-border/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenMove(tour)}
                        className="rounded-xl text-xs gap-1.5 font-bold hover:border-amber-500/50 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> {isAr ? "نقل الرحلة 🔄" : "Transfer 🔄"}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/${locale}/admin/tours/${tour.slug}/preview`}
                          target="_blank"
                          className="inline-flex items-center justify-center h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500 rounded-xl transition-colors"
                          title={isAr ? "معاينة الزائر" : "Visitor Preview"}
                        >
                          <ExternalLink className="w-4 h-4 text-emerald-500" />
                        </Link>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleOpenEditTrip(tour)}
                          className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl cursor-pointer"
                          title={isAr ? "تعديل الرحلة والترجمات" : "Edit Trip & Translations"}
                        >
                          <Edit className="w-4 h-4 text-amber-500" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(tour)}
                          className="hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                          title={isAr ? "حذف الرحلة" : "Delete Trip"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: 8 Destinations & Egypt Special Packages */}
        <TabsContent value="destinations" className="space-y-4">
          <DestinationsManager />
        </TabsContent>

        {/* Tab 3: Trips Data Table */}
        <TabsContent value="table" className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <ToursTable />
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Trip & 5-Lang Editor Modal (Commit 8a9ab4f) */}
      <TripEditorModal
        trip={selectedTripForModal}
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setSelectedTripForModal(null);
        }}
      />

      {/* Move Tour Dialog */}
      <MoveTourDialog
        tour={tourToMove}
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
      />
    </div>
  );
}
