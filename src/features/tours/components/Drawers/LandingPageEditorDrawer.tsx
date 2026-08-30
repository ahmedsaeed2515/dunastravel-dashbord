"use client";

import { useEffect, useState } from "react";
import { LandingPageMutationPayload, LandingPageStatus, LandingPageType, TourLandingPage } from "../../api/landingPagesApi";
import { Tour } from "../../types";
import { useCreateLandingPage, useUpdateLandingPage, usePublishLandingPage, useUnpublishLandingPage, useAttachToursToLandingPage, useDetachTourFromLandingPage, useReorderLandingPageTours, useUpdateLandingPageTourRelation } from "../../hooks/useLandingPages";
import { useTours } from "../../hooks/useTours";
import { extractToursList } from "@/lib/extract-tours";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Globe, Image as ImageIcon, Layers, Package, SearchCheck, CheckCircle2, AlertCircle, Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

interface LandingPageEditorDrawerProps {
  landingPage: TourLandingPage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCALES = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "it", name: "Italiano (Italian)" },
];

export function LandingPageEditorDrawer({ landingPage, open, onOpenChange }: LandingPageEditorDrawerProps) {
  const updateMutation = useUpdateLandingPage();
  const createMutation = useCreateLandingPage();
  const publishMutation = usePublishLandingPage();
  const unpublishMutation = useUnpublishLandingPage();
  const attachMutation = useAttachToursToLandingPage();
  const detachMutation = useDetachTourFromLandingPage();
  const relationMutation = useUpdateLandingPageTourRelation();
  const reorderToursMutation = useReorderLandingPageTours();

  const { data: allToursData } = useTours({ limit: 100 });

  const [activeLang, setActiveLang] = useState("en");
  const [formData, setFormData] = useState<LandingPageMutationPayload>({});
  const [selectedTourToAdd, setSelectedTourToAdd] = useState("");
  const [tourRelations, setTourRelations] = useState<NonNullable<TourLandingPage["tours"]>>([]);
  const [sectionsRaw, setSectionsRaw] = useState("{}");
  const [customSections, setCustomSections] = useState<Array<{ id: string; type: string; title: string; subtitle: string; content?: string }>>([]);

  useEffect(() => {
    if (landingPage) {
      const raw = JSON.stringify(landingPage.sectionsJsonb || {}, null, 2);
      setSectionsRaw(raw);
      
      // Parse structured sections if available
      const secObj = landingPage.sectionsJsonb as any;
      if (secObj && Array.isArray(secObj.sections)) {
        setCustomSections(secObj.sections);
      } else if (Array.isArray(secObj)) {
        setCustomSections(secObj);
      } else if (secObj && typeof secObj === "object" && Object.keys(secObj).length > 0) {
        setCustomSections(
          Object.entries(secObj).map(([k, v]: [string, any], idx) => ({
            id: v?.id || `sec-${idx}-${k}`,
            type: v?.type || k || "custom",
            title: typeof v === "string" ? v : v?.title || k,
            subtitle: v?.subtitle || "",
            content: v?.content || (typeof v === "object" ? JSON.stringify(v) : ""),
          }))
        );
      } else {
        setCustomSections([]);
      }

      setFormData({
        slug: landingPage.slug,
        expectedUpdatedAt: landingPage.updatedAt || undefined,
        type: (landingPage.type || "DESTINATION") as LandingPageType,
        status: (landingPage.status || "PUBLISHED") as LandingPageStatus,
        isActive: landingPage.isActive ?? true,
        sortOrder: landingPage.sortOrder ?? 0,
        titleJsonb: landingPage.titleJsonb || {},
        subtitleJsonb: landingPage.subtitleJsonb || {},
        descriptionJsonb: landingPage.descriptionJsonb || {},
        briefJsonb: landingPage.briefJsonb || {},
        heroImageUrl: landingPage.heroImageUrl || "",
        heroVideoUrl: landingPage.heroVideoUrl || "",
        seoTitleJsonb: landingPage.seoTitleJsonb || {},
        seoDescriptionJsonb: landingPage.seoDescriptionJsonb || {},
        seoKeywordsJsonb: landingPage.seoKeywordsJsonb || {},
      });
      setTourRelations(landingPage.tours || []);
    }
  }, [landingPage]);

  const syncSectionsToFormData = (newSections: Array<{ id: string; type: string; title: string; subtitle: string; content?: string }>) => {
    setCustomSections(newSections);
    const sectionsPayload = { sections: newSections };
    setFormData((prev) => ({ ...prev, sectionsJsonb: sectionsPayload }));
    setSectionsRaw(JSON.stringify(sectionsPayload, null, 2));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const list = [...customSections];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    syncSectionsToFormData(list);
    toast.success("تم تحديث ترتيب القسم بنجاح");
  };

  const addCustomSection = (type: string = "highlight") => {
    const newSec = {
      id: `sec-${Date.now()}`,
      type,
      title: type === "faq" ? "الأسئلة الشائعة" : type === "promo" ? "عروض حصرية VIP" : "مميزات الوجهة الفريدة",
      subtitle: "نص توضيحي للأعضاء والزوار",
      content: "",
    };
    syncSectionsToFormData([...customSections, newSec]);
    toast.success("تمت إضافة قسم جديد");
  };

  const removeCustomSection = (id: string) => {
    syncSectionsToFormData(customSections.filter((s) => s.id !== id));
    toast.success("تم حذف القسم");
  };

  if (!landingPage) return null;

  const handleJsonFieldChange = (field: string, lang: string, value: string) => {
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

  const handleSave = async () => {
    try {
      const payload: LandingPageMutationPayload = {
        ...formData,
        heroImageUrl: formData.heroImageUrl?.trim() || null,
        heroVideoUrl: formData.heroVideoUrl?.trim() || null,
      };
      if (landingPage.id) {
        await updateMutation.mutateAsync({ slug: landingPage.slug, data: payload });
        toast.success("Interface updated successfully");
      } else {
        if (!formData.slug || !formData.titleJsonb?.en?.trim()) {
          toast.error("A slug and English title are required to create an interface.");
          return;
        }
        await createMutation.mutateAsync({ ...payload, type: payload.type ?? "DESTINATION" });
        toast.success("Interface created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update interface");
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(landingPage.slug);
      toast.success("Interface published");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish interface");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync(landingPage.slug);
      toast.success("Interface unpublished");
    } catch (err: any) {
      toast.error(err.message || "Failed to unpublish interface");
    }
  };

  const handleAttachTour = async () => {
    if (!selectedTourToAdd) return;
    try {
      const updated = await attachMutation.mutateAsync({
        slug: landingPage.slug,
        tourIds: [selectedTourToAdd],
      });
      setTourRelations(updated.tours || []);
      toast.success("Tour attached to interface");
      setSelectedTourToAdd("");
    } catch (err: any) {
      toast.error(err.message || "Failed to attach tour");
    }
  };

  const handleDetachTour = async (tourId: string) => {
    try {
      await detachMutation.mutateAsync({
        slug: landingPage.slug,
        tourId,
      });
      setTourRelations((current) => current.filter((relation) => relation.tourId !== tourId));
      toast.success("Tour removed from this interface (global tour remains untouched)");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove tour");
    }
  };

  const updateRelation = async (tourId: string, data: { isFeatured?: boolean; isVisible?: boolean; customBadge?: Record<string, string> }) => {
    try {
      await relationMutation.mutateAsync({ slug: landingPage.slug, tourId, data });
      setTourRelations((current) => current.map((relation) => relation.tourId === tourId ? { ...relation, ...data } : relation));
      toast.success("Tour placement updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update tour placement.");
    }
  };

  const moveTour = async (index: number, direction: -1 | 1) => {
    const relations = [...tourRelations].sort((a, b) => a.sortOrder - b.sortOrder);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= relations.length) return;
    [relations[index], relations[swapIndex]] = [relations[swapIndex], relations[index]];
    try {
      const updated = await reorderToursMutation.mutateAsync({
        slug: landingPage.slug,
        items: relations.map((relation, sortOrder) => ({ tourId: relation.tourId, sortOrder })),
      });
      setTourRelations(updated.tours || []);
      toast.success("Tour order updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder tours.");
    }
  };

  const attachedTourIds = tourRelations.map((t) => t.tourId);
  const allToursList: Tour[] = extractToursList(allToursData);
  const availableTours = allToursList.filter((t) => !attachedTourIds.includes(t.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl w-full p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/80 bg-muted/30 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={landingPage.status === "PUBLISHED" ? "default" : "secondary"}>
                {landingPage.status}
              </Badge>
              <Badge variant="outline">{landingPage.type}</Badge>
            </div>
            <SheetTitle className="text-xl font-bold mt-1">
              Edit Interface: {landingPage.titleJsonb?.en || landingPage.slug}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Slug: <code className="font-mono bg-muted px-1 rounded">/{landingPage.slug}</code>
            </SheetDescription>
          </div>

          <div className="flex items-center gap-2">
            {landingPage.id && landingPage.status === "PUBLISHED" ? (
              <Button size="sm" variant="outline" onClick={handleUnpublish} disabled={unpublishMutation.isPending}>
                Unpublish
              </Button>
            ) : landingPage.id ? (
              <Button size="sm" variant="default" onClick={handlePublish} disabled={publishMutation.isPending}>
                Publish
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-7 mb-6 text-xs h-auto p-1 bg-muted rounded-xl font-bold">
              <TabsTrigger value="general">عام</TabsTrigger>
              <TabsTrigger value="translations" className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> اللغات
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> الغلاف
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-1">
                <Layers className="w-3 h-3" /> الأقسام
              </TabsTrigger>
              <TabsTrigger value="tours" className="flex items-center gap-1">
                <Package className="w-3 h-3" /> الرحلات ({tourRelations.length})
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-1">
                <SearchCheck className="w-3 h-3" /> السيو SEO
              </TabsTrigger>
              <TabsTrigger value="publishing">النشر</TabsTrigger>
            </TabsList>

            {/* 1. GENERAL TAB */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1 block">الرابط الدائم (Slug)</label>
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="font-mono text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">نوع الواجهة / الصفحة</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-bold"
                    value={formData.type || "DESTINATION"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LandingPageType })}
                  >
                    <option value="DESTINATION">صفحة وجهة سياحية (Destination)</option>
                    <option value="THEME">مجموعة تصنيفية (Theme)</option>
                    <option value="COLLECTION">مجموعة مخصصة (Custom)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1 block">ترتيب العرض (Sort Order)</label>
                  <Input
                    type="number"
                    value={formData.sortOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="font-mono text-xs rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                  <div>
                    <div className="text-xs font-bold">الحالة نشطة</div>
                    <div className="text-[10px] text-muted-foreground">تظهر للزوار في الموقع عند النشر</div>
                  </div>
                  <Switch
                    checked={formData.isActive ?? true}
                    onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 2. TRANSLATIONS TAB */}
            <TabsContent value="translations" className="space-y-4">
              <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                {LOCALES.map((loc) => {
                  const comp = landingPage.translationCompletion?.[loc.code];
                  return (
                    <Button
                      key={loc.code}
                      variant={activeLang === loc.code ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveLang(loc.code)}
                      className="gap-1 text-xs"
                    >
                      {loc.name}
                      {comp?.isComplete ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                    </Button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title ({activeLang.toUpperCase()})</label>
                  <Input
                    value={(formData.titleJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("titleJsonb", activeLang, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subtitle ({activeLang.toUpperCase()})</label>
                  <Input
                    value={(formData.subtitleJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("subtitleJsonb", activeLang, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={3}
                    value={(formData.descriptionJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("descriptionJsonb", activeLang, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Brief Intro ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={3}
                    value={(formData.briefJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("briefJsonb", activeLang, e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 3. HERO & MEDIA TAB */}
            <TabsContent value="hero" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Hero Image URL</label>
                <Input
                  placeholder="https://..."
                  value={formData.heroImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                />
                {formData.heroImageUrl && (
                  <div className="mt-2 relative h-40 rounded-lg overflow-hidden border">
                    <img src={formData.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Hero Video URL (Optional)</label>
                <Input
                  placeholder="https://..."
                  value={formData.heroVideoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })}
                />
              </div>
            </TabsContent>

            {/* 4. SECTIONS TAB */}
            <TabsContent value="sections" className="space-y-4">
              <div className="p-4 border rounded-2xl bg-card space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      الأقسام المخصصة وترتيب الظهور (Custom Sections)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      قم بإضافة وترتيب الأقسام الترويجية، المميزات، والأسئلة الشائعة مع المعاينة اللحظية.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomSection("highlight")}
                      className="text-xs font-bold rounded-xl gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> مميزات الوجهة
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomSection("faq")}
                      className="text-xs font-bold rounded-xl gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> الأسئلة الشائعة
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomSection("promo")}
                      className="text-xs font-bold rounded-xl gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> بانر ترويجي VIP
                    </Button>
                  </div>
                </div>

                {customSections.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-2xl text-center text-muted-foreground text-xs space-y-2 bg-muted/10">
                    <Layers className="w-8 h-8 mx-auto text-amber-500/50" />
                    <p className="font-bold text-foreground">لا توجد أقسام مخصصة مضافة حالياً</p>
                    <p>انقر على أحد الأزرار بالأعلى لإضافة قسم جديد وترتيبه بالصفحة.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customSections.map((sec, index) => (
                      <div
                        key={sec.id}
                        className="p-4 border rounded-2xl bg-muted/20 hover:border-amber-500/40 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs bg-background">
                              #{index + 1}
                            </Badge>
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs">
                              {sec.type === "faq" ? "أسئلة شائعة" : sec.type === "promo" ? "بانر ترويجي" : "مميزات الوجهة"}
                            </Badge>
                            <span className="font-bold text-xs text-foreground">{sec.title}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg"
                              title="تحريك لأعلى"
                              onClick={() => moveSection(index, -1)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg"
                              title="تحريك لأسفل"
                              onClick={() => moveSection(index, 1)}
                              disabled={index === customSections.length - 1}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                              title="حذف القسم"
                              onClick={() => removeCustomSection(sec.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                              عنوان القسم
                            </label>
                            <Input
                              value={sec.title}
                              onChange={(e) => {
                                const list = [...customSections];
                                list[index].title = e.target.value;
                                syncSectionsToFormData(list);
                              }}
                              className="h-8 text-xs rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                              الوصف التوضيحي للقسم
                            </label>
                            <Input
                              value={sec.subtitle}
                              onChange={(e) => {
                                const list = [...customSections];
                                list[index].subtitle = e.target.value;
                                syncSectionsToFormData(list);
                              }}
                              className="h-8 text-xs rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Visual Preview Box */}
                        <div className="p-3 bg-background/80 rounded-xl border border-border/60 text-xs">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                            معاينة حية لشكل القسم في الموقع 👁️
                          </span>
                          <div className="font-bold text-foreground">{sec.title || "عنوان القسم"}</div>
                          <div className="text-muted-foreground text-[11px] mt-0.5">
                            {sec.subtitle || "الوصف التوضيحي الذي سيظهر للعملاء في واجهة الصفحة."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <details className="text-xs text-muted-foreground cursor-pointer">
                    <summary className="font-bold hover:text-foreground">
                      محرر البيانات المتقدم (Raw JSON Schema) ⚙️
                    </summary>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs mt-2 rounded-xl"
                      value={sectionsRaw}
                      onChange={(e) => {
                        setSectionsRaw(e.target.value);
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData((prev) => ({ ...prev, sectionsJsonb: parsed }));
                        } catch {
                          // typing buffer
                        }
                      }}
                    />
                  </details>
                </div>
              </div>
            </TabsContent>

            {/* 5. TOURS TAB */}
            <TabsContent value="tours" className="space-y-4">
              <div className="flex gap-2 items-center">
                <select
                  className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                  value={selectedTourToAdd}
                  onChange={(e) => setSelectedTourToAdd(e.target.value)}
                >
                  <option value="">-- Select an existing tour to add to this interface --</option>
                  {availableTours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.titleJsonb?.en || t.slug} (${t.basePriceUsd} USD)
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAttachTour} disabled={!selectedTourToAdd || attachMutation.isPending}>
                  <Plus className="w-4 h-4 mr-1" /> Attach Tour
                </Button>
              </div>

              <div className="border rounded-md divide-y mt-4">
                {tourRelations.length > 0 ? (
                  [...tourRelations].sort((a, b) => a.sortOrder - b.sortOrder).map((rel, index, relations) => (
                    <div key={rel.id} className="p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                          {rel.tour.images?.[0]?.imageUrl ? (
                            <img src={rel.tour.images[0].imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Package className="w-5 h-5 m-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {rel.tour.titleJsonb?.en || rel.tour.slug}
                            {rel.isFeatured && <Badge variant="gold"><Star className="w-3 h-3 mr-1 inline" /> Featured</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            /{rel.tour.slug} • Order: {rel.sortOrder}
                          </div>
                          <Input
                            aria-label={`Custom badge for ${rel.tour.slug}`}
                            className="mt-2 h-8 w-48 text-xs"
                            defaultValue={rel.customBadge?.en || ""}
                            placeholder="Custom badge (English)"
                            onBlur={(event) => {
                              const value = event.target.value.trim();
                              if (value !== (rel.customBadge?.en || "")) {
                                void updateRelation(rel.tourId, { customBadge: value ? { en: value } : {} });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" title={rel.isVisible ? "Hide from public page" : "Show on public page"} onClick={() => updateRelation(rel.tourId, { isVisible: !rel.isVisible })} disabled={relationMutation.isPending}>
                          {rel.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" title={rel.isFeatured ? "Remove featured placement" : "Mark as featured"} onClick={() => updateRelation(rel.tourId, { isFeatured: !rel.isFeatured })} disabled={relationMutation.isPending}>
                          <Star className={`w-4 h-4 ${rel.isFeatured ? "fill-gold-500 text-gold-500" : ""}`} />
                        </Button>
                        <Button size="icon" variant="ghost" title="Move tour up" onClick={() => moveTour(index, -1)} disabled={index === 0 || reorderToursMutation.isPending}><ArrowUp className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" title="Move tour down" onClick={() => moveTour(index, 1)} disabled={index === relations.length - 1 || reorderToursMutation.isPending}><ArrowDown className="w-4 h-4" /></Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          title="Remove from this interface (leaves global tour intact)"
                          onClick={() => handleDetachTour(rel.tourId)}
                          disabled={detachMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No tours attached to this interface yet.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 6. SEO TAB */}
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">SEO Title ({activeLang.toUpperCase()})</label>
                  <Input
                    value={(formData.seoTitleJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("seoTitleJsonb", activeLang, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SEO Meta Description ({activeLang.toUpperCase()})</label>
                  <Textarea
                    rows={3}
                    value={(formData.seoDescriptionJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("seoDescriptionJsonb", activeLang, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SEO Keywords ({activeLang.toUpperCase()})</label>
                  <Input
                    placeholder="egypt, luxury travel, nile cruise"
                    value={(formData.seoKeywordsJsonb as any)?.[activeLang] || ""}
                    onChange={(e) => handleJsonFieldChange("seoKeywordsJsonb", activeLang, e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 7. PUBLISHING TAB */}
            <TabsContent value="publishing" className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                <h4 className="text-sm font-semibold">Publishing Controls</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                      value={formData.status || "PUBLISHED"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as LandingPageStatus })}
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending || createMutation.isPending}>
            {(updateMutation.isPending || createMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
