"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useTour, useUpdateTour } from "@/features/tours/hooks/useTours";
import { Tour, TourItinerary, UpdateTourPayload } from "@/features/tours/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, ArrowLeft, Save, Eye, Globe, Plus, Trash2, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { AvailabilityManager } from "@/features/tours/components/AvailabilityManager";
import { MediaManager } from "@/features/tours/components/MediaManager";

export const TOUR_EDITOR_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية (Arabic)", dir: "rtl" },
  { code: "es", name: "Español (Spanish)", dir: "ltr" },
  { code: "pt", name: "Português (Portuguese)", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
];

export default function EditTourPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const { data: tour, isLoading, error } = useTour(slug);
  const updateMutation = useUpdateTour();

  const [activeLang, setActiveLang] = useState("en");
  const [formData, setFormData] = useState<Partial<Tour>>({});
  const [itineraries, setItineraries] = useState<TourItinerary[]>([]);

  useEffect(() => {
    if (tour) {
      setFormData({
        slug: tour.slug,
        category: tour.category || "",
        country: tour.country || "",
        city: tour.city || "",
        basePriceUsd: tour.basePriceUsd ?? "",
        currency: tour.currency ?? "",
        status: tour.status,
        isActive: tour.isActive,
        isFeatured: tour.isFeatured ?? false,
        titleJsonb: tour.titleJsonb || {},
        overviewJsonb: tour.overviewJsonb ?? {},
        durationJsonb: tour.durationJsonb || {},
        includedServicesJsonb: tour.includedServicesJsonb || {},
        excludedServicesJsonb: tour.excludedServicesJsonb || {},
        cancellationPolicyJsonb: tour.cancellationPolicyJsonb || {},
        termsJsonb: tour.termsJsonb || {},
        seoTitle: tour.seoTitle || "",
        seoDescription: tour.seoDescription || "",
      });
      setItineraries(tour.itineraries || []);
    }
  }, [tour]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading tour editor...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-destructive">Tour Not Found</h2>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  function getLocalizedFieldText(data: any, lang: string): string {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
      return data.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
    }
    const val = data[lang];
    if (val === undefined || val === null) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) {
      return val.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
    }
    return JSON.stringify(val);
  }

  const handleJsonChange = (field: string, lang: string, value: string) => {
    setFormData((prev) => {
      const currentObj = (prev as any)[field] || {};
      return {
        ...prev,
        [field]: {
          ...currentObj,
          [lang]: value,
        },
      };
    });
  };

  const handleSave = async (statusOverride?: string) => {
    try {
      const priceText = String(formData.basePriceUsd ?? "").trim();
      if (!/^\d+(?:\.\d{1,2})?$/.test(priceText)) {
        toast.error("Base price is required and must have no more than two decimal places.");
        return;
      }
      const price = Number(priceText);

      // Ensure title has at least English title
      const titleJson = formData.titleJsonb || {};
      if (!titleJson.en && !titleJson[activeLang]) {
        toast.error("Tour title is required");
        return;
      }

      const cleanItineraries = itineraries.map((it, idx) => ({
        dayLabel: it.dayLabel?.trim() || undefined,
        descriptionJsonb: it.descriptionJsonb,
        mealsJsonb: it.mealsJsonb && Object.keys(it.mealsJsonb).length > 0 ? it.mealsJsonb : undefined,
        activitiesJsonb: it.activitiesJsonb && Object.keys(it.activitiesJsonb).length > 0 ? it.activitiesJsonb : undefined,
        hotelsJsonb: it.hotelsJsonb && Object.keys(it.hotelsJsonb).length > 0 ? it.hotelsJsonb : undefined,
        transportationJsonb: it.transportationJsonb && Object.keys(it.transportationJsonb).length > 0 ? it.transportationJsonb : undefined,
        notesJsonb: it.notesJsonb && Object.keys(it.notesJsonb).length > 0 ? it.notesJsonb : undefined,
        sortOrder: idx + 1,
      }));

      if (cleanItineraries.some((it) => Object.values(it.descriptionJsonb ?? {}).every((value) => !String(value).trim()))) {
        toast.error("Every itinerary day needs a description in at least one locale.");
        return;
      }

      const payload: UpdateTourPayload = {
        category: formData.category?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        basePriceUsd: price,
        currency: formData.currency || undefined,
        status: (statusOverride ?? formData.status) as UpdateTourPayload["status"],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured ?? false,
        titleJsonb: formData.titleJsonb || {},
        overviewJsonb: formData.overviewJsonb || {},
        durationJsonb: formData.durationJsonb && Object.keys(formData.durationJsonb).length > 0 ? formData.durationJsonb : undefined,
        includedServicesJsonb: formData.includedServicesJsonb && Object.keys(formData.includedServicesJsonb).length > 0 ? formData.includedServicesJsonb : undefined,
        excludedServicesJsonb: formData.excludedServicesJsonb && Object.keys(formData.excludedServicesJsonb).length > 0 ? formData.excludedServicesJsonb : undefined,
        cancellationPolicyJsonb: formData.cancellationPolicyJsonb && Object.keys(formData.cancellationPolicyJsonb).length > 0 ? formData.cancellationPolicyJsonb : undefined,
        termsJsonb: formData.termsJsonb && Object.keys(formData.termsJsonb).length > 0 ? formData.termsJsonb : undefined,
        seoTitle: formData.seoTitle?.trim() || undefined,
        seoDescription: formData.seoDescription?.trim() || undefined,
        itineraries: cleanItineraries,
        expectedUpdatedAt: tour.updatedAt,
      };

      await updateMutation.mutateAsync({
        slug: tour.slug,
        data: payload,
      });

      toast.success("Tour saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save tour");
    }
  };

  const handleAddItineraryDay = () => {
    const nextDayNum = itineraries.length + 1;
    setItineraries([
      ...itineraries,
      {
        dayLabel: "",
        descriptionJsonb: {},
        sortOrder: nextDayNum,
      },
    ]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    setItineraries(itineraries.filter((_, i) => i !== index));
  };

  const activeLangConfig = TOUR_EDITOR_LOCALES.find((l) => l.code === activeLang) || TOUR_EDITOR_LOCALES[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Sticky Action Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b py-3 px-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/${locale}/admin/tours/${tour.slug}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tour Details
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold truncate">Editing: {tour.titleJsonb?.en || tour.slug}</h1>
            <Badge variant={formData.status === "PUBLISHED" ? "default" : "secondary"}>
              {formData.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" /> Preview as Visitor (معاينة كزائر)
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => handleSave("DRAFT")} disabled={updateMutation.isPending}>
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave()} disabled={updateMutation.isPending} className="gap-1.5">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor Main Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="basic">Basic Specs</TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Translations
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Pricing & Seats
          </TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary ({itineraries.length})</TabsTrigger>
          <TabsTrigger value="media">Gallery ({tour.images?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>

        {/* 1. BASIC SPECS */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tour Core Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug (Route Identifier)</label>
                  <Input value={formData.slug || ""} disabled className="bg-muted" />
                  <p className="text-[11px] text-muted-foreground mt-1">Slug is the unique permanent identifier</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category / Theme</label>
                  <Input value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. egypt, luxury, adventure" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input value={formData.country || ""} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="e.g. Egypt" />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="e.g. Cairo" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <div className="font-medium text-sm">Featured Tour</div>
                  <div className="text-xs text-muted-foreground">Highlight this tour on homepage and destination headers</div>
                </div>
                <Switch checked={formData.isFeatured ?? false} onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. TRANSLATIONS */}
        <TabsContent value="translations" className="space-y-4">
          <div className="flex gap-2 border-b pb-3 overflow-x-auto">
            {TOUR_EDITOR_LOCALES.map((loc) => (
              <Button
                key={loc.code}
                variant={activeLang === loc.code ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLang(loc.code)}
                className="gap-1.5 shrink-0"
              >
                <Globe className="w-3.5 h-3.5" /> {loc.name}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Multilingual Content for [{activeLangConfig.name}]
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" dir={activeLangConfig.dir}>
              <div>
                <label className="text-sm font-medium block mb-1">Title ({activeLang.toUpperCase()})</label>
                <Input
                  value={getLocalizedFieldText(formData.titleJsonb, activeLang)}
                  onChange={(e) => handleJsonChange("titleJsonb", activeLang, e.target.value)}
                  placeholder={`Tour title in ${activeLangConfig.name}...`}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Duration Label ({activeLang.toUpperCase()})</label>
                <Input
                  placeholder="e.g. 8 Days / 7 Nights"
                  value={getLocalizedFieldText(formData.durationJsonb, activeLang)}
                  onChange={(e) => handleJsonChange("durationJsonb", activeLang, e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Overview / Description ({activeLang.toUpperCase()})</label>
                <Textarea
                  rows={5}
                  value={getLocalizedFieldText(formData.overviewJsonb, activeLang)}
                  onChange={(e) => handleJsonChange("overviewJsonb", activeLang, e.target.value)}
                  placeholder={`Detailed overview in ${activeLangConfig.name}...`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Included Services ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={3}
                    value={getLocalizedFieldText(formData.includedServicesJsonb, activeLang)}
                    onChange={(e) => handleJsonChange("includedServicesJsonb", activeLang, e.target.value)}
                    placeholder="Hotels, Transport, Guides..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Excluded Services ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={3}
                    value={getLocalizedFieldText(formData.excludedServicesJsonb, activeLang)}
                    onChange={(e) => handleJsonChange("excludedServicesJsonb", activeLang, e.target.value)}
                    placeholder="International Flights, Personal expenses..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PRICING & SEATS */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing & Seat Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Base Price (USD)</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.basePriceUsd ?? ""}
                    onChange={(e) => setFormData({ ...formData, basePriceUsd: e.target.value as any })}
                    placeholder="e.g. 0.00 or 450.00"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Starting price per adult in USD (enter 0 for free / on request)</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Input value={formData.currency ?? ""} disabled className="bg-muted" />
                </div>
              </div>
              <AvailabilityManager tour={tour} locale={locale} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. ITINERARY */}
        <TabsContent value="itinerary" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Itinerary Days ({itineraries.length})</h3>
            <Button size="sm" onClick={handleAddItineraryDay} variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Day
            </Button>
          </div>

          <div className="space-y-4">
            {itineraries.map((day, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Day {idx + 1}</Badge>
                    <Input
                      className="w-48 h-8 text-xs font-semibold"
                      value={day.dayLabel || `Day ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...itineraries];
                        updated[idx].dayLabel = e.target.value;
                        setItineraries(updated);
                      }}
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleRemoveItineraryDay(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Description ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={2}
                    className="text-xs"
                    value={day.descriptionJsonb?.[activeLang] || day.descriptionJsonb?.en || ""}
                    onChange={(e) => {
                      const updated = [...itineraries];
                      updated[idx].descriptionJsonb = {
                        ...updated[idx].descriptionJsonb,
                        [activeLang]: e.target.value,
                      };
                      setItineraries(updated);
                    }}
                    placeholder={`Day ${idx + 1} description...`}
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 5. MEDIA */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent><MediaManager tour={tour} /></CardContent>
          </Card>
        </TabsContent>

        {/* 6. SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Engine Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">SEO Meta Title</label>
                <Input value={formData.seoTitle || ""} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Meta Description</label>
                <Textarea rows={3} value={formData.seoDescription || ""} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. PUBLISHING */}
        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing & Status Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    value={formData.status ?? ""}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="" disabled>Select status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="text-sm font-medium">Is Active</div>
                    <div className="text-xs text-muted-foreground">Allows tour to be queried</div>
                  </div>
                  <Switch checked={formData.isActive ?? false} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
