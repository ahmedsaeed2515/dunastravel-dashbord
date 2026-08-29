"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useDataContext } from '@/context/DataContext';
import { TripModel } from '@/types/dunas-suite';
import { TripEditorModal } from '@/components/trips/TripEditorModal';
import { TransferTripModal } from '@/components/trips/TransferTripModal';
import { useTours, useSoftDeleteTour, useClearAllTours } from '@/features/tours/hooks/useTours';
import { useLandingPages } from '@/features/tours/hooks/useLandingPages';
import type { Tour } from '@/features/tours/types';
import {
  resolveTourDestination,
  DESTINATIONS_LIST,
  DEST_FLAGS,
  DEST_GRADIENTS,
} from '@/lib/tour-destinations';
import { extractToursList } from '@/lib/extract-tours';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Compass,
  Plus,
  ArrowRightLeft,
  Edit,
  Trash2,
  Star,
  Flame,
  Calendar,
  Layers,
  MapPin,
  Eye,
  Crown,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  Filter,
  Loader2,
  Search,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

/** Classifies an Egypt tour into one of the 5 official Egypt VIP Packages */
function resolveEgyptPackageId(
  tour: Tour,
  arTitle: string,
  enTitle: string,
  category: string,
  tags: string[] = [],
): string {
  const t = (
    arTitle +
    ' ' +
    enTitle +
    ' ' +
    (tour.slug || '') +
    ' ' +
    (category || '') +
    ' ' +
    (tour.country || '') +
    ' ' +
    (tour.city || '') +
    ' ' +
    tags.join(' ')
  ).toLowerCase();

  // 1. Multi-Country
  if (
    t.includes('combined') ||
    t.includes('multi-country') ||
    t.includes('jordan') ||
    t.includes('turkey') ||
    t.includes('dubai') ||
    t.includes('مشترك') ||
    t.includes('أردن') ||
    t.includes('تركيا') ||
    t.includes('دبي')
  ) {
    return 'egypt-multi-country';
  }

  // 2. Religious
  if (
    t.includes('religious') ||
    t.includes('catherine') ||
    t.includes('holy') ||
    t.includes('coptic') ||
    t.includes('islamic') ||
    t.includes('monastery') ||
    t.includes('moses') ||
    t.includes('ديني') ||
    t.includes('سانت كاترين') ||
    t.includes('مقدس') ||
    t.includes('دير') ||
    t.includes('قبطي') ||
    t.includes('إسلامي') ||
    t.includes('حج')
  ) {
    return 'egypt-religious';
  }

  // 3. Honeymoon & Romance
  if (
    t.includes('honeymoon') ||
    t.includes('عسل') ||
    t.includes('romantic') ||
    t.includes('رومانسي') ||
    t.includes('gouna') ||
    t.includes('الجونة')
  ) {
    return 'egypt-honeymoon';
  }

  // 4. Extensions & Safaris
  if (
    t.includes('extension') ||
    t.includes('siwa') ||
    t.includes('alexandria') ||
    t.includes('oasis') ||
    t.includes('desert') ||
    t.includes('safari') ||
    t.includes('day-tour') ||
    t.includes('سيوة') ||
    t.includes('إسكندرية') ||
    t.includes('واحة') ||
    t.includes('سفاري') ||
    t.includes('تمديد') ||
    t.includes('توسعة')
  ) {
    return 'egypt-extensions';
  }

  // 5. Classic (Default for Cairo, Pyramids, Nile Cruises, Luxor, Aswan)
  return 'egypt-classic';
}

function convertTourToTripModel(tour: Tour): TripModel & { landingPageSlugs: string[] } {
  const getText = (value: Record<string, any> | null | undefined, locale: string): string =>
    typeof value?.[locale] === 'string' ? value[locale] : '';
  const getList = (value: Record<string, any> | null | undefined, locale: string): string[] =>
    Array.isArray(value?.[locale])
      ? value[locale].filter((item: unknown): item is string => typeof item === 'string')
      : [];
  const canonicalLandingPage = tour.landingPages?.find((lp: any) => lp?.type === 'DESTINATION')?.slug?.toLowerCase();
  const destResolved = resolveTourDestination(tour);
  const destId =
    canonicalLandingPage ||
    (destResolved === 'Egypt'
      ? 'egypt'
      : destResolved === 'Turkey'
      ? 'turkey'
      : destResolved === 'Jordan'
      ? 'jordan'
      : destResolved === 'Morocco'
      ? 'morocco'
      : destResolved === 'Dubai'
      ? 'dubai'
      : destResolved === 'Tunisia'
      ? 'tunisia'
      : destResolved === 'Greece'
      ? 'greece'
      : destResolved === 'Multi-Country'
      ? 'multi-country'
      : destResolved === 'Religious'
      ? 'religious'
      : 'egypt');

  const landingPageSlugs = (tour.landingPages || [])
    .filter((lp: any) => lp?.type === 'DESTINATION')
    .map((lp: any) => lp.slug.toLowerCase());

  const arTitle = tour.titleJsonb?.ar || tour.titleJsonb?.en || tour.slug;
  const enTitle = tour.titleJsonb?.en || tour.slug;
  const arOverview = tour.overviewJsonb?.ar || tour.overviewJsonb?.en || 'برنامج سياحي فاخر متكامل مع إقامة وجولات مرشد سياحي.';
  const enOverview = tour.overviewJsonb?.en || arOverview;
  const duration = tour.durationJsonb?.ar || tour.durationJsonb?.en || '';
  const price = Number(tour.basePriceUsd ?? 0);
  const hotelInfo =
    tour.hotelInfoJsonb && typeof tour.hotelInfoJsonb === 'object' && !Array.isArray(tour.hotelInfoJsonb)
      ? (tour.hotelInfoJsonb as Record<string, any>)
      : {};
  const accommodation = Array.isArray(hotelInfo.accommodation)
    ? hotelInfo.accommodation.filter(
        (item: unknown): item is { destination: string; nights: number; regime: string } =>
          Boolean(item) && typeof (item as { destination?: unknown }).destination === 'string',
      )
    : [];

  const images =
    tour.images && tour.images.length > 0
      ? tour.images.map((img) => img.imageUrl)
      : tour.heroImage
      ? [tour.heroImage]
      : [];

  const tags = Array.isArray(tour.tags) ? tour.tags : [];
  const packageId = destId === 'egypt'
    ? resolveEgyptPackageId(tour, arTitle, enTitle, tour.category || '', tags)
    : undefined;

  return {
    id: tour.id,
    slug: tour.slug,
    title: arTitle,
    subtitle: tour.subtitleJsonb?.ar || tour.subtitleJsonb?.en || '',
    destination: destId,
    landingPageSlugs,
    market: tour.market || 'Global',
    language: 'ar',
    type: (tour.category || 'Classic') as any,
    duration,
    departures: getText(tour.departureInfoJsonb, 'ar') || getText(tour.departureInfoJsonb, 'en'),
    price,
    hotelCategory: typeof hotelInfo.hotelCategory === 'string' ? hotelInfo.hotelCategory : '',
    rating: 4.9,
    reviewCount: tour.reviewCount || 0,
    popular: !!tour.isFeatured,
    familyFriendly: Boolean(tags.includes('family')),
    honeymoon: Boolean(tags.includes('honeymoon') || packageId === 'egypt-honeymoon'),
    luxury: Boolean(tags.includes('luxury') || tour.isFeatured),
    cultural: Boolean(tags.includes('cultural') || packageId === 'egypt-classic'),
    adventure: Boolean(tags.includes('adventure') || packageId === 'egypt-extensions'),
    overview: arOverview,
    highlights: getList(tour.highlightsJsonb, 'ar').length ? getList(tour.highlightsJsonb, 'ar') : getList(tour.highlightsJsonb, 'en'),
    included: getList(tour.includedServicesJsonb, 'ar').length ? getList(tour.includedServicesJsonb, 'ar') : getList(tour.includedServicesJsonb, 'en'),
    excluded: getList(tour.excludedServicesJsonb, 'ar').length ? getList(tour.excludedServicesJsonb, 'ar') : getList(tour.excludedServicesJsonb, 'en'),
    images,
    hotels: typeof hotelInfo.notes === 'string' ? hotelInfo.notes : '',
    accommodation: accommodation.length > 0 ? accommodation : [{ destination: tour.city || '', nights: 1, regime: '' }],
    itinerary:
      tour.itineraries && tour.itineraries.length > 0
        ? tour.itineraries.map((itin, idx) => ({
            day: idx + 1,
            title: itin.dayLabel || `Day ${idx + 1}`,
            description: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || '',
            meals: (itin.mealsJsonb?.ar as string) || (itin.mealsJsonb?.en as string) || 'الإفطار',
          }))
        : [],
    translations: Object.fromEntries(
      ['ar', 'en', 'es', 'pt', 'it'].map((locale) => [
        locale,
        {
          title: getText(tour.titleJsonb, locale),
          subtitle: getText(tour.subtitleJsonb, locale),
          overview: getText(tour.overviewJsonb, locale),
          duration: getText(tour.durationJsonb, locale),
          highlights: getList(tour.highlightsJsonb, locale),
          included: getList(tour.includedServicesJsonb, locale),
          excluded: getList(tour.excludedServicesJsonb, locale),
          itinerary: (tour.itineraries || []).map((itin, index) => ({
            day: index + 1,
            title: itin.dayLabel || `Day ${index + 1}`,
            description: getText(itin.descriptionJsonb, locale),
            meals: getText(itin.mealsJsonb, locale),
          })),
        },
      ]),
    ),
    packageId,
  };
}

export const DestinationsManager: React.FC = React.memo(() => {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || 'en';
  const isAr = locale === 'ar';

  const section1Ref = useRef<HTMLDivElement>(null);

  const { egyptPackages } = useDataContext();
  const { data: destinationData, isLoading: isLoadingDestinations } = useLandingPages({
    type: 'DESTINATION',
    status: 'PUBLISHED',
    isActive: true,
    limit: 50,
  });

  const destinations = useMemo(() => {
    const pages = Array.isArray(destinationData?.data) ? destinationData.data : [];
    if (pages.length === 0) {
      return DESTINATIONS_LIST.filter((d) => d.id !== 'ALL').map((d) => ({
        id: d.id.toLowerCase(),
        nameAr: d.nameAr,
        nameEn: d.nameEn,
        flag: d.flag,
        gradient: DEST_GRADIENTS[d.id.toLowerCase()] || 'from-amber-500/20 to-amber-600/10',
        description: d.nameAr,
      }));
    }
    return pages.map((page) => ({
      id: page.slug,
      nameAr: page.titleJsonb?.ar || page.titleJsonb?.en || page.slug,
      nameEn: page.titleJsonb?.en || page.slug,
      flag: DEST_FLAGS[page.slug.toLowerCase()] || '📍',
      gradient: DEST_GRADIENTS[page.slug.toLowerCase()] || 'from-amber-500/20 to-amber-600/10',
      description: page.briefJsonb?.ar || page.briefJsonb?.en || page.descriptionJsonb?.en || '',
    }));
  }, [destinationData]);

  const { data: toursData, isLoading: isLoadingTours } = useTours({ limit: 500 });
  const removeTourMutation = useSoftDeleteTour();

  const realTrips = useMemo(() => {
    const rawTours: Tour[] = extractToursList(toursData);
    return rawTours.map(convertTourToTripModel);
  }, [toursData]);

  const [activeDestId, setActiveDestId] = useState<string>('');
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'duration' | 'popular'>('default');

  const [editingTrip, setEditingTrip] = useState<TripModel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [transferringTrip, setTransferringTrip] = useState<TripModel | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  const activeDestination = useMemo(() => {
    return destinations.find((d) => d.id === activeDestId) || destinations[0];
  }, [destinations, activeDestId]);

  useEffect(() => {
    if (!activeDestId && destinations[0]) setActiveDestId(destinations[0].id);
  }, [activeDestId, destinations]);

  // Trip count map per destination
  const tripCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of realTrips) {
      if (t.landingPageSlugs && t.landingPageSlugs.length > 0) {
        for (const slug of t.landingPageSlugs) {
          map[slug] = (map[slug] || 0) + 1;
        }
      } else {
        const dKey = (t.destination || '').toLowerCase();
        map[dKey] = (map[dKey] || 0) + 1;
      }
    }
    return map;
  }, [realTrips]);

  // Egypt Package Counts Map
  const egyptPackageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      'egypt-classic': 0,
      'egypt-honeymoon': 0,
      'egypt-religious': 0,
      'egypt-multi-country': 0,
      'egypt-extensions': 0,
    };
    for (const t of realTrips) {
      const isEgypt =
        (t.landingPageSlugs && t.landingPageSlugs.includes('egypt')) ||
        (t.destination || '').toLowerCase() === 'egypt';
      if (isEgypt) {
        counts.all += 1;
        if (t.packageId && counts[t.packageId] !== undefined) {
          counts[t.packageId] += 1;
        } else {
          counts['egypt-classic'] += 1;
        }
      }
    }
    return counts;
  }, [realTrips]);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    let result = realTrips.filter((t) => {
      const aDest = (activeDestId || '').toLowerCase();
      const belongs =
        t.landingPageSlugs && t.landingPageSlugs.length > 0
          ? t.landingPageSlugs.includes(aDest)
          : (t.destination || '').toLowerCase() === aDest;
      if (!belongs) return false;

      // Package filter (when in Egypt)
      if (aDest === 'egypt' && activePackageId && t.packageId !== activePackageId) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = (t.title || '').toLowerCase().includes(q);
        const matchesSlug = (t.slug || '').toLowerCase().includes(q);
        const matchesOverview = (t.overview || '').toLowerCase().includes(q);
        const matchesDuration = (t.duration || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug && !matchesOverview && !matchesDuration) {
          return false;
        }
      }

      // Style tag filter
      if (selectedTag === 'VIP' && !t.luxury) return false;
      if (selectedTag === 'FAMILY' && !t.familyFriendly) return false;
      if (selectedTag === 'ROMANTIC' && !t.honeymoon) return false;
      if (selectedTag === 'CULTURAL' && !t.cultural) return false;

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [realTrips, activeDestId, activePackageId, searchQuery, selectedTag, sortBy]);

  const handleSelectPackageFilter = (pkgId: string | null) => {
    setActivePackageId(pkgId);
    if (section1Ref.current) {
      section1Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteTrip = useCallback(
    async (tripId: string, tripTitle: string, tripSlug?: string) => {
      if (confirm(isAr ? `هل أنت متأكد من حذف الرحلة "${tripTitle}"؟` : `Delete tour "${tripTitle}"?`)) {
        if (!tripSlug) {
          toast.error(isAr ? 'لا يمكن حذف رحلة بدون معرّف backend صالح.' : 'Cannot delete tour without slug.');
          return;
        }
        try {
          await removeTourMutation.mutateAsync(tripSlug);
        } catch {
          toast.error(isAr ? 'تعذر حذف الرحلة من قاعدة البيانات.' : 'Failed to delete tour from backend.');
          return;
        }
        toast.success(isAr ? 'تم حذف الرحلة بنجاح.' : 'Tour deleted successfully.');
      }
    },
    [removeTourMutation, isAr],
  );

  const handleOpenTransfer = useCallback((trip: TripModel) => {
    setTransferringTrip(trip);
    setIsTransferOpen(true);
  }, []);

  const handleOpenEdit = useCallback(
    (trip: TripModel) => {
      if (!trip.slug) return;
      window.location.assign(`/${locale}/admin/tours/${trip.slug}/edit`);
    },
    [locale],
  );

  const handleOpenNew = useCallback(() => {
    setEditingTrip(null);
    setIsEditorOpen(true);
  }, []);

  if (isLoadingDestinations && isLoadingTours) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!activeDestination) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isEgypt = activeDestId === 'egypt';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 8 Destinations Tab Switcher Bar */}
      <div className="bg-card border border-border/80 rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {destinations.map((dest) => {
            const isSelected = activeDestId === dest.id;
            const destTripCount = tripCountMap[dest.id] || 0;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setActiveDestId(dest.id);
                  setActivePackageId(null);
                  setSearchQuery('');
                  setSelectedTag('ALL');
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span className="text-lg">{dest.flag}</span>
                <span>{dest.nameAr}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {destTripCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Country Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-r ${activeDestination.gradient} p-6 sm:p-8 backdrop-blur-md shadow-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-5xl sm:text-6xl drop-shadow-md">{activeDestination.flag}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                  {isAr ? `وجهة ${activeDestination.nameAr}` : activeDestination.nameEn} ({activeDestination.nameEn})
                </h2>
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 font-mono text-xs">
                  {filteredTrips.length} {isAr ? 'رحلة معروضة' : 'tours'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium">
                {activeDestination.description}
              </p>
            </div>
          </div>

          <Button
            onClick={handleOpenNew}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-sm gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? `إضافة رحلة جديدة لوجهة ${activeDestination.nameAr} +` : `Add Tour to ${activeDestination.nameEn} +`}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: السكشن الأول - الرحلات الرئيسية وفلترة الباكدجات العلوية الحديثة   */}
      {/* ========================================================================= */}
      <div ref={section1Ref} className="space-y-4 pt-2">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card border border-border/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <span>
                  {isAr
                    ? `السكشن الأول: الرحلات الرئيسية لوجهة ${activeDestination.nameAr}`
                    : `Section 1: Main Tours Catalog — ${activeDestination.nameEn}`}
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {isAr
                  ? `عرض وإدارة كافة البرامج والجولات السياحية المتاحة للعملاء (${filteredTrips.length} رحلة مطابقة).`
                  : `Browse and manage all verified travel programs and excursions (${filteredTrips.length} matching tours).`}
              </p>
            </div>
          </div>

          {(activePackageId || searchQuery || selectedTag !== 'ALL') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActivePackageId(null);
                setSearchQuery('');
                setSelectedTag('ALL');
              }}
              className="text-xs gap-1.5 font-bold cursor-pointer text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}</span>
            </Button>
          )}
        </div>

        {/* 🌟 TOP MODERN FILTER BAR (Special for Egypt 5 VIP Packages & Quick Styles) */}
        {isEgypt && (
          <Card className="p-4 bg-card border border-border/80 rounded-3xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-foreground uppercase tracking-wider">
                  {isAr ? 'تصفية سريعة حسب باكدجات وبرامج مصر الـ 5:' : 'Filter by Egypt VIP Packages:'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {isAr ? `${filteredTrips.length} من إجمالي ${egyptPackageCounts.all} رحلة` : `${filteredTrips.length} of ${egyptPackageCounts.all} tours`}
              </span>
            </div>

            {/* Egypt 5 Packages Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* All Egypt Tours Pill */}
              <button
                type="button"
                onClick={() => setActivePackageId(null)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-2 shadow-xs ${
                  activePackageId === null
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]'
                    : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <span>🌟</span>
                <span>{isAr ? 'كافة رحلات مصر' : 'All Egypt Tours'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    activePackageId === null ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {egyptPackageCounts.all}
                </span>
              </button>

              {/* 5 VIP Packages Pills */}
              {egyptPackages.map((pkg) => {
                const isActive = activePackageId === pkg.id;
                const count = egyptPackageCounts[pkg.id] || 0;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setActivePackageId(isActive ? null : pkg.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-2 shadow-xs ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70'
                    }`}
                  >
                    <span>{pkg.icon}</span>
                    <span>{isAr ? pkg.titleAr.split('(')[0].trim() : pkg.titleEn}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                        isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub Toolbar: Search + Style Tags + Sorting */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                <input
                  type="text"
                  placeholder={isAr ? 'البحث باسم الرحلة، المدة، أو الكود...' : 'Search by tour name, duration, slug...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Travel Style Pills & Sort */}
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground ms-1">{isAr ? 'النمط:' : 'Style:'}</span>
                  {[
                    { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
                    { id: 'VIP', labelAr: '👑 VIP', labelEn: '👑 VIP' },
                    { id: 'ROMANTIC', labelAr: '💍 رومانسي', labelEn: '💍 Honeymoon' },
                    { id: 'FAMILY', labelAr: '👨‍👩‍👧‍👦 عائلي', labelEn: '👨‍👩‍👧‍👦 Family' },
                    { id: 'CULTURAL', labelAr: '🏛️ ثقافي', labelEn: '🏛️ Cultural' },
                  ].map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTag(tag.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer ${
                        selectedTag === tag.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-muted/30 text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {isAr ? tag.labelAr : tag.labelEn}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSortBy((prev) =>
                        prev === 'default'
                          ? 'price-asc'
                          : prev === 'price-asc'
                          ? 'price-desc'
                          : prev === 'price-desc'
                          ? 'popular'
                          : 'default',
                      );
                    }}
                    className="h-8 text-xs font-bold gap-1 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {sortBy === 'default'
                        ? (isAr ? 'الترتيب: الافتراضي' : 'Sort: Default')
                        : sortBy === 'price-asc'
                        ? (isAr ? 'السعر: الأقل' : 'Price: Low')
                        : sortBy === 'price-desc'
                        ? (isAr ? 'السعر: الأعلى' : 'Price: High')
                        : (isAr ? 'الأكثر طلباً' : 'Popular')}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Trips Grid */}
        {isLoadingTours && realTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs text-muted-foreground font-semibold">
              {isAr ? 'جاري تحميل رحلات الوجهة من قاعدة البيانات...' : 'Loading tour catalog...'}
            </p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">
              {isAr ? 'لا توجد رحلات مطابقة لهذا البحث أو الباكج المحدد.' : 'No tours match the selected filters.'}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isAr
                ? 'يمكنك إعادة ضبط الفلترة لعرض كافة رحلات مصر أو إضافة برنامج سياحي جديد.'
                : 'Reset your active filters to browse the full catalog or add a new tour.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActivePackageId(null);
                  setSearchQuery('');
                  setSelectedTag('ALL');
                }}
                className="text-xs font-bold"
              >
                {isAr ? 'عرض كافة الرحلات' : 'Show All Tours'}
              </Button>
              <Button onClick={handleOpenNew} size="sm" className="rounded-xl bg-amber-500 text-slate-950 font-bold">
                {isAr ? 'إضافة رحلة جديدة +' : 'Add New Tour +'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((trip) => {
              const packageObj = egyptPackages.find((p) => p.id === trip.packageId);

              return (
                <div
                  key={trip.id}
                  className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Hero */}
                    <div className="h-48 relative overflow-hidden bg-slate-900">
                      {trip.images[0] ? (
                        <img
                          src={trip.images[0]}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No image uploaded
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                        {trip.popular && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {isAr ? 'الأكثر إقبالاً' : 'Featured'}
                          </span>
                        )}

                        {packageObj && isEgypt && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                            {packageObj.icon} {isAr ? packageObj.type : packageObj.titleEn}
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/80 text-amber-400 backdrop-blur-md border border-amber-400/20 font-mono">
                          ${trip.price}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                        <span className="flex items-center gap-1 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" /> {trip.duration}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {trip.rating} ({trip.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h4 className="font-extrabold text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {trip.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {trip.overview}
                      </p>

                      {/* Category Tags icons */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                        {trip.familyFriendly && <span title="عائلية">👨‍👩‍👧‍👦 عائلية</span>}
                        {trip.honeymoon && <span title="شهر عسل">💍 شهر عسل</span>}
                        {trip.luxury && <span title="فاخرة VIP">👑 VIP</span>}
                        {trip.cultural && <span title="ثقافية">🏛️ ثقافية</span>}
                        <span className="ms-auto text-[11px] font-bold text-amber-500">{trip.hotelCategory}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-5 py-3 flex items-center justify-between border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTransfer(trip)}
                      className="rounded-xl text-xs gap-1.5 hover:border-amber-500/50 cursor-pointer font-bold"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'نقل الرحلة' : 'Transfer Tour'}</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(trip)}
                        className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl"
                        title={isAr ? 'تعديل الرحلة' : 'Edit Tour'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDeleteTrip(trip.id, trip.title, trip.slug)}
                        className="hover:bg-destructive/10 text-destructive rounded-xl"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: السكشن الثاني - الباكدجات والبرامج الخاصة بمصر الـ 5               */}
      {/* ========================================================================= */}
      {isEgypt && (
        <div className="space-y-4 pt-6 border-t border-border/80 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 shrink-0">
                <Crown className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? 'السكشن الثاني: الباكدجات والبرامج الخاصة بمصر الـ 5 (Egypt VIP Packages)' : 'Section 2: Egypt 5 VIP Packages Catalog'}</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  {isAr
                    ? 'عرض كامل وتفصيلي لباكدجات مصر الشاملة المخصصة للعملاء مع الفلترة والإدارة المباشرة.'
                    : 'Full overview of the 5 curated Egypt VIP programs with direct linking and quick filtering.'}
                </p>
              </div>
            </div>

            {activePackageId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSelectPackageFilter(null)}
                className="text-xs text-amber-500 font-bold cursor-pointer hover:bg-amber-500/10"
              >
                {isAr ? 'عرض كافة الباكدجات' : 'View All Packages'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {egyptPackages.map((pkg) => {
              const isSelected = activePackageId === pkg.id;
              const count = egyptPackageCounts[pkg.id] || 0;
              return (
                <Card
                  key={pkg.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between group ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-border/80 hover:border-amber-500/40 bg-card'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-2xl shrink-0">
                        {pkg.icon}
                      </div>
                      {pkg.badge && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900/90 dark:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-xs">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-foreground group-hover:text-amber-500 transition-colors">
                        {pkg.titleAr}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Associated Trips Info */}
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-amber-500" />
                        {isAr ? 'الرحلات المربوطة بالباكج:' : 'Linked Tours:'}
                      </span>
                      <span className="font-extrabold text-amber-500 font-mono text-sm">
                        {count} {isAr ? 'رحلات 🔗' : 'tours 🔗'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPackageFilter(isSelected ? null : pkg.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-muted/60 text-foreground hover:bg-amber-500/20 hover:text-amber-500 border border-border'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>{isAr ? 'مفعل حالياً (عرض كافة رحلات مصر)' : 'Active (Show All Egypt Tours)'}</span>
                        </>
                      ) : (
                        <>
                          <Filter className="w-4 h-4 text-amber-500" />
                          <span>{isAr ? `تصفية الرحلات لـ ${pkg.type} 🔍` : `Filter Tours by ${pkg.type} 🔍`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {isEditorOpen && (
        <TripEditorModal
          trip={editingTrip}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {isTransferOpen && (
        <TransferTripModal
          trip={transferringTrip}
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          destinations={destinations}
          egyptPackages={egyptPackages}
        />
      )}
    </div>
  );
});

DestinationsManager.displayName = 'DestinationsManager';
