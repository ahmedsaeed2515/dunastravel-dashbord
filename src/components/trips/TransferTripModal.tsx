"use client";

import React, { useState, memo } from 'react';
import { TripModel } from '@/types/dunas-suite';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/features/tours/api/toursApi';
import { LANDING_PAGES_QUERY_KEY } from '@/features/tours/hooks/useLandingPages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Check, Compass, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface TransferTripModalProps {
  trip: TripModel | null;
  isOpen: boolean;
  onClose: () => void;
  destinations: Array<{ id: string; nameAr: string; nameEn: string; flag: string }>;
  egyptPackages: Array<{ id: string; titleAr: string; description: string; icon: string }>;
}

export const TransferTripModal: React.FC<TransferTripModalProps> = memo(({
  trip,
  isOpen,
  onClose,
  destinations,
  egyptPackages,
}) => {
  const queryClient = useQueryClient();
  const [selectedDestination, setSelectedDestination] = useState<string>(
    trip?.destination || 'egypt'
  );
  const [selectedPackage, setSelectedPackage] = useState<string>(
    trip?.packageId || ''
  );

  React.useEffect(() => {
    if (trip) {
      setSelectedDestination(trip.destination);
      setSelectedPackage(trip.packageId || '');
    }
  }, [trip]);

  if (!trip) return null;

  const currentDestinationObj = destinations.find(
    d => d.id === trip.destination
  );

  const handleConfirmTransfer = async () => {
    const countryByDestination: Record<string, string> = {
      egypt: 'Egypt',
      turkey: 'Turkey',
      jordan: 'Jordan',
      morocco: 'Morocco',
      dubai: 'United Arab Emirates',
      tunisia: 'Tunisia',
      greece: 'Greece',
      'multi-country': 'Multi-Country',
    };
    const countryName = countryByDestination[selectedDestination] || selectedDestination;

    try {
      if (!trip.slug) throw new Error('A backend tour slug is required');
      await toursApi.moveTour(trip.slug, {
          destinationSlug: selectedDestination,
          country: countryName,
          category: selectedPackage || undefined,
        });
      await queryClient.invalidateQueries({ queryKey: ['tours'] });
      await queryClient.invalidateQueries({ queryKey: ['tours', 'catalog-overview'] });
      await queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
    } catch {
      toast.error('تعذر نقل الرحلة في قاعدة البيانات. لم يتم تطبيق أي تغيير.');
      return;
    }

    const destObj = destinations.find(d => d.id === selectedDestination);
    toast.success(
      `تم نقل الرحلة "${trip.title}" بنجاح إلى ${destObj?.nameAr || selectedDestination} وحفظها في قاعدة البيانات!`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[88vh] overflow-y-auto bg-card border border-border/80 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 gpu-accelerate">
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-foreground">
                نقل الرحلة بين الوجهات والباكدجات (Transfer Trip)
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                اختر الوجهة السياحية الـ 8 أو البرنامج المخصص لنقل الرحلة فوراً بنقرة واحدة.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Current Trip Info */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                الرحلة الحالية
              </span>
              <p className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                {trip.title}
              </p>
              <span className="text-xs text-amber-500 font-medium">
                ${trip.price} • {trip.duration}
              </span>
            </div>
            <div className="sm:text-end shrink-0">
              <span className="text-xs text-muted-foreground block">
                الوجهة الحالية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mt-1">
                <span>{currentDestinationObj?.flag}</span>
                <span>{currentDestinationObj?.nameAr || trip.destination}</span>
              </span>
            </div>
          </div>

          {/* Select New Destination */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              اختر الوجهة الجديدة (Select Destination):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {destinations.map(dest => {
                const isSelected = selectedDestination === dest.id;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setSelectedDestination(dest.id);
                      if (dest.id !== 'egypt') setSelectedPackage('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-foreground ring-2 ring-amber-500/30 scale-[1.03]'
                        : 'border-border/70 hover:border-amber-500/40 bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{dest.flag}</span>
                    <span className="text-xs font-bold">{dest.nameAr}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full">
                      {dest.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Destination is Egypt, Allow Assigning to Egypt 5 Custom Packages */}
          {selectedDestination === 'egypt' && (
            <div className="space-y-3 pt-2 animate-in fade-in duration-300">
              <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                تخصيص لباكدج مصر المخصص (Egypt Custom Package):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {egyptPackages.map(pkg => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-200 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500/30 scale-[1.01]'
                          : 'border-border/60 hover:border-amber-500/30 bg-muted/20 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{pkg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">
                          {pkg.titleAr}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {pkg.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:justify-end border-t border-border/60 pt-4 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl w-full sm:w-auto">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 w-full sm:w-auto"
          >
            تأكيد النقل الآن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

TransferTripModal.displayName = 'TransferTripModal';
