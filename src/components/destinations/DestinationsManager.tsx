"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from '@/context/DataContext';
import { TripModel } from '@/types/dunas-suite';
import { TripEditorModal } from '@/components/trips/TripEditorModal';
import { TransferTripModal } from '@/components/trips/TransferTripModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export const DestinationsManager: React.FC = React.memo(() => {
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

  // Pre-calculate trip count map per destination for 60fps instant switching
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
    if (confirm(`هل أنت تأكد من حذف الرحلة "${tripTitle}"؟`)) {
      deleteTrip(tripId);
      toast.success('تم حذف الرحلة بنجاح.');
    }
  }, [deleteTrip]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 ${
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
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                {activeDestination.description}
              </p>
            </div>
          </div>

          <Button onClick={handleOpenNew} className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-sm gap-2">
            <Plus className="w-4 h-4" /> إضافة رحلة جديدة لوجهة {activeDestination.nameAr}
          </Button>
        </div>
      </div>

      {/* Special Egypt Packages Section */}
      {activeDestId === 'egypt' && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold font-heading text-foreground">
                باكدجات مصر الـ 5 المخصصة (Egypt Special Programs)
              </h3>
            </div>
            {activePackageId && (
              <Button size="xs" variant="ghost" onClick={() => setActivePackageId(null)} className="text-xs text-amber-500">
                عرض كافة رحلات مصر
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {egyptPackages.map(pkg => {
              const isSelected = activePackageId === pkg.id;
              const pkgTripsCount = trips.filter(t => t.destination === 'egypt' && t.packageId === pkg.id).length;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setActivePackageId(isSelected ? null : pkg.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-start transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-border/70 hover:border-amber-500/40 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-2xl">{pkg.icon}</span>
                    {pkg.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground line-clamp-1 mb-1">
                    {pkg.titleAr}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">
                    {pkg.description}
                  </p>
                  <span className="text-[10px] font-extrabold text-amber-500 mt-auto">
                    {pkgTripsCount} رحلات مرتبطة
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trips Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-foreground">
            قائمة الرحلات المتاحة ({filteredTrips.length})
          </h3>
        </div>

        {filteredTrips.length === 0 ? (
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
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md flex flex-col"
              >
                {/* Image Hero */}
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  <img
                    src={trip.images[0] || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                    {trip.popular && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs flex items-center gap-1">
                        <Flame className="w-3 h-3" /> الأكثر إقبالاً
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 text-amber-400 backdrop-blur-md border border-amber-400/20">
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
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {trip.overview}
                    </p>
                  </div>

                  {/* Category Tags icons */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                    {trip.familyFriendly && <span title="عائلية">👨‍👩‍👧‍👦</span>}
                    {trip.honeymoon && <span title="شهر عسل">💍</span>}
                    {trip.luxury && <span title="فاخرة VIP">⭐ VIP</span>}
                    {trip.cultural && <span title="ثقافية">🏛️</span>}
                    {trip.adventure && <span title="مغامرة">🐪</span>}
                    <span className="ms-auto text-[11px] text-muted-foreground">{trip.hotelCategory}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTransfer(trip)}
                      className="rounded-xl text-xs gap-1 hover:border-amber-500/50"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> نقل الرحلة
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(trip)}
                        className="hover:bg-amber-500/10 hover:text-amber-500"
                        title="تعديل الرحلة"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDeleteTrip(trip.id, trip.title)}
                        className="hover:bg-destructive/10 text-destructive"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
