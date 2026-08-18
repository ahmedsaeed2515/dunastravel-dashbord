"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTour, useUpdateTour } from "@/features/tours/hooks/useTours";
import { Tour } from "@/features/tours/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Loader2, ArrowLeft, Save, Eye, Globe, Image as ImageIcon, Plus, Trash2,
  DollarSign, MapPin, Layers, CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية (Arabic)", dir: "rtl" },
  { code: "es", name: "Español (Spanish)", dir: "ltr" },
  { code: "pt", name: "Português (Portuguese)", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
];

export default function EditTourPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const router = useRouter();
  const { data: tour, isLoading, error } = useTour(slug);
  const updateMutation = useUpdateTour();

  const [activeLang, setActiveLang] = useState("en");
  const [formData, setFormData] = useState<Partial<Tour>>({});
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (tour) {
      setFormData({
        slug: tour.slug,
        category: tour.category || "",
        country: tour.country || "",
        city: tour.city || "",
        basePriceUsd: tour.basePriceUsd !== undefined && tour.basePriceUsd !== null ? String(tour.basePriceUsd) : "0",
        currency: tour.currency || "USD",
        capacity: tour.capacity || 30,
        status: tour.status || "PUBLISHED",
        isActive: tour.isActive ?? true,
        isFeatured: tour.isFeatured ?? false,
        titleJsonb: tour.titleJsonb || {},
        overviewJsonb: tour.overviewJsonb || tour.descriptionJsonb || {},
        durationJsonb: tour.durationJsonb || {},
        includedServicesJsonb: tour.includedServicesJsonb || {},
        excludedServicesJsonb: tour.excludedServicesJsonb || {},
        cancellationPolicyJsonb: tour.cancellationPolicyJsonb || {},
        termsJsonb: tour.termsJsonb || {},
        seoTitle: tour.seoTitle || "",
        seoDescription: tour.seoDescription || "",
      });
      setItineraries(tour.itineraries || []);
      setImages(tour.images || []);
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
      const price = parseFloat(String(formData.basePriceUsd));
      if (isNaN(price) || price < 0) {
        toast.error("Base Price must be 0 or greater (USD)");
        return;
      }

      // Ensure title has at least English title
      const titleJson = formData.titleJsonb || {};
      if (!titleJson.en && !titleJson[activeLang]) {
        toast.error("Tour title is required");
        return;
      }

      const cleanItineraries = itineraries.map((it, idx) => ({
        dayLabel: it.dayLabel || `Day ${idx + 1}`,
        descriptionJsonb: it.descriptionJsonb || { en: `Day ${idx + 1} itinerary` },
        mealsJsonb: it.mealsJsonb && Object.keys(it.mealsJsonb).length > 0 ? it.mealsJsonb : undefined,
        activitiesJsonb: it.activitiesJsonb && Object.keys(it.activitiesJsonb).length > 0 ? it.activitiesJsonb : undefined,
        hotelsJsonb: it.hotelsJsonb && Object.keys(it.hotelsJsonb).length > 0 ? it.hotelsJsonb : undefined,
        transportationJsonb: it.transportationJsonb && Object.keys(it.transportationJsonb).length > 0 ? it.transportationJsonb : undefined,
        notesJsonb: it.notesJsonb && Object.keys(it.notesJsonb).length > 0 ? it.notesJsonb : undefined,
        sortOrder: idx + 1,
      }));

      const cleanImages = images.map((img, idx) => ({
        imageUrl: img.imageUrl || img.url,
        isHero: Boolean(img.isHero),
        isVideo: Boolean(img.isVideo),
        videoUrl: img.videoUrl && String(img.videoUrl).trim().length > 0 ? String(img.videoUrl).trim() : undefined,
        altText: img.altText || undefined,
        sortOrder: idx + 1,
      }));

      const payload: any = {
        category: formData.category?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        basePriceUsd: price,
        currency: "USD",
        status: statusOverride || formData.status || "PUBLISHED",
        isActive: formData.isActive ?? true,
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
        images: cleanImages,
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
        dayLabel: `Day ${nextDayNum}`,
        descriptionJsonb: { [activeLang]: `Day ${nextDayNum} itinerary details` },
        mealsJsonb: { [activeLang]: "Breakfast, Lunch" },
        sortOrder: nextDayNum,
      },
    ]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    setItineraries(itineraries.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (!newImageUrl || !newImageUrl.trim()) return;
    setImages([
      ...images,
      {
        imageUrl: newImageUrl.trim(),
        isHero: images.length === 0,
        sortOrder: images.length + 1,
      },
    ]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetHeroImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isHero: i === index })));
  };

  const activeLangConfig = LOCALES.find((l) => l.code === activeLang) || LOCALES[0];

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
          <TabsTrigger value="media">Gallery ({images.length})</TabsTrigger>
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
            {LOCALES.map((loc) => (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Base Price (USD)</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.basePriceUsd ?? 0}
                    onChange={(e) => setFormData({ ...formData, basePriceUsd: e.target.value as any })}
                    placeholder="e.g. 0.00 or 450.00"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Starting price per adult in USD (enter 0 for free / on request)</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Input value={formData.currency || "USD"} disabled className="bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Capacity (Max Seats)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.capacity || 30}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
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
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste image URL (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button size="sm" onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add Image
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-40 rounded-lg overflow-hidden border bg-muted group">
                    <img src={img.imageUrl || img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <Button
                          size="xs"
                          variant={img.isHero ? "default" : "secondary"}
                          onClick={() => handleSetHeroImage(idx)}
                          className="text-[10px]"
                        >
                          {img.isHero ? "Hero" : "Make Hero"}
                        </Button>
                        <Button size="icon" variant="destructive" className="w-6 h-6" onClick={() => handleRemoveImage(idx)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
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
                    value={formData.status || "PUBLISHED"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
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
                  <Switch checked={formData.isActive ?? true} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
