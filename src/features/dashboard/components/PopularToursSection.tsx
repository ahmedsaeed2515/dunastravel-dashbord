"use client";

import { Card } from "@/components/ui/card";
import { 
  Flame, 
  Star, 
  MapPin, 
  Users, 
  ChevronLeft, 
  Sparkles, 
  Compass, 
  TrendingUp,
  CalendarCheck
} from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";

export function PopularToursSection() {
  const params = useParams();
  const isAr = params?.locale === "ar";

  const popularTours = [
    {
      id: "nile-cruise-5d4n",
      title: isAr ? "رحلة الكروز النيلي الفاخرة (الأقصر وأسوان 5 أيام)" : "Luxury Nile Cruise (Luxor & Aswan 5D/4N)",
      category: isAr ? "رحلات نيلية VIP" : "Nile Cruises VIP",
      image: "https://images.unsplash.com/photo-1572252821128-4ef864c7ecfa?auto=format&fit=crop&w=600&q=80",
      price: "$1,450",
      bookingsCount: isAr ? "142 حجز مؤكد" : "142 Confirmed Bookings",
      rating: "4.9",
      growth: "+24%",
      badge: isAr ? "الأعلى مبيعاً 🔥" : "Top Seller 🔥",
      badgeBg: "bg-amber-500 text-slate-950",
      destination: isAr ? "مصر • الأقصر وأسوان" : "Egypt • Luxor & Aswan",
    },
    {
      title: isAr ? "برنامج مصر الشامل (القاهرة، الأقصر، والغردقة)" : "Grand Egypt Tour (Cairo, Luxor & Hurghada)",
      category: isAr ? "الباكدجز الخاصة" : "Special Packages",
      image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80",
      price: "$2,200",
      bookingsCount: isAr ? "98 حجز مؤكد" : "98 Confirmed Bookings",
      rating: "4.95",
      growth: "+18%",
      badge: isAr ? "برنامج ذهبي 👑" : "VIP Gold 👑",
      badgeBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
      destination: isAr ? "مصر • القاهرة والبحر الأحمر" : "Egypt • Cairo & Red Sea",
    },
    {
      title: isAr ? "رحلة إسطنبول وكابادوكيا (المناطيد الساحرة 7 أيام)" : "Istanbul & Cappadocia Balloons Experience (7D)",
      category: isAr ? "الواجهات العالمية" : "Global Tours",
      image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80",
      price: "$1,890",
      bookingsCount: isAr ? "76 حجز مؤكد" : "76 Confirmed Bookings",
      rating: "4.85",
      growth: "+15%",
      badge: isAr ? "إقبال مرتفع ⭐️" : "High Demand ⭐️",
      badgeBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
      destination: isAr ? "تركيا • كابادوكيا" : "Turkey • Cappadocia",
    },
    {
      title: isAr ? "مغامرة البتراء ووادي رم والبحيرة الميتة (5 أيام)" : "Petra, Wadi Rum & Dead Sea Adventure (5D)",
      category: isAr ? "سياحة ثقافية" : "Cultural Tours",
      image: "https://images.unsplash.com/photo-1579606032821-4f67d26fb511?auto=format&fit=crop&w=600&q=80",
      price: "$1,650",
      bookingsCount: isAr ? "64 حجز مؤكد" : "64 Confirmed Bookings",
      rating: "4.88",
      growth: "+12%",
      badge: isAr ? "برنامج مميز 🌟" : "Featured 🌟",
      badgeBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
      destination: isAr ? "الأردن • البتراء ووادي رم" : "Jordan • Petra & Wadi Rum",
    },
  ];

  return (
    <Card className="p-6 bg-card border border-border/80 rounded-3xl shadow-sm space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              {isAr ? "الرحلات والبرامج الأكثر إقبالاً وحجزاً" : "Most Popular & High-Demand Tours"}
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr
              ? "أعلى البرامج السياحية والرحلات البحرية طلباً وحجزاً من العملاء والوكلاء هذا الموسم."
              : "Highest booked travel programs and Nile cruises requested by clients and B2B agents."}
          </p>
        </div>

        {/* View All Button */}
        <Link
          href={adminRoutes.tours}
          className="py-2 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0"
        >
          <span>{isAr ? "عرض جميع الرحلات 🗺️" : "View All Tours 🗺️"}</span>
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>

      {/* Cards Grid: 4 Equal Popular Tours */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {popularTours.map((tour, idx) => (
          <Link key={idx} href={adminRoutes.tours} className="block group">
            <Card className="overflow-hidden bg-muted/30 border border-border hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col justify-between">
              <div>
                {/* Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                  
                  {/* Badge */}
                  <span className={`absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md ${tour.badgeBg}`}>
                    {tour.badge}
                  </span>

                  {/* Growth Tag */}
                  <span className="absolute top-3 left-3 bg-emerald-500/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-xs">
                    <TrendingUp className="w-3 h-3" /> {tour.growth}
                  </span>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 right-3 text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-slate-200">{tour.destination}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-black text-foreground group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                    {tour.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      {tour.bookingsCount}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500 dir-ltr">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {tour.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 pt-0 mt-2 flex items-center justify-between border-t border-border/40 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block">{isAr ? "السعر من" : "Starting From"}</span>
                  <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{tour.price}</span>
                </div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                  {isAr ? "تفاصيل ←" : "Details →"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
}
