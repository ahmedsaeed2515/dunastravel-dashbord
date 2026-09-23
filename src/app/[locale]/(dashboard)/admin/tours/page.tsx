"use client";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";

import { useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowUpDown,
  Eye,
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
import type { Tour } from "@/features/tours/types";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { TourPriorityList } from "@/features/tours/components/TourPriorityList/TourPriorityList";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { Switch } from "@/components/ui/switch";
import { useSoftDeleteTour, useTourCatalogOverview, useTours, useTourStats, useTourLifecycleAction } from "@/features/tours/hooks/useTours";
import { useLandingPages } from "@/features/tours/hooks/useLandingPages";
import { toursApi } from "@/features/tours/api/toursApi";
import Link from "next/link";
import { getFrontendTourUrl } from "@/lib/frontend-urls";
import {
  DESTINATIONS_LIST,
  resolveTourDestination,
  destinationForCountry,
  isTourVisibleOnWebsite,
  publicDestinationLabelsForTour,
} from "@/lib/tour-destinations";

import canonicalDb from "@/data/database/unified_52_tours.json";

const LOCALES = ["ar", "en", "es", "pt", "it"] as const;
const canonicalToursList = (canonicalDb as any).tours || [];

function findCanonicalTour(slugOrId: string) {
  if (!slugOrId) return null;
  const s = String(slugOrId).toLowerCase();
  return canonicalToursList.find((t: any) =>
    (t.slug && t.slug.toLowerCase() === s) ||
    (t.id && t.id.toLowerCase() === s) ||
    (t.code && typeof t.code === 'string' && t.code.toLowerCase() === s) ||
    (t.code?.en && t.code.en.toLowerCase() === s) ||
    (t.code?.ar && t.code.ar.toLowerCase() === s)
  ) || null;
}

function localeText(value: Record<string, any> | null | undefined, locale: string): string {
  return typeof value?.[locale] === "string" ? value[locale] as string : "";
}

function localeList(value: Record<string, any> | string[] | null | undefined, locale: string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item[locale] || item.en || item.ar || item.es || Object.values(item)[0] || '';
      }
      return typeof item === 'string' ? item : '';
    }).filter(Boolean);
  }
  if (typeof value === "object") {
    const list = value[locale] || value.en || value.ar || value.es || [];
    if (Array.isArray(list)) {
      return list.map(item => typeof item === 'string' ? item : (item?.[locale] || item?.en || '')).filter(Boolean);
    }
  }
  return [];
}

function tourToTripModel(tour: Tour): TripModel {
  const canon = findCanonicalTour(tour.slug || tour.id);

  const hasItems = (v: any) => (Array.isArray(v) ? v.length > 0 : (v && typeof v === 'object' ? Object.keys(v).length > 0 : !!v));

  const rawHighlights = hasItems(tour.highlightsJsonb) ? tour.highlightsJsonb : (hasItems((tour as any).highlights) ? (tour as any).highlights : canon?.highlights);
  const rawIncluded = hasItems(tour.includedServicesJsonb) ? tour.includedServicesJsonb : (hasItems((tour as any).includedServices) ? (tour as any).includedServices : (hasItems((tour as any).included) ? (tour as any).included : (canon?.included || canon?.includes)));
  const rawExcluded = hasItems(tour.excludedServicesJsonb) ? tour.excludedServicesJsonb : (hasItems((tour as any).excludedServices) ? (tour as any).excludedServices : (hasItems((tour as any).excluded) ? (tour as any).excluded : (canon?.excluded || canon?.excludes)));

  const rawItinerary = (Array.isArray(tour.itineraries) && tour.itineraries.length > 0)
    ? tour.itineraries
    : (Array.isArray(canon?.days) && canon.days.length > 0)
      ? canon.days
      : (Array.isArray(canon?.itinerary) && canon.itinerary.length > 0)
        ? canon.itinerary
        : [];

  const itinerary = rawItinerary.map((item: any, index: number) => ({
    day: item.day || (item.sortOrder !== undefined ? item.sortOrder + 1 : index + 1),
    title: item.dayLabel || (typeof item.title === 'object' ? (item.title?.ar || item.title?.en) : item.title) || `اليوم ${index + 1}`,
    description: localeText(item.descriptionJsonb, 'ar') || (typeof item.description === 'object' ? (item.description?.ar || item.description?.en) : item.description) || '',
    meals: localeText(item.mealsJsonb, 'ar') || (typeof item.meals === 'object' ? (item.meals?.ar || item.meals?.en) : item.meals) || 'الإفطار',
  }));

  const rawImages = (Array.isArray(tour.images) && tour.images.length > 0)
    ? tour.images.map((image: { imageUrl?: string }) => image.imageUrl || "").filter(Boolean)
    : (Array.isArray(canon?.images) && canon.images.length > 0)
      ? canon.images
      : (tour.heroImage ? [tour.heroImage] : (canon?.heroImage ? [canon.heroImage] : []));

  const heroFromImages = Array.isArray(tour.images)
    ? tour.images.find((img: any) => img?.isHero)?.imageUrl
    : undefined;
  const resolvedHero = heroFromImages || (typeof tour.heroImage === 'string' ? tour.heroImage : '') || (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') || rawImages[0] || '';

  let images = [...rawImages];
  if (resolvedHero && images.includes(resolvedHero)) {
    images = [resolvedHero, ...images.filter((img) => img !== resolvedHero)];
  } else if (resolvedHero && !images.includes(resolvedHero)) {
    images = [resolvedHero, ...images];
  }

  return {
    id: tour.id,
    slug: tour.slug,
    title: localeText(tour.titleJsonb, 'ar') || localeText(tour.titleJsonb, 'en') || (typeof canon?.title === 'object' ? (canon?.title?.ar || canon?.title?.en) : canon?.title) || tour.slug,
    subtitle: localeText(tour.subtitleJsonb, 'ar') || localeText(tour.subtitleJsonb, 'en') || '',
    destination: destinationForCountry(tour.country || canon?.destination || 'egypt'),
    market: tour.market || 'Global',
    language: 'ar',
    type: tour.category || canon?.type || 'Classic',
    duration: localeText(tour.durationJsonb, 'ar') || (typeof canon?.duration === 'object' ? (canon?.duration?.ar || canon?.duration?.en) : canon?.duration) || '',
    departures: localeText(tour.departureInfoJsonb, 'ar') || 'Daily / Diário',
    price:
      tour.basePriceUsd !== undefined && tour.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
        ? Number(tour.basePriceUsd)
        : Number(canon?.price ?? 0),
    hotelCategory: '5-Star Luxury',
    rating: Number(tour.sourceRating || 5),
    reviewCount: tour.sourceReviewCount || 0,
    popular: !!tour.isFeatured,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: localeText(tour.overviewJsonb, 'ar') || (typeof canon?.overview === 'object' ? (canon?.overview?.ar || canon?.overview?.en) : canon?.overview) || '',
    highlights: localeList(rawHighlights, 'ar'),
    included: localeList(rawIncluded, 'ar'),
    excluded: localeList(rawExcluded, 'ar'),
    heroImage: resolvedHero,
    images,
    hotels: '5-Star Luxury Hotels',
    accommodation: tour.city ? [{ destination: tour.city, nights: 3, regime: 'Bed & Breakfast' }] : [],
    itinerary,
    translations: Object.fromEntries(LOCALES.map((locale) => [locale, {
      title: localeText(tour.titleJsonb, locale) || (typeof canon?.title === 'object' ? (canon?.title?.[locale] || canon?.title?.en) : tour.slug),
      subtitle: localeText(tour.subtitleJsonb, locale) || '',
      overview: localeText(tour.overviewJsonb, locale) || (typeof canon?.overview === 'object' ? (canon?.overview?.[locale] || canon?.overview?.en) : ''),
      duration: localeText(tour.durationJsonb, locale) || (typeof canon?.duration === 'object' ? (canon?.duration?.[locale] || canon?.duration?.en) : ''),
      highlights: localeList(rawHighlights, locale),
      included: localeList(rawIncluded, locale),
      excluded: localeList(rawExcluded, locale),
      itinerary: rawItinerary.map((item: any, index: number) => ({
        day: item.day || (item.sortOrder !== undefined ? item.sortOrder + 1 : index + 1),
        title: item.dayLabel || (typeof item.title === 'object' ? (item.title?.[locale] || item.title?.en) : item.title) || `اليوم ${index + 1}`,
        description: localeText(item.descriptionJsonb, locale) || (typeof item.description === 'object' ? (item.description?.[locale] || item.description?.en) : item.description) || '',
        meals: localeText(item.mealsJsonb, locale) || (typeof item.meals === 'object' ? (item.meals?.[locale] || item.meals?.en) : item.meals) || '',
      })),
    }])) as TripModel['translations'],
  };
}

function textFor(value: Record<string, unknown> | null | undefined, locale: string) {
  if (!value) return "";
  if (typeof value[locale] === "string" && (value[locale] as string)?.trim()) {
    return (value[locale] as string).trim();
  }
  for (const fallback of LOCALES) {
    if (typeof value[fallback] === "string" && (value[fallback] as string)?.trim()) {
      return (value[fallback] as string).trim();
    }
  }
  return "";
}

function hasLocaleCoreContent(tour: Tour, locale: string) {
  return [tour.titleJsonb, tour.overviewJsonb, tour.durationJsonb].every((field) =>
    typeof (field as Record<string, unknown>)?.[locale] === "string" && ((field as Record<string, unknown>)[locale] as string).trim().length > 0,
  );
}

function completion(tour: Tour) {
  return LOCALES.filter((locale) => hasLocaleCoreContent(tour, locale)).length;
}

function hasDestinationInterface(tour: Tour, slug?: string): boolean {
  return (tour.landingPages || []).some((relation: { type?: string; slug?: string }) =>
    relation.type === "DESTINATION" && (!slug || relation.slug?.toLowerCase() === slug.toLowerCase()),
  );
}

function isVisibleOnDestinationInterface(tour: Tour, slug?: string): boolean {
  if (tour.status !== "PUBLISHED" || !tour.isActive) return false;
  return (tour.landingPages || []).some((relation: { type?: string; isVisible?: boolean; status?: string; isActive?: boolean; slug?: string }) =>
    relation.type === "DESTINATION" &&
    relation.isVisible === true &&
    relation.status === "PUBLISHED" &&
    relation.isActive === true &&
    (!slug || relation.slug?.toLowerCase() === slug.toLowerCase()),
  );
}

export default function ToursPage() {
  const params = useParams<{ locale?: string }>();
  const router = useRouter();
  const locale = params?.locale || "en";
  const isAr = locale === "ar";

  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [catalogScope, setCatalogScope] = useState<"ADMIN" | "PUBLIC" | "HIDDEN" | "UNLINKED" | "UNPUBLISHED">("ADMIN");
  const [search, setSearch] = useState("");
  const [activeMainTab, setActiveMainTab] = useState<string>("grid");
  const [selectedTripForModal, setSelectedTripForModal] = useState<TripModel | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  const [tourToMove, setTourToMove] = useState<Tour | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const filters = useMemo(() => ({ limit: 500, ...(search.trim() ? { search: search.trim() } : {}) }), [search]);
  const { data, isLoading, error, refetch } = useTours(filters);
  const { data: landingPagesData } = useLandingPages({ type: "DESTINATION", limit: 50 });
  const { data: stats } = useTourStats();
  const { data: catalogOverview } = useTourCatalogOverview();
  const removeTour = useSoftDeleteTour();
  const publishMutation = useTourLifecycleAction('publish');
  const unpublishMutation = useTourLifecycleAction('unpublish');

  const handleTogglePublish = (tour: Tour) => {
    const isCurrentlyPublished = tour.status === "PUBLISHED" && tour.isActive;
    if (isCurrentlyPublished) {
      unpublishMutation.mutate(tour.slug);
      toast.success(isAr ? `تم إيقاف نشر الرحلة (${tour.slug}) وتحويلها لمسودة` : `Tour unpublished: ${tour.slug}`);
    } else {
      publishMutation.mutate(tour.slug);
      toast.success(isAr ? `تم نشر وتفعيل الرحلة (${tour.slug}) بالموقع` : `Tour published: ${tour.slug}`);
    }
  };

  const tours = data?.data ?? [];
  const visibleWebsiteTours = useMemo(() => tours.filter(isTourVisibleOnWebsite), [tours]);
  const scopedTours = useMemo(() => {
    switch (catalogScope) {
      case "PUBLIC": return visibleWebsiteTours;
      case "HIDDEN": return tours.filter((tour) => !isTourVisibleOnWebsite(tour));
      case "UNLINKED": return tours.filter((tour) => !hasDestinationInterface(tour));
      case "UNPUBLISHED": return tours.filter((tour) => tour.status !== "PUBLISHED" || !tour.isActive);
      default: return tours;
    }
  }, [catalogScope, tours, visibleWebsiteTours]);
  const translatedTourCount = useMemo(
    () => scopedTours.filter((tour) => completion(tour) === LOCALES.length).length,
    [scopedTours]
  );
  const translatedPercent = scopedTours.length
    ? Math.round((translatedTourCount / scopedTours.length) * 100)
    : 0;
  const connectedDestinationCount = useMemo(
    () => new Set(scopedTours.flatMap((tour) =>
      catalogScope === "PUBLIC"
        ? publicDestinationLabelsForTour(tour)
        : [resolveTourDestination(tour)],
    )).size,
    [scopedTours, catalogScope]
  );
  const averageRating = useMemo(() => {
    const ratings = scopedTours
      .map((tour) => Number(tour.sourceRating))
      .filter((rating) => Number.isFinite(rating) && rating > 0);
    return ratings.length
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)
      : '0.00';
  }, [scopedTours]);

  const exactScopeCount = search.trim()
    ? scopedTours.length
    : catalogScope === "PUBLIC"
      ? (catalogOverview?.visibleOnWebsite ?? visibleWebsiteTours.length)
      : catalogScope === "HIDDEN"
        ? (catalogOverview?.hiddenFromWebsite ?? tours.filter((tour) => !isTourVisibleOnWebsite(tour)).length)
        : catalogScope === "UNLINKED"
          ? (catalogOverview?.unlinked ?? tours.filter((tour) => !hasDestinationInterface(tour)).length)
          : catalogScope === "UNPUBLISHED"
            ? (catalogOverview?.unpublished ?? tours.filter((tour) => tour.status !== "PUBLISHED" || !tour.isActive).length)
            : (catalogOverview?.totalTours ?? stats?.totalTours ?? tours.length);

  const handleOpenEditTrip = async (tour: Tour) => {
    setSelectedTripForModal(tourToTripModel(tour));
    setIsTripModalOpen(true);

    if (tour.slug) {
      try {
        const fullTour = await toursApi.getTourBySlug(tour.slug);
        if (fullTour) {
          setSelectedTripForModal(tourToTripModel(fullTour));
        }
      } catch {
        // Fallback model already loaded
      }
    }
  };

  const handleOpenAddTrip = () => {
    setSelectedTripForModal(null);
    setIsTripModalOpen(true);
  };

  const destinationInterfaces = useMemo(() => {
    const pages = landingPagesData?.data || [];
    if (pages.length > 0) {
      return pages.map((page) => ({
        slug: page.slug,
        label: isAr ? (page.titleJsonb?.ar || page.titleJsonb?.en || page.slug) : (page.titleJsonb?.en || page.slug),
      }));
    }
    return DESTINATIONS_LIST.filter((destination) => destination.id !== "ALL").map((destination) => ({
      slug: destinationForCountry(destination.id),
      label: isAr ? destination.nameAr : destination.nameEn,
    }));
  }, [isAr, landingPagesData]);

  // These counts use interface relations and publication flags, never sort order.
  const interfaceSummaries = useMemo(() => {
    if (catalogOverview?.interfaces?.length) {
      return catalogOverview.interfaces.map((destination) => ({
        slug: destination.slug,
        label: isAr
          ? String(destination.titleJsonb?.ar || destination.titleJsonb?.en || destination.slug)
          : String(destination.titleJsonb?.en || destination.slug),
        total: destination.total,
        visible: destination.visible,
        hidden: destination.hidden,
      }));
    }
    return destinationInterfaces.map((destination) => {
    const attached = tours.filter((tour) => hasDestinationInterface(tour, destination.slug));
    const visible = attached.filter((tour) => isVisibleOnDestinationInterface(tour, destination.slug));
    return { ...destination, total: attached.length, visible: visible.length, hidden: attached.length - visible.length };
    });
  }, [catalogOverview, destinationInterfaces, isAr, tours]);

  // Filtered tours for the UI
  const filteredTours = useMemo(() => {
    return scopedTours.filter((tour) => {
      if (selectedDestination !== "ALL" && !hasDestinationInterface(tour, selectedDestination)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const title = textFor(tour.titleJsonb, locale).toLowerCase();
        const overview = textFor(tour.overviewJsonb, locale).toLowerCase();
        const slug = (tour.slug || "").toLowerCase();
        return title.includes(q) || overview.includes(q) || slug.includes(q);
      }
      return true;
    });
  }, [scopedTours, catalogScope, selectedDestination, search, locale]);

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
                <PageHelpTooltip description="إدارة كتالوج الجولات — إضافة جولات جديدة، تعديل الأسعار والمواعيد، والتحكم في مستوى التوفر." />
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
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-2 px-5 py-2.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-3" />
              <span>{isAr ? "إضافة رحلة جديدة +" : "Add New Trip +"}</span>
            </Button>
            <Button
              type="button"
              onClick={() => setActiveMainTab("priority")}
              className={`rounded-2xl font-black text-xs gap-2 px-4.5 py-2.5 shadow-xs transition-all cursor-pointer ${
                activeMainTab === "priority"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40"
              }`}
            >
              <ArrowUpDown className="w-4 h-4 text-amber-500 stroke-[2.5]" />
              <span>{isAr ? "تغيير ترتيب ظهور الرحلات ⭐" : "Tour Display Order ⭐"}</span>
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
                {exactScopeCount} <span className="text-xs font-bold text-amber-500">{isAr ? "رحلة 🗺️" : "Tours 🗺️"}</span>
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
                {catalogScope === "ADMIN" && !search.trim() && catalogOverview
                  ? Math.round((catalogOverview.integrity.complete / Math.max(catalogOverview.totalTours, 1)) * 100)
                  : translatedPercent}% <span className="text-xs font-bold text-emerald-500">({catalogScope === "ADMIN" && !search.trim() && catalogOverview ? catalogOverview.integrity.complete : translatedTourCount}/{catalogScope === "ADMIN" && !search.trim() && catalogOverview ? catalogOverview.totalTours : scopedTours.length}) 🌐</span>
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
              — <span className="text-xs font-bold text-amber-400">/ 5.0</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 3. Main Views Tabs Switcher */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="flex flex-wrap items-center gap-1.5 bg-card border border-border/80 p-1.5 rounded-2xl max-w-4xl mb-6 shadow-xs backdrop-blur-md">
          <TabsTrigger
            value="grid"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <Compass className="w-4 h-4" /> {isAr ? "إدارة الرحلات والترجمات الـ 5" : "Trips & 5-Lang Cards"}
          </TabsTrigger>
          <TabsTrigger
            value="priority"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" /> {isAr ? "تغيير ترتيب ظهور الرحلات ⭐" : "Tour Display Priority ⭐"}
          </TabsTrigger>
          <TabsTrigger
            value="destinations"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4" /> {isAr ? "الوجهات السياحية وباقات مصر" : "Destinations & Egypt Packages"}
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
           <Card className="p-3 bg-card border border-border/80 rounded-2xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
             <div>
               <p className="text-xs font-black text-foreground">
                 {isAr ? "مصدر العد" : "Count scope"}
               </p>
               <p className="text-[11px] text-muted-foreground">
                 {catalogScope === "PUBLIC"
                   ? (isAr ? "الرحلات الظاهرة حالياً على موقع العملاء فقط." : "Only tours currently visible on the customer website.")
                   : (isAr ? "كل سجلات الإدارة، بما فيها غير المرتبط أو غير المنشور." : "All admin records, including unpublished or unlinked tours.")}
               </p>
             </div>
             <div className="flex flex-wrap rounded-xl border border-border p-1 bg-muted/40 self-start sm:self-auto gap-1">
               <button
                 type="button"
                 onClick={() => { setCatalogScope("PUBLIC"); setSelectedDestination("ALL"); }}
                 className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${catalogScope === "PUBLIC" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
               >
                 {isAr ? "الظاهر بالموقع" : "Visible on website"}
               </button>
               <button
                 type="button"
                 onClick={() => { setCatalogScope("ADMIN"); setSelectedDestination("ALL"); }}
                 className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${catalogScope === "ADMIN" ? "bg-amber-500 text-slate-950" : "text-muted-foreground hover:text-foreground"}`}
               >
                 {isAr ? "كل السجلات" : "All admin records"}
               </button>
             </div>
             <div className="flex flex-wrap gap-1">
               <button type="button" onClick={() => { setCatalogScope("HIDDEN"); setSelectedDestination("ALL"); }} className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${catalogScope === "HIDDEN" ? "bg-rose-500 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground"}`}>
                 {isAr ? "غير ظاهر بالموقع" : "Hidden from website"}
               </button>
               <button type="button" onClick={() => { setCatalogScope("UNPUBLISHED"); setSelectedDestination("ALL"); }} className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${catalogScope === "UNPUBLISHED" ? "bg-sky-500 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground"}`}>
                 {isAr ? "غير منشور" : "Unpublished"}
               </button>
               <button type="button" onClick={() => { setCatalogScope("UNLINKED"); setSelectedDestination("ALL"); }} className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${catalogScope === "UNLINKED" ? "bg-violet-500 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground"}`}>
                 {isAr ? "غير مربوط بواجهة" : "No interface"}
               </button>
             </div>
           </Card>
           {/* Destination Selector & Search Bar */}
          <Card className="p-4 bg-card border border-border/80 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Destination Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full lg:w-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedDestination("ALL")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
                    selectedDestination === "ALL"
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/20 shadow-md scale-[1.02]"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <span>{isAr ? "كل الواجهات" : "All interfaces"}</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-background/80 text-muted-foreground border">{exactScopeCount}</span>
                </button>
                {interfaceSummaries.map((destination) => {
                  const isActive = selectedDestination === destination.slug;
                  return (
                    <button
                      key={destination.slug}
                      onClick={() => setSelectedDestination(destination.slug)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
                        isActive
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/20 shadow-md scale-[1.02]"
                          : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <span>{destination.label}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-slate-950/20 text-slate-950"
                            : "bg-background/80 text-muted-foreground border"
                        }`}
                      >
                        {destination.visible}/{destination.total}
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
                const overview = textFor(tour.overviewJsonb, locale);
                const duration = textFor(tour.durationJsonb, locale);
                const price =
                  tour.basePriceUsd !== undefined && tour.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
                    ? Number(tour.basePriceUsd)
                    : 0;
                const isFeatured = Boolean(tour.isFeatured);
                const destGroup = resolveTourDestination(tour);
                const heroImg =
                  tour.heroImage ||
                  (Array.isArray(tour.images) && tour.images.length > 0
                    ? typeof tour.images[0] === 'string'
                      ? tour.images[0]
                      : (tour.images[0] as any)?.imageUrl || (tour.images[0] as any)?.url || null
                    : null) ||
                  null;
                const visibleOnWebsite = isTourVisibleOnWebsite(tour);
                const attachedToInterface = hasDestinationInterface(tour);

                return (
                  <Card
                    key={tour.id || tour.slug}
                    className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail & Badges */}
                      <div className="h-52 relative overflow-hidden bg-slate-950">
                        {heroImg ? <img src={heroImg} alt={title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image uploaded</div>}
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-transparent to-black/30" />

                        {/* Top Badges & Switch */}
                        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 items-center">
                          {/* Dedicated Live Publish Switch */}
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 shadow-md cursor-pointer hover:border-amber-400/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePublish(tour);
                            }}
                            title={tour.status === "PUBLISHED" && tour.isActive ? (isAr ? "انقر لإلغاء النشر وإيقاف الرحلة" : "Click to unpublish") : (isAr ? "انقر لنشر الرحلة وتفعيلها بالموقع" : "Click to publish")}
                          >
                            <Switch
                              size="sm"
                              checked={tour.status === "PUBLISHED" && tour.isActive}
                              onCheckedChange={() => handleTogglePublish(tour)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className={`text-[10px] font-black ${tour.status === "PUBLISHED" && tour.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                              {tour.status === "PUBLISHED" && tour.isActive ? (
                                isAr ? "منشور بالموقع" : "Live"
                              ) : (
                                isAr ? "غير ظاهر" : "Hidden"
                              )}
                            </span>
                          </div>

                          {!attachedToInterface && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-500 text-white shadow-xs">
                              {isAr ? "بدون واجهة" : "No interface"}
                            </span>
                          )}
                          {isFeatured && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-white" /> {isAr ? "الأكثر إقبالاً 🔥" : "Popular 🔥"}
                            </span>
                          )}
                          {price > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 shadow-md">
                              ${price.toLocaleString()} USD
                            </span>
                          )}
                        </div>
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
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${completion(tour) === LOCALES.length ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-600 bg-amber-500/10 border-amber-500/20"}`}>
                            {completion(tour)}/5 {isAr ? "لغات" : "Locales"}
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

                    {/* Actions Bar */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-border/60 bg-muted/20 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenMove(tour)}
                        className="rounded-xl text-xs gap-1.5 font-bold hover:border-amber-500/50 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> {isAr ? "نقل الرحلة" : "Transfer"}
                      </Button>

                      <div className="flex items-center gap-1">
                        <a
                          href={getFrontendTourUrl(tour.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 hover:bg-sky-500/15 hover:text-sky-400 text-sky-500 rounded-xl transition-colors cursor-pointer"
                          title={isAr ? "عرض الرحلة في الموقع المباشر (الفرونت)" : "View Tour on Live Website (Frontend)"}
                          aria-label={isAr ? "عرض الرحلة في الموقع" : "View Tour on Website"}
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <Link
                          href={`/${locale}/admin/tours/${tour.slug}/preview`}
                          target="_blank"
                          className="inline-flex items-center justify-center h-8 w-8 hover:bg-emerald-500/15 hover:text-emerald-400 text-emerald-500 rounded-xl transition-colors"
                          title={isAr ? "معاينة كزائر في الداشبورد" : "Admin Visitor Preview"}
                          aria-label={isAr ? "معاينة كزائر" : "Visitor Preview"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleOpenEditTrip(tour)}
                          className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl cursor-pointer"
                          title={isAr ? "تعديل الرحلة والترجمات" : "Edit Trip & Translations"}
                          aria-label={isAr ? "تعديل الرحلة" : "Edit Trip"}
                        >
                          <Edit className="w-4 h-4 text-amber-500" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(tour)}
                          className="hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                          title={isAr ? "حذف الرحلة" : "Delete Trip"}
                          aria-label={isAr ? "حذف الرحلة" : "Delete Trip"}
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

        {/* Tab 2: Tour Display Priority & Featured Manager */}
        <TabsContent value="priority" className="space-y-4">
          <TourPriorityList initialTours={tours} />
        </TabsContent>

        {/* Tab 3: 8 Destinations & Egypt Special Packages */}
        <TabsContent value="destinations" className="space-y-4">
          <DestinationsManager />
        </TabsContent>

        {/* Tab 4: Trips Data Table */}
        <TabsContent value="table" className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <ToursTable />
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Trip & 5-Lang Editor Modal */}
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
