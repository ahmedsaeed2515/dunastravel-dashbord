"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Award, Calendar, Compass, Edit, Globe2, ImageOff, Layers, Loader2, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTourWizard } from "@/features/tours/components/CreateTourWizard/CreateTourWizard";
import { EditTourDrawer } from "@/features/tours/components/Drawers/EditTourDrawer";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { useSoftDeleteTour, useTour, useTours, useTourStats } from "@/features/tours/hooks/useTours";
import type { Tour } from "@/features/tours/types";

const LOCALES = ["ar", "en", "es", "pt", "it"] as const;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800";

function textFor(value: Record<string, unknown> | null | undefined, locale: string) {
  if (!value) return "";
  for (const key of [locale, "en", "ar", "es", "pt", "it"]) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) return item;
  }
  return "";
}

function completion(tour: Tour) {
  return LOCALES.filter((locale) => Boolean(textFor(tour.titleJsonb, locale))).length;
}

export default function ToursPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const arabic = locale === "ar";
  const [country, setCountry] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const filters = useMemo(() => ({ limit: 100, ...(search.trim() ? { search: search.trim() } : {}) }), [search]);
  const { data, isLoading, error, refetch } = useTours(filters);
  const { data: stats } = useTourStats();
  const { data: detailedTour } = useTour(editingSlug || "");
  const removeTour = useSoftDeleteTour();
  const tours = data?.data ?? [];
  const countries = useMemo(() => Array.from(new Set(tours.map((tour) => tour.country?.trim()).filter(Boolean))) as string[], [tours]);
  const shown = country === "ALL" ? tours : tours.filter((tour) => tour.country === country);

  const remove = async (tour: Tour) => {
    const title = textFor(tour.titleJsonb, locale) || tour.slug;
    if (!window.confirm(arabic ? "حذف رحلة " + title + "؟" : "Delete " + title + "?")) return;
    try {
      await removeTour.mutateAsync(tour.slug);
      toast.success(arabic ? "تم حذف الرحلة." : "Tour deleted.");
    } catch {
      // The mutation hook displays the backend error.
    }
  };

  return <div className="space-y-6 pb-16 animate-in fade-in duration-300">
    <Card className="p-6 sm:p-8 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500"><Globe2 className="w-7 h-7" /></div>
          <div><h1 className="text-xl sm:text-2xl font-black">{arabic ? "إدارة الرحلات والترجمات" : "Tours & translations"}</h1><p className="mt-1 text-xs sm:text-sm text-muted-foreground">{arabic ? "بيانات حية من نظام الإدارة" : "Live catalog data from the administration API"}</p></div>
        </div>
        <CreateTourWizard />
      </div>
    </Card>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric icon={<Compass className="w-6 h-6" />} label={arabic ? "إجمالي الرحلات" : "Total tours"} value={stats?.totalTours ?? tours.length} />
      <Metric icon={<Globe2 className="w-6 h-6" />} label={arabic ? "منشورة" : "Published"} value={stats?.publishedTours ?? 0} />
      <Metric icon={<Layers className="w-6 h-6" />} label={arabic ? "الدول المتصلة" : "Connected countries"} value={countries.length} />
      <Metric icon={<Award className="w-6 h-6" />} label={arabic ? "رحلات مميزة" : "Featured tours"} value={stats?.featuredTours ?? 0} />
    </div>

    <Tabs defaultValue="grid">
      <TabsList className="mb-6 h-auto rounded-2xl p-1.5">
        <TabsTrigger value="grid"><Compass className="mr-2 w-4 h-4" />{arabic ? "كروت الرحلات" : "Tour cards"}</TabsTrigger>
        <TabsTrigger value="destinations"><Globe2 className="mr-2 w-4 h-4" />{arabic ? "الوجهات" : "Destinations"}</TabsTrigger>
        <TabsTrigger value="table"><Layers className="mr-2 w-4 h-4" />{arabic ? "جدول البيانات" : "Data table"}</TabsTrigger>
      </TabsList>
      <TabsContent value="grid" className="space-y-6">
        <Card className="p-4 rounded-2xl">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter active={country === "ALL"} onClick={() => setCountry("ALL")}>{arabic ? "كل الوجهات" : "All countries"} ({tours.length})</Filter>
              {countries.map((item) => <Filter key={item} active={country === item} onClick={() => setCountry(item)}>{item}</Filter>)}
            </div>
            <label className="relative w-full lg:w-80"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={arabic ? "ابحث باسم الرحلة..." : "Search tours..."} className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm" /></label>
          </div>
        </Card>
        {error ? <Failure retry={() => void refetch()} /> : isLoading ? <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : shown.length === 0 ? <Card className="p-12 text-center text-muted-foreground">{arabic ? "لا توجد رحلات تطابق البحث." : "No tours match these filters."}</Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{shown.map((tour) => <TourCard key={tour.id} tour={tour} locale={locale} arabic={arabic} deleting={removeTour.isPending} edit={() => setEditingSlug(tour.slug)} remove={() => void remove(tour)} />)}</div>}
      </TabsContent>
      <TabsContent value="destinations"><DestinationsManager /></TabsContent>
      <TabsContent value="table"><ToursTable /></TabsContent>
    </Tabs>
    <EditTourDrawer tour={detailedTour ?? tours.find((tour) => tour.slug === editingSlug) ?? null} open={Boolean(editingSlug)} onOpenChange={(open) => !open && setEditingSlug(null)} />
  </div>;
}

function TourCard({ tour, locale, arabic, deleting, edit, remove }: { tour: Tour; locale: string; arabic: boolean; deleting: boolean; edit: () => void; remove: () => void }) {
  const title = textFor(tour.titleJsonb, locale) || tour.slug;
  const overview = textFor(tour.overviewJsonb, locale) || (arabic ? "لا يوجد وصف بعد." : "No overview has been added yet.");
  const duration = textFor(tour.durationJsonb, locale) || (arabic ? "المدة غير محددة" : "Duration not specified");
  return <Card className="overflow-hidden rounded-3xl flex flex-col justify-between">
    <div>
      <div className="relative h-52 overflow-hidden bg-slate-950"><img src={tour.heroImage || FALLBACK_IMAGE} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" /><span className="absolute right-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-black text-amber-400">USD {Number(tour.basePriceUsd).toLocaleString()}</span><span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-slate-100"><Calendar className="w-3.5 h-3.5 text-amber-400" />{duration}</span></div>
      <div className="space-y-3 p-5"><h2 className="line-clamp-1 text-base font-black">{title}</h2><p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{overview}</p><div className="rounded-2xl border bg-muted/50 p-2.5 text-[11px]"><div className="flex justify-between font-bold text-muted-foreground"><span>{arabic ? "الترجمات" : "Translations"}</span><span className="text-emerald-600">{completion(tour)}/5</span></div><div className="mt-2 flex justify-between"><span>{tour.country || (arabic ? "غير محدد" : "Unspecified")}</span><span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />{tour.reviewCount ?? 0} {arabic ? "تقييم" : "reviews"}</span></div></div></div>
    </div>
    <div className="flex justify-end gap-1 border-t px-5 py-3"><Button variant="ghost" size="icon-sm" aria-label={"Edit " + title} onClick={edit}><Edit className="w-4 h-4 text-amber-600" /></Button><Button variant="ghost" size="icon-sm" aria-label={"Delete " + title} disabled={deleting} onClick={remove}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
  </Card>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <Card className="flex items-center justify-between rounded-2xl p-5"><div><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 font-mono text-3xl font-black">{value}</p></div><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">{icon}</div></Card>;
}

function Filter({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={active ? "shrink-0 rounded-xl border border-amber-500 bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-slate-950" : "shrink-0 rounded-xl border bg-muted/30 px-3.5 py-2 text-xs font-extrabold text-muted-foreground"}>{children}</button>;
}

function Failure({ retry }: { retry: () => void }) {
  return <Card className="p-8 text-center"><ImageOff className="mx-auto h-8 w-8 text-destructive" /><h2 className="mt-3 font-bold">Tours could not be loaded</h2><p className="mt-1 text-sm text-muted-foreground">Check the connection, then try again.</p><Button className="mt-4" variant="outline" onClick={retry}>Retry</Button></Card>;
}
