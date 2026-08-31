"use client";

import { useState } from "react";
import { Tour } from "../types";
import { useAddTourItinerary, useRemoveTourItinerary, useUpdateTourItinerary } from "../hooks/useTours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Edit2, X, Save, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";

interface ItineraryManagerProps {
  tour: Tour;
}

const LANGUAGES = [
  { code: "ar", label: "العربية (AR)", flag: "🇪🇬" },
  { code: "en", label: "English (EN)", flag: "🇬🇧" },
  { code: "es", label: "Español (ES)", flag: "🇪🇸" },
  { code: "pt", label: "Português (PT)", flag: "🇧🇷" },
  { code: "it", label: "Italiano (IT)", flag: "🇮🇹" },
] as const;

export function ItineraryManager({ tour }: ItineraryManagerProps) {
  const { mutate: addItinerary, isPending: isAdding } = useAddTourItinerary();
  const { mutate: removeItinerary, isPending: isRemoving } = useRemoveTourItinerary();
  const { mutate: updateItinerary, isPending: isUpdating } = useUpdateTourItinerary();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<string>("ar");

  // Form State
  const [titles, setTitles] = useState<Record<string, string>>({
    ar: "",
    en: "",
    es: "",
    pt: "",
    it: "",
  });

  const [descriptions, setDescriptions] = useState<Record<string, string>>({
    ar: "",
    en: "",
    es: "",
    pt: "",
    it: "",
  });

  const [sortOrder, setSortOrder] = useState<number>(
    tour.itineraries?.length ? tour.itineraries.length + 1 : 1
  );

  const resetForm = () => {
    setTitles({ ar: "", en: "", es: "", pt: "", it: "" });
    setDescriptions({ ar: "", en: "", es: "", pt: "", it: "" });
    setSortOrder(tour.itineraries?.length ? tour.itineraries.length + 1 : 1);
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleTitleChange = (lang: string, value: string) => {
    setTitles((prev) => ({ ...prev, [lang]: value }));
  };

  const handleDescChange = (lang: string, value: string) => {
    setDescriptions((prev) => ({ ...prev, [lang]: value }));
  };

  // Auto-fill empty languages from the first available filled language
  const handleAutoFillLanguages = () => {
    const sourceTitle = titles.ar || titles.en || titles.es || titles.pt || titles.it || "";
    const sourceDesc = descriptions.ar || descriptions.en || descriptions.es || descriptions.pt || descriptions.it || "";

    if (!sourceTitle && !sourceDesc) {
      toast.warning("يرجى كتابة عنوان أو وصف في إحدى اللغات أولاً.");
      return;
    }

    setTitles((prev) => {
      const updated = { ...prev };
      LANGUAGES.forEach((l) => {
        if (!updated[l.code]?.trim()) {
          updated[l.code] = sourceTitle;
        }
      });
      return updated;
    });

    setDescriptions((prev) => {
      const updated = { ...prev };
      LANGUAGES.forEach((l) => {
        if (!updated[l.code]?.trim()) {
          updated[l.code] = sourceDesc;
        }
      });
      return updated;
    });

    toast.success("تم نسخ النصوص إلى كافة اللغات غير المكتملة بنجاح!");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryTitle = titles.ar || titles.en || titles.es || titles.pt || titles.it || `Day ${sortOrder}`;
    const primaryDesc = descriptions.ar || descriptions.en || descriptions.es || descriptions.pt || descriptions.it || "";

    // Ensure all 5 languages have at least the primary fallback
    const titleJsonb: Record<string, string> = {};
    const descriptionJsonb: Record<string, string> = {};
    LANGUAGES.forEach((l) => {
      titleJsonb[l.code] = titles[l.code]?.trim() || primaryTitle;
      descriptionJsonb[l.code] = descriptions[l.code]?.trim() || primaryDesc;
    });

    addItinerary(
      {
        slug: tour.slug,
        data: {
          dayLabel: primaryTitle,
          titleJsonb,
          descriptionJsonb,
          sortOrder,
        },
      },
      {
        onSuccess: resetForm,
      }
    );
  };

  const handleEditSubmit = (e: React.FormEvent, dayId: string) => {
    e.preventDefault();
    const primaryTitle = titles.ar || titles.en || titles.es || titles.pt || titles.it || `Day ${sortOrder}`;
    const primaryDesc = descriptions.ar || descriptions.en || descriptions.es || descriptions.pt || descriptions.it || "";

    const titleJsonb: Record<string, string> = {};
    const descriptionJsonb: Record<string, string> = {};
    LANGUAGES.forEach((l) => {
      titleJsonb[l.code] = titles[l.code]?.trim() || primaryTitle;
      descriptionJsonb[l.code] = descriptions[l.code]?.trim() || primaryDesc;
    });

    updateItinerary(
      {
        slug: tour.slug,
        dayId,
        data: {
          dayLabel: primaryTitle,
          titleJsonb,
          descriptionJsonb,
          sortOrder,
        },
      },
      {
        onSuccess: resetForm,
      }
    );
  };

  const startEditing = (it: any) => {
    setEditingId(it.id);
    const existingTitles: Record<string, string> = {};
    const existingDescs: Record<string, string> = {};

    LANGUAGES.forEach((l) => {
      existingTitles[l.code] = it.titleJsonb?.[l.code] || (l.code === "ar" ? it.dayLabel || "" : "");
      existingDescs[l.code] = it.descriptionJsonb?.[l.code] || "";
    });

    // Fallbacks
    const fallbackTitle = it.dayLabel || "";
    const fallbackDesc = it.descriptionJsonb?.["en"] || it.descriptionJsonb?.["ar"] || "";

    LANGUAGES.forEach((l) => {
      if (!existingTitles[l.code]) existingTitles[l.code] = fallbackTitle;
      if (!existingDescs[l.code]) existingDescs[l.code] = fallbackDesc;
    });

    setTitles(existingTitles);
    setDescriptions(existingDescs);
    setSortOrder(it.sortOrder);
    setIsAddingNew(false);
  };

  const sortedItineraries = [...(tour.itineraries || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            إدارة البرنامج اليومي (Itinerary Management - 5 Languages)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            يدعم المحتوى 5 لغات رسمية: العربية، الإنجليزية، الإسبانية، البرتغالية، والإيطالية
          </p>
        </div>
        {!isAddingNew && !editingId && (
          <Button size="sm" onClick={() => setIsAddingNew(true)} className="font-bold gap-1.5 rounded-xl">
            <Plus className="h-4 w-4" /> إضافة يوم ➕
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="border rounded-2xl p-5 bg-card/60 backdrop-blur-xs space-y-4 shadow-sm relative border-primary/20">
          <Button variant="ghost" size="icon" className="absolute top-3 left-3 h-7 w-7 rounded-full" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">إضافة يوم جديد للبرنامج</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillLanguages}
              className="text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ملء اللغات المتبقية تلقائياً (Auto-Fill)
            </Button>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLangTab(lang.code)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeLangTab === lang.code
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {titles[lang.code]?.trim() && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold flex items-center justify-between">
                <span>عنوان اليوم ({LANGUAGES.find((l) => l.code === activeLangTab)?.label})</span>
                <span className="text-[10px] text-muted-foreground font-normal">مثال: زيارة أهرامات الجيزة ومصنع البردي</span>
              </label>
              <Input
                value={titles[activeLangTab] || ""}
                onChange={(e) => handleTitleChange(activeLangTab, e.target.value)}
                placeholder="اكتب عنوان اليوم باللغة المختارة..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold">الترتيب (Sort Order)</label>
              <Input
                required
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold flex items-center justify-between">
              <span>وصف وتفاصيل اليوم ({LANGUAGES.find((l) => l.code === activeLangTab)?.label})</span>
              <span className="text-[10px] text-muted-foreground font-normal">الأنشطة، الوجبات، ومسار اليوم بالتفصيل</span>
            </label>
            <Textarea
              rows={4}
              value={descriptions[activeLangTab] || ""}
              onChange={(e) => handleDescChange(activeLangTab, e.target.value)}
              placeholder="اكتب تفاصيل وجدول اليوم باللغة المختارة..."
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={resetForm} className="rounded-xl">
              إلغاء
            </Button>
            <Button size="sm" type="submit" disabled={isAdding} className="font-bold gap-1.5 rounded-xl shadow-sm">
              <Save className="h-4 w-4" /> حفظ اليوم
            </Button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingId && (
        <form onSubmit={(e) => handleEditSubmit(e, editingId)} className="border-2 border-primary/30 rounded-2xl p-5 bg-card/80 space-y-4 shadow-sm relative">
          <Button variant="ghost" size="icon" className="absolute top-3 left-3 h-7 w-7 rounded-full" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">تعديل بيانات اليوم (الـ 5 لغات)</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillLanguages}
              className="text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ملء اللغات المتبقية تلقائياً (Auto-Fill)
            </Button>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLangTab(lang.code)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeLangTab === lang.code
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {titles[lang.code]?.trim() && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold flex items-center justify-between">
                <span>عنوان اليوم ({LANGUAGES.find((l) => l.code === activeLangTab)?.label})</span>
              </label>
              <Input
                value={titles[activeLangTab] || ""}
                onChange={(e) => handleTitleChange(activeLangTab, e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold">الترتيب</label>
              <Input
                required
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold">الوصف والتفاصيل ({LANGUAGES.find((l) => l.code === activeLangTab)?.label})</label>
            <Textarea
              rows={4}
              value={descriptions[activeLangTab] || ""}
              onChange={(e) => handleDescChange(activeLangTab, e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={resetForm} className="rounded-xl">
              إلغاء
            </Button>
            <Button size="sm" type="submit" disabled={isUpdating} className="font-bold gap-1.5 rounded-xl shadow-sm">
              <Save className="h-4 w-4" /> تحديث اليوم
            </Button>
          </div>
        </form>
      )}

      {/* Itinerary Cards List */}
      <div className="space-y-3.5">
        {sortedItineraries.length > 0 ? (
          sortedItineraries.map((it, i) => {
            const titleObj = (it as any).titleJsonb;
            const currentTitle = titleObj?.ar || titleObj?.en || it.dayLabel || `Day ${it.sortOrder}`;
            const currentDesc = (it.descriptionJsonb as any)?.ar || (it.descriptionJsonb as any)?.en || Object.values(it.descriptionJsonb || {})[0] || "لا يوجد وصف مسجل.";
            const availableLangs = Object.keys(titleObj || it.descriptionJsonb || {}).filter((k) => ["ar", "en", "es", "pt", "it"].includes(k));

            return (
              <div
                key={it.id || i}
                className="border rounded-2xl p-4 bg-card shadow-2xs space-y-3 group relative hover:border-primary/40 transition-all overflow-hidden"
              >
                <div className="absolute top-3 left-3 flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg" onClick={() => startEditing(it)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => removeItinerary({ slug: tour.slug, dayId: it.id! })}
                    disabled={isRemoving}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between pl-20">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {it.sortOrder}
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {currentTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {availableLangs.length > 0 ? (
                      availableLangs.map((code) => (
                        <span key={code} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase font-mono">
                          {code}
                        </span>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-[9px]">Generic</Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pl-8 line-clamp-3">
                  {currentDesc}
                </p>
              </div>
            );
          })
        ) : (
          !isAddingNew && (
            <div className="text-center text-muted-foreground py-12 border rounded-2xl bg-card/40">
              لا توجد أيام مسجلة لهذا البرنامج السياحي بعد.
            </div>
          )
        )}
      </div>
    </div>
  );
}
