"use client";

import { use, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTourAvailabilities, useTourPreview } from "@/features/tours/hooks/useTours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Clock, Edit, Globe, Loader2, MapPin, Monitor, ShieldAlert, Smartphone, Tablet, Tag, Users, X, ExternalLink } from "lucide-react";
import { getFrontendTourUrl } from "@/lib/frontend-urls";

export const TOUR_PREVIEW_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "Arabic", dir: "rtl" },
  { code: "es", name: "Spanish", dir: "ltr" },
  { code: "pt", name: "Portuguese", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
] as const;

type PreviewLanguage = (typeof TOUR_PREVIEW_LOCALES)[number]["code"];
const previewLanguageFor = (locale: string): PreviewLanguage => TOUR_PREVIEW_LOCALES.some((language) => language.code === locale) ? locale as PreviewLanguage : "en";

export default function VisitorTourPreviewPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const [previewLang, setPreviewLang] = useState<PreviewLanguage>(() => previewLanguageFor(locale));
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const { data: tour, isLoading, error } = useTourPreview(slug, previewLang);
  const { data: departures, isLoading: departuresLoading, error: departuresError } = useTourAvailabilities(tour?.id ?? "");

  if (isLoading) return <PreviewLoading />;
  if (error || !tour) return <PreviewUnavailable locale={locale} />;

  const activeLanguage = TOUR_PREVIEW_LOCALES.find((language) => language.code === previewLang) ?? TOUR_PREVIEW_LOCALES[0];
  const heroImage = tour.images.find((image) => image.isHero) ?? null;
  const openDepartures = departures?.filter((departure) => departure.remainingSeats > 0 && departure.status !== "CLOSED") ?? [];
  const soldOutDepartures = departures?.filter((departure) => departure.status === "SOLD_OUT").length ?? 0;
  const numericPrice = Number(tour.basePriceUsd);
  const price = Number.isFinite(numericPrice) ? new Intl.NumberFormat(activeLanguage.code, { style: "currency", currency: tour.currency, minimumFractionDigits: 2 }).format(numericPrice) : "Price not recorded";

  return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <div className="bg-slate-900 border-b border-slate-800 p-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/tours/${tour.slug}`}><Button variant="ghost" size="sm" className="text-slate-300 hover:text-white font-bold"><ArrowLeft className="w-4 h-4 mr-1" /> {locale === "ar" ? "الخروج من المعاينة" : "Exit Preview"}</Button></Link>
        <div className="h-4 w-px bg-slate-700 hidden sm:block" />
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-bold">{locale === "ar" ? "معاينة كزائر 👁️" : "Visitor Preview"}</Badge>
        {!tour.preview.isPublic && <Badge variant="outline" className="border-violet-400/40 bg-violet-400/10 text-violet-200 text-xs">{tour.preview.status.toLowerCase()} - {locale === "ar" ? "مسودة غير منشورة" : "not public"}</Badge>}
        <span className="text-xs font-mono text-slate-400 hidden md:inline">/{tour.slug}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700" aria-label="Preview language">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {TOUR_PREVIEW_LOCALES.map((language) => <button key={language.code} type="button" onClick={() => setPreviewLang(language.code)} aria-pressed={previewLang === language.code} className={`text-xs px-2 py-0.5 rounded font-semibold uppercase transition-colors ${previewLang === language.code ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>{language.code}</button>)}
        </div>
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700 hidden sm:flex" aria-label="Preview viewport">
          <ViewportButton active={viewport === "desktop"} label="Desktop View" onClick={() => setViewport("desktop")}><Monitor className="w-4 h-4" /></ViewportButton>
          <ViewportButton active={viewport === "tablet"} label="Tablet View" onClick={() => setViewport("tablet")}><Tablet className="w-4 h-4" /></ViewportButton>
          <ViewportButton active={viewport === "mobile"} label="Mobile View" onClick={() => setViewport("mobile")}><Smartphone className="w-4 h-4" /></ViewportButton>
        </div>
        <a href={getFrontendTourUrl(tour.slug)} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="text-sky-400 border-sky-500/40 hover:bg-sky-500/10 font-bold">
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> {locale === "ar" ? "عرض في الموقع المباشر 🌐" : "Open Live Website"}
          </Button>
        </a>
        <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"><Edit className="w-3.5 h-3.5 mr-1" /> {locale === "ar" ? "تعديل الرحلة" : "Edit Tour"}</Button></Link>
      </div>
    </div>

    <div className="flex-1 flex justify-center py-6 px-2 overflow-x-auto bg-slate-950">
      <article dir={activeLanguage.dir} className={`transition-all duration-300 bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${viewport === "mobile" ? "w-[375px]" : viewport === "tablet" ? "w-[768px]" : "w-full max-w-5xl"}`}>
        <div className="relative h-[360px] md:h-[480px] w-full overflow-hidden">
          {heroImage ? (
            <img src={heroImage.imageUrl} alt={heroImage.altText ?? tour.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-800 px-6 text-center text-slate-300 font-bold">
              {previewLang === "ar" ? "لا توجد صورة غلاف مرفقة لهذه الرحلة." : "No hero media has been recorded for this tour."}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-8 inset-x-8 text-center space-y-3">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">{tour.category ?? (previewLang === "ar" ? "رحلات مميزة" : "Featured Tours")}</span>
            <h1 className="text-3xl md:text-5xl font-serif text-white font-bold">{tour.title || (previewLang === "ar" ? "بدون عنوان" : "Untitled Tour")}</h1>
          </div>
        </div>

        <div className="bg-slate-850 border-y border-slate-800 grid grid-cols-3 divide-x divide-slate-800 text-center p-4">
          <InfoCell icon={<Clock className="w-4 h-4" />} label={previewLang === "ar" ? "المدة" : "Duration"} value={tour.duration || (previewLang === "ar" ? "غير محدد" : "Not specified")} />
          <InfoCell icon={<Tag className="w-4 h-4" />} label={previewLang === "ar" ? "السعر يبدأ من" : "Price from"} value={price} />
          <InfoCell
            icon={<Users className="w-4 h-4" />}
            label={previewLang === "ar" ? "المغادرات" : "Departures"}
            value={
              departuresLoading
                ? (previewLang === "ar" ? "جاري التحميل..." : "Loading...")
                : departuresError
                ? (previewLang === "ar" ? "غير متاح" : "Unavailable")
                : departures?.length === 0
                ? (previewLang === "ar" ? "لا توجد مواعيد" : "No departures")
                : previewLang === "ar"
                ? `${openDepartures.length} متاح${soldOutDepartures ? ` / ${soldOutDepartures} مكتمل` : ""}`
                : `${openDepartures.length} bookable${soldOutDepartures ? ` / ${soldOutDepartures} sold out` : ""}`
            }
          />
        </div>

        <div className="p-6 md:p-10 space-y-12">
          <PreviewSection title={previewLang === "ar" ? "نبذة عامة عن البرنامج" : "Overview"}>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              {tour.overview || (previewLang === "ar" ? `لم يتم تسجيل نبذة عامة للغة ${previewLang.toUpperCase()}.` : "No overview has been recorded.")}
            </p>
          </PreviewSection>
          <PreviewSection title={previewLang === "ar" ? `البرنامج اليومي (${tour.itinerary.length} أيام)` : `Itinerary (${tour.itinerary.length} days)`}>
            {tour.itinerary.length ? (
              <div className="space-y-4">
                {tour.itinerary.map((day) => (
                  <div key={day.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold text-amber-400 text-sm">{day.dayLabel || (previewLang === "ar" ? `اليوم ${day.sortOrder + 1}` : `Day ${day.sortOrder + 1}`)}</span>
                      {day.meals && <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-600 font-bold">{day.meals}</Badge>}
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{day.description || (previewLang === "ar" ? `لم يتم تسجيل تفاصيل اليوم للغة ${previewLang.toUpperCase()}.` : "No day description recorded.")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyContent label={previewLang === "ar" ? "لم يتم تسجيل جدول الأيام." : "No itinerary days have been recorded."} />
            )}
          </PreviewSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <ServiceList title={previewLang === "ar" ? "الخدمات المشمولة" : "Included services"} icon={<Check className="w-4 h-4" />} items={tour.includedServices} empty={previewLang === "ar" ? "لا توجد خدمات مشمولة مسجلة." : "No included services have been recorded."} tone="included" />
            <ServiceList title={previewLang === "ar" ? "الخدمات المستثناة" : "Excluded services"} icon={<X className="w-4 h-4" />} items={tour.excludedServices} empty={previewLang === "ar" ? "لا توجد خدمات مستثناة مسجلة." : "No excluded services have been recorded."} tone="excluded" />
          </div>

          <PreviewSection title={previewLang === "ar" ? "السياسات ومعلومات الالتقاء" : "Policies and meeting information"}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">{previewLang === "ar" ? "سياسة الإلغاء" : "Cancellation policy"}</h3>
                <p className="text-sm text-slate-300">{tour.cancellationPolicy ?? (previewLang === "ar" ? "تطبق الشروط والأحكام القياسية للشركة." : "No cancellation policy has been recorded.")}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-1 flex gap-2 items-center"><MapPin className="w-4 h-4 text-amber-400" /> {previewLang === "ar" ? "نقطة الالتقاء" : "Meeting point"}</h3>
                <p className="text-sm text-slate-300">{tour.meetingPoint ?? (previewLang === "ar" ? "يتم التنسيق مع العميل قبل موعد الرحلة." : "No meeting point has been recorded.")}</p>
              </div>
            </div>
          </PreviewSection>
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/20 border border-amber-500/30 text-center space-y-3"><h3 className="text-xl font-serif font-bold text-white">{previewLang === "ar" ? "إجراء الحجز للزوار" : "Public booking action"}</h3><p className="text-xs text-slate-300 max-w-md mx-auto">{previewLang === "ar" ? "الحجز معطل في وضع المعاينة الإدارية، وتتم الحجوزات الفعلية من خلال الموقع المباشر." : "Booking is intentionally disabled in the admin preview."}</p><Button size="lg" disabled className="bg-amber-500 text-slate-950 font-bold px-8 rounded-xl">{previewLang === "ar" ? "معاينة فقط (الحجز معطل)" : "Preview only"}</Button></div>
        </div>
      </article>
    </div>
  </div>;
}

function PreviewLoading() { return <div className="flex flex-col items-center justify-center min-h-[70vh]"><Loader2 className="w-8 h-8 animate-spin text-primary mb-2" /><p className="text-sm text-muted-foreground font-bold">جاري تحميل معاينة الرحلة كزائر...</p></div>; }
function PreviewUnavailable({ locale }: { locale: string }) { return <div className="p-8 text-center max-w-lg mx-auto space-y-4"><ShieldAlert className="w-12 h-12 text-destructive mx-auto" /><h2 className="text-xl font-bold">معاينة الرحلة غير متاحة</h2><p className="text-sm text-muted-foreground">ربما تم حذف الرحلة أو لا يمكن استرجاع بياناتها حالياً.</p><Link href={`/${locale}/admin/tours`}><Button variant="outline" className="font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> العودة لكتالوج الرحلات</Button></Link></div>; }
function ViewportButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active} className={`p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer ${active ? "bg-slate-700 text-amber-400" : ""}`}>{children}</button>; }
function InfoCell({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="space-y-1"><div className="text-amber-400 flex items-center justify-center gap-1.5 text-xs font-bold uppercase">{icon}{label}</div><div className="text-sm font-bold text-white">{value}</div></div>; }
function PreviewSection({ title, children }: { title: string; children: ReactNode }) { return <section className="space-y-4"><h2 className="text-2xl font-serif font-bold text-amber-400 border-b border-amber-500/20 pb-2">{title}</h2>{children}</section>; }
function EmptyContent({ label }: { label: string }) { return <p className="rounded-xl border border-dashed border-slate-600 p-4 text-sm text-slate-300">{label}</p>; }
function ServiceList({ title, icon, items, empty, tone }: { title: string; icon: ReactNode; items: string[]; empty: string; tone: "included" | "excluded" }) { const style = tone === "included" ? { box: "bg-emerald-950/20 border-emerald-500/20", heading: "text-emerald-400" } : { box: "bg-rose-950/20 border-rose-500/20", heading: "text-rose-400" }; return <section className={`p-5 rounded-2xl border space-y-3 ${style.box}`}><h3 className={`font-bold text-sm flex items-center gap-2 ${style.heading}`}>{icon}{title}</h3>{items.length ? <ul className="text-xs text-slate-300 space-y-2">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span aria-hidden>*</span><span>{item}</span></li>)}</ul> : <EmptyContent label={empty} />}</section>; }
