"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useTour, useUpdateTour } from "@/features/tours/hooks/useTours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Edit, Eye, Star, ShieldAlert, Layers, Sparkles, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import type { TripModel } from "@/types/dunas-suite";
import { destinationForCountry } from "@/lib/tour-destinations";
import { getFrontendTourUrl } from "@/lib/frontend-urls";

const LOCALES = ["ar", "en", "es", "pt", "it"] as const;

function localeText(value: Record<string, unknown> | null | undefined, locale: string): string {
  return typeof value?.[locale] === "string" ? (value[locale] as string) : "";
}

function localeList(value: Record<string, unknown> | null | undefined, locale: string): string[] {
  return Array.isArray(value?.[locale]) ? value[locale].filter((item): item is string => typeof item === "string") : [];
}

function tourToTripModel(tour: any): TripModel {
  const highlights = tour.highlightsJsonb || tour.highlightJsonb;
  const itinerary = (tour.itineraries || []).map((item: any, index: number) => ({
    day: index + 1,
    title: item.dayLabel || '',
    description: localeText(item.descriptionJsonb, 'ar'),
    meals: localeText(item.mealsJsonb, 'ar'),
  }));

  return {
    id: tour.id,
    slug: tour.slug,
    title: localeText(tour.titleJsonb, 'ar') || localeText(tour.titleJsonb, 'en') || tour.slug,
    subtitle: localeText(tour.subtitleJsonb, 'ar'),
    destination: destinationForCountry(tour.country),
    market: tour.market || '',
    language: 'ar',
    type: tour.category || '',
    duration: localeText(tour.durationJsonb, 'ar'),
    departures: localeText(tour.departureInfoJsonb, 'ar'),
    price:
      tour.basePriceUsd !== undefined && tour.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
        ? Number(tour.basePriceUsd)
        : 0,
    hotelCategory: '',
    rating: Number(tour.sourceRating || 0),
    reviewCount: tour.sourceReviewCount || 0,
    popular: !!tour.isFeatured,
    familyFriendly: false,
    honeymoon: false,
    luxury: false,
    cultural: false,
    adventure: false,
    overview: localeText(tour.overviewJsonb, 'ar'),
    highlights: localeList(highlights, 'ar'),
    included: localeList(tour.includedServicesJsonb || tour.inclusionJsonb, 'ar'),
    excluded: localeList(tour.excludedServicesJsonb || tour.exclusionJsonb, 'ar'),
    heroImage: (() => {
      const heroFromImages = Array.isArray(tour.images)
        ? tour.images.find((img: any) => img?.isHero)?.imageUrl
        : undefined;
      return heroFromImages || (typeof tour.heroImage === 'string' ? tour.heroImage : '') || (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') || (tour.images?.[0]?.imageUrl || '');
    })(),
    images: (() => {
      const rawImages = tour.images?.map((image: any) => image.imageUrl) || (tour.heroImage ? [tour.heroImage] : []);
      const heroFromImages = Array.isArray(tour.images)
        ? tour.images.find((img: any) => img?.isHero)?.imageUrl
        : undefined;
      const resolvedHero = heroFromImages || (typeof tour.heroImage === 'string' ? tour.heroImage : '') || (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') || rawImages[0] || '';
      let imgs = [...rawImages];
      if (resolvedHero && imgs.includes(resolvedHero)) {
        imgs = [resolvedHero, ...imgs.filter((img: string) => img !== resolvedHero)];
      } else if (resolvedHero && !imgs.includes(resolvedHero)) {
        imgs = [resolvedHero, ...imgs];
      }
      return imgs;
    })(),
    hotels: '',
    accommodation: tour.city ? [{ destination: tour.city, nights: 0, regime: '' }] : [],
    itinerary,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        {
          title: localeText(tour.titleJsonb, locale),
          subtitle: localeText(tour.subtitleJsonb, locale),
          overview: localeText(tour.overviewJsonb, locale),
          duration: localeText(tour.durationJsonb, locale),
          highlights: localeList(highlights, locale),
          included: localeList(tour.includedServicesJsonb || tour.inclusionJsonb, locale),
          excluded: localeList(tour.excludedServicesJsonb || tour.exclusionJsonb, locale),
          itinerary: (tour.itineraries || []).map((item: any, index: number) => ({
            day: index + 1,
            title: item.dayLabel || '',
            description: localeText(item.descriptionJsonb, locale),
            meals: localeText(item.mealsJsonb, locale),
          })),
        },
      ])
    ) as TripModel['translations'],
  };
}

export default function TourDetailsPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const { data: tour, isLoading, error } = useTour(slug);
  const updateMutation = useUpdateTour();

  const [activeLocale, setActiveLocale] = useState("en");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tripModel = useMemo(() => {
    if (!tour) return null;
    return tourToTripModel(tour);
  }, [tour]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-xs font-bold text-muted-foreground">جاري تحميل تفاصيل وبيانات الرحلة...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">الرحلة غير موجودة</h2>
        <p className="text-xs text-muted-foreground">
          تعذر العثور على الرحلة ذات الرابط <code className="bg-muted px-1 rounded font-mono">{slug}</code>.
        </p>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline" className="rounded-xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> العودة إلى كتالوج الرحلات</Button>
        </Link>
      </div>
    );
  }

  const titleEn = tour.titleJsonb?.en || tour.slug;
  const activeTitle = tour.titleJsonb?.[activeLocale] || titleEn;
  const activeOverview = tour.overviewJsonb?.[activeLocale] || "";
  const activeDuration = tour.durationJsonb?.[activeLocale] || "";

  const togglePublishStatus = async () => {
    const newStatus = tour.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await updateMutation.mutateAsync({
        slug: tour.slug,
        data: { status: newStatus as any },
      });
      toast.success(newStatus === "PUBLISHED" ? "تم نشر الرحلة بنجاح" : "تم إلغاء نشر الرحلة وتحويلها لمسودة");
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث حالة النشر");
    }
  };

  const occupancyRate = tour.capacity && tour.capacity > 0 && tour.remainingSeats !== undefined && tour.remainingSeats !== null
    ? Math.round(((tour.capacity - tour.remainingSeats) / tour.capacity) * 100)
    : null;
  const occupiedSeats = tour.capacity && tour.remainingSeats !== undefined && tour.remainingSeats !== null
    ? Math.max(0, tour.capacity - tour.remainingSeats)
    : null;
  const capacity = tour.capacity;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/tours`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif">{tour.titleJsonb?.ar || activeTitle}</h1>
              <Badge variant={tour.status === "PUBLISHED" ? "default" : "secondary"} className="font-bold text-xs">
                {tour.status === "PUBLISHED" ? "منشور" : "مسودة"}
              </Badge>
              {tour.isFeatured && (
                <Badge variant="outline" className="border-amber-400 bg-amber-500/10 text-amber-600 font-bold text-xs">
                  مميز ⭐
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">/{tour.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={getFrontendTourUrl(tour.slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="gap-1.5 font-bold rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer">
              <Eye className="w-4 h-4" /> عرض في الموقع 🌐
            </Button>
          </a>
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`}>
            <Button size="sm" variant="outline" className="gap-1.5 font-bold rounded-xl cursor-pointer">
              <ExternalLink className="w-4 h-4" /> معاينة الرحلة
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="default"
            className="gap-1.5 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-black cursor-pointer"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Sparkles className="w-4 h-4" /> تعديل الرحلة (5 لغات)
          </Button>
          <Button size="sm" variant={tour.status === "PUBLISHED" ? "secondary" : "default"} onClick={togglePublishStatus} disabled={updateMutation.isPending} className="font-bold rounded-xl cursor-pointer">
            {tour.status === "PUBLISHED" ? "إلغاء النشر" : "نشر الرحلة"}
          </Button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card rounded-2xl">
          <div className="text-xs text-muted-foreground font-bold">السعر الأساسي ($)</div>
          <div className="text-2xl font-bold font-mono mt-1 text-primary">${tour.basePriceUsd} USD</div>
        </Card>
        <Card className="p-4 bg-card rounded-2xl">
          <div className="text-xs text-muted-foreground font-bold">السعة ومعدل الإشغال</div>
          <div className="text-2xl font-bold mt-1 font-mono">
            {occupiedSeats ?? "—"} / {capacity ?? "—"} <span className="text-xs font-normal text-muted-foreground">({occupancyRate === null ? "—" : `${occupancyRate}%`})</span>
          </div>
        </Card>
        <Card className="p-4 bg-card rounded-2xl">
          <div className="text-xs text-muted-foreground font-bold">الواجهات والصفحات المرتبطة</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-1.5 font-mono">
            <Layers className="w-5 h-5 text-primary" />
            {tour.landingPages?.length || 0}
          </div>
        </Card>
        <Card className="p-4 bg-card rounded-2xl">
          <div className="text-xs text-muted-foreground font-bold">البرنامج والوسائط</div>
          <div className="text-2xl font-bold mt-1 font-bold">
            {tour.itineraries?.length || 0} أيام • {tour.images?.length || 0} صور
          </div>
        </Card>
      </div>

      {/* Tabs Detail View */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6 font-bold rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="overview" className="text-xs font-bold">نظرة عامة</TabsTrigger>
          <TabsTrigger value="translations" className="text-xs font-bold">اللغات والمحتوى</TabsTrigger>
          <TabsTrigger value="itinerary" className="text-xs font-bold">البرنامج ({tour.itineraries?.length || 0})</TabsTrigger>
          <TabsTrigger value="media" className="text-xs font-bold">الصور ({tour.images?.length || 0})</TabsTrigger>
          <TabsTrigger value="interfaces" className="text-xs font-bold">الواجهات ({tour.landingPages?.length || 0})</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs font-bold">الحجوزات ({tour.bookings?.length || 0})</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold">ملخص ونظرة عامة للرحلة ({activeLocale.toUpperCase()})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">عنوان الرحلة</h4>
                  <p className="text-lg font-bold">{activeTitle}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">الوصف والملخص</h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {activeOverview || "لا يوجد وصف مسجل لهذه اللغة حالياً."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold">المواصفات الفنية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-bold">التصنيف:</span>
                  <span className="font-bold">{tour.category || "عام"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-bold">الدولة:</span>
                  <span className="font-bold">{tour.country || "مصر (Egypt)"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-bold">المدينة:</span>
                  <span className="font-bold">{tour.city || "غير محددة"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-bold">المدة:</span>
                  <span className="font-bold">{activeDuration || "غير محددة"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-bold">السعة الكلية:</span>
                  <span className="font-bold font-mono">{tour.capacity} مقاعد</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. TRANSLATIONS */}
        <TabsContent value="translations" className="space-y-4">
          <div className="flex gap-2 mb-4 border-b pb-2">
            {["ar", "en", "es", "pt", "it"].map((loc) => (
              <Button
                key={loc}
                variant={activeLocale === loc ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLocale(loc)}
                className="uppercase font-bold rounded-xl"
              >
                {loc}
              </Button>
            ))}
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">المحتوى متعدد اللغات للغة [{activeLocale.toUpperCase()}]</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">عنوان الرحلة</span>
                <p className="text-sm font-bold">{tour.titleJsonb?.[activeLocale] || "—"}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">العنوان الفرعي</span>
                <p className="text-sm font-medium">{tour.subtitleJsonb?.[activeLocale] || "—"}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">الملخص والوصف</span>
                <p className="text-sm text-muted-foreground">{tour.overviewJsonb?.[activeLocale] || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ITINERARY */}
        <TabsContent value="itinerary" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">تفاصيل البرنامج اليومي للرحلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tour.itineraries && tour.itineraries.length > 0 ? (
                tour.itineraries.map((day, idx) => (
                  <div key={day.id || idx} className="p-4 border rounded-xl bg-card space-y-2">
                    <div className="flex justify-between items-center font-bold text-sm">
                      <span>{day.dayLabel || `اليوم ${idx + 1}`}</span>
                      {day.mealsJsonb?.[activeLocale] && (
                        <Badge variant="outline" className="text-xs font-bold">
                          {day.mealsJsonb[activeLocale]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {day.descriptionJsonb?.[activeLocale] || day.descriptionJsonb?.en || "لا يوجد وصف متوفر لهذا اليوم."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs font-bold">لم يتم إنشاء أيام للبرنامج بعد.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MEDIA */}
        <TabsContent value="media" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tour.images && tour.images.length > 0 ? (
              tour.images.map((img) => (
                <div key={img.id || img.imageUrl} className="relative h-40 rounded-xl overflow-hidden border group bg-muted">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {img.isHero && (
                    <Badge className="absolute top-2 right-2 text-[10px] font-bold" variant="default">صورة الغلاف الرئيسية</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground text-xs font-bold">لا توجد صور مرتبطة بهذه الرحلة.</div>
            )}
          </div>
        </TabsContent>

        {/* 5. INTERFACES */}
        <TabsContent value="interfaces" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">الواجهات وصفحات الهبوط المرتبطة بهذه الرحلة</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.landingPages && tour.landingPages.length > 0 ? (
                <div className="divide-y border rounded-xl">
                  {tour.landingPages.map((lp: any) => (
                    <div key={lp.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">{lp.landingPage?.titleJsonb?.ar || lp.landingPage?.titleJsonb?.en || lp.landingPage?.slug}</div>
                        <div className="text-xs font-mono text-muted-foreground">/{lp.landingPage?.slug}</div>
                      </div>
                      <Badge variant="outline" className="font-bold">{lp.landingPage?.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs font-bold">هذه الرحلة غير مخصصة لأي واجهة بعد.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. BOOKINGS */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">سجل الحجوزات الخاصة بهذه الرحلة</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.bookings && tour.bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المرجع</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجمالي ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tour.bookings.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs font-bold">{b.referenceCode}</TableCell>
                        <TableCell className="font-medium">{b.billingInfo?.fullName || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="font-bold">{b.status}</Badge></TableCell>
                        <TableCell className="font-mono font-bold text-emerald-600">${b.totalAmountUsd}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا توجد حجوزات مسجلة لهذه الرحلة حتى الآن.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TripEditorModal
        trip={tripModel}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
