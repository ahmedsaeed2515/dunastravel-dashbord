"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useDataContext } from "@/context/DataContext";
import { TripModel } from "@/types/dunas-suite";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import { TransferTripModal } from "@/components/trips/TransferTripModal";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Compass,
  Plus,
  ArrowRightLeft,
  Edit,
  Trash2,
  Star,
  Flame,
  Calendar,
  Globe2,
  Sparkles,
  CheckCircle2,
  Layers,
  Search,
  Filter,
  Package,
  Globe,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function ToursPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";

  const { trips, destinations, deleteTrip } = useDataContext();
  const [selectedDestId, setSelectedDestId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingTrip, setEditingTrip] = useState<TripModel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const [transferringTrip, setTransferringTrip] = useState<TripModel | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  // Filter trips by destination & search query
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (selectedDestId !== "ALL" && t.destination !== selectedDestId) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.overview.toLowerCase().includes(query) ||
          t.destination.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [trips, selectedDestId, searchQuery]);

  const handleDeleteTrip = useCallback(
    (tripId: string, tripTitle: string) => {
      if (confirm(`هل أنت تأكد من حذف الرحلة "${tripTitle}"؟`)) {
        deleteTrip(tripId);
        toast.success("تم حذف الرحلة بنجاح.");
      }
    },
    [deleteTrip]
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

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header Banner matching Vercel 1:1 */}
      <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0">
              <Globe2 className="w-7 h-7 text-amber-500 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>{isAr ? "إدارة الرحلات والترجمات (Trips & Translations)" : "Trips & Translations Suite"}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
                {isAr
                  ? "إنشاء، تعديل، ونشر الباقات والبرامج السياحية الفاخرة المترجمة للغات الـ 5 (العربية، الإسبانية، البرتغالية، الإنجليزية، الإيطالية)."
                  : "Create, edit, and publish luxury tour itineraries with 5-language translation support."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              onClick={handleOpenNew}
              variant="gold"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة رحلة جديدة ➕" : "Add New Trip ➕"}</span>
            </Button>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xs">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>دعم 5 لغات 🌐</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Active Trips */}
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              {isAr ? "إجمالي الرحلات النشطة" : "Total Active Trips"}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {trips.length} <span className="text-xs font-bold text-amber-500">رحلة 🗺️</span>
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
              100% <span className="text-xs font-bold text-emerald-500">({trips.length}/{trips.length}) 🌐</span>
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
              8 <span className="text-xs font-bold text-sky-500">واجهات 🏖️</span>
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

      {/* 3. Main Views Tabs Switcher matching Vercel */}
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
            <Package className="w-4 h-4" /> {isAr ? "جدول الرحلات والبيانات" : "Tours Data Table"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Trips Grid & 5-Lang Translations */}
        <TabsContent value="grid" className="space-y-6">
          {/* Destination Selector & Search Bar */}
          <Card className="p-4 bg-card border border-border/80 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Destinations Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full lg:w-auto">
                <button
                  onClick={() => setSelectedDestId("ALL")}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border ${
                    selectedDestId === "ALL"
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                      : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  🌐 {isAr ? "جميع الواجهات الـ 8" : "All Destinations"} ({trips.length})
                </button>
                {destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDestId(d.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      selectedDestId === d.id
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    <span>{d.flag}</span>
                    <span>{d.nameAr}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 ltr:left-3 rtl:left-auto" />
                <input
                  type="text"
                  placeholder={isAr ? "البحث باسم الرحلة، السعر..." : "Search trip name, price..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </Card>

          {/* Interactive Trips Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Card
                key={trip.id}
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image Thumbnail */}
                  <div className="h-52 relative overflow-hidden bg-slate-950">
                    <img
                      src={trip.images[0] || "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800"}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                      {trip.popular && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-white" /> الأكثر إقبالاً 🔥
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 shadow-md">
                        ${trip.price}
                      </span>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> {trip.duration}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {trip.rating} ({trip.reviewCount} تقييم)
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h4 className="font-black text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {trip.overview}
                    </p>

                    {/* 5 Languages Translation Status Bar */}
                    <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-amber-500" />
                          {isAr ? "مترجم بالكامل:" : "Translated:"}
                        </span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          5/5 لغات ✓
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
                    onClick={() => handleOpenTransfer(trip)}
                    className="rounded-xl text-xs gap-1.5 font-bold hover:border-amber-500/50 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" /> {isAr ? "نقل الرحلة 🔄" : "Transfer 🔄"}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(trip)}
                      className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl cursor-pointer"
                      title={isAr ? "تعديل الرحلة والترجمات" : "Edit Trip & Translations"}
                    >
                      <Edit className="w-4 h-4 text-amber-500" />
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteTrip(trip.id, trip.title)}
                      className="hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                      title={isAr ? "حذف الرحلة" : "Delete Trip"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
}
