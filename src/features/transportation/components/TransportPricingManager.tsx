"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Truck,
  Bus,
  Car,
  Plus,
  Search,
  Users,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
  LayoutGrid,
  DollarSign,
  Menu,
  FolderOpen,
  Link as LinkIcon,
  Calendar,
  ArrowDownAZ,
  ArrowUpZA,
  Repeat,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { transportPricingApi } from "@/features/transportation/api/transportPricingApi";
import type { CreateTransportPricingDto } from "@/features/transportation/types";
import { DEFAULT_FLEET } from "@/features/transportation/data/default-fleet";
import { TransportPricing, TransportPricingFilters } from "@/features/transportation/types";
import { resolveLocalizedFeature } from "@/features/transportation/data/default-fleet";
import { CANONICAL_ROUTES } from "@/features/transportation/data/canonical-routes";

interface CategoryMeta {
  labelAr: string;
  labelEn: string;
  icon: React.ElementType;
  badgeClass: string;
  dotColor: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  transfer: {
    labelAr: "توصيل واستقبال",
    labelEn: "Airport Transfer",
    icon: Truck,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dotColor: "bg-emerald-500",
  },
  transportation: {
    labelAr: "نقل",
    labelEn: "Transportation",
    icon: Bus,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dotColor: "bg-sky-500",
  },
  private: {
    labelAr: "سيارة خاصة",
    labelEn: "Private Vehicle",
    icon: Car,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    dotColor: "bg-purple-500",
  },
};

function inferCategory(item: string | undefined): string {
  if (!item) return "transportation";
  const cat = item.toLowerCase().trim();
  if (cat === "transfer" || cat.includes("airport") || cat.includes("توصيل")) return "transfer";
  if (cat === "private" || cat.includes("سيارة")) return "private";
  return "transportation";
}

function getFallbackImage(category: string): string {
  switch (category) {
    case "transfer":
      return "/imgs/transportation/truck1.jpeg";
    case "private":
      return "/imgs/transportation/car1.jpeg";
    case "bus":
    default:
      return "/imgs/transportation/bus1.jpeg";
  }
}

const emptyPricing: TransportPricing = {
  id: "",
  tourId: undefined,
  bookingId: undefined,
  route: { ar: "", en: "", es: "", pt: "", it: "" },
  routes: { ar: "", en: "", es: "", pt: "", it: "" },
  priceBase0204: 0,
  priceBase0507: 0,
  priceBase0814: 0,
  currency: "USD",
  displayOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function getRouteDisplayName(item: TransportPricing, locale: string): string {
  const routes = (item.routes && typeof item.routes === "object")
    ? (item.routes as Record<string, string>)
    : (item.route && typeof item.route === "object")
      ? (item.route as Record<string, string>)
      : { es: String(item.route || "") };
  return routes[locale] || routes.es || routes.en || routes.ar || Object.values(routes).find(Boolean) || "—";
}

export function TransportPricingManager({
  tourId,
  bookingId,
  initialCategory,
}: {
  tourId?: string;
  bookingId?: string;
  initialCategory?: string;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const queryClient = useQueryClient();
  const t = useTranslations();
  const isRtl = isAr;

  const [category, setCategory] = useState<string>(initialCategory || "transportation");
  const [pricings, setPricings] = useState<TransportPricing[]>([]);
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportPricing | null>(null);
  const [draft, setDraft] = useState<TransportPricing>({ ...emptyPricing });
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TransportPricing | null>(null);
  const [activeTab, setActiveTab] = useState("pricings");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: apiPricings = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["transport-pricings", category, tourId, bookingId, search],
    queryFn: async () => {
      try {
        const list = await transportPricingApi.list({
          category,
          passengerRange: search.trim() || undefined,
          tourId,
          bookingId,
        });
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn("Error fetching transport pricings:", err);
        return [];
      }
    },
    staleTime: 30_000,
  });

  // If we have a tourId or bookingId, fetch specific pricings
  useEffect(() => {
    if (tourId || bookingId) {
      refetch();
    }
  }, [tourId, bookingId, refetch]);

  const filteredPricings = useMemo(() => {
    return pricings.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const routes = (item.routes && typeof item.routes === "object")
          ? (item.routes as Record<string, string>)
          : (item.route && typeof item.route === "object")
            ? (item.route as Record<string, string>)
            : { es: String(item.route || "") };
        const match = Object.values(routes).some(v => v?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [pricings, search]);

  // Load default canonical sample data if no pricings fetched
  useEffect(() => {
    if (apiPricings.length === 0 && (tourId || bookingId)) {
      const samplePricings: TransportPricing[] = CANONICAL_ROUTES.map((c, idx) => ({
        id: `pricing-${tourId || bookingId}-${idx + 1}`,
        tourId,
        bookingId,
        route: { ...c.route },
        routes: { ...c.route },
        priceBase0204: c.priceBase0204,
        priceBase0507: c.priceBase0507,
        priceBase0814: c.priceBase0814,
        currency: c.currency || "USD",
        displayOrder: c.displayOrder || idx + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setPricings(samplePricings);
    } else if (apiPricings.length > 0) {
      setPricings(apiPricings);
    }
  }, [apiPricings, tourId, bookingId]);

  const saveMutation = useMutation({
    mutationFn: async (payload: TransportPricing) => {
      const routesObj = (payload.routes && typeof payload.routes === "object")
        ? { ...payload.routes }
        : (payload.route && typeof payload.route === "object")
          ? { ...payload.route }
          : { es: String(payload.route || "") };

      const pricingData: CreateTransportPricingDto = {
        tourId: payload.tourId,
        bookingId: payload.bookingId,
        route: routesObj,
        priceBase0204: Number(payload.priceBase0204) || 0,
        priceBase0507: Number(payload.priceBase0507) || 0,
        priceBase0814: Number(payload.priceBase0814) || 0,
        currency: payload.currency || "USD",
        displayOrder: payload.displayOrder,
        isActive: Boolean(payload.isActive),
      };

      if (editingItem?.id) {
        return await transportPricingApi.update(editingItem.id, pricingData);
      } else {
        return await transportPricingApi.create(pricingData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-pricings", category] });
      toast.success(
        isAr
          ? "تم حفظ سعر النقل بنجاح! ✨"
          : "Transport pricing saved successfully! ✨"
      );
      setIsEditorOpen(false);
      setEditingItem(null);
      setDraft({ ...emptyPricing });
      refetch();
    },
    onError: (err: any) => {
      const serverMessage = err?.response?.data?.message;
      let displayError = "";
      if (Array.isArray(serverMessage)) {
        displayError = serverMessage.join(", ");
      } else if (typeof serverMessage === "string") {
        displayError = serverMessage;
      } else if (err?.message) {
        displayError = err.message;
      }
      toast.error(displayError || (isAr ? "تعذر حفظ سعر النقل." : "Failed to save transport pricing."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await transportPricingApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-pricings", category] });
      toast.success(
        isAr ? "تم حذف سعر النقل بنجاح! 🗑️" : "Transport pricing deleted successfully! 🗑️"
      );
      setDeleteConfirmItem(null);
      refetch();
    },
    onError: (err: any) => {
      const serverMessage = err?.response?.data?.message;
      let displayError = "";
      if (Array.isArray(serverMessage)) {
        displayError = serverMessage.join(", ");
      } else if (typeof serverMessage === "string") {
        displayError = serverMessage;
      } else if (err?.message) {
        displayError = err.message;
      }
      toast.error(displayError || (isAr ? "تعذر حذف سعر النقل." : "Failed to delete transport pricing."));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const item = pricings.find((p) => p.id === id);
      if (!item) throw new Error("Pricing not found");
      return await transportPricingApi.toggleActive(id, !item.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-pricings", category] });
      toast.success(
        isAr ? "تم تفعيل إلغاء تنشيط السعر! ✨" : "Transport pricing status toggled! ✨"
      );
      refetch();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          (isAr ? "تعذر تفعيل إلغاء التنشيط." : "Failed to toggle status.")
      );
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setDraft({
      id: "",
      tourId,
      bookingId,
      route: { ar: "", en: "", es: "", pt: "", it: "" },
      routes: { ar: "", en: "", es: "", pt: "", it: "" },
      priceBase0204: 0,
      priceBase0507: 0,
      priceBase0814: 0,
      currency: "USD",
      displayOrder: pricings.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveTab("pricings");
    setIsEditorOpen(true);
  };

  const openEditModal = (item: TransportPricing) => {
    const routesObj = (item.routes && typeof item.routes === "object")
      ? { ...item.routes }
      : (item.route && typeof item.route === "object")
        ? { ...item.route }
        : { es: String(item.route || "") };

    setEditingItem(item);
    setDraft({
      ...item,
      route: routesObj,
      routes: routesObj,
      priceBase0204: Number(item.priceBase0204 || 0),
      priceBase0507: Number(item.priceBase0507 || 0),
      priceBase0814: Number(item.priceBase0814 || 0),
      isActive: Boolean(item.isActive),
    });
    setActiveTab("pricings");
    setIsEditorOpen(true);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPricings([]);
    refetch();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? "rtl" : "ltr"}>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 shrink-0">
              <Truck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                <span>{isAr ? "أسعار النقل والمركبات" : "Transportation Pricing"}</span>
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <PageHelpTooltip
                  description={isAr
                    ? "إدارة أسعار النقل حسب عدد الركاب — تحديد الأسعار لنطاقات الركاب المختلفة (2-4، 5-7، 8-14) وإضافتها لكل رحلة."
                    : "Manage transportation pricing by passenger count — set prices for different passenger ranges (2-4, 5-7, 8-14) and add them to each trip."}
                />
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                {isAr
                  ? "تعيين أسعار النقل بناءً على عدد الأفراد لكل نطاق ركاب"
                  : "Set transportation prices based on number of passengers per range"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={isFetching}
            className="rounded-2xl h-11 text-xs font-bold gap-2 border-border cursor-pointer shadow-xs"
          >
            <Plus className={`w-4 h-4 ${isFetching ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isAr ? "إضافة سعر جديد +" : "Add Pricing +"}</span>
          </Button>

          {/* Category filter */}
          <Select
            onValueChange={handleCategoryChange}
            value={category}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={isAr ? "اختر التصنيف" : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transportation">{isAr ? "نقل عام" : "General Transportation"}</SelectItem>
              <SelectItem value="transfer">{isAr ? "توصيل واستقبال" : "Airport Transfer"}</SelectItem>
              <SelectItem value="private">{isAr ? "سيارة خاصة" : "Private Vehicle"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Pricing Table */}
      <div className="p-4 rounded-3xl bg-card border shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-muted-foreground">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-xs font-bold">
              {isAr ? "جاري تحميل الأسعار..." : "Loading prices..."}
            </span>
          </div>
        ) : filteredPricings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-center">
            <Truck className="w-12 h-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-foreground">
                {isAr
                  ? "لا توجد أسعار نقل مطابقة"
                  : "No transport pricing found matching criteria"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {isAr
                  ? "يمكنك إضافة سعر نقل جديد باستخدام الزر أعلاه."
                  : "You can add a new transport pricing using the button above."}
              </p>
              {tourId || bookingId ? (
                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-2 text-xs font-bold px-4 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl"
                >
                  <Plus className="w-3.5 h-3.5 stroke-3" />
                  <span>{isAr ? "إضافة سعر جديد" : "Add New Pricing"}</span>
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <caption className="p-3 text-start text-xs font-bold text-muted-foreground border-b border-border">
                {isAr
                  ? "جدول أسعار النقل الإضافي بالدولار للفرد (PRECIOS NETOS DE TRASLADOS EXTRAS EN USD Y POR PERSONA)"
                  : "Extra Transfers Net Pricing in USD per person (PRECIOS NETOS DE TRASLADOS EXTRAS EN USD Y POR PERSONA)"}
              </caption>
              <thead>
                <tr className="bg-amber-500/10 border-b border-amber-500/30">
                  <th className="p-3 text-center text-xs font-black text-foreground w-12">#</th>
                  <th className="p-3 text-start text-xs font-black text-foreground min-w-[260px]">
                    {isAr ? "Traslados (خط السير)" : "Traslados (Route)"}
                  </th>
                  <th className="p-3 text-center text-xs font-black text-amber-600 dark:text-amber-400 w-28">
                    Base 02 – 04
                  </th>
                  <th className="p-3 text-center text-xs font-black text-amber-600 dark:text-amber-400 w-28">
                    Base 05 – 07
                  </th>
                  <th className="p-3 text-center text-xs font-black text-amber-600 dark:text-amber-400 w-28">
                    Base 08 – 14
                  </th>
                  <th className="p-3 text-center text-xs font-black text-foreground w-20">
                    {isAr ? "الحالة" : "Status"}
                  </th>
                  <th className="p-3 text-center text-xs font-black text-foreground w-28">
                    {isAr ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPricings.map((item, idx) => {
                  const routes = (item.routes && typeof item.routes === "object")
                    ? (item.routes as Record<string, string>)
                    : (item.route && typeof item.route === "object")
                      ? (item.route as Record<string, string>)
                      : { es: String(item.route || "") };

                  const displayName = getRouteDisplayName(item, locale);

                  return (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-amber-500/5 transition-colors">
                      <td className="p-3 text-center font-bold text-muted-foreground">
                        {item.displayOrder || idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        <div className="space-y-0.5">
                          <p className="font-bold">{displayName}</p>
                          {routes.es && routes.es !== displayName && (
                            <p className="text-[11px] text-muted-foreground truncate">🇪🇸 {routes.es}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-black text-foreground font-mono">
                        $ {item.priceBase0204 ?? 0}
                      </td>
                      <td className="p-3 text-center font-black text-foreground font-mono">
                        $ {item.priceBase0507 ?? 0}
                      </td>
                      <td className="p-3 text-center font-black text-foreground font-mono">
                        $ {item.priceBase0814 ?? 0}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={item.isActive ? "default" : "secondary"}
                          className={item.isActive
                            ? "bg-emerald-500/80 text-slate-950 font-black text-[10px] gap-1"
                            : "bg-slate-950/80 text-amber-400 border border-amber-400/20 font-black text-[10px] gap-1"}
                        >
                          {item.isActive
                            ? isAr ? "نشط" : "Active"
                            : isAr ? "مؤرشف" : "Archived"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => openEditModal(item)}
                            className="rounded-xl cursor-pointer p-1.5 text-amber-500 hover:bg-amber-500/10"
                            title={isAr ? "تعديل خط السير" : "Edit route"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => toggleMutation.mutate(item.id)}
                            disabled={toggleMutation.isPending}
                            className="rounded-xl cursor-pointer p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                            title={isAr ? "تغيير الحالة" : "Toggle status"}
                          >
                            {item.isActive ? (
                              <ArrowDownAZ className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpZA className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="rounded-xl cursor-pointer p-1.5 text-destructive hover:bg-destructive/10"
                            title={isAr ? "حذف خط السير" : "Delete route"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state when no tour/booking selected */}
        {!tourId && !bookingId && filteredPricings.length === 0 && !isLoading && (
          <div className="p-12 text-center text-muted-foreground">
            <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-sm font-black text-foreground">
              {isAr
                ? "حدد رحلة أو حجزة لعرض الأسعار"
                : "Select a trip or booking to view pricing"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {isAr
                ? "يمكنك اختيار رحلة من القائمة أو إنشاء رحلة جديدة"
                : "You can select a trip from the list or create a new one"}
            </p>
          </div>
        )}
      </div>

      {/* 3. Editor Modal */}
      {isEditorOpen && (
        <Dialog open={isEditorOpen} onOpenChange={(open) => { if (!open) setIsEditorOpen(false); }}>
          <DialogContent className="p-6 space-y-4 max-w-lg">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-black">
                {editingItem
                  ? isAr ? "تعديل خط السير وأسعار النقل" : "Edit Route & Transport Pricing"
                  : isAr ? "إضافة خط سير جديد" : "Add New Route & Transport Pricing"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isAr
                  ? "أدخل اسم خط السير باللغات الـ 5 والأسعار المحددة للشرائح الثلاث (02-04 / 05-07 / 08-14)"
                  : "Enter route names in all 5 languages and prices for the 3 passenger tiers"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(draft); }} className="space-y-4">
              {/* 5 Language Inputs for Route */}
              <div className="space-y-2 rounded-xl bg-muted/40 p-3 border border-border/80">
                <span className="text-xs font-black text-amber-500 uppercase block mb-1">
                  🌐 {isAr ? "اسم خط السير (Traslados) بخمس لغات" : "Route Name (5 Languages)"}
                </span>

                {([
                  { code: 'es', label: 'Spanish (es - الرئيسي)', dir: 'ltr' },
                  { code: 'en', label: 'English (en)', dir: 'ltr' },
                  { code: 'ar', label: 'Arabic (ar)', dir: 'rtl' },
                  { code: 'pt', label: 'Portuguese (pt)', dir: 'ltr' },
                  { code: 'it', label: 'Italian (it)', dir: 'ltr' },
                ] as const).map(({ code, label, dir }) => {
                  const routes = (draft.routes && typeof draft.routes === "object")
                    ? (draft.routes as Record<string, string>)
                    : (draft.route && typeof draft.route === "object")
                      ? (draft.route as Record<string, string>)
                      : { es: String(draft.route || "") };

                  return (
                    <div key={code} className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">{label}</label>
                      <Input
                        value={routes[code] || ""}
                        onChange={(e) => {
                          const updatedRoutes = { ...routes, [code]: e.target.value };
                          setDraft({
                            ...draft,
                            route: updatedRoutes,
                            routes: updatedRoutes,
                          });
                        }}
                        dir={dir}
                        placeholder={`مثال: Aeropuerto ...`}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  );
                })}
              </div>

              {/* 3 Price Tiers (Base 02-04, Base 05-07, Base 08-14) */}
              <div className="space-y-2">
                <span className="text-xs font-black text-foreground block">
                  💵 {isAr ? "الأسعار بالدولار للفرد حسب الشريحة" : "Prices in USD per person"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground">Base 02 – 04 ($)</label>
                    <Input
                      type="number"
                      min="0"
                      value={draft.priceBase0204 || ""}
                      onChange={(e) => setDraft({ ...draft, priceBase0204: Number(e.target.value) || 0 })}
                      placeholder="65"
                      className="h-9 text-center font-black font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground">Base 05 – 07 ($)</label>
                    <Input
                      type="number"
                      min="0"
                      value={draft.priceBase0507 || ""}
                      onChange={(e) => setDraft({ ...draft, priceBase0507: Number(e.target.value) || 0 })}
                      placeholder="55"
                      className="h-9 text-center font-black font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground">Base 08 – 14 ($)</label>
                    <Input
                      type="number"
                      min="0"
                      value={draft.priceBase0814 || ""}
                      onChange={(e) => setDraft({ ...draft, priceBase0814: Number(e.target.value) || 0 })}
                      placeholder="40"
                      className="h-9 text-center font-black font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => setDraft({ ...draft, currency: value as string })}
                    value={draft.currency || "USD"}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs font-bold">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActivePricing"
                    checked={draft.isActive}
                    onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                    className="rounded-sm"
                  />
                  <label htmlFor="isActivePricing" className="text-xs font-bold cursor-pointer">
                    {isAr ? "نشط" : "Active"}
                  </label>
                </div>
              </div>

              <DialogFooter className="p-0 pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                  className="h-10 rounded-xl text-xs font-bold gap-2 flex-1 flex items-center justify-center"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="h-10 rounded-xl text-xs font-bold gap-2 flex-1 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingItem ? (
                    isAr ? "تحديث" : "Update"
                  ) : (
                    isAr ? "إضافة" : "Add"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 4. Delete Confirmation */}
      {deleteConfirmItem && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setDeleteConfirmItem(null); }}>
          <DialogContent>
            <DialogHeader className="pb-2">
              <DialogTitle>{isAr ? "حذف سعر النقل" : "Delete Transport Pricing"}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{isAr ? "هل أنت متأكد أنك تريد حذف هذا السعر؟" : "Are you sure you want to delete this pricing?"}</p>
            <DialogFooter className="p-0 pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmItem(null)}
                className="h-10 rounded-xl text-xs font-bold gap-2 flex-1 flex items-center justify-center"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteConfirmItem.id)}
                className="h-10 rounded-xl text-xs font-bold gap-2 flex-1 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-slate-950"
              >
                {isAr ? "نعم، احذف" : "Yes, delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}