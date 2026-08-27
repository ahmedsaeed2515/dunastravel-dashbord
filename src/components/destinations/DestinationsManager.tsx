"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataContext } from '@/context/DataContext';
import { TripModel } from '@/types/dunas-suite';
import { TripEditorModal } from '@/components/trips/TripEditorModal';
import { TransferTripModal } from '@/components/trips/TransferTripModal';
import { useTours, useSoftDeleteTour, useClearAllTours } from '@/features/tours/hooks/useTours';
import { useLandingPages } from '@/features/tours/hooks/useLandingPages';
import type { Tour } from '@/features/tours/types';
import { resolveTourDestination } from '@/app/[locale]/(dashboard)/admin/tours/page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import { toast } from 'sonner';

function convertTourToTripModel(tour: Tour): TripModel {
  const destResolved = resolveTourDestination(tour);
  const destId =
    destResolved === 'Egypt'
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
      : 'holyland';

  const arTitle = tour.titleJsonb?.ar || tour.titleJsonb?.en || tour.slug;
  const enTitle = tour.titleJsonb?.en || tour.slug;
  const arOverview = tour.overviewJsonb?.ar || tour.overviewJsonb?.en || 'برنامج سياحي فاخر متكامل مع إقامة وجولات مرشد سياحي.';
  const enOverview = tour.overviewJsonb?.en || arOverview;
  const duration = tour.durationJsonb?.ar || tour.durationJsonb?.en || '';
  const price = Number(tour.basePriceUsd || 650);

  const images =
    tour.images && tour.images.length > 0
      ? tour.images.map((img) => img.imageUrl)
      : (tour.heroImage ? [tour.heroImage] : []);

  // Assign Egypt Package Id based on category & title
  let packageId: string | undefined = undefined;
  const cat = (tour.category || '').toLowerCase();
  const slug = (tour.slug || '').toLowerCase();
  const title = (arTitle + ' ' + enTitle).toLowerCase();

  if (destId === 'egypt') {
    if (cat.includes('nile') || slug.includes('nile') || title.includes('نيل') || title.includes('كروز')) {
      packageId = 'egypt-nile-cruise';
    } else if (cat.includes('honeymoon') || slug.includes('honeymoon') || title.includes('عسل')) {
      packageId = 'egypt-honeymoon';
    } else if (cat.includes('luxury') || cat.includes('vip') || slug.includes('luxury') || title.includes('فاخر')) {
      packageId = 'egypt-luxury-vip';
    } else if (cat.includes('desert') || cat.includes('adventure') || slug.includes('desert') || title.includes('صحراء') || title.includes('مغامرة')) {
      packageId = 'egypt-desert-adventure';
    } else {
      packageId = 'egypt-classic';
    }
  }

  return {
    id: tour.id,
    slug: tour.slug,
    title: arTitle,
    subtitle: tour.subtitleJsonb?.ar || tour.subtitleJsonb?.en || '',
    destination: destId,
    market: 'Global',
    language: 'ar',
    type: (tour.category || 'Classic') as any,
    duration,
    departures: 'Daily / Diário',
    price,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: tour.reviewCount || 0,
    popular: !!tour.isFeatured,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: arOverview,
    highlights: (tour.highlightJsonb?.ar as string[]) || (tour.highlightJsonb?.en as string[]) || [],
    included: (tour.includedServicesJsonb?.ar as string[]) || (tour.includedServicesJsonb?.en as string[]) || [],
    excluded: (tour.excludedServicesJsonb?.ar as string[]) || (tour.excludedServicesJsonb?.en as string[]) || [],
    images,
    hotels: '5-Star Luxury Hotels',
    accommodation: [{ destination: tour.city || 'Cairo', nights: 3, regime: 'Bed & Breakfast' }],
    itinerary:
      tour.itineraries && tour.itineraries.length > 0
        ? tour.itineraries.map((itin, idx) => ({
            day: idx + 1,
            title: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || itin.dayLabel || `اليوم ${idx + 1}`,
            description: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || '',
            meals: (itin.mealsJsonb?.ar as string) || (itin.mealsJsonb?.en as string) || 'الإفطار',
          }))
        : [{ day: 1, title: 'الوصول والتسكين', description: 'الوصول للمطار واستقبال في الفندق والتسكين.', meals: 'الإفطار' }],
    translations: {
      ar: { title: arTitle, overview: arOverview },
      en: { title: enTitle, overview: enOverview },
      es: { title: tour.titleJsonb?.es || enTitle, overview: tour.overviewJsonb?.es || enOverview },
      pt: { title: tour.titleJsonb?.pt || enTitle, overview: tour.overviewJsonb?.pt || enOverview },
      it: { title: tour.titleJsonb?.it || enTitle, overview: tour.overviewJsonb?.it || enOverview },
    },
    packageId,
  };
}

import { extractToursList } from '@/lib/extract-tours';

export const DestinationsManager: React.FC = React.memo(() => {
  // Destination identities and tour records both come from the canonical API.
  // DataContext remains only for the separately managed Egypt package labels.
  const { egyptPackages } = useDataContext();
  const { data: destinationData, isLoading: isLoadingDestinations, error: destinationsError } = useLandingPages({
    type: 'DESTINATION', status: 'PUBLISHED', isActive: true, limit: 100,
  });
  const destinations = useMemo(() => {
    const pages = Array.isArray(destinationData?.data) ? destinationData.data : [];
    return pages.map((page) => ({
      id: page.slug,
      nameAr: page.titleJsonb?.ar || page.titleJsonb?.en || page.slug,
      nameEn: page.titleJsonb?.en || page.slug,
      flag: '',
      gradient: 'from-amber-500/20 to-amber-600/10',
      description: page.briefJsonb?.ar || page.briefJsonb?.en || page.descriptionJsonb?.en || '',
    }));
  }, [destinationData]);
  const { data: toursData, isLoading: isLoadingTours } = useTours({ limit: 500 });
  const removeTourMutation = useSoftDeleteTour();
  const clearAllToursMutation = useClearAllTours();

  const realTrips = useMemo(() => {
    const rawTours: Tour[] = extractToursList(toursData);
    return rawTours.map(convertTourToTripModel).map((trip) => {
      const destLower = (trip.destination || '').toLowerCase();
      const normDest =
        destLower.includes('egypt') || destLower.includes('مصر')
          ? 'egypt'
          : destLower.includes('turkey') || destLower.includes('تركيا')
          ? 'turkey'
          : destLower.includes('jordan') || destLower.includes('الأردن')
          ? 'jordan'
          : destLower.includes('morocco') || destLower.includes('المغرب')
          ? 'morocco'
          : destLower.includes('dubai') || destLower.includes('دبي')
          ? 'dubai'
          : destLower.includes('tunisia') || destLower.includes('تونس')
          ? 'tunisia'
          : destLower.includes('greece') || destLower.includes('اليونان')
          ? 'greece'
          : destLower.includes('holyland') || destLower.includes('القدس')
          ? 'holyland'
          : destLower || 'egypt';

      let pkgId = trip.packageId;
      if (normDest === 'egypt' && !pkgId) {
        const title = (trip.title || '').toLowerCase();
        const slug = (trip.slug || '').toLowerCase();
        if (slug.includes('nile') || title.includes('نيل') || title.includes('كروز')) {
          pkgId = 'egypt-nile-cruise';
        } else if (slug.includes('honeymoon') || title.includes('عسل')) {
          pkgId = 'egypt-honeymoon';
        } else if (slug.includes('ramses') || title.includes('رمسيس') || title.includes('vip')) {
          pkgId = 'egypt-luxury-vip';
        } else if (slug.includes('desert') || title.includes('صحراء')) {
          pkgId = 'egypt-desert-adventure';
        } else {
          pkgId = 'egypt-classic';
        }
      }

      return {
        ...trip,
        destination: normDest,
        packageId: pkgId,
      };
    });
  }, [toursData]);

  const [activeDestId, setActiveDestId] = useState<string>('');
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

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

  // Pre-calculate trip count map per destination for instant switching
  const tripCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of realTrips) {
      const dKey = (t.destination || '').toLowerCase();
      map[dKey] = (map[dKey] || 0) + 1;
    }
    return map;
  }, [realTrips]);

  // Filter trips by active destination and optional package filter
  const filteredTrips = useMemo(() => {
    return realTrips.filter((t) => {
      const tDest = (t.destination || '').toLowerCase();
      const aDest = (activeDestId || '').toLowerCase();
      if (tDest !== aDest) return false;
      if (activePackageId && t.packageId !== activePackageId) return false;
      return true;
    });
  }, [realTrips, activeDestId, activePackageId]);

  const handleDeleteTrip = useCallback(
    async (tripId: string, tripTitle: string, tripSlug?: string) => {
      if (confirm(`هل أنت متأكد من حذف الرحلة "${tripTitle}"؟`)) {
        if (!tripSlug) {
          toast.error('لا يمكن حذف رحلة بدون معرّف backend صالح.');
          return;
        }
        try {
          await removeTourMutation.mutateAsync(tripSlug);
        } catch {
          toast.error('تعذر حذف الرحلة من قاعدة البيانات. لم يتم تطبيق أي تغيير.');
          return;
        }
        toast.success('تم حذف الرحلة بنجاح.');
      }
    },
    [removeTourMutation]
  );

  const handleOpenTransfer = useCallback((trip: TripModel) => {
    setTransferringTrip(trip);
    setIsTransferOpen(true);
  }, []);

  const handleOpenEdit = useCallback((trip: TripModel) => {
    setEditingTrip(trip);
    setIsEditorOpen(true);
  }, []);

  const handleOpenNew = useCallback(() => {
    setEditingTrip(null);
    setIsEditorOpen(true);
  }, []);

  if (isLoadingDestinations || isLoadingTours) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  if (destinationsError) {
    return <div className="rounded-3xl border border-red-300 bg-red-50 p-8 text-center text-red-800">Destinations could not be loaded from the Backend.</div>;
  }

  if (!activeDestination) {
    return <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">No published destinations are currently available.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 8 Destinations Tab Switcher Bar */}
      <div className="bg-card border border-border/80 rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {destinations.map(dest => {
            const isSelected = activeDestId === dest.id;
            const destTripCount = tripCountMap[dest.id] || 0;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setActiveDestId(dest.id);
                  setActivePackageId(null);
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span className="text-lg">{dest.flag}</span>
                <span>{dest.nameAr}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
                }`}>
                  {destTripCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Country Banner */}
      <div className={`relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-r ${activeDestination.gradient} p-6 sm:p-8 backdrop-blur-md shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-5xl sm:text-6xl drop-shadow-md">{activeDestination.flag}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                  وجهة {activeDestination.nameAr} ({activeDestination.nameEn})
                </h2>
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10">
                  {filteredTrips.length} رحلة نشطة
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium">
                {activeDestination.description}
              </p>
            </div>
          </div>

          <Button onClick={handleOpenNew} className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-sm gap-2 shrink-0 cursor-pointer">
            <Plus className="w-4 h-4" /> إضافة رحلة جديدة لوجهة {activeDestination.nameAr}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: السكشن الأول - الرحلات الرئيسية (Main Tours & Excursions)       */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card border border-border/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <span>السكشن الأول: الرحلات الرئيسية لوجهة {activeDestination.nameAr}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                عرض وإدارة كافة الرحلات والمزارات السياحية الأساسية المتاحة للعملاء ({filteredTrips.length} رحلة).
              </p>
            </div>
          </div>

          {activePackageId && (
            <Button size="xs" variant="gold" onClick={() => setActivePackageId(null)} className="text-xs gap-1.5 font-bold cursor-pointer">
              <Filter className="w-3.5 h-3.5" /> عرض كافة رحلات {activeDestination.nameAr}
            </Button>
          )}
        </div>

        {/* Trips Grid */}
        {isLoadingTours && realTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs text-muted-foreground font-semibold">
              جاري تحميل رحلات الوجهة من قاعدة البيانات...
            </p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">لا توجد رحلات مسجلة في هذه الوجهة حالياً.</p>
            <Button onClick={handleOpenNew} size="sm" className="rounded-xl bg-amber-500 text-slate-950 font-bold">
              إضافة رحلة جديدة
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map(trip => (
              <div
                key={trip.id}
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image Hero */}
                  <div className="h-48 relative overflow-hidden bg-slate-900">
                    {trip.images[0] ? <img src={trip.images[0]} alt={trip.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image uploaded</div>}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                      {trip.popular && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3" /> الأكثر إقبالاً
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-400 backdrop-blur-md border border-amber-400/20">
                        ${trip.price}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> {trip.duration}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-400">
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
                      {trip.luxury && <span title="فاخرة VIP">⭐ VIP</span>}
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
                    className="rounded-xl text-xs gap-1.5 hover:border-amber-500/50 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> نقل الرحلة
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(trip)}
                      className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl"
                      title="تعديل الرحلة"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteTrip(trip.id, trip.title, trip.slug)}
                      className="hover:bg-destructive/10 text-destructive rounded-xl"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: السكشن الثاني - الباكدجات والبرامج الخاصة بمصر                 */}
      {/* ========================================================================= */}
      {activeDestId === 'egypt' && (
        <div className="space-y-4 pt-6 border-t border-border/80 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 shrink-0">
                <Crown className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>السكشن الثاني: الباكدجات والبرامج الخاصة بمصر الـ 5 (Egypt VIP Packages)</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  عرض كامل وتفصيلي لباكدجات مصر الشاملة المخصصة للعملاء مع الفلترة والإدارة المباشرة.
                </p>
              </div>
            </div>

            {activePackageId && (
              <Button size="xs" variant="ghost" onClick={() => setActivePackageId(null)} className="text-xs text-amber-500 font-bold cursor-pointer">
                عرض كافة الباكدجات
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {egyptPackages.map(pkg => {
              const isSelected = activePackageId === pkg.id;
              const pkgTrips = realTrips.filter(t => t.destination === 'egypt' && t.packageId === pkg.id);
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
                        الرحلات المربوطة بالباكج:
                      </span>
                      <span className="font-extrabold text-amber-500 font-mono text-sm">
                        {pkgTrips.length} رحلات 🔗
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePackageId(isSelected ? null : pkg.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-muted/60 text-foreground hover:bg-amber-500/20 hover:text-amber-500 border border-border'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>عرض كافة رحلات مصر</span>
                        </>
                      ) : (
                        <>
                          <Filter className="w-4 h-4 text-amber-500" />
                          <span>تصفية الرحلات لـ {pkg.type} 🔍</span>
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

      {/* Modals - Rendered only when active to preserve DOM & render speed */}
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
        />
      )}
    </div>
  );
});

DestinationsManager.displayName = 'DestinationsManager';
