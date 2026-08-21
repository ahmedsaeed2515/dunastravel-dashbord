"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  Package,
  Compass,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers,
  Heart,
  Globe,
  Landmark,
  Plus,
  Edit,
  Eye,
  Star,
} from "lucide-react";
import { useLocale } from "next-intl";

interface EgyptInterfaceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface StandardTourItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  duration: string;
  category: string;
  priceFrom: string;
  isFeatured?: boolean;
  heroImage: string;
}

export interface PackageProgramItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  description: string;
  category: string;
  badge: string;
  heroImage: string;
}

// 📁 Folder 1: Standard Tours (الرحلات العادية - 9 رحلات)
const STANDARD_TOURS: StandardTourItem[] = [
  {
    id: "egypt-1",
    title: "Cairo Express",
    slug: "cairo-express-4d",
    url: "https://luxury-project-one.vercel.app/tours/cairo-express-4d",
    duration: "4 Days / 3 Nights",
    category: "Cairo Short Stay",
    priceFrom: "$450",
    isFeatured: true,
    heroImage: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-2",
    title: "Cairo Express with Alexandria",
    slug: "cairo-express-alexandria-5d",
    url: "https://luxury-project-one.vercel.app/tours/cairo-express-alexandria-5d",
    duration: "5 Days / 4 Nights",
    category: "Cairo & Mediterranean",
    priceFrom: "$580",
    heroImage: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-3",
    title: "Classic Egypt: Cairo + Nile Cruise",
    slug: "egito-classico-8d",
    url: "https://luxury-project-one.vercel.app/tours/egito-classico-8d",
    duration: "8 Days / 7 Nights",
    category: "Classic Nile Voyage",
    priceFrom: "$1,250",
    isFeatured: true,
    heroImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-4",
    title: "Classic Egypt II: Cairo + Nile Cruise",
    slug: "egito-classico-ii-9d",
    url: "https://luxury-project-one.vercel.app/tours/egito-classico-ii-9d",
    duration: "9 Days / 8 Nights",
    category: "Extended Classic Voyage",
    priceFrom: "$1,390",
    heroImage: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-5",
    title: "Historic Egypt: Cairo + Cruise + Red Sea",
    slug: "egito-historico-10d",
    url: "https://luxury-project-one.vercel.app/tours/egito-historico-10d",
    duration: "10 Days / 9 Nights",
    category: "History & Red Sea Resort",
    priceFrom: "$1,580",
    isFeatured: true,
    heroImage: "https://images.unsplash.com/photo-1560499005-7288673752c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-6",
    title: "Cairo with Cruise + Sharm El Sheikh",
    slug: "cairo-cruzeiro-sharm-11d",
    url: "https://luxury-project-one.vercel.app/tours/cairo-cruzeiro-sharm-11d",
    duration: "11 Days / 10 Nights",
    category: "Nile Cruise & Riviera",
    priceFrom: "$1,720",
    heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-7",
    title: "THE GRAND RAMSES - FULL DESCRIPTION",
    slug: "grande-ramses-10d",
    url: "https://luxury-project-one.vercel.app/tours/grande-ramses-10d",
    duration: "10 Days / 9 Nights",
    category: "Luxury VIP Experience",
    priceFrom: "$2,100",
    isFeatured: true,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-8",
    title: "Treasures of Egypt with Alexandria",
    slug: "tesouros-egipto-9d",
    url: "https://luxury-project-one.vercel.app/tours/tesouros-egipto-9d",
    duration: "9 Days / 8 Nights",
    category: "Treasures & Heritage",
    priceFrom: "$1,420",
    heroImage: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egypt-9",
    title: "Complete Egypt",
    slug: "complete-egypt-8d",
    url: "https://luxury-project-one.vercel.app/tours/complete-egypt-8d",
    duration: "8 Days / 7 Nights",
    category: "Comprehensive Tour",
    priceFrom: "$1,190",
    heroImage: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
  },
];

// 📁 Folder 2: Packages & Programs (الباكدجز والبرامج - 5 باكدجز)
const PACKAGE_PROGRAMS: PackageProgramItem[] = [
  {
    id: "pkg-1",
    title: "Classic Program",
    slug: "classic-program",
    url: "https://luxury-project-one.vercel.app/programs/classic/classic-program",
    description: "البرنامج الكلاسيكي الأكثر طلباً لزيارة أهرامات الجيزة، القاهرة القديمة، وأقصر وأسوان عبر نايل كروز فاخر.",
    category: "Classic Collection",
    badge: "الأكثر مبيعاً",
    heroImage: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pkg-2",
    title: "Honeymooners Package",
    slug: "honeymooners",
    url: "https://luxury-project-one.vercel.app/programs/honeymooners",
    description: "باقة شهر العسل الفاخرة التي تجمع بين سحر الحضارة الفرعونية واسترخاء الشواطئ الخاصة بالفنادق 5 نجوم.",
    category: "Romantic Voyages",
    badge: "شهر العسل VIP",
    heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pkg-3",
    title: "Religious Programs",
    slug: "religious",
    url: "https://luxury-project-one.vercel.app/programs/religious",
    description: "مسارات السياحة الدينية الشاملة للتراث القبطي والإسلامي ورحلة العائلة المقدسة ودير سانت كاترين.",
    category: "Heritage & Faith",
    badge: "التراث والروحانيات",
    heroImage: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pkg-4",
    title: "Multi-Country Tours",
    slug: "multi-country",
    url: "https://luxury-project-one.vercel.app/programs/multi-country",
    description: "رحلات مشتركة بين مصر ودول المنطقة مثل الأردن (البتراء)، تركيا، أو دبي في برنامج متكامل واحد.",
    category: "Regional Combos",
    badge: "رحلات مشتركة",
    heroImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pkg-5",
    title: "Egypt Extensions",
    slug: "extension",
    url: "https://luxury-project-one.vercel.app/programs/extension",
    description: "إضافات وتوسعات مرنة لزيادة أيام الإقامة في الغردقة، واحة سيوة، أو رحلات السفاري بالصحراء البيضاء.",
    category: "Custom Extensions",
    badge: "إضافات مخصصة",
    heroImage: "https://images.unsplash.com/photo-1560499005-7288673752c0?auto=format&fit=crop&w=800&q=80",
  },
];

export function EgyptInterfaceDrawer({ open, onOpenChange }: EgyptInterfaceDrawerProps) {
  const currentLocale = useLocale();
  const isAr = currentLocale === "ar";

  const [activeFolder, setActiveFolder] = useState<"tours" | "packages">("tours");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col h-full border-l border-border bg-card">
        {/* Top Header Banner */}
        <SheetHeader className="p-6 bg-linear-to-r from-amber-500/15 via-primary/10 to-amber-500/5 border-b shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-600 rounded-2xl shrink-0 shadow-sm border border-amber-500/30">
                <span className="text-2xl">🇪🇬</span>
              </div>
              <div>
                <SheetTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <span>{isAr ? "واجهة مصر (Egypt Tour Interface)" : "Egypt Interface & Collections"}</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                    {isAr ? "منظمة في ملفين" : "2 Folders Structured"}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  {isAr
                    ? "إدارة وعرض برامج ورحلات مصر المقسمة بين ملف الرحلات العادية وملف الباكدجز."
                    : "Manage Egypt's tours organized into Standard Tours and Packages folders."}
                </SheetDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold shrink-0"
              onClick={() => window.open("https://luxury-project-one.vercel.app/tours", "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "معاينة الواجهة الرسمية" : "Live Interface Preview"}</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Folders Navigation Bar */}
        <div className="p-4 bg-muted/40 border-b shrink-0">
          <Tabs
            defaultValue="tours"
            value={activeFolder}
            onValueChange={(val: any) => setActiveFolder(val as "tours" | "packages")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-card border rounded-xl shadow-xs">
              <TabsTrigger
                value="tours"
                className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <Folder className="w-4 h-4 text-amber-500 data-[state=active]:text-primary-foreground" />
                <span>{isAr ? "📁 الملف الأول: الرحلات العادية" : "📁 Folder 1: Standard Tours"}</span>
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] bg-background/30 text-foreground font-mono px-2"
                >
                  9 {isAr ? "رحلات" : "Tours"}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="packages"
                className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <Layers className="w-4 h-4 text-blue-500 data-[state=active]:text-primary-foreground" />
                <span>{isAr ? "📁 الملف الثاني: الباكدجز والبرامج" : "📁 Folder 2: Packages"}</span>
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] bg-background/30 text-foreground font-mono px-2"
                >
                  5 {isAr ? "باكدجز" : "Packages"}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeFolder === "tours" ? (
            /* FOLDER 1: STANDARD TOURS (9 TOURS) */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                  <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {isAr
                      ? "الملف الأول: يعرض الـ 9 رحلات العادية الأساسية المقترحة لمصر."
                      : "Folder 1: Shows the 9 primary standard tours available for Egypt."}
                  </span>
                </div>
                <Badge variant="outline" className="bg-background text-foreground font-mono">
                  9 / 9 Included
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STANDARD_TOURS.map((tour, index) => (
                  <div
                    key={tour.id}
                    className="group bg-card border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-36 w-full bg-muted overflow-hidden">
                        <img
                          src={tour.heroImage}
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
                        
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold flex items-center justify-center border border-white/20">
                            #{index + 1}
                          </span>
                          {tour.isFeatured && (
                            <Badge className="bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 border-none shadow-xs">
                              <Sparkles className="w-3 h-3" /> Featured
                            </Badge>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border shadow-xs">
                          <span className="font-mono font-bold text-xs text-foreground">{tour.priceFrom}</span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {tour.title}
                        </h4>
                        <p className="text-[11px] font-mono text-muted-foreground truncate dir-ltr text-start">
                          /{tour.slug}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{tour.duration}</span>
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            {tour.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 pt-0 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1 font-medium"
                        onClick={() => window.open(tour.url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? "معاينة الصفحة" : "Live View"}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs gap-1 font-medium"
                        onClick={() => window.open(`/${currentLocale}/admin/tours/${tour.slug}/edit`, "_blank")}
                      >
                        <Edit className="w-3 h-3" />
                        <span>{isAr ? "تعديل" : "Edit"}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* FOLDER 2: PACKAGES & PROGRAMS (5 PACKAGES) */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                  <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    {isAr
                      ? "الملف الثاني: يعرض الـ 5 باكدجز والبرامج المخصصة لمصر."
                      : "Folder 2: Shows the 5 curated tour packages & programs for Egypt."}
                  </span>
                </div>
                <Badge variant="outline" className="bg-background text-foreground font-mono">
                  5 / 5 Included
                </Badge>
              </div>

              <div className="space-y-4">
                {PACKAGE_PROGRAMS.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className="group bg-card border rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-4 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0 border relative">
                        <img src={pkg.heroImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {pkg.title}
                          </h4>
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold text-[10px]">
                            {pkg.badge}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-mono text-muted-foreground dir-ltr text-start">
                            /{pkg.slug}
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="text-[11px] text-primary font-medium">{pkg.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-xs gap-1.5 font-semibold"
                        onClick={() => window.open(pkg.url, "_blank")}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isAr ? "معاينة الباكدج" : "Preview Package"}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-muted/30 border-t shrink-0 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isAr ? "واجهة مصر محدثة ومنظمة بالكامل (14 مادة سياحية)" : "Egypt interface updated with 14 items"}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs font-semibold">
            {isAr ? "إغلاق" : "Close"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
