"use client";

import React, { useState, useEffect, memo, useMemo } from 'react';
import { TripModel } from '@/types/dunas-suite';
import { Tour } from '@/features/tours/types';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/features/tours/api/toursApi';
import { LANDING_PAGES_QUERY_KEY, useLandingPages } from '@/features/tours/hooks/useLandingPages';
import {
  DESTINATIONS_LIST,
  DEST_FLAGS,
  resolveTourDestination,
  destinationForCountry,
} from '@/lib/tour-destinations';
import { getTourTitle } from '@/features/tours/components/ToursTable/columns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ArrowRightLeft,
  Check,
  Compass,
  Layers,
  Sparkles,
  MapPin,
  Building2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

export interface TransferTripModalProps {
  trip?: TripModel | null;
  tour?: Tour | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  destinations?: Array<{ id: string; nameAr: string; nameEn: string; flag: string; code?: string }>;
  egyptPackages?: Array<{ id: string; titleAr: string; titleEn?: string; description: string; icon: string }>;
}

const DEFAULT_DESTINATIONS = [
  { id: 'tunisia', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', code: 'TN' },
  { id: 'egypt', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', code: 'EG' },
  { id: 'turkey', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', code: 'TR' },
  { id: 'jordan', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', code: 'JO' },
  { id: 'morocco', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', code: 'MA' },
  { id: 'greece', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷', code: 'GR' },
  { id: 'dubai', nameAr: 'دبي', nameEn: 'Dubai', flag: '🇦🇪', code: 'AE' },
  { id: 'multi-country', nameAr: 'رحلات متعددة الدول', nameEn: 'Multi-Country', flag: '🌍', code: 'MC' },
  { id: 'religious', nameAr: 'رحلات دينية', nameEn: 'Religious Tours', flag: '🕊️', code: 'RL' },
];

const DEFAULT_EGYPT_PACKAGES = [
  {
    id: 'egypt-classic',
    categoryName: 'Classic Tours',
    titleAr: 'البرنامج الكلاسيكي (Classic Program)',
    titleEn: 'Classic Egypt Itinerary',
    description: 'رحلات القاهرة، الأهرامات، والمتحف المصري، والنايل كروز',
    icon: '🏛️',
  },
  {
    id: 'egypt-honeymoon',
    categoryName: 'Honeymoon Packages',
    titleAr: 'برنامج شهر العسل (Honeymoon)',
    titleEn: 'Honeymoon & Romantic Getaway',
    description: 'إقامة رومانسية على الجونة، شرم الشيخ، وإطلالات النيل الساحرة',
    icon: '💍',
  },
  {
    id: 'egypt-religious',
    categoryName: 'Religious Tours',
    titleAr: 'البرامج الدينية (Religious Programs)',
    titleEn: 'Holy Family & Pilgrimage',
    description: 'رحلات ومسار استكشافي للأديرة والكنائس وسانت كاترين',
    icon: '🕊️',
  },
  {
    id: 'egypt-extensions',
    categoryName: 'Desert & Extensions',
    titleAr: 'توسعات وتمديدات مصر (Egypt Extensions)',
    titleEn: 'Oasis & Desert Safaris',
    description: 'سيوة، الواحات البحرية، وسفاري الصحراء البيضاء',
    icon: '🏜️',
  },
  {
    id: 'egypt-multi-country',
    categoryName: 'Multi-Country Tours',
    titleAr: 'جولات متعددة الدول (Multi-Country)',
    titleEn: 'Egypt & Middle East Combined',
    description: 'برامج مشتركة تشمل مصر مع الأردن أو تركيا أو دبي',
    icon: '🌍',
  },
];

const CITIES_BY_DESTINATION: Record<string, string[]> = {
  egypt: ['Cairo', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Alexandria', 'Siwa'],
  turkey: ['Istanbul', 'Cappadocia', 'Antalya', 'Bodrum', 'Pamukkale', 'Fethiye'],
  jordan: ['Amman', 'Petra', 'Wadi Rum', 'Dead Sea', 'Aqaba'],
  morocco: ['Marrakech', 'Casablanca', 'Fes', 'Chefchaouen', 'Tangier'],
  dubai: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  tunisia: ['Tunis', 'Hammamet', 'Sousse', 'Djerba', 'Tozeur'],
  greece: ['Athens', 'Santorini', 'Mykonos', 'Crete'],
  'multi-country': ['Cairo & Istanbul', 'Jordan & Egypt', 'Morocco & Spain', 'Dubai & Maldives'],
  religious: ['Cairo & St. Catherine', 'Holy Family Trail', 'Mount Sinai & Petra'],
};

const COUNTRY_NAME_BY_DEST: Record<string, string> = {
  egypt: 'Egypt',
  turkey: 'Turkey',
  jordan: 'Jordan',
  morocco: 'Morocco',
  dubai: 'United Arab Emirates',
  tunisia: 'Tunisia',
  greece: 'Greece',
  'multi-country': 'Multi-Country',
  religious: 'Egypt',
};

export const TransferTripModal: React.FC<TransferTripModalProps> = memo(({
  trip,
  tour,
  isOpen,
  open,
  onClose,
  onOpenChange,
  destinations = DEFAULT_DESTINATIONS,
  egyptPackages = DEFAULT_EGYPT_PACKAGES,
}) => {
  const currentLocale = useLocale();
  const isAr = currentLocale === 'ar';
  const queryClient = useQueryClient();

  const isModalOpen = Boolean(isOpen ?? open);
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  // Determine active item (tour or trip)
  const activeSlug = tour?.slug || trip?.slug || '';
  const activeTitle = tour ? getTourTitle(tour, currentLocale) : (trip?.title || '');
  const activePrice =
    tour?.basePriceUsd !== undefined && tour?.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
      ? `$${tour.basePriceUsd}`
      : (trip?.price !== undefined && trip?.price !== null && !isNaN(Number(trip.price)) ? `$${trip.price}` : 'Free');
  const activeDuration = tour?.durationJsonb
    ? ((tour.durationJsonb as any)?.[currentLocale] || (tour.durationJsonb as any)?.ar || (tour.durationJsonb as any)?.en || '')
    : (trip?.duration || '');

  const initialDestination = useMemo(() => {
    if (tour) {
      const canonical = tour.landingPages?.find((lp: any) => lp?.type === 'DESTINATION')?.slug;
      if (canonical) return canonical.toLowerCase();
      const resolved = resolveTourDestination(tour);
      return destinationForCountry(resolved) || 'egypt';
    }
    if (trip) {
      return trip.destination?.toLowerCase() || 'egypt';
    }
    return 'egypt';
  }, [tour, trip]);

  const [selectedDestination, setSelectedDestination] = useState<string>(initialDestination);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setSelectedDestination(initialDestination);
      const currentCat = tour?.category || (trip as any)?.type || (trip as any)?.packageId || '';
      setSelectedPackage(currentCat);
      setSelectedCity(tour?.city || (trip?.accommodation?.[0]?.destination) || '');
    }
  }, [isModalOpen, initialDestination, tour, trip]);

  if (!tour && !trip) return null;

  const currentDestinationObj = destinations.find(
    (d) => d.id.toLowerCase() === initialDestination.toLowerCase()
  ) || destinations[1]; // fallback to Egypt

  const handleDestinationSelect = (destId: string) => {
    const nextDest = destId.toLowerCase();
    setSelectedDestination(nextDest);
    const suggestedCities = CITIES_BY_DESTINATION[nextDest];
    if (suggestedCities && suggestedCities.length > 0) {
      setSelectedCity(suggestedCities[0]);
    }
    if (nextDest !== 'egypt' && nextDest !== 'religious') {
      setSelectedPackage('');
    }
  };

  const handleConfirmTransfer = async () => {
    if (!activeSlug) {
      toast.error(isAr ? 'كود الرحلة غير متوفر' : 'Tour slug is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const targetCountry = COUNTRY_NAME_BY_DEST[selectedDestination] || selectedDestination;

      // Find matched package category if any
      const matchedPkg = egyptPackages.find((p) => p.id === selectedPackage);
      const categoryToSave = matchedPkg ? (matchedPkg as any).categoryName || matchedPkg.titleAr : (selectedPackage || undefined);

      await toursApi.moveTour(activeSlug, {
        destinationSlug: selectedDestination,
        country: targetCountry,
        city: selectedCity || undefined,
        category: categoryToSave,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tours'] }),
        queryClient.invalidateQueries({ queryKey: ['tours', 'catalog-overview'] }),
        queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY }),
      ]);

      const destObj = destinations.find((d) => d.id.toLowerCase() === selectedDestination.toLowerCase());
      const destName = isAr ? (destObj?.nameAr || selectedDestination) : (destObj?.nameEn || selectedDestination);

      toast.success(
        isAr
          ? `تم نقل الرحلة "${activeTitle}" بنجاح إلى وجهة ${destName}!`
          : `Successfully transferred "${activeTitle}" to ${destName}!`
      );

      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      toast.error(
        msg || (isAr ? 'حدث خطأ أثناء نقل الرحلة. يرجى المحاولة مرة أخرى.' : 'Failed to transfer tour. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged =
    selectedDestination !== initialDestination ||
    selectedCity !== (tour?.city || '') ||
    selectedPackage !== (tour?.category || '');

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[88vh] overflow-y-auto bg-card border border-border/80 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 gpu-accelerate">
        {/* Header Banner */}
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0 shadow-xs">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
                <span>{isAr ? 'نقل الرحلة بين الوجهات والباكدجات (Transfer Trip)' : 'Transfer Trip Between Destinations'}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                {isAr
                  ? 'اختر الوجهة السياحية الـ 9 أو البرنامج المخصص لنقل الرحلة فوراً بنقرة واحدة.'
                  : 'Select the destination or specialized package to transfer this tour in one click.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Current Trip Info Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {isAr ? '📍 الرحلة الحالية' : '📍 Current Tour'}
              </span>
              <p className="font-black text-foreground text-sm sm:text-base line-clamp-1">
                {activeTitle}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono text-[11px] text-muted-foreground/80">/{activeSlug}</span>
                <span>•</span>
                <span className="text-amber-500 font-bold font-mono">{activePrice}</span>
                {activeDuration && (
                  <>
                    <span>•</span>
                    <span>{activeDuration}</span>
                  </>
                )}
              </div>
            </div>
            <div className="sm:text-end shrink-0">
              <span className="text-[11px] font-bold text-muted-foreground block">
                {isAr ? 'الوجهة الحالية' : 'Current Destination'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mt-1 shadow-xs">
                <span>{currentDestinationObj?.flag}</span>
                <span>{isAr ? currentDestinationObj?.nameAr : currentDestinationObj?.nameEn}</span>
              </span>
            </div>
          </div>

          {/* 1. Select New Destination Grid (9 Destinations) */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-black text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'اختر الوجهة الجديدة (Select Destination):' : 'Select New Destination:'}</span>
              </span>
              <span className="text-[11px] font-bold text-muted-foreground">
                {destinations.length} {isAr ? 'وجهات سياحية' : 'destinations'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {destinations.map((dest) => {
                const isSelected = selectedDestination.toLowerCase() === dest.id.toLowerCase();
                const flag = dest.flag || DEST_FLAGS[dest.id.toLowerCase()] || '📍';
                const code = dest.code || dest.id.substring(0, 2).toUpperCase();

                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleDestinationSelect(dest.id)}
                    className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-foreground ring-2 ring-amber-500/30 shadow-md shadow-amber-500/20 scale-[1.03]'
                        : 'border-border/70 hover:border-amber-500/40 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-0.5 bg-amber-500 text-slate-950 rounded-full shadow-xs">
                        <Check className="w-3 h-3 stroke-3" />
                      </div>
                    )}
                    <span className="text-xl font-mono font-black text-amber-500 mb-0.5">{code}</span>
                    <span className="text-xs font-black text-foreground">{dest.nameAr}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full font-medium">
                      {dest.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. City / Region Quick Selector */}
          {CITIES_BY_DESTINATION[selectedDestination] && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-300">
              <label className="text-xs font-black text-foreground flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'المدينة / المنطقة المقترحة (City / Region):' : 'City / Region:'}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES_BY_DESTINATION[selectedDestination].map((c) => {
                  const isCitySelected = selectedCity.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCity(c)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                        isCitySelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted/60'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Egypt Custom Packages (When Egypt or Religious is selected) */}
          {(selectedDestination === 'egypt' || selectedDestination === 'religious') && (
            <div className="space-y-3 pt-2 border-t border-border/60 animate-in fade-in duration-300">
              <label className="text-xs sm:text-sm font-black text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'تخصيص لباكدج مصر المخصص (Egypt Custom Package):' : 'Egypt Custom Package Allocation:'}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-500">
                  {isAr ? '5 باقات VIP' : '5 VIP Packages'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {egyptPackages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id || (tour?.category && (pkg as any).categoryName === tour.category);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-foreground ring-2 ring-amber-500/30 shadow-md shadow-amber-500/15 scale-[1.02]'
                          : 'border-border/70 hover:border-amber-500/40 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{pkg.icon}</span>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-black text-foreground truncate">
                          {isAr ? pkg.titleAr : (pkg.titleEn || pkg.titleAr)}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                          {pkg.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 left-3 sm:left-auto sm:right-3 p-0.5 bg-amber-500 text-slate-950 rounded-full shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:justify-end border-t border-border/60 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-2xl w-full sm:w-auto text-xs font-bold px-5 h-10 cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleConfirmTransfer}
            disabled={isSubmitting}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 h-10 shadow-md shadow-amber-500/25 w-full sm:w-auto gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? 'جاري نقل الرحلة...' : 'Transferring...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'تأكيد النقل الآن' : 'Confirm Transfer Now'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

TransferTripModal.displayName = 'TransferTripModal';
