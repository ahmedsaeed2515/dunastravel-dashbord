"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useDataContext } from '@/context/DataContext';
import { TripModel } from '@/types/dunas-suite';
import { TripEditorModal } from '@/components/trips/TripEditorModal';
import { TransferTripModal } from '@/components/trips/TransferTripModal';
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
} from 'lucide-react';
import { toast } from 'sonner';

export const DestinationsManager: React.FC = React.memo(() => {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isAr = locale === 'ar';

  const { destinations, egyptPackages, trips, deleteTrip } = useDataContext();
  const [activeDestId, setActiveDestId] = useState<string>('egypt');
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  const [editingTrip, setEditingTrip] = useState<TripModel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const [transferringTrip, setTransferringTrip] = useState<TripModel | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  const activeDestination = useMemo(() => {
    return destinations.find(d => d.id === activeDestId) || destinations[0];
  }, [destinations, activeDestId]);

  // Pre-calculate trip count map per destination
  const tripCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of trips) {
      map[t.destination] = (map[t.destination] || 0) + 1;
    }
    return map;
  }, [trips]);

  // Filter trips by active destination and optional package filter
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      if (t.destination !== activeDestId) return false;
      if (activePackageId && t.packageId !== activePackageId) return false;
      return true;
    });
  }, [trips, activeDestId, activePackageId]);

  const handleDeleteTrip = useCallback((tripId: string, tripTitle: string) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف الرحلة "${tripTitle}"؟`
      : `Are you sure you want to delete "${tripTitle}"?`;
    if (confirm(confirmMsg)) {
      deleteTrip(tripId);
      toast.success(isAr ? 'تم حذف الرحلة بنجاح.' : 'Tour deleted successfully.');
    }
  }, [deleteTrip, isAr]);

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

  const getTripTitle = (trip: TripModel): string => {
    const trans = trip.translations as Record<string, any> | undefined;
    if (trans && trans[locale]?.title) {
      return String(trans[locale].title);
    }
    return isAr ? trip.title : String(trans?.en?.title || trip.title || '');
  };

  const getTripOverview = (trip: TripModel): string => {
    const trans = trip.translations as Record<string, any> | undefined;
    if (trans && trans[locale]?.overview) {
      return String(trans[locale].overview);
    }
    return isAr ? trip.overview : String(trans?.en?.overview || trip.overview || '');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 8 Destinations Tab Switcher Bar */}
      <div className="bg-card border border-border/80 rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {destinations.map(dest => {
            const isSelected = activeDestId === dest.id;
            const destTripCount = tripCountMap[dest.id] || 0;
            const destName = isAr ? dest.nameAr : dest.nameEn;
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
                <span>{destName}</span>
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                  {isAr
                    ? `وجهة ${activeDestination.nameAr} (${activeDestination.nameEn})`
                    : `${activeDestination.nameEn} Destination (${activeDestination.nameAr})`}
                </h2>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold">
                  {isAr ? `${filteredTrips.length} رحلة نشطة` : `${filteredTrips.length} Active Tours`}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium leading-relaxed">
                {isAr ? activeDestination.description : (activeDestination.description || activeDestination.nameEn)}
              </p>
            </div>
          </div>

          <Button onClick={handleOpenNew} className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-sm gap-2 shrink-0 cursor-pointer">
            <Plus className="w-4 h-4" /> 
            {isAr
              ? `إضافة رحلة جديدة لوجهة ${activeDestination.nameAr}`
              : `Add New Tour for ${activeDestination.nameEn}`}
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
                <span>
                  {isAr
                    ? `السكشن الأول: الرحلات الرئيسية لوجهة ${activeDestination.nameAr}`
                    : `Section 1: Main Tours & Excursions for ${activeDestination.nameEn}`}
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {isAr
                  ? `عرض وإدارة كافة الرحلات والمزارات السياحية الأساسية المتاحة للعملاء (${filteredTrips.length} رحلة).`
                  : `View and manage all primary travel itineraries and tourist excursions (${filteredTrips.length} tours).`}
              </p>
            </div>
          </div>

          {activePackageId && (
            <Button size="xs" variant="gold" onClick={() => setActivePackageId(null)} className="text-xs gap-1.5 font-bold cursor-pointer">
              <Filter className="w-3.5 h-3.5" /> 
              {isAr ? `عرض كافة رحلات ${activeDestination.nameAr}` : `Show all ${activeDestination.nameEn} tours`}
            </Button>
          )}
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              {isAr ? 'لا توجد رحلات مسجلة في هذه الوجهة حالياً.' : 'No tours currently registered under this destination.'}
            </p>
            <Button onClick={handleOpenNew} size="sm" className="rounded-xl bg-amber-500 text-slate-950 font-bold">
              {isAr ? 'إضافة رحلة جديدة' : 'Add New Tour'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map(trip => {
              const tripTitle = getTripTitle(trip);
              const tripOverview = getTripOverview(trip);
              const tripImage = trip.images?.[0] || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800';

              return (
                <div
                  key={trip.id}
                  className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Hero */}
                    <div className="h-48 relative overflow-hidden bg-slate-900">
                      <img
                        src={tripImage}
                        alt={tripTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                        {trip.popular && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {isAr ? 'الأكثر إقبالاً' : 'Popular'}
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
                        {tripTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tripOverview}
                      </p>

                      {/* Category Tags icons */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                        {trip.familyFriendly && <span title={isAr ? 'عائلية' : 'Family'}>👨‍👩‍👧‍👦 {isAr ? 'عائلية' : 'Family'}</span>}
                        {trip.honeymoon && <span title={isAr ? 'شهر عسل' : 'Honeymoon'}>💍 {isAr ? 'شهر عسل' : 'Honeymoon'}</span>}
                        {trip.luxury && <span title={isAr ? 'فاخرة VIP' : 'VIP'}>⭐ VIP</span>}
                        {trip.cultural && <span title={isAr ? 'ثقافية' : 'Culture'}>🏛️ {isAr ? 'ثقافية' : 'Culture'}</span>}
                        <span className="ms-auto text-[11px] font-bold text-amber-600 dark:text-amber-400">{trip.hotelCategory}</span>
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
                      {isAr ? 'نقل الرحلة' : 'Transfer Tour'}
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
                        onClick={() => handleDeleteTrip(trip.id, tripTitle)}
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
                  <span>
                    {isAr
                      ? 'السكشن الثاني: الباكدجات والبرامج الخاصة بمصر الـ 5 (Egypt VIP Packages)'
                      : 'Section 2: Bespoke Egypt Packages Suite (5 VIP Programs)'}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  {isAr
                    ? 'عرض كامل وتفصيلي لباكدجات مصر الشاملة المخصصة للعملاء مع الفلترة والإدارة المباشرة.'
                    : 'Comprehensive showcase of curated Egypt packages with real-time tour assignment and filtering.'}
                </p>
              </div>
            </div>

            {activePackageId && (
              <Button size="xs" variant="ghost" onClick={() => setActivePackageId(null)} className="text-xs text-amber-500 font-bold cursor-pointer">
                {isAr ? 'عرض كافة الباكدجات' : 'Show All Packages'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {egyptPackages.map(pkg => {
              const isSelected = activePackageId === pkg.id;
              const pkgTrips = trips.filter(t => t.destination === 'egypt' && t.packageId === pkg.id);
              const pkgTitle = isAr ? pkg.titleAr : pkg.titleEn;

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
                          {isAr ? pkg.badge : 'Top Choice'}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-foreground group-hover:text-amber-500 transition-colors">
                        {pkgTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Associated Trips Info */}
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-amber-500" />
                        {isAr ? 'الرحلات المربوطة بالباكج:' : 'Associated Tours:'}
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-sm">
                        {pkgTrips.length} {isAr ? 'رحلات 🔗' : 'tours 🔗'}
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
                          <span>{isAr ? 'عرض كافة رحلات مصر' : 'Show All Egypt Tours'}</span>
                        </>
                      ) : (
                        <>
                          <Filter className="w-4 h-4 text-amber-500" />
                          <span>{isAr ? `تصفية الرحلات لـ ${pkg.type} 🔍` : `Filter tours by ${pkg.type} 🔍`}</span>
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
        />
      )}
    </div>
  );
});

DestinationsManager.displayName = 'DestinationsManager';

