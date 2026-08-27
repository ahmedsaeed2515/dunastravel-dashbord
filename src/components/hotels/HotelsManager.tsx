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
  Users,
  DollarSign,
  Copy,
  Check,
  Layers,
  UtensilsCrossed,
  Car,
  Wine,
  Sun,
  Flame,
  Tv,
  Palmtree,
  Shield,
  Briefcase,
  ChevronDown,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateHotel,
  useHotelLifecycle,
  useHotels,
  useUpdateHotel,
} from "@/features/hotels/hooks/useHotels";
import { AdminHotel, HotelPayload, HotelRoomPayload, HotelStatus } from "@/features/hotels/types";

// ----------------------------------------------------
// Constants & Presets
// ----------------------------------------------------
export const DESTINATION_OPTIONS = [
  { slug: "egypt", nameEn: "Egypt", nameAr: "مصر", flag: "🇪🇬", defaultCities: ["Cairo", "Giza", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Alexandria", "Marsa Alam", "Dahab", "Siwa"] },
  { slug: "turkey", nameEn: "Turkey", nameAr: "تركيا", flag: "🇹🇷", defaultCities: ["Istanbul", "Cappadocia", "Antalya", "Bodrum", "Pamukkale", "Trabzon", "Izmir"] },
  { slug: "jordan", nameEn: "Jordan", nameAr: "الأردن", flag: "🇯🇴", defaultCities: ["Amman", "Petra", "Dead Sea", "Aqaba", "Wadi Rum", "Jerash"] },
  { slug: "dubai", nameEn: "Dubai & UAE", nameAr: "دبي والإمارات", flag: "🇦🇪", defaultCities: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah"] },
  { slug: "morocco", nameEn: "Morocco", nameAr: "المغرب", flag: "🇲🇦", defaultCities: ["Marrakech", "Casablanca", "Fes", "Tangier", "Rabat", "Chefchaouen", "Agadir"] },
  { slug: "greece", nameEn: "Greece", nameAr: "اليونان", flag: "🇬🇷", defaultCities: ["Athens", "Santorini", "Mykonos", "Crete", "Rhodes", "Corfu"] },
  { slug: "tunisia", nameEn: "Tunisia", nameAr: "تونس", flag: "🇹🇳", defaultCities: ["Tunis", "Hammamet", "Sousse", "Djerba", "Tozeur", "Monastir"] },
  { slug: "multi-country", nameEn: "Multi-Country", nameAr: "برامج متعددة الوجهات", flag: "🌍", defaultCities: ["Cairo & Dubai", "Egypt & Jordan", "Turkey & Greece", "Middle East Grand Tour"] },
  { slug: "religious", nameEn: "Religious & Cultural", nameAr: "رحلات دينية وثقافية", flag: "✨", defaultCities: ["Holy Land", "Jerusalem & Amman", "Islamic Cairo", "Saint Catherine"] },
] as const;

export const AMENITY_CATEGORIES = [
  {
    categoryEn: "Wellness, Spa & Pools",
    categoryAr: "الاستجمام، السبا والمسابح",
    items: [
      { id: "pool", labelEn: "Swimming Pool", labelAr: "مسبح فاخر", icon: Waves },
      { id: "heatedPool", labelEn: "Heated Pool", labelAr: "مسبح دافئ", icon: Flame },
      { id: "infinityPool", labelEn: "Infinity Pool", labelAr: "مسبح إنفينيتي", icon: Waves },
      { id: "spa", labelEn: "Luxury Spa & Sauna", labelAr: "سبا ونادي صحي", icon: Sparkles },
      { id: "jacuzzi", labelEn: "Private Jacuzzi", labelAr: "جاكوزي خاص", icon: Flame },
      { id: "beach", labelEn: "Private Beach Front", labelAr: "شاطئ رملي خاص", icon: Palmtree },
    ],
  },
  {
    categoryEn: "Dining & Culinary",
    categoryAr: "المطاعم والضيافة",
    items: [
      { id: "restaurant", labelEn: "Fine Dining Restaurant", labelAr: "مطعم فاخر", icon: Utensils },
      { id: "breakfast", labelEn: "Breakfast Buffet Included", labelAr: "شامل الإفطار الفاخر", icon: Coffee },
      { id: "rooftop", labelEn: "Rooftop Lounge & Bar", labelAr: "لاونج مع إطلالة بانورامية", icon: Wine },
      { id: "roomService", labelEn: "24h Room Service", labelAr: "خدمة غرف 24 ساعة", icon: Clock },
      { id: "halalDining", labelEn: "Halal Certified Cuisine", labelAr: "مأكولات حلال معتمدة", icon: UtensilsCrossed },
    ],
  },
  {
    categoryEn: "VIP Services & Comfort",
    categoryAr: "الخدمات الحصرية والراحة",
    items: [
      { id: "wifi", labelEn: "High-Speed Wi-Fi", labelAr: "واي فاي فائق السرعة", icon: Wifi },
      { id: "concierge", labelEn: "24/7 VIP Concierge", labelAr: "خدمة كونسيرج 24/7", icon: ShieldCheck },
      { id: "airportShuttle", labelEn: "Private Airport Chauffeur", labelAr: "توصيل خاص للمطار", icon: Car },
      { id: "valetParking", labelEn: "Free Valet Parking", labelAr: "خدمة صف السيارات", icon: Car },
      { id: "butler", labelEn: "Personal Butler Service", labelAr: "خدمة خادم شخصي", icon: Shield },
    ],
  },
  {
    categoryEn: "Fitness & Leisure",
    categoryAr: "اللياقة والأنشطة",
    items: [
      { id: "gym", labelEn: "State-of-the-Art Gym", labelAr: "مركز لياقة بدنية متطور", icon: Dumbbell },
      { id: "tennis", labelEn: "Tennis Courts", labelAr: "ملاعب تنس", icon: Sun },
      { id: "diving", labelEn: "Diving & Water Sports Center", labelAr: "مركز غوص وأنشطة بحرية", icon: Compass },
      { id: "businessCenter", labelEn: "Executive Business Center", labelAr: "مركز رجال أعمال وقاعات", icon: Briefcase },
    ],
  },
];

const MEAL_PLAN_OPTIONS = [
  { id: "bb", nameEn: "Bed & Breakfast (BB)", nameAr: "شامل الإفطار" },
  { id: "hb", nameEn: "Half Board (HB)", nameAr: "إقامة نصف شاملة (إفطار + عشاء)" },
  { id: "fb", nameEn: "Full Board (FB)", nameAr: "إقامة كاملة (3 وجبات)" },
  { id: "ai", nameEn: "All Inclusive (AI)", nameAr: "شامل كلياً" },
  { id: "ro", nameEn: "Room Only (RO)", nameAr: "إقامة بدون وجبات" },
];

const ROOM_PRESETS = [
  { slug: "deluxe-room", nameEn: "Deluxe Nile View Room", nameAr: "غرفة ديلوكس بإطلالة على النيل", rate: 180, maxOccupancy: 2, inventory: 15, mealPlan: "bb" },
  { slug: "superior-room", nameEn: "Superior City View Room", nameAr: "غرفة سوبيريور بإطلالة المدينة", rate: 140, maxOccupancy: 2, inventory: 20, mealPlan: "bb" },
  { slug: "executive-suite", nameEn: "Executive Panorama Suite", nameAr: "جناح تنفيذي بانورامي", rate: 290, maxOccupancy: 3, inventory: 8, mealPlan: "bb" },
  { slug: "royal-suite", nameEn: "Royal Presidential Suite", nameAr: "الجناح الرئاسي الملكي", rate: 550, maxOccupancy: 4, inventory: 3, mealPlan: "hb" },
  { slug: "family-connecting", nameEn: "Family Connecting Suite", nameAr: "جناح عائلي متصل", rate: 320, maxOccupancy: 5, inventory: 6, mealPlan: "bb" },
  { slug: "luxury-villa", nameEn: "Private Beachfront Villa", nameAr: "فيلا شاطئية خاصة مع مسبح", rate: 850, maxOccupancy: 6, inventory: 2, mealPlan: "ai" },
];

export interface FormRoomItem {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameEs: string;
  namePt: string;
  nameIt: string;
  ratePerNight: number;
  maxOccupancy: number;
  inventory: number;
  mealPlan: string;
  isActive: boolean;
}

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
  rooms: FormRoomItem[];
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
  destinationSlug: "egypt",
  city: "Cairo",
  stars: 5,
  rating: "4.9",
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
    {
      slug: "deluxe-nile-view",
      nameEn: "Deluxe Nile View Room",
      nameAr: "غرفة ديلوكس بإطلالة على النيل",
      nameEs: "Habitación Deluxe con Vista al Nilo",
      namePt: "Quarto Deluxe com Vista para o Nilo",
      nameIt: "Camera Deluxe con Vista sul Nilo",
      ratePerNight: 195,
      maxOccupancy: 2,
      inventory: 15,
      mealPlan: "bb",
      isActive: true,
    },
    {
      slug: "royal-suite",
      nameEn: "Royal Presidential Suite",
      nameAr: "الجناح الملكي الرئاسي",
      nameEs: "Suite Presidencial Real",
      namePt: "Suíte Presidencial Real",
      nameIt: "Suite Presidenziale Reale",
      ratePerNight: 480,
      maxOccupancy: 4,
      inventory: 5,
      mealPlan: "bb",
      isActive: true,
    },
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

  const lifecycleMutation = useHotelLifecycle();

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
    if (
      !window.confirm(
        isAr
          ? `هل أنت متأكد من تغيير حالة فندق "${name}" إلى أرشيف؟`
          : `Are you sure you want to archive "${name}"?`
      )
    ) {
      return;
    }
    lifecycleMutation.mutate(
      { id: hotel.id, action: hotel.status === "ARCHIVED" ? "unarchive" : "archive" },
      {
        onSuccess: () =>
          toast.success(
            hotel.status === "ARCHIVED"
              ? (isAr ? "تمت استعادة الفندق كمسودة بنجاح" : "Hotel returned to draft")
              : (isAr ? "تم أرشفة الفندق بنجاح" : "Hotel archived successfully")
          ),
      }
    );
  };

  const handlePublish = (hotel: AdminHotel) => {
    const isPub = hotel.status === "PUBLISHED";
    lifecycleMutation.mutate(
      { id: hotel.id, action: isPub ? "unpublish" : "publish" },
      {
        onSuccess: () =>
          toast.success(
            isPub
              ? (isAr ? "تم تحويل الفندق إلى مسودة (غير متاح للجمهور)" : "Hotel converted to draft")
              : (isAr ? "تم نشر الفندق بنجاح وأصبح متاحاً للحجز" : "Hotel published successfully")
          ),
      }
    );
  };

  // Metrics
  const totalHotels = hotels.length;
  const fiveStarCount = hotels.filter((h) => h.stars === 5).length;
  const publishedCount = hotels.filter((h) => h.status === "PUBLISHED" && h.isActive).length;
  const totalRoomsCount = hotels.reduce((acc: number, h) => acc + (h.rooms?.reduce((rAcc: number, r: any) => rAcc + (r.inventory || 0), 0) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الفنادق المسجلة" : "Total Hotels in Catalog"}</span>
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
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "منشورة ومتاحة للحجز" : "Published & Live"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {publishedCount} <span className="text-xs font-bold text-emerald-500">({totalHotels ? Math.round((publishedCount / totalHotels) * 100) : 0}%) 🌐</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border/80 shadow-xs rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isAr ? "إجمالي الغرف المتاحة" : "Total Room Inventory"}</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalRoomsCount} <span className="text-xs font-bold text-sky-500">{isAr ? "غرفة متاحة 🛏️" : "Rooms 🛏️"}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <BedDouble className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Card>
      </div>

      {/* 2. Actions & Filters Bar */}
      <Card className="p-5 bg-card border border-border/80 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>{isAr ? "إدارة الفنادق والإقامة الفاخرة والغرف" : "Luxury Hotels & Accommodations Suite"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              {isAr
                ? "التحكم الكامل بالفنادق الشريكة، فئات الغرف، الأسعار وعدد الغرف المتاحة، والترجمات الـ 5."
                : "Full control over luxury partner hotels, room tiers, available inventories, and 5-language content."}
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
          <button
            onClick={() => setSelectedDestination("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-xs ${
              selectedDestination === "all"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]"
                : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/70"
            }`}
          >
            <span>🌐</span>
            <span>{isAr ? "جميع الوجهات" : "All Destinations"}</span>
          </button>

          {DESTINATION_OPTIONS.map((dest) => {
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
              placeholder={isAr ? "البحث باسم الفندق، المدينة، أو الـ slug..." : "Search by hotel name, city, slug..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground shrink-0">{isAr ? "النجوم:" : "Stars:"}</span>
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground shrink-0">{isAr ? "الحالة:" : "Status:"}</span>
              <div className="flex items-center gap-1">
                {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      selectedStatus === st
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-muted/30 text-muted-foreground border-border"
                    }`}
                  >
                    {st === "ALL" ? (isAr ? "الكل" : "All") : st === "PUBLISHED" ? (isAr ? "منشور 🌐" : "Live") : st === "DRAFT" ? (isAr ? "مسودة" : "Draft") : (isAr ? "مؤرشف" : "Archived")}
                  </button>
                ))}
              </div>
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
            {isAr ? "جاري تحميل قائمة الفنادق الفاخرة..." : "Loading luxury hotel catalog..."}
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
              setSelectedStatus("ALL");
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
            const roomsCount = hotel.rooms?.length || 0;
            const hotelInventory = hotel.rooms?.reduce((sum: number, r: any) => sum + (r.inventory || 0), 0) || 0;
            const lowestRate = hotel.rooms && hotel.rooms.length > 0
              ? Math.min(...hotel.rooms.map((r: any) => r.ratePerNight))
              : null;
            const heroImg = hotel.heroImageUrl;
            const ratingVal = hotel.rating !== null ? Number(hotel.rating).toFixed(1) : "4.9";
            const isPub = hotel.status === "PUBLISHED" && hotel.isActive;

            return (
              <Card
                key={hotel.id || hotel.slug}
                className="group rounded-3xl border border-border/80 bg-card hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Hero Image & Top Badges */}
                  <div className="h-48 relative overflow-hidden bg-slate-950">
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-muted-foreground">
                        {isAr ? "لا توجد صورة رئيسية" : "No hotel image"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-black/40" />

                    {/* Stars Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-400/30 text-xs font-black shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{hotel.stars} ⭐ ({ratingVal})</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge
                        variant={isPub ? "default" : "secondary"}
                        className={`font-bold text-[10px] shadow-xs cursor-pointer ${
                          isPub
                            ? "bg-emerald-500/90 hover:bg-emerald-600 text-white"
                            : "bg-slate-900/90 text-amber-400 border border-amber-400/30"
                        }`}
                        onClick={() => handlePublish(hotel)}
                        title={isAr ? "اضغط لتبديل حالة النشر" : "Click to toggle publication"}
                      >
                        {isPub ? (isAr ? "منشور 🌐" : "PUBLISHED") : hotel.status}
                      </Badge>
                    </div>

                    {/* Bottom Location Tag & Rate */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1 font-bold truncate max-w-[60%]">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{hotel.city} · {hotel.destinationSlug}</span>
                      </span>
                      {lowestRate !== null && (
                        <span className="font-mono font-extrabold text-amber-400 text-xs bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
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

                    {/* Rooms & Inventory Quick Summary */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-extrabold text-foreground">
                        <BedDouble className="w-4 h-4 text-amber-500" />
                        <span>{isAr ? `${roomsCount} فئات غرف` : `${roomsCount} Room Tiers`}</span>
                      </span>
                      <span className="font-bold text-muted-foreground text-[11px]">
                        {isAr ? `إجمالي السعة: ${hotelInventory} غرفة` : `Capacity: ${hotelInventory} rooms`}
                      </span>
                    </div>

                    {/* 5-Language Badge */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pt-1 border-t border-border/60">
                      <span>{isAr ? "الترجمات المتاحة:" : "Translations:"}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">5/5 {isAr ? "لغات متوفرة ✓" : "5 Locales Active ✓"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3 flex items-center justify-between border-t border-border/60 bg-muted/20">
                  <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">/{hotel.slug}</span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(hotel)}
                      className="h-8 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 rounded-xl cursor-pointer gap-1 px-3 border-amber-500/30 text-amber-500"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isAr ? "تعديل الفندق والغرف" : "Edit & Rooms"}</span>
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleArchive(hotel)}
                      className="h-8 w-8 hover:bg-destructive/10 text-destructive rounded-xl cursor-pointer"
                      title={isAr ? "أرشفة الفندق" : "Archive Hotel"}
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
  const [langSubTab, setLangSubTab] = useState<"en" | "ar" | "es" | "pt" | "it">("en");
  const [isSlugManual, setIsSlugManual] = useState(false);

  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState<FormRoomItem>({
    slug: "",
    nameEn: "",
    nameAr: "",
    nameEs: "",
    namePt: "",
    nameIt: "",
    ratePerNight: 150,
    maxOccupancy: 2,
    inventory: 10,
    mealPlan: "bb",
    isActive: true,
  });

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
          destinationSlug: hotel.destinationSlug || "egypt",
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
                id: r.id,
                slug: r.slug,
                nameEn: (r.name as any)?.en || (typeof r.name === 'string' ? r.name : r.slug),
                nameAr: (r.name as any)?.ar || (r.name as any)?.en || r.slug,
                nameEs: (r.name as any)?.es || (r.name as any)?.en || r.slug,
                namePt: (r.name as any)?.pt || (r.name as any)?.en || r.slug,
                nameIt: (r.name as any)?.it || (r.name as any)?.en || r.slug,
                ratePerNight: r.ratePerNight,
                maxOccupancy: r.maxOccupancy,
                inventory: r.inventory || 10,
                mealPlan: typeof (r.mealPlan) === 'string' ? r.mealPlan : "bb",
                isActive: r.isActive ?? true,
              }))
            : defaultFormData().rooms,
        });
        setIsSlugManual(true);
      } else {
        setForm(defaultFormData());
        setIsSlugManual(false);
      }
      setActiveTab("basic");
      setIsAddingRoom(false);
    }
  }, [hotel, open]);

  // Auto-slugify generator
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameEnChange = (val: string) => {
    setForm((prev) => {
      const newSlug = !isSlugManual ? slugify(val) : prev.slug;
      return {
        ...prev,
        nameEn: val,
        slug: newSlug,
      };
    });
  };

  // Smart translation fill helper
  const handleSmartFillTranslations = () => {
    const baseName = form.nameEn || form.nameAr;
    const baseDesc = form.descEn || form.descAr;

    if (!baseName) {
      toast.error(isAr ? "يرجى كتابة الاسم بالإنجليزية أو العربية أولاً." : "Please enter English or Arabic name first.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      nameEs: prev.nameEs || baseName,
      namePt: prev.namePt || baseName,
      nameIt: prev.nameIt || baseName,
      descEs: prev.descEs || baseDesc,
      descPt: prev.descPt || baseDesc,
      descIt: prev.descIt || baseDesc,
    }));

    toast.success(isAr ? "تم ملء الحقول الشاغرة في اللغات الخمس بنجاح!" : "5-Language fields populated successfully!");
  };

  // Destination change & Auto-city select
  const handleDestinationChange = (destSlug: string) => {
    const dest = DESTINATION_OPTIONS.find((d) => d.slug === destSlug);
    setForm((prev) => ({
      ...prev,
      destinationSlug: destSlug,
      city: dest?.defaultCities[0] || prev.city || "Cairo",
    }));
  };

  // Room Management Helpers
  const handleAddRoom = () => {
    if (!newRoom.nameEn.trim()) {
      toast.error(isAr ? "يرجى إدخال اسم الغرفة بالإنجليزية." : "Room English name is required.");
      return;
    }
    const roomSlug = newRoom.slug.trim() ? slugify(newRoom.slug) : slugify(newRoom.nameEn);
    const roomToAdd: FormRoomItem = {
      ...newRoom,
      slug: roomSlug,
      nameAr: newRoom.nameAr.trim() || newRoom.nameEn,
      nameEs: newRoom.nameEs.trim() || newRoom.nameEn,
      namePt: newRoom.namePt.trim() || newRoom.nameEn,
      nameIt: newRoom.nameIt.trim() || newRoom.nameEn,
    };

    setForm((prev) => ({
      ...prev,
      rooms: [...prev.rooms, roomToAdd],
    }));

    setNewRoom({
      slug: "",
      nameEn: "",
      nameAr: "",
      nameEs: "",
      namePt: "",
      nameIt: "",
      ratePerNight: 150,
      maxOccupancy: 2,
      inventory: 10,
      mealPlan: "bb",
      isActive: true,
    });
    setIsAddingRoom(false);
    toast.success(isAr ? "تمت إضافة الغرفة بنجاح!" : "Room tier added successfully!");
  };

  const handleApplyRoomPreset = (preset: typeof ROOM_PRESETS[0]) => {
    setNewRoom({
      slug: preset.slug,
      nameEn: preset.nameEn,
      nameAr: preset.nameAr,
      nameEs: preset.nameEn,
      namePt: preset.nameEn,
      nameIt: preset.nameEn,
      ratePerNight: preset.rate,
      maxOccupancy: preset.maxOccupancy,
      inventory: preset.inventory,
      mealPlan: preset.mealPlan,
      isActive: true,
    });
    setIsAddingRoom(true);
  };

  const handleDeleteRoom = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
    toast.info(isAr ? "تم حذف فئة الغرفة." : "Room removed.");
  };

  const handleUpdateRoomField = (index: number, field: keyof FormRoomItem, val: any) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r, i) => (i === index ? { ...r, [field]: val } : r)),
    }));
  };

  const handleSave = async () => {
    // Form Validations
    if (!form.nameEn.trim()) {
      toast.error(isAr ? "يرجى كتابة اسم الفندق بالإنجليزية." : "English Hotel Name is required.");
      setActiveTab("basic");
      return;
    }

    const cleanSlug = slugify(form.slug || form.nameEn);
    if (!cleanSlug) {
      toast.error(isAr ? "يرجى إدخال رمز الرابط (Slug)." : "A valid URL slug is required.");
      setActiveTab("basic");
      return;
    }

    const cleanDestination = form.destinationSlug.trim().toLowerCase() || "egypt";
    const stars = Number(form.stars) || 5;
    const rating = form.rating.trim() ? Number(form.rating) : 4.9;

    // Build Rooms payload
    const roomsPayload: HotelRoomPayload[] = form.rooms.map((r, idx) => ({
      slug: slugify(r.slug || r.nameEn || `room-${idx + 1}`),
      nameJsonb: {
        en: r.nameEn.trim(),
        ar: r.nameAr.trim() || r.nameEn.trim(),
        es: r.nameEs.trim() || r.nameEn.trim(),
        pt: r.namePt.trim() || r.nameEn.trim(),
        it: r.nameIt.trim() || r.nameEn.trim(),
      },
      ratePerNight: Number(r.ratePerNight) || 100,
      currency: form.currency.toUpperCase() || "USD",
      maxOccupancy: Number(r.maxOccupancy) || 2,
      inventory: Number(r.inventory) >= 0 ? Number(r.inventory) : 10,
      mealPlanJsonb: {
        en: r.mealPlan || "bb",
      },
      isActive: r.isActive ?? true,
      sortOrder: idx,
    }));

    if (roomsPayload.length === 0) {
      toast.error(isAr ? "يجب إضافة غرفة واحدة على الأقل في الفندق." : "At least one room tier must be configured.");
      setActiveTab("rooms");
      return;
    }

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
      rooms: roomsPayload,
    };

    try {
      if (hotel) {
        await updateMutation.mutateAsync({ id: hotel.id, payload });
        toast.success(isAr ? `تم تحديث بيانات الفندق "${form.nameEn}" والغرف بنجاح!` : `Hotel "${form.nameEn}" and rooms updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(isAr ? `تمت إضافة فندق "${form.nameEn}" والغرف بنجاح!` : `Hotel "${form.nameEn}" and rooms created successfully!`);
      }
      onOpenChange(false);
    } catch (err: any) {
      // Handled by mutation toast
    }
  };

  const currentDestinationConfig = DESTINATION_OPTIONS.find((d) => d.slug === form.destinationSlug) || DESTINATION_OPTIONS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-3xl bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
                <Hotel className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <span>{hotel ? (isAr ? "تعديل بيانات الفندق والغرف" : "Edit Luxury Hotel & Suites") : (isAr ? "إضافة فندق فاخر جديد" : "Add New Luxury Hotel")}</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  {isAr ? "التحكم في الوجهة، الترجمات الـ 5، الغرف وعددها، المرافق والسياسات." : "Configure hotel profile, 5-language content, rooms inventory, amenities & policies."}
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="hidden sm:flex border-amber-500/40 text-amber-500 font-black text-xs py-1 px-3">
              {form.stars} ⭐ {form.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Modal Form Tabs */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 bg-muted/60 p-1 rounded-2xl mb-6">
              <TabsTrigger value="basic" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "البيانات الأساسية" : "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="rooms" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? `الغرف والعدد (${form.rooms.length}) 🛏️` : `Rooms (${form.rooms.length}) 🛏️`}
              </TabsTrigger>
              <TabsTrigger value="translations" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الترجمات الـ 5 🌐" : "5 Languages 🌐"}
              </TabsTrigger>
              <TabsTrigger value="amenities" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "المرافق والخدمات" : "Amenities"}
              </TabsTrigger>
              <TabsTrigger value="policies" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                {isAr ? "الاتصال والسياسات" : "Policies"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFORMATION */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hotel Name EN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "اسم الفندق بالإنجليزية *" : "English Hotel Name *"}</span>
                    <span className="text-[10px] text-muted-foreground">🇬🇧 Primary Name</span>
                  </label>
                  <Input
                    placeholder="e.g. Four Seasons Nile Plaza"
                    value={form.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    className="h-10 text-xs font-bold"
                  />
                </div>

                {/* Hotel Name AR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "اسم الفندق بالعربية *" : "Arabic Hotel Name *"}</span>
                    <span className="text-[10px] text-muted-foreground">🇸🇦 الاسم الرسمي</span>
                  </label>
                  <Input
                    placeholder="مثال: فندق فور سيزونز نايل بلازا"
                    value={form.nameAr}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="h-10 text-xs font-bold"
                    dir="rtl"
                  />
                </div>

                {/* URL Slug */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{isAr ? "رمز الرابط (Slug) *" : "URL Slug *"}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        ({isAr ? "يتم إنشاؤه تلقائياً ويمكنك تخصيصه" : "Auto-generated, fully customizable"})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual(!isSlugManual)}
                      className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                    >
                      {isSlugManual ? (isAr ? "إعادة التوليد التلقائي 🔄" : "Re-sync Auto 🔄") : (isAr ? "تعديل يدوي ✏️" : "Manual Edit ✏️")}
                    </button>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="four-seasons-nile-plaza"
                      value={form.slug}
                      onChange={(e) => {
                        setIsSlugManual(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      className="h-10 text-xs font-mono font-bold pl-3"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    dunas-travel.com/hotels/<span className="text-amber-500 font-bold">{form.slug || "hotel-slug"}</span>
                  </p>
                </div>

                {/* Destination Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "الوجهة السياحية (Destination) *" : "Destination Region *"}</span>
                  </label>
                  <select
                    value={form.destinationSlug}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    {DESTINATION_OPTIONS.map((dest) => (
                      <option key={dest.slug} value={dest.slug}>
                        {dest.flag} {isAr ? dest.nameAr : dest.nameEn} ({dest.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Selection with Quick Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>{isAr ? "المدينة (City) *" : "City Location *"}</span>
                    <span className="text-[10px] text-muted-foreground">{currentDestinationConfig.nameEn}</span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g. Cairo, Luxor, Istanbul..."
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="h-10 text-xs font-bold"
                    />
                    {/* City suggestion pills */}
                    <div className="flex flex-wrap gap-1">
                      {currentDestinationConfig.defaultCities.slice(0, 5).map((cityPreset) => (
                        <button
                          key={cityPreset}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, city: cityPreset }))}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-colors cursor-pointer ${
                            form.city === cityPreset
                              ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {cityPreset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? "تصنيف النجوم *" : "Star Rating *"}</span>
                  </label>
                  <select
                    value={form.stars}
                    onChange={(e) => setForm((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Ultra Luxury Resort)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars (Premium Luxury)</option>
                    <option value={3}>⭐⭐⭐ 3 Stars (Comfort Boutique)</option>
                  </select>
                </div>

                {/* Guest Rating & Currency */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "تقييم الضيوف" : "Guest Score"}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "العملة" : "Currency"}</label>
                    <Input
                      value={form.currency}
                      maxLength={3}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Active Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-foreground">{isAr ? "حالة النشر (Publication Status)" : "Publication Status"}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as HotelStatus }))}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                  >
                    <option value="PUBLISHED">{isAr ? "منشور ومتاح للحجز (PUBLISHED)" : "Published & Live"}</option>
                    <option value="DRAFT">{isAr ? "مسودة مؤقتة (DRAFT)" : "Draft (Hidden)"}</option>
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
                    {isAr ? "تفعيل الفندق في الكتالوج العام للموقع" : "Active on public catalog & search"}
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ROOMS & INVENTORY MANAGEMENT (NEW & COMPLETE) */}
            <TabsContent value="rooms" className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" />
                    <span>{isAr ? "التحكم في فئات الغرف وعدد الغرف المتاحة (Inventory)" : "Room Categories & Available Inventory"}</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr
                      ? "يمكنك إضافة فئات غرف متعددة وتحديد سعر كل غرفة وعدد الغرف المتاحة للحجز وأقصى سعة للأفراد."
                      : "Configure room categories, nightly rates, available inventory quotas, and occupancy limits."}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsAddingRoom(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-3" />
                  <span>{isAr ? "إضافة فئة غرفة +" : "Add Room Tier +"}</span>
                </Button>
              </div>

              {/* Quick Room Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground block">{isAr ? "نماذج جاهزة للغرف السريعة:" : "Quick Room Presets:"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ROOM_PRESETS.map((preset) => (
                    <button
                      key={preset.slug}
                      type="button"
                      onClick={() => handleApplyRoomPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-xl border bg-card hover:border-amber-500 hover:text-amber-500 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>{isAr ? preset.nameAr : preset.nameEn}</span>
                      <span className="text-[10px] font-mono text-amber-400">(${preset.rate})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Room Inline Form Card */}
              {isAddingRoom && (
                <Card className="p-5 border-2 border-amber-500/50 bg-amber-500/5 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h5 className="text-xs font-black text-foreground flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-amber-500" />
                      <span>{isAr ? "إضافة فئة غرفة جديدة" : "New Room Configuration"}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingRoom(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "اسم الغرفة بالإنجليزية *" : "Room Name (EN) *"}</label>
                      <Input
                        placeholder="e.g. Deluxe Nile View Room"
                        value={newRoom.nameEn}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, nameEn: e.target.value, slug: slugify(e.target.value) }))}
                        className="h-9 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "اسم الغرفة بالعربية *" : "Room Name (AR) *"}</label>
                      <Input
                        placeholder="مثال: غرفة ديلوكس مطلة على النيل"
                        value={newRoom.nameAr}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, nameAr: e.target.value }))}
                        className="h-9 text-xs font-bold"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "سعر الليلة ($ USD) *" : "Rate Per Night ($ USD) *"}</label>
                      <Input
                        type="number"
                        min="1"
                        value={newRoom.ratePerNight}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, ratePerNight: Number(e.target.value) }))}
                        className="h-9 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "عدد الغرف المتاحة (Inventory) *" : "Available Inventory (Quantity) *"}</label>
                      <Input
                        type="number"
                        min="0"
                        value={newRoom.inventory}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, inventory: Number(e.target.value) }))}
                        className="h-9 text-xs font-mono font-bold text-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "أقصى سعة للأفراد (Max Occupancy) *" : "Max Guests Occupancy *"}</label>
                      <select
                        value={newRoom.maxOccupancy}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, maxOccupancy: Number(e.target.value) }))}
                        className="w-full h-9 px-3 rounded-xl border bg-background text-xs font-bold"
                      >
                        <option value={1}>👤 1 Guest</option>
                        <option value={2}>👥 2 Guests (Standard Double)</option>
                        <option value={3}>👥👤 3 Guests (Triple)</option>
                        <option value={4}>👨‍👩‍👧‍👦 4 Guests (Family Suite)</option>
                        <option value={6}>👨‍👩‍👧‍👦👥 6 Guests (Luxury Villa)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-foreground">{isAr ? "نظام الوجبات" : "Meal Plan"}</label>
                      <select
                        value={newRoom.mealPlan}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, mealPlan: e.target.value }))}
                        className="w-full h-9 px-3 rounded-xl border bg-background text-xs font-bold"
                      >
                        {MEAL_PLAN_OPTIONS.map((mp) => (
                          <option key={mp.id} value={mp.id}>
                            {isAr ? mp.nameAr : mp.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingRoom(false)}
                      className="text-xs"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddRoom}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      {isAr ? "حفظ وإضافة الغرفة" : "Confirm & Add Room"}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Configured Rooms List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{isAr ? "الغرف المحددة في هذا الفندق:" : "Configured Room Tiers:"}</span>
                  <span className="text-amber-500 font-extrabold">{form.rooms.length} {isAr ? "فئات غرف" : "Tiers"}</span>
                </div>

                {form.rooms.length === 0 ? (
                  <div className="p-8 text-center border-dashed border-2 rounded-2xl text-muted-foreground text-xs font-bold">
                    {isAr ? "لم تتم إضافة أي غرف بعد. يرجى إضافة غرفة واحدة على الأقل." : "No rooms configured. Please add at least one room tier."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.rooms.map((room, idx) => (
                      <Card
                        key={idx}
                        className="p-4 bg-card border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-amber-500/40 transition-all"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-foreground">{room.nameEn}</span>
                            {room.nameAr && <span className="text-xs text-muted-foreground font-semibold" dir="rtl">({room.nameAr})</span>}
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {MEAL_PLAN_OPTIONS.find((m) => m.id === room.mealPlan)?.nameEn || "Bed & Breakfast"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-amber-500 font-extrabold text-sm">
                              <DollarSign className="w-3.5 h-3.5" />
                              {room.ratePerNight} / {isAr ? "ليلة" : "nt"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-sky-500" />
                              {room.maxOccupancy} {isAr ? "أفراد" : "Guests"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-foreground">
                              <Layers className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{room.inventory}</span> {isAr ? "غرفة متاحة" : "Available"}
                            </span>
                          </div>
                        </div>

                        {/* Inline Quick Edit Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border">
                            <span className="text-[10px] font-bold text-muted-foreground px-1">{isAr ? "العدد:" : "Qty:"}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoomField(idx, "inventory", Math.max(0, room.inventory - 1))}
                              className="w-6 h-6 rounded-lg bg-background text-foreground font-bold hover:bg-muted text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-xs">{room.inventory}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoomField(idx, "inventory", room.inventory + 1)}
                              className="w-6 h-6 rounded-lg bg-background text-foreground font-bold hover:bg-muted text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleDeleteRoom(idx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                            title={isAr ? "حذف الغرفة" : "Delete Room"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: 5-LANGUAGE TRANSLATIONS */}
            <TabsContent value="translations" className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Globe2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? "دعم كامل للغات الخمس العالمية (الإنجليزية، العربية، الإسبانية، البرتغالية، الإيطالية)." : "Full 5-language editorial localization suite."}</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSmartFillTranslations}
                  className="h-8 text-xs font-bold gap-1 rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 cursor-pointer shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{isAr ? "نسخ ذكي للغات الشاغرة" : "Smart Fill"}</span>
                </Button>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1.5 border-b pb-2 overflow-x-auto">
                {(
                  [
                    { id: "en", label: "🇬🇧 English", nameKey: "nameEn", descKey: "descEn" },
                    { id: "ar", label: "🇸🇦 العربية", nameKey: "nameAr", descKey: "descAr" },
                    { id: "es", label: "🇪🇸 Español", nameKey: "nameEs", descKey: "descEs" },
                    { id: "pt", label: "🇵🇹 Português", nameKey: "namePt", descKey: "descPt" },
                    { id: "it", label: "🇮🇹 Italiano", nameKey: "nameIt", descKey: "descIt" },
                  ] as const
                ).map((lang) => {
                  const isActive = langSubTab === lang.id;
                  const hasName = Boolean(form[lang.nameKey]);
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLangSubTab(lang.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {hasName && <Check className={`w-3 h-3 ${isActive ? "text-slate-950" : "text-emerald-500"}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Subtab Content for Selected Language */}
              <div className="space-y-4 pt-2">
                {langSubTab === "en" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 Hotel Name (English)</label>
                      <Input
                        value={form.nameEn}
                        onChange={(e) => handleNameEnChange(e.target.value)}
                        placeholder="Nile Palace Luxury Resort"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇬🇧 Full Overview & Description (English)</label>
                      <Textarea
                        rows={4}
                        value={form.descEn}
                        onChange={(e) => setForm((prev) => ({ ...prev, descEn: e.target.value }))}
                        placeholder="A timeless 5-star haven on the banks of the Nile, offering opulent suites and world-class spa facilities..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "ar" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 اسم الفندق (العربية)</label>
                      <Input
                        value={form.nameAr}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                        placeholder="منتجع قصر النيل الفاخر"
                        className="h-10 text-xs font-bold"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇸🇦 الوصف الكامل للفندق (العربية)</label>
                      <Textarea
                        rows={4}
                        value={form.descAr}
                        onChange={(e) => setForm((prev) => ({ ...prev, descAr: e.target.value }))}
                        placeholder="واحة فاخرة من فئة 5 نجوم على ضفاف نهر النيل الخالد، تقدم أجنحة فندقية ملكية وخدمات سبا عالمية المستوى..."
                        className="text-xs leading-relaxed"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "es" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Nombre del Hotel (Español)</label>
                      <Input
                        value={form.nameEs}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameEs: e.target.value }))}
                        placeholder="Hotel Palacio del Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇪🇸 Descripción del Hotel (Español)</label>
                      <Textarea
                        rows={4}
                        value={form.descEs}
                        onChange={(e) => setForm((prev) => ({ ...prev, descEs: e.target.value }))}
                        placeholder="Un refugio de lujo de 5 estrellas a orillas del Nilo con suites de primera categoría..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "pt" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Nome do Hotel (Português)</label>
                      <Input
                        value={form.namePt}
                        onChange={(e) => setForm((prev) => ({ ...prev, namePt: e.target.value }))}
                        placeholder="Hotel Palácio do Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇵🇹 Descrição do Hotel (Português)</label>
                      <Textarea
                        rows={4}
                        value={form.descPt}
                        onChange={(e) => setForm((prev) => ({ ...prev, descPt: e.target.value }))}
                        placeholder="Um refúgio atemporal de 5 estrelas às margens do Nilo com hospitalidade incomparável..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {langSubTab === "it" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Nome dell'Hotel (Italiano)</label>
                      <Input
                        value={form.nameIt}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameIt: e.target.value }))}
                        placeholder="Hotel Palazzo del Nilo"
                        className="h-10 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground">🇮🇹 Descrizione dell'Hotel (Italiano)</label>
                      <Textarea
                        rows={4}
                        value={form.descIt}
                        onChange={(e) => setForm((prev) => ({ ...prev, descIt: e.target.value }))}
                        placeholder="Un'oasi di lusso a 5 stelle sulle rive del Nilo con servizi benessere esclusivi..."
                        className="text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: CATEGORIZED AMENITIES & FACILITIES */}
            <TabsContent value="amenities" className="space-y-6">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>{isAr ? "حدد المرافق والخدمات الحصرية المتوفرة في الفندق بالنقر عليها:" : "Select luxury amenities available at this property:"}</span>
                <Badge variant="outline" className="text-amber-500 font-bold border-amber-500/30">
                  {Object.values(form.amenities).filter(Boolean).length} {isAr ? "مرافق مختارة" : "Selected"}
                </Badge>
              </div>

              {AMENITY_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2.5">
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 border-b pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? cat.categoryAr : cat.categoryEn}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {cat.items.map((am) => {
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
                              ? "bg-amber-500/10 border-amber-500/60 text-foreground shadow-xs scale-[1.01]"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isChecked ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-extrabold truncate">{isAr ? am.labelAr : am.labelEn}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{am.labelEn}</div>
                          </div>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: POLICIES, CONTACT & HERO IMAGE */}
            <TabsContent value="policies" className="space-y-4">
              {/* Hero Image URL & Preview */}
              <div className="p-4 rounded-2xl bg-muted/30 border space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "رابط الصورة الرئيسية للفندق (Hero Image URL)" : "Hotel Hero Image URL"}</span>
                  </label>
                  <Input
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    value={form.heroImageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                    className="h-10 text-xs font-mono"
                  />
                </div>

                {form.heroImageUrl && (
                  <div className="h-36 rounded-xl overflow-hidden relative border bg-slate-950">
                    <img
                      src={form.heroImageUrl}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] text-amber-400 font-mono">
                      Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
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
                    placeholder="reservations@hotel.com"
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
                    placeholder="https://luxuryhotel.com"
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Check-in & Check-out Times */}
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

              {/* Cancellation Policy */}
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
        <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground font-semibold">
            {form.rooms.length} {isAr ? "غرف معدة" : "room tiers"} · {form.status}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-10 text-xs font-semibold px-4 cursor-pointer"
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
                  <span>{isAr ? "جاري الحفظ..." : "Saving Hotel & Rooms..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hotel ? (isAr ? "حفظ التعديلات والغرف" : "Save Changes") : (isAr ? "إضافة الفندق والغرف الآن" : "Create Hotel & Rooms")}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
