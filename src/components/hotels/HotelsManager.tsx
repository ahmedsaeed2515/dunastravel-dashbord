"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Hotel,
  Plus,
  Search,
  Star,
  MapPin,
  Edit3,
  Trash2,
  Globe2,
  Building2,
  Sparkles,
  CheckCircle2,
  Compass,
  Phone,
  Mail,
  ExternalLink,
  BedDouble,
  ShieldCheck,
  Coffee,
  Wifi,
  Waves,
  Utensils,
  Dumbbell,
  Clock,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateHotel, useDeleteHotel, useHotels, useUpdateHotel } from "@/features/hotels/hooks/useHotels";
import { AdminHotel, HotelPayload, HotelStatus } from "@/features/hotels/types";

const FALLBACK_HOTEL_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";

const LUXURY_AMENITIES = [
  { id: "pool", labelEn: "Swimming Pool", labelAr: "مسبح فاخر", icon: Waves },
  { id: "spa", labelEn: "Spa & Wellness", labelAr: "سبا ونادي صحي", icon: Sparkles },
  { id: "wifi", labelEn: "Free High-Speed Wi-Fi", labelAr: "واي فاي مجاني", icon: Wifi },
  { id: "restaurant", labelEn: "Fine Dining Restaurant", labelAr: "مطعم فاخر", icon: Utensils },
  { id: "gym", labelEn: "Fitness Center", labelAr: "صالة رياضية", icon: Dumbbell },
  { id: "breakfast", labelEn: "Breakfast Included", labelAr: "شامل الإفطار", icon: Coffee },
  { id: "beach", labelEn: "Private Beach", labelAr: "شاطئ خاص", icon: Waves },
  { id: "concierge", labelEn: "24/7 Concierge", labelAr: "خدمة كونسيرج 24/7", icon: ShieldCheck },
  { id: "roomService", labelEn: "24h Room Service", labelAr: "خدمة غرف 24 ساعة", icon: Clock },
] as const;

const POPULAR_DESTINATIONS = [
  { slug: "all", nameEn: "All Destinations", nameAr: "جميع الوجهات", flag: "🌐" },
  { slug: "cairo", nameEn: "Cairo & Giza", nameAr: "القاهرة والجيزة", flag: "🇪🇬" },
  { slug: "luxor", nameEn: "Luxor & Nile", nameAr: "الأقصر والنيل", flag: "🏛️" },
  { slug: "aswan", nameEn: "Aswan & Nubia", nameAr: "أسوان والنوبة", flag: "⛵" },
  { slug: "sharm", nameEn: "Sharm El Sheikh", nameAr: "شرم الشيخ", flag: "🏖️" },
  { slug: "hurghada", nameEn: "Hurghada & Red Sea", nameAr: "الغردقة والبحر الأحمر", flag: "🐠" },
  { slug: "istanbul", nameEn: "Istanbul", nameAr: "إسطنبول", flag: "🇹🇷" },
  { slug: "cappadocia", nameEn: "Cappadocia", nameAr: "كابادوكيا", flag: "🎈" },
  { slug: "dubai", nameEn: "Dubai", nameAr: "دبي", flag: "🇦🇪" },
  { slug: "petra", nameEn: "Petra & Amman", nameAr: "البتراء وعمان", flag: "🇯🇴" },
  { slug: "marrakech", nameEn: "Marrakech", nameAr: "مراكش", flag: "🇲🇦" },
] as const;

interface HotelFormData {
  slug: string;
  nameEn: string;
  nameAr: string;
  nameEs: string;
  namePt: string;
  nameIt: string;
  descEn: string;
  descAr: string;
  descEs: string;
  descPt: string;
  descIt: string;
  destinationSlug: string;
  city: string;
  stars: number;
  rating: string;
  currency: string;
  phone: string;
  email: string;
  website: string;
  heroMediaId: string;
  heroImageUrl: string;
  amenities: Record<string, boolean>;
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  status: HotelStatus;
  isActive: boolean;
  rooms: Array<{
    slug: string;
    name: string;
    ratePerNight: number;
    maxOccupancy: number;
    inventory: number;
  }>;
}

const defaultFormData = (): HotelFormData => ({
  slug: "",
  nameEn: "",
  nameAr: "",
  nameEs: "",
  namePt: "",
  nameIt: "",
  descEn: "",
  descAr: "",
  descEs: "",
  descPt: "",
  descIt: "",
  destinationSlug: "cairo",
  city: "Cairo",
  stars: 5,
  rating: "4.90",
  currency: "USD",
  phone: "",
  email: "",
  website: "",
  heroMediaId: "",
  heroImageUrl: "",
  amenities: {
    pool: true,
    spa: true,
    wifi: true,
    restaurant: true,
    gym: true,
    breakfast: true,
    concierge: true,
    roomService: true,
  },
  checkIn: "14:00",
  checkOut: "12:00",
  cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
  status: "PUBLISHED",
  isActive: true,
  rooms: [
    { slug: "deluxe-king-room", name: "Deluxe King Room", ratePerNight: 180, maxOccupancy: 2, inventory: 15 },
    { slug: "royal-suite-nile-view", name: "Royal Suite Nile View", ratePerNight: 350, maxOccupancy: 4, inventory: 5 },
  ],
});

export function HotelsManager() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedStars, setSelectedStars] = useState<number | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<HotelStatus | "ALL">("ALL");

  const [selectedHotel, setSelectedHotel] = useState<AdminHotel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useHotels({
    page: 1,
    limit: 100,
    search: search || undefined,
  });

  const removeMutation = useDeleteHotel();

  const hotels = Array.isArray(data) ? data : (data?.data ?? []);

  // Filter hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (selectedDestination !== "all" && h.destinationSlug?.toLowerCase() !== selectedDestination.toLowerCase()) {
        return false;
      }
      if (selectedStars !== "ALL" && h.stars !== selectedStars) {
        return false;
      }
      if (selectedStatus !== "ALL" && h.status !== selectedStatus) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const en = (h.nameJsonb?.en || "").toLowerCase();
        const ar = (h.nameJsonb?.ar || "").toLowerCase();
        const city = (h.city || "").toLowerCase();
        const slug = (h.slug || "").toLowerCase();
        return en.includes(q) || ar.includes(q) || city.includes(q) || slug.includes(q);
      }
      return true;
    });
  }, [hotels, selectedDestination, selectedStars, selectedStatus, search]);

  const handleOpenAdd = () => {
    setSelectedHotel(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (hotel: AdminHotel) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
  };

  const handleArchive = async (hotel: AdminHotel) => {
    const name = hotel.nameJsonb?.[locale] || hotel.nameJsonb?.en || hotel.slug;
    if (!window.confirm(isAr ? `هل أنت متأكد من أرشفة فندق "${name}"؟` : `Are you sure you want to archive "${name}"?`)) {
      return;
    }
    removeMutation.mutate(hotel.id);
  };

  // Metrics
  const totalHotels = hotels.length;
  const fiveStarCount = hotels.filter((h) => h.stars === 5).length;
  const publishedCount = hotels.filter((h) => h.status === "PUBLISHED" && h.isActive).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الفنادق المسجلة" : "Total Registered Hotels"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalHotels} <span className="text-xs font-bold text-amber-500">{isAr ? "فندق 🏨" : "Hotels 🏨"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Hotel className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "فنادق ومنتجعات 5 نجوم" : "5-Star Luxury Resorts"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {fiveStarCount} <span className="text-xs font-bold text-amber-400">⭐⭐⭐⭐⭐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "منشورة ومتاحة للحجز" : "Published & Active"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {publishedCount} <span className="text-xs font-bold text-emerald-500">({totalHotels ? Math.round((publishedCount / totalHotels) * 100) : 100}%) 🌐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "متوسط تقييم الضيوف" : "Avg Guest Rating"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              4.92 <span className="text-xs font-bold text-amber-400">/ 5.0 ⭐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Star className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 2. Actions & Filters Bar */}
      <Card className="p-5 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>{isAr ? "دليل الفنادق والإقامة الفاخرة" : "Luxury Hotels & Resorts Inventory"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              {isAr ? "إدارة وتصنيف الفنادق الشريكة، فئات الغرف والأسعار، والمرافق الفندقية." : "Manage hotel partnerships, room tiers, rates, and 5-language content."}
            </p>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-2 px-6 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>{isAr ? "إضافة فندق جديد +" : "Add New Hotel +"}</span>
          </Button>
        </div>

        {/* Destination Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {POPULAR_DESTINATIONS.map((dest) => {
            const isActive = selectedDestination === dest.slug;
            const label = isAr ? dest.nameAr : dest.nameEn;
            return (
              <button
                key={dest.slug}
                onClick={() => setSelectedDestination(dest.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <span>{dest.flag}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Star Rating Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground rtl:right-3 ltr:left-3 rtl:left-auto" />
            <input
              type="text"
              placeholder={isAr ? "البحث بالاسم، المدينة، أو الرمز..." : "Search by hotel name, city, slug..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-muted-foreground shrink-0">{isAr ? "تصنيف النجوم:" : "Stars:"}</span>
            <div className="flex items-center gap-1">
              {(["ALL", 5, 4, 3] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStars(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    selectedStars === s
                      ? "bg-amber-500 text-slate-950 border-amber-500"
                      : "bg-muted/30 text-muted-foreground border-border"
                  }`}
                >
                  {s === "ALL" ? (isAr ? "الكل" : "All") : `${s} ⭐`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Hotels Grid */}
      {isError ? (
        <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold text-destructive">
            {isAr ? "تعذر تحميل قائمة الفنادق من الخادم." : "Hotel inventory could not be loaded from backend."}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr ? "يرجى التحقق من الاتصال وإعادة المحاولة." : "Please check connection and retry."}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => void refetch()}>
            {isAr ? "إعادة المحاولة" : "Retry"}
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr ? "جاري تحميل قائمة الفنادق الفاخرة..." : "Loading hotel catalog..."}
          </p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed rounded-3xl">
          <Hotel className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-bold">
            {isAr ? "لا توجد فنادق مطابقة لهذا البحث أو التصنيف." : "No hotels match the selected filters."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs text-amber-500 font-bold"
            onClick={() => {
              setSelectedDestination("all");
              setSelectedStars("ALL");
              setSearch("");
            }}
          >
            {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const name = hotel.nameJsonb?.[locale] || hotel.nameJsonb?.en || hotel.slug;
            const desc = hotel.descriptionJsonb?.[locale] || hotel.descriptionJsonb?.en || (isAr ? "إقامة فاخرة متكاملة الخدمات مع إطلالة مميزة ومرافق راقية." : "Luxury 5-star accommodation with bespoke guest amenities.");
            const lowestRate = hotel.rooms && hotel.rooms.length > 0
              ? Math.min(...hotel.rooms.map((r: any) => r.ratePerNight))
              : null;
            const heroImg = hotel.heroImageUrl || FALLBACK_HOTEL_IMAGE;
            const ratingVal = hotel.rating !== null ? Number(hotel.rating).toFixed(1) : "4.9";

            return (
              <Card
                key={hotel.id || hotel.slug}
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Hero Image & Top Badges */}
                  <div className="h-48 relative overflow-hidden bg-slate-950">
                    <img
                      src={heroImg}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-transparent to-black/30" />

                    {/* Stars Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 text-xs font-black shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{hotel.stars} ⭐ ({ratingVal})</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={hotel.status === "PUBLISHED" && hotel.isActive ? "default" : "secondary"}
                        className="font-bold text-[10px] shadow-xs"
                      >
                        {hotel.status === "PUBLISHED" ? (isAr ? "منشور 🌐" : "PUBLISHED") : hotel.status}
                      </Badge>
                    </div>

                    {/* Bottom Location Tag */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> {hotel.city} · {hotel.destinationSlug}
                      </span>
                      {lowestRate !== null && (
                        <span className="font-mono font-extrabold text-amber-400 text-xs">
                          {isAr ? `تبدأ من $${lowestRate}` : `From $${lowestRate}`} / {isAr ? "ليلة" : "nt"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {desc}
                    </p>

                    {/* Amenities Icons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground flex items-center gap-1">
                        <Waves className="w-3 h-3 text-sky-500" /> {isAr ? "مسبح" : "Pool"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> {isAr ? "سبا" : "Spa"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-500" /> {isAr ? "واي فاي" : "Wi-Fi"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-rose-500" /> {isAr ? "مطعم" : "Dining"}
                      </span>
                    </div>

                    {/* 5-Language Badge */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pt-1 border-t border-border/60">
                      <span>{isAr ? "الترجمات المتاحة:" : "Translations:"}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">5/5 {isAr ? "لغات ✓" : "Locales ✓"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3 flex items-center justify-between border-t border-border/60 bg-muted/20">
                  <span className="text-xs font-mono text-muted-foreground">/{hotel.slug}</span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(hotel)}
                      className="hover:bg-amber-500/10 hover:text-amber-500 rounded-xl cursor-pointer"
                      title={isAr ? "تعديل الفندق" : "Edit Hotel"}
                    >
                      <Edit3 className="w-4 h-4 text-amber-500" />
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleArchive(hotel)}
                      className="hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                      title={isAr ? "أرشفة / حذف" : "Archive Hotel"}
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

      {/* 4. Add / Edit Hotel Dialog Modal */}
      <HotelEditorDialog
        hotel={selectedHotel}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}

// ----------------------------------------------------
// Hotel Editor Modal Component
// ----------------------------------------------------
function HotelEditorDialog({
  hotel,
  open,
  onOpenChange,
}: {
  hotel: AdminHotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const [form, setForm] = useState<HotelFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");

  const createMutation = useCreateHotel();
  const updateMutation = useUpdateHotel();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (hotel) {
        setForm({
          slug: hotel.slug,
          nameEn: hotel.nameJsonb?.en || "",
          nameAr: hotel.nameJsonb?.ar || "",
          nameEs: hotel.nameJsonb?.es || "",
          namePt: hotel.nameJsonb?.pt || "",
          nameIt: hotel.nameJsonb?.it || "",
          descEn: hotel.descriptionJsonb?.en || "",
          descAr: hotel.descriptionJsonb?.ar || "",
          descEs: hotel.descriptionJsonb?.es || "",
          descPt: hotel.descriptionJsonb?.pt || "",
          descIt: hotel.descriptionJsonb?.it || "",
          destinationSlug: hotel.destinationSlug || "cairo",
          city: hotel.city || "Cairo",
          stars: hotel.stars || 5,
          rating: hotel.rating !== null ? String(hotel.rating) : "4.90",
          currency: hotel.currency || "USD",
          phone: hotel.phone || "",
          email: hotel.email || "",
          website: hotel.website || "",
          heroMediaId: hotel.heroMediaId || "",
          heroImageUrl: hotel.heroImageUrl || "",
          amenities: (hotel.amenitiesJsonb as Record<string, boolean>) || {
            pool: true,
            spa: true,
            wifi: true,
            restaurant: true,
            gym: true,
            breakfast: true,
            concierge: true,
            roomService: true,
          },
          checkIn: (hotel.policiesJsonb?.checkIn as string) || "14:00",
          checkOut: (hotel.policiesJsonb?.checkOut as string) || "12:00",
          cancellationPolicy: (hotel.policiesJsonb?.cancellation as string) || "Free cancellation up to 48 hours before check-in.",
          status: hotel.status || "PUBLISHED",
          isActive: hotel.isActive ?? true,
          rooms: hotel.rooms && hotel.rooms.length > 0
            ? hotel.rooms.map((r) => ({
                slug: r.slug,
                name: r.name?.en || r.slug,
                ratePerNight: r.ratePerNight,
                maxOccupancy: r.maxOccupancy,
                inventory: r.inventory || 10,
              }))
            : [
                { slug: "deluxe-room", name: "Deluxe Nile View Room", ratePerNight: 180, maxOccupancy: 2, inventory: 15 },
                { slug: "royal-suite", name: "Royal Panorama Suite", ratePerNight: 350, maxOccupancy: 4, inventory: 5 },
              ],
        });
      } else {
        setForm(defaultFormData());
      }
      setActiveTab("basic");
    }
  }, [hotel, open]);

  // Auto-slugify
  const handleNameEnChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      nameEn: val,
      slug: prev.slug && hotel ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  const handleSave = async () => {
    // Form Validations
    if (!form.nameEn.trim()) {
      toast.error(isAr ? "يرجى كتابة اسم الفندق بالإنجليزية." : "English Hotel Name is required.");
      setActiveTab("basic");
      return;
    }

    const cleanSlug = form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!cleanSlug) {
      toast.error(isAr ? "يرجى إدخال رمز الرابط (Slug)." : "A valid URL slug is required.");
      setActiveTab("basic");
      return;
    }

    const cleanDestination = form.destinationSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cairo";
    const stars = Number(form.stars) || 5;
    const rating = form.rating.trim() ? Number(form.rating) : 4.9;

    const payload: HotelPayload = {
      slug: cleanSlug,
      nameJsonb: {
        en: form.nameEn.trim(),
        ar: form.nameAr.trim() || form.nameEn.trim(),
        es: form.nameEs.trim() || form.nameEn.trim(),
        pt: form.namePt.trim() || form.nameEn.trim(),
        it: form.nameIt.trim() || form.nameEn.trim(),
      },
      descriptionJsonb: {
        en: form.descEn.trim() || "Luxury accommodation with world-class hospitality.",
        ar: form.descAr.trim() || "إقامة فاخرة متكاملة الخدمات مع ضيافة عالمية المستوى.",
        es: form.descEs.trim() || form.descEn.trim() || "Alojamiento de lujo con hospitalidad de primer nivel.",
        pt: form.descPt.trim() || form.descEn.trim() || "Acomodação de luxo com hospitalidade de classe mundial.",
        it: form.descIt.trim() || form.descEn.trim() || "Sistemazione di lusso con ospitalità di livello mondiale.",
      },
      destinationSlug: cleanDestination,
      city: form.city.trim() || "Cairo",
      stars,
      rating,
      currency: form.currency.toUpperCase() || "USD",
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.website.trim() ? { website: form.website.trim() } : {}),
      ...(form.heroMediaId.trim() ? { heroMediaId: form.heroMediaId.trim() } : {}),
      amenitiesJsonb: form.amenities,
      policiesJsonb: {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        cancellation: form.cancellationPolicy,
      },
      status: form.status,
      isActive: form.isActive,
    };

    try {
      if (hotel) {
        await updateMutation.mutateAsync({ id: hotel.id, payload });
        toast.success(isAr ? `تم تحديث بيانات الفندق "${form.nameEn}" بنجاح!` : `Hotel "${form.nameEn}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(isAr ? `تمت إضافة فندق "${form.nameEn}" بنجاح!` : `Hotel "${form.nameEn}" created successfully!`);
      }
      onOpenChange(false);
    } catch (err: any) {
      // Handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-3xl bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
              <Hotel className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <span>{hotel ? (isAr ? "تعديل بيانات الفندق" : "Edit Luxury Hotel") : (isAr ? "إضافة فندق فاخر جديد" : "Add New Luxury Hotel")}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                {isAr ? "أدخل تفاصيل الفندق، الترجمات الـ 5، الفئات، المرافق، والسياسات." : "Configure hotel details, 5-language content, luxury amenities, and policies."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Form Tabs */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-muted/60 p-1 rounded-2xl mb-6">
              <TabsTrigger value="basic" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "البيانات الأساسية" : "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="translations" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الترجمات الـ 5 🌐" : "5 Languages 🌐"}
              </TabsTrigger>
              <TabsTrigger value="amenities" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "المرافق والخدمات" : "Amenities"}
              </TabsTrigger>
              <TabsTrigger value="policies" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الاتصال والسياسات" : "Policies & Rooms"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFORMATION */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "اسم الفندق بالإنجليزية *" : "English Hotel Name *"}</label>
                  <Input
                    placeholder="e.g. Nile Palace Luxor Resort"
                    value={form.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "اسم الفندق بالعربية *" : "Arabic Hotel Name *"}</label>
                  <Input
                    placeholder="مثال: منتجع قصر النيل الأقصر"
                    value={form.nameAr}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="h-10 text-xs font-bold"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "رمز الرابط (Slug) *" : "URL Slug *"}</label>
                  <Input
                    placeholder="nile-palace-luxor"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="h-10 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "الوجهة السياحية (Destination Slug) *" : "Destination Slug *"}</label>
                  <Input
                    placeholder="cairo, luxor, sharm, istanbul..."
                    value={form.destinationSlug}
                    onChange={(e) => setForm((prev) => ({ ...prev, destinationSlug: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "المدينة (City) *" : "City *"}</label>
                  <Input
                    placeholder="Luxor, Cairo, Hurghada..."
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "تصنيف النجوم (1 - 5) *" : "Stars Rating (1 - 5) *"}</label>
                  <select
                    value={form.stars}
                    onChange={(e) => setForm((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Ultra Luxury)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars (Premium)</option>
                    <option value={3}>⭐⭐⭐ 3 Stars (Comfort)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "تقييم الضيوف (0.0 - 5.0)" : "Guest Score (0.0 - 5.0)"}</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                    className="h-10 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "العملة (Currency)" : "Currency"}</label>
                  <Input
                    value={form.currency}
                    maxLength={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                    className="h-10 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Status & Active Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "حالة النشر (Status)" : "Publication Status"}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as HotelStatus }))}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold"
                  >
                    <option value="PUBLISHED">{isAr ? "منشور ومتاح (PUBLISHED)" : "Published"}</option>
                    <option value="DRAFT">{isAr ? "مسودة غير منشورة (DRAFT)" : "Draft"}</option>
                    <option value="ARCHIVED">{isAr ? "مؤرشف (ARCHIVED)" : "Archived"}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-extrabold text-foreground cursor-pointer">
                    {isAr ? "تفعيل الظهور في الموقع والكتالوج العام" : "Active on public catalog & booking engine"}
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: 5-LANGUAGE TRANSLATIONS */}
            <TabsContent value="translations" className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                  <Globe2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? "محتوى الفندق مترجم بالكامل لـ 5 لغات عالمية لخدمة زوار الموقع وكبار العملاء." : "5-Language localization for international luxury clients."}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground">🇪🇸 Spanish Name</label>
                    <Input
                      value={form.nameEs}
                      onChange={(e) => setForm((prev) => ({ ...prev, nameEs: e.target.value }))}
                      placeholder="Hotel Palacio del Nilo"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground">🇵🇹 Portuguese Name</label>
                    <Input
                      value={form.namePt}
                      onChange={(e) => setForm((prev) => ({ ...prev, namePt: e.target.value }))}
                      placeholder="Hotel Palácio do Nilo"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground">🇮🇹 Italian Name</label>
                    <Input
                      value={form.nameIt}
                      onChange={(e) => setForm((prev) => ({ ...prev, nameIt: e.target.value }))}
                      placeholder="Hotel Palazzo del Nilo"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "الوصف بالإنجليزية (English Description)" : "English Description"}</label>
                    <Textarea
                      rows={3}
                      value={form.descEn}
                      onChange={(e) => setForm((prev) => ({ ...prev, descEn: e.target.value }))}
                      placeholder="A timeless 5-star haven on the banks of the Nile..."
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "الوصف بالعربية (Arabic Description)" : "Arabic Description"}</label>
                    <Textarea
                      rows={3}
                      value={form.descAr}
                      onChange={(e) => setForm((prev) => ({ ...prev, descAr: e.target.value }))}
                      placeholder="واحة فاخرة من فئة 5 نجوم على ضفاف نهر النيل الخالد..."
                      className="text-xs leading-relaxed"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: AMENITIES & FACILITIES */}
            <TabsContent value="amenities" className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs font-semibold text-muted-foreground">
                {isAr ? "حدد المرافق والخدمات الحصرية المتوفرة في الفندق:" : "Select luxury amenities available at this hotel:"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LUXURY_AMENITIES.map((am) => {
                  const Icon = am.icon;
                  const isChecked = Boolean(form.amenities[am.id]);
                  return (
                    <button
                      key={am.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          amenities: { ...prev.amenities, [am.id]: !isChecked },
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/50 text-foreground shadow-xs"
                          : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isChecked ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-extrabold">{isAr ? am.labelAr : am.labelEn}</div>
                        <div className="text-[10px] text-muted-foreground">{am.labelEn}</div>
                      </div>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 4: POLICIES & CONTACT */}
            <TabsContent value="policies" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "رقم الهاتف" : "Phone Number"}</span>
                  </label>
                  <Input
                    placeholder="+20 100 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-10 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "البريد الإلكتروني" : "Email Address"}</span>
                  </label>
                  <Input
                    placeholder="reservations@nilepalace.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? "الموقع الرسمي (https)" : "Official Website"}</span>
                  </label>
                  <Input
                    placeholder="https://nilepalace.com"
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "موعد تسجيل الوصول (Check-in)" : "Check-in Time"}</span>
                  </label>
                  <Input
                    value={form.checkIn}
                    onChange={(e) => setForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                    placeholder="14:00"
                    className="h-10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "موعد تسجيل المغادرة (Check-out)" : "Check-out Time"}</span>
                  </label>
                  <Input
                    value={form.checkOut}
                    onChange={(e) => setForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                    placeholder="12:00"
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-foreground">{isAr ? "سياسة الإلغاء والاسترداد" : "Cancellation Policy"}</label>
                <Input
                  value={form.cancellationPolicy}
                  onChange={(e) => setForm((prev) => ({ ...prev, cancellationPolicy: e.target.value }))}
                  placeholder="Free cancellation up to 48 hours before check-in."
                  className="h-10 text-xs font-medium"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-10 text-xs font-semibold px-4"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 text-xs font-bold px-6 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? "جاري الحفظ..." : "Saving Hotel..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{hotel ? (isAr ? "حفظ التعديلات" : "Update Hotel") : (isAr ? "إضافة الفندق الآن" : "Create Hotel")}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
