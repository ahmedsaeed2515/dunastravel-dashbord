"use client";

import { useEffect, useState } from "react";
import { LandingPageMutationPayload, LandingPageStatus, LandingPageType, TourLandingPage } from "../../api/landingPagesApi";
import { useCreateLandingPage, useUpdateLandingPage, usePublishLandingPage, useUnpublishLandingPage, useAttachToursToLandingPage, useDetachTourFromLandingPage, useReorderLandingPageTours, useUpdateLandingPageTourRelation } from "../../hooks/useLandingPages";
import { useTours } from "../../hooks/useTours";
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

  useEffect(() => {
    if (landingPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const availableTours = allToursData?.data?.filter((t) => !attachedTourIds.includes(t.id)) || [];

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
            <TabsList className="grid grid-cols-7 mb-6 text-xs h-auto p-1 bg-muted">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="translations" className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Locales
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Hero
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-1">
                <Layers className="w-3 h-3" /> Sections
              </TabsTrigger>
              <TabsTrigger value="tours" className="flex items-center gap-1">
                <Package className="w-3 h-3" /> Tours ({tourRelations.length})
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-1">
                <SearchCheck className="w-3 h-3" /> SEO
              </TabsTrigger>
              <TabsTrigger value="publishing">Status</TabsTrigger>
            </TabsList>

            {/* 1. GENERAL TAB */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug (Route identifier)</label>
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Interface Type</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.type || "DESTINATION"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LandingPageType })}
                  >
                    <option value="DESTINATION">Destination Page</option>
                    <option value="THEME">Theme Collection</option>
                    <option value="COLLECTION">Custom Collection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sortOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="text-sm font-medium">Is Active</div>
                    <div className="text-xs text-muted-foreground">Visible on site when published</div>
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
              <div className="p-4 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">Custom Page Content & Promotional Blocks</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure extra hero highlights, FAQs, or promotional banners rendered below the tour listings.
                </p>
                <Textarea
                  rows={8}
                  className="font-mono text-xs"
                  value={JSON.stringify(formData.sectionsJsonb || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, sectionsJsonb: parsed });
                    } catch {
                      // ignore parse errors while typing
                    }
                  }}
                />
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
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
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
