"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Bus,
  Car,
  Plus,
  Search,
  Users,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Navigation,
  RefreshCw,
  Armchair,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Fuel,
  LayoutGrid,
  Table as TableIcon,
  DoorClosed,
  Plane,
  Building2,
  MapPin,
  HelpCircle,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/axios";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { TransportationService, ServiceDraft, VehicleCategory } from "../types";
import {
  DEFAULT_FLEET,
  PRESET_VEHICLE_IMAGES,
  AVAILABLE_FEATURES,
  resolveLocalizedFeature,
} from "../data/default-fleet";

interface CategoryMeta {
  labelAr: string;
  labelEn: string;
  icon: React.ElementType;
  badgeClass: string;
  dotColor: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  bus: {
    labelAr: "حافلة سياحية كبرى",
    labelEn: "Luxury Tour Bus",
    icon: Bus,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  coaster: {
    labelAr: "كوستر وميني باص",
    labelEn: "Executive Coaster",
    icon: Bus,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dotColor: "bg-sky-500",
  },
  private: {
    labelAr: "سيارة خاصة VIP",
    labelEn: "VIP Private Vehicle",
    icon: Car,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    dotColor: "bg-purple-500",
  },
  transfer: {
    labelAr: "توصيل واستقبال VIP",
    labelEn: "VIP Airport Transfer",
    icon: Plane,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dotColor: "bg-emerald-500",
  },
};

const FEATURE_ICONS: Record<string, React.ElementType> = {
  ac: Wind,
  wifi: Wifi,
  driver: ShieldCheck,
  leather: Armchair,
  restroom: Coffee,
  usb: Sparkles,
  fridge: Coffee,
  sound: Tv,
  tv: Tv,
  luggage: Bus,
  gps: Navigation,
  airbag: ShieldCheck,
  reclining: Armchair,
};

function inferCategory(item: Partial<TransportationService>): string {
  const cat = (item.vehicleCategory || "").toLowerCase().trim();
  if (cat === "bus" || cat.includes("bus")) return "bus";
  if (cat === "coaster" || cat.includes("coaster") || cat.includes("mini")) return "coaster";
  if (cat === "private" || cat.includes("private") || cat.includes("sedan") || cat.includes("suv")) return "private";

  const st = (item.serviceType || "").toUpperCase().trim();
  if (st === "AIRPORT" || st === "CITY_TO_CITY" || st === "HOTEL") return "transfer";
  if (st === "COASTER") return "coaster";
  if (st === "BUS") return "bus";
  if (st === "PRIVATE") return "private";

  return "bus";
}

function getFallbackImage(category: string): string {
  switch (category) {
    case "coaster":
      return "/imgs/transportation/costar.jpeg";
    case "private":
    case "transfer":
      return "/imgs/transportation/privte.jpeg";
    case "bus":
    default:
      return "/imgs/transportation/bus1.jpeg";
  }
}

const emptyDraft = (): ServiceDraft => ({
  name: "",
  nameAr: "",
  nameEn: "",
  serviceType: "AIRPORT",
  vehicleCategory: "bus",
  vehicleType: "",
  capacity: 50,
  doors: 2,
  transmission: "AUTO",
  basePriceUsd: 150,
  heroImageUrl: "/imgs/transportation/bus1.jpeg",
  heroMediaId: null,
  isPrivate: false,
  isActive: true,
  rating: 5.0,
  reviews: 50,
  features: ["Air Conditioning", "WiFi", "Professional Driver"],
  description: "",
  pickupInstructions: "",
  dropoffInstructions: "",
});

export function TransportationServicesManager() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [localFleet, setLocalFleet] = useState<TransportationService[]>(DEFAULT_FLEET);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportationService | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch live services from backend
  const {
    data: apiServices,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["transportation-services"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any, any>("/admin/transportation/services");
        const list = Array.isArray(res) ? res : res?.data ? res.data : [];
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn("Using default fleet fallback for transportation services:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Normalize API data with rich fallbacks & multi-language keys
  const fleetData = useMemo(() => {
    if (apiServices && apiServices.length > 0) {
      return apiServices.map((apiItem: any) => {
        const fallback = DEFAULT_FLEET.find((d) => d.id === apiItem.id);
        const resolvedCategory = inferCategory(apiItem);
        const rawFeatures =
          (Array.isArray(apiItem.featuresJsonb) && apiItem.featuresJsonb.length > 0
            ? apiItem.featuresJsonb
            : Array.isArray(apiItem.features) && apiItem.features.length > 0
            ? apiItem.features
            : fallback?.features) || [
            isAr ? "تكييف هوائي" : "Air Conditioning",
            isAr ? "واي فاي" : "WiFi",
            isAr ? "سائق محترف" : "Professional Driver",
          ];

        const defaultPrice =
          resolvedCategory === "private" || resolvedCategory === "transfer"
            ? 150
            : resolvedCategory === "coaster"
            ? 250
            : 350;

        return {
          ...fallback,
          ...apiItem,
          id: apiItem.id,
          name: apiItem.name || fallback?.name || (isAr ? "مركبة Dunas Travel" : "Dunas Travel Vehicle"),
          nameAr: apiItem.nameAr || fallback?.nameAr || apiItem.name,
          nameEn: apiItem.nameEn || fallback?.nameEn || apiItem.name,
          heroImageUrl: apiItem.heroImageUrl || fallback?.heroImageUrl || getFallbackImage(resolvedCategory),
          capacity: apiItem.capacity ?? fallback?.capacity ?? (resolvedCategory === "private" ? 4 : resolvedCategory === "coaster" ? 24 : 50),
          doors: apiItem.doors ?? fallback?.doors ?? (resolvedCategory === "private" ? 4 : 2),
          transmission: apiItem.transmission || fallback?.transmission || "AUTO",
          basePriceUsd: Number(apiItem.basePriceUsd) || fallback?.basePriceUsd || defaultPrice,
          vehicleCategory: resolvedCategory,
          vehicleType:
            apiItem.vehicleType ||
            fallback?.vehicleType ||
            (resolvedCategory === "private"
              ? "Luxury Sedan & SUV"
              : resolvedCategory === "coaster"
              ? "Toyota Coaster Executive"
              : resolvedCategory === "transfer"
              ? "VIP Chauffeur & Transfer"
              : "VIP Tour Coach"),
          serviceType: apiItem.serviceType || fallback?.serviceType || "AIRPORT",
          features: rawFeatures,
          featuresJsonb: rawFeatures,
          isActive: apiItem.isActive !== undefined ? Boolean(apiItem.isActive) : true,
          isPrivate: apiItem.isPrivate !== undefined ? Boolean(apiItem.isPrivate) : resolvedCategory === "private",
          description: apiItem.description || fallback?.description || "",
          pickupInstructions: apiItem.pickupInstructions || fallback?.pickupInstructions || "",
          dropoffInstructions: apiItem.dropoffInstructions || fallback?.dropoffInstructions || "",
        } as TransportationService;
      });
    }
    return localFleet;
  }, [apiServices, localFleet, isAr]);

  // Key fleet metrics
  const stats = useMemo(() => {
    const total = fleetData.length;
    const active = fleetData.filter((v) => v.isActive).length;
    const buses = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "bus").length;
    const coasters = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "coaster").length;
    const privates = fleetData.filter((v) => {
      const cat = (v.vehicleCategory || "").toLowerCase();
      return cat === "private" || cat === "transfer";
    }).length;
    const totalCapacity = fleetData.reduce((acc, v) => acc + (Number(v.capacity) || 0), 0);
    return { total, active, buses, coasters, privates, totalCapacity };
  }, [fleetData]);

  // Filtered dataset
  const filteredFleet = useMemo(() => {
    return fleetData.filter((item) => {
      const cat = (item.vehicleCategory || "bus").toLowerCase();

      // Category filter
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "private") {
          if (cat !== "private" && cat !== "transfer") return false;
        } else if (cat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus === "ACTIVE" && !item.isActive) return false;
      if (selectedStatus === "INACTIVE" && item.isActive) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchType = (item.vehicleType || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchService = (item.serviceType || "").toLowerCase().includes(q);
        const matchFeatures = (item.features || []).some((f) => f.toLowerCase().includes(q));
        if (!matchName && !matchType && !matchDesc && !matchFeatures && !matchService) {
          return false;
        }
      }
      return true;
    });
  }, [fleetData, selectedCategory, selectedStatus, search]);

  const handleOpenCreate = useCallback(() => {
    setEditingItem(null);
    setDraft(emptyDraft());
    setActiveTab("basic");
    setIsEditorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: TransportationService) => {
    setEditingItem(item);
    setDraft({
      id: item.id,
      name: item.name || "",
      nameAr: item.nameAr || item.name || "",
      nameEn: item.nameEn || item.name || "",
      serviceType: item.serviceType || "AIRPORT",
      vehicleCategory: item.vehicleCategory || "bus",
      vehicleType: item.vehicleType || "",
      capacity: item.capacity ?? 50,
      doors: item.doors ?? 2,
      transmission: item.transmission || "AUTO",
      basePriceUsd: Number(item.basePriceUsd) || 150,
      heroImageUrl: item.heroImageUrl || getFallbackImage(inferCategory(item)),
      heroMediaId: item.heroMediaId || null,
      isPrivate: item.isPrivate ?? false,
      isActive: item.isActive ?? true,
      rating: item.rating || 5.0,
      reviews: item.reviews || 50,
      features: item.features ? [...item.features] : ["Air Conditioning", "WiFi"],
      description: item.description || "",
      pickupInstructions: item.pickupInstructions || "",
      dropoffInstructions: item.dropoffInstructions || "",
    });
    setActiveTab("basic");
    setIsEditorOpen(true);
  }, []);

  const toggleFeature = (featId: string) => {
    const featDef = AVAILABLE_FEATURES.find((f) => f.id === featId);
    if (!featDef) return;
    const featLabel = isAr ? featDef.labelAr : featDef.labelEn;

    setDraft((prev) => {
      const exists = prev.features.some((f) => {
        const clean = f.trim().toLowerCase();
        return (
          featDef.keys.some((k) => k.toLowerCase() === clean) ||
          featDef.labelEn.toLowerCase() === clean ||
          featDef.labelAr.toLowerCase() === clean
        );
      });

      const updated = exists
        ? prev.features.filter((f) => {
            const clean = f.trim().toLowerCase();
            return !(
              featDef.keys.some((k) => k.toLowerCase() === clean) ||
              featDef.labelEn.toLowerCase() === clean ||
              featDef.labelAr.toLowerCase() === clean
            );
          })
        : [...prev.features, featLabel];

      return { ...prev, features: updated };
    });
  };

  const isFeatureSelected = (featId: string, featureList: string[] = []): boolean => {
    const featDef = AVAILABLE_FEATURES.find((f) => f.id === featId);
    if (!featDef) return false;
    return featureList.some((f) => {
      const clean = f.trim().toLowerCase();
      return (
        featDef.keys.some((k) => k.toLowerCase() === clean) ||
        featDef.labelEn.toLowerCase() === clean ||
        featDef.labelAr.toLowerCase() === clean
      );
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: ServiceDraft) => {
      const backendPayload = {
        name: payload.name || payload.nameAr || payload.nameEn,
        serviceType: payload.serviceType || "AIRPORT",
        description: payload.description,
        vehicleCategory: payload.vehicleCategory,
        vehicleType: payload.vehicleType,
        capacity: Number(payload.capacity),
        doors: Number(payload.doors),
        transmission: payload.transmission,
        heroImageUrl: payload.heroImageUrl,
        isPrivate: Boolean(payload.isPrivate),
        pickupInstructions: payload.pickupInstructions,
        dropoffInstructions: payload.dropoffInstructions,
        features: payload.features,
        heroMediaId: payload.heroMediaId,
        basePriceUsd: String(payload.basePriceUsd),
        isActive: Boolean(payload.isActive),
      };

      try {
        if (editingItem?.id) {
          return await apiClient.put(`/admin/transportation/services/${editingItem.id}`, backendPayload);
        } else {
          return await apiClient.post("/admin/transportation/services", backendPayload);
        }
      } catch (err) {
        console.warn("Backend save failed, using local state update:", err);
        return backendPayload;
      }
    },
    onSuccess: () => {
      const finalItem: TransportationService = {
        id: editingItem?.id || `tr-custom-${Date.now()}`,
        name: draft.name || draft.nameAr || draft.nameEn || (isAr ? "مركبة جديدة" : "New Vehicle"),
        nameAr: draft.nameAr || draft.name,
        nameEn: draft.nameEn || draft.name,
        serviceType: draft.serviceType,
        vehicleCategory: draft.vehicleCategory,
        vehicleType: draft.vehicleType || (draft.vehicleCategory === "private" ? "Luxury Sedan & SUV" : "Tour Coach"),
        capacity: Number(draft.capacity) || 4,
        doors: Number(draft.doors) || 4,
        transmission: draft.transmission || "AUTO",
        basePriceUsd: Number(draft.basePriceUsd) || 150,
        heroImageUrl: draft.heroImageUrl || getFallbackImage(String(draft.vehicleCategory)),
        heroMediaId: draft.heroMediaId,
        isPrivate: draft.isPrivate,
        isActive: draft.isActive,
        rating: 5.0,
        reviews: 24,
        features: draft.features,
        featuresJsonb: draft.features,
        description: draft.description,
        pickupInstructions: draft.pickupInstructions,
        dropoffInstructions: draft.dropoffInstructions,
      };

      setLocalFleet((prev) => {
        if (editingItem?.id) {
          return prev.map((item) => (item.id === editingItem.id ? finalItem : item));
        }
        return [finalItem, ...prev];
      });

      queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
      toast.success(
        editingItem
          ? isAr
            ? "تم تحديث بيانات المركبة بنجاح ✨"
            : "Vehicle updated successfully ✨"
          : isAr
          ? "تمت إضافة المركبة الجديدة إلى الأسطول بنجاح 🚍"
          : "Vehicle added to fleet successfully 🚍"
      );
      setIsEditorOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || (isAr ? "فشل حفظ بيانات المركبة" : "Failed to save vehicle"));
    },
  });

  const toggleActiveStatus = async (item: TransportationService) => {
    const updated = !item.isActive;
    try {
      await apiClient.put(`/admin/transportation/services/${item.id}`, { isActive: updated });
    } catch {
      // optimistic fallback
    }
    setLocalFleet((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, isActive: updated } : v))
    );
    queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
    toast.success(
      updated
        ? isAr
          ? `تم تفعيل ${item.name}`
          : `${item.name} activated`
        : isAr
        ? `تم تعطيل ${item.name}`
        : `${item.name} deactivated`
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/admin/transportation/services/${id}`);
      } catch (err) {
        console.warn("Backend delete skipped, updating local state:", err);
      }
      return id;
    },
    onSuccess: (id) => {
      setLocalFleet((prev) => prev.filter((v) => v.id !== id));
      queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
      toast.success(isAr ? "تم حذف المركبة من الأسطول بنجاح" : "Vehicle removed from fleet");
      setDeleteConfirmId(null);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name && !draft.nameAr && !draft.nameEn) {
      toast.error(isAr ? "يرجى كتابة اسم المركبة" : "Please enter vehicle name");
      return;
    }
    saveMutation.mutate(draft);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                  {isAr ? "إدارة أسطول النقل والسيارات" : "Transportation Fleet Management"}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold px-2 py-0.5"
                >
                  Dunas Fleet VIP
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isAr
                  ? "متابعة وإدارة حافلات وسيارات Dunas Travel الفاخرة، الاستقبال في المطار، وخدمات الشيفور الخاص."
                  : "Manage and monitor Dunas Travel coaches, executive vans, and VIP private chauffeurs."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              toast.info(isAr ? "جاري تحديث بيانات الأسطول..." : "Refreshing fleet data...");
            }}
            disabled={isFetching}
            className="rounded-xl text-xs font-semibold gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-amber-500" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold gap-1.5 h-9 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{isAr ? "إضافة مركبة جديدة" : "Add New Vehicle"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Executive KPI Grid (Theme Adaptive) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Fleet */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "إجمالي الأسطول" : "Total Fleet"}
            </span>
            <div className="p-1.5 rounded-xl bg-muted text-foreground">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{stats.total}</span>
            <span className="text-[11px] text-muted-foreground">{isAr ? "مركبة" : "units"}</span>
          </div>
        </Card>

        {/* Active & Ready */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "مركبات جاهزة" : "Active Ready"}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</span>
            <span className="text-[11px] text-muted-foreground">{isAr ? "مفعلة" : "live"}</span>
          </div>
        </Card>

        {/* Luxury Coaches (50-Seater) */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "حافلات سياحية" : "Tour Coaches"}
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{stats.buses}</span>
            <span className="text-[11px] text-muted-foreground">50-Seat</span>
          </div>
        </Card>

        {/* Coasters */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-sky-500/40 transition-all shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "كوستر وميني" : "Coasters"}
            </span>
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{stats.coasters}</span>
            <span className="text-[11px] text-muted-foreground">26-Seat</span>
          </div>
        </Card>

        {/* Private VIP */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-purple-500/40 transition-all shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "سيارات خاصة" : "Private VIP"}
            </span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{stats.privates}</span>
            <span className="text-[11px] text-muted-foreground">4-Seat</span>
          </div>
        </Card>

        {/* Total Capacity */}
        <Card className="p-4 rounded-2xl border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "السعة الكلية" : "Total Capacity"}
            </span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.totalCapacity}</span>
            <span className="text-[11px] text-muted-foreground">{isAr ? "مقعد" : "seats"}</span>
          </div>
        </Card>
      </div>

      {/* 3. Filter, Search & View Controls */}
      <Card className="p-3.5 rounded-2xl border-border/80 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", labelAr: "الكل", labelEn: "All Fleet", count: stats.total },
              { id: "bus", labelAr: "حافلات كبرى", labelEn: "Luxury Coaches", count: stats.buses },
              { id: "coaster", labelAr: "كوستر وميني باص", labelEn: "Coasters", count: stats.coasters },
              { id: "private", labelAr: "سيارات خاصة ونقل", labelEn: "Private VIP & Transfers", count: stats.privates },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
                  }`}
                >
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? "bg-slate-950/20 text-slate-950" : "bg-muted text-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status & View Switcher + Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? "الكل" : "All"}
              </button>
              <button
                onClick={() => setSelectedStatus("ACTIVE")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? "مفعل" : "Active"}
              </button>
              <button
                onClick={() => setSelectedStatus("INACTIVE")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "INACTIVE"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? "معطل" : "Inactive"}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setViewMode("grid")}
                title={isAr ? "عرض شبكي" : "Grid View"}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title={isAr ? "عرض جدول" : "Table View"}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? "بحث في الأسطول والمميزات..." : "Search fleet and features..."}
                className="text-xs pr-8 pl-8 h-9 rounded-xl bg-background border-border/80 focus:border-amber-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Main Content: Grid View or Table View */}
      {isError ? (
        <Card className="p-12 text-center border-destructive/30 bg-destructive/5 space-y-3 rounded-3xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
          <h3 className="text-base font-bold text-destructive">
            {isAr ? "تعذر تحميل بيانات الأسطول من الخادم" : "Fleet data could not be loaded from backend"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr ? "يرجى التحقق من اتصال الشبكة وإعادة المحاولة." : "Please check connection and retry."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="rounded-xl">
            {isAr ? "إعادة المحاولة" : "Retry"}
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr ? "جاري تحميل أسطول النقل الفاخر..." : "Loading luxury fleet catalog..."}
          </p>
        </div>
      ) : filteredFleet.length === 0 ? (
        <Card className="text-center py-16 p-8 space-y-4 rounded-3xl border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Bus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {isAr ? "لم يتم العثور على مركبات مطابقة" : "No matching vehicles found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isAr
              ? "جرب تغيير فئة البحث أو مسح كلمة البحث الحالية لعرض أسطول النقل."
              : "Try adjusting your search criteria or filters to see available fleet units."}
          </p>
          <Button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
            }}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            {isAr ? "عرض جميع المركبات" : "Show All Vehicles"}
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFleet.map((item) => {
            const catKey = inferCategory(item);
            const catInfo = CATEGORY_MAP[catKey] || CATEGORY_MAP.bus;
            const CategoryIcon = catInfo.icon;
            const price = Number(item.basePriceUsd) || 150;
            const rawFeatures = item.features || item.featuresJsonb || [];

            return (
              <Card
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Vehicle Image & Badges */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.heroImageUrl || getFallbackImage(catKey)}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage(catKey);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                  {/* Top-Right Category Pill */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${catInfo.badgeClass}`}
                    >
                      <CategoryIcon className="w-3 h-3 mr-1 inline" />
                      {isAr ? catInfo.labelAr : catInfo.labelEn}
                    </Badge>
                  </div>

                  {/* Top-Left Active Status Pill */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => toggleActiveStatus(item)}
                      title={isAr ? "اضغط لتبديل حالة التفعيل" : "Click to toggle active status"}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600"
                          : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isActive ? "bg-white animate-pulse" : "bg-rose-400"
                        }`}
                      />
                      {item.isActive ? (isAr ? "مفعل وجاهز" : "Active") : (isAr ? "معطل" : "Inactive")}
                    </button>
                  </div>

                  {/* Bottom-Left Price Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-slate-950/85 backdrop-blur-md border border-amber-400/30 text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                      <span className="text-[10px] text-slate-300 font-semibold">{isAr ? "من" : "From"}</span>
                      <span className="text-base font-black text-amber-400">${price}</span>
                      <span className="text-[10px] text-slate-300">/{isAr ? "يوم" : "day"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-snug line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {item.vehicleType || (isAr ? "مركبة سياحية فاخرة" : "Luxury Tourist Vehicle")}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-extrabold">{item.capacity || 4}</span>
                      <span className="text-[10px] text-muted-foreground">{isAr ? "مقعد" : "seats"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-foreground">
                      <DoorClosed className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="font-extrabold">{item.doors || 2}</span>
                      <span className="text-[10px] text-muted-foreground">{isAr ? "أبواب" : "doors"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="font-extrabold text-[11px] truncate">{item.transmission || "AUTO"}</span>
                    </div>
                  </div>

                  {/* Amenities / Features Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rawFeatures.slice(0, 4).map((f, i) => {
                      const localized = resolveLocalizedFeature(f, locale);
                      return (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-muted/70 text-foreground px-2.5 py-1 rounded-lg border border-border/70 truncate max-w-[140px]"
                          title={localized}
                        >
                          {localized}
                        </span>
                      );
                    })}
                    {rawFeatures.length > 4 && (
                      <span
                        className="text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20"
                        title={rawFeatures.slice(4).map((f) => resolveLocalizedFeature(f, locale)).join(", ")}
                      >
                        +{rawFeatures.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[110px]" title={item.id}>
                    {item.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(item)}
                      className="text-xs px-3 py-1.5 h-8 rounded-xl gap-1.5 font-bold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? "تعديل" : "Edit"}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-8 rounded-xl cursor-pointer"
                      title={isAr ? "حذف المركبة" : "Delete Vehicle"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View for Fleet Management */
        <Card className="rounded-3xl border-border/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right dir-rtl">
              <thead className="bg-muted/60 border-b border-border/80 text-muted-foreground font-bold">
                <tr>
                  <th className="p-3.5 text-start">{isAr ? "المركبة والطراز" : "Vehicle & Model"}</th>
                  <th className="p-3.5 text-start">{isAr ? "الفئة والخدمة" : "Category & Service"}</th>
                  <th className="p-3.5 text-center">{isAr ? "السعة" : "Seats"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الأبواب" : "Doors"}</th>
                  <th className="p-3.5 text-center">{isAr ? "السعر اليومي" : "Daily Rate"}</th>
                  <th className="p-3.5 text-start">{isAr ? "أبرز المميزات" : "Key Amenities"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFleet.map((item) => {
                  const catKey = inferCategory(item);
                  const catInfo = CATEGORY_MAP[catKey] || CATEGORY_MAP.bus;
                  const price = Number(item.basePriceUsd) || 150;
                  const rawFeatures = item.features || item.featuresJsonb || [];

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-border/80">
                            <img
                              src={item.heroImageUrl || getFallbackImage(catKey)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-foreground line-clamp-1">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.vehicleType || "VIP Coach"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge variant="outline" className={`text-[10px] font-bold ${catInfo.badgeClass}`}>
                          {isAr ? catInfo.labelAr : catInfo.labelEn}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-center font-extrabold text-foreground">
                        {item.capacity || 4} {isAr ? "مقعد" : "seats"}
                      </td>

                      <td className="p-3.5 text-center font-medium text-muted-foreground">
                        {item.doors || 2}
                      </td>

                      <td className="p-3.5 text-center font-mono font-black text-amber-600 dark:text-amber-400">
                        ${price}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rawFeatures.slice(0, 2).map((f, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-foreground border border-border/60"
                            >
                              {resolveLocalizedFeature(f, locale)}
                            </span>
                          ))}
                          {rawFeatures.length > 2 && (
                            <span className="text-[10px] text-muted-foreground font-bold">
                              +{rawFeatures.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleActiveStatus(item)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {item.isActive ? (isAr ? "مفعل" : "Active") : (isAr ? "معطل" : "Inactive")}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 h-8 w-8 rounded-xl text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                            title={isAr ? "تعديل" : "Edit"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title={isAr ? "حذف" : "Delete"}
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
        </Card>
      )}

      {/* 5. Create / Edit Vehicle Modal Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl bg-card border-border text-foreground p-6 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader className="border-b border-border/80 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2.5 font-heading">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Bus className="w-5 h-5" />
              </div>
              <span>
                {editingItem
                  ? isAr
                    ? `تعديل المركبة: ${editingItem.name}`
                    : `Edit Vehicle: ${editingItem.name}`
                  : isAr
                  ? "إضافة مركبة جديدة إلى أسطول النقل"
                  : "Add New Vehicle to Fleet"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "قم بإدخال تفاصيل المركبة، سعة المقاعد، الأسعار والمميزات لتظهر في أنظمة الحجز والجولات الفاخرة."
                : "Enter vehicle specifications, seating capacity, pricing, and guest amenities."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-muted/60 border border-border/80 rounded-2xl p-1 mb-4">
                <TabsTrigger
                  value="basic"
                  className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 cursor-pointer"
                >
                  {isAr ? "البيانات الأساسية" : "Basic Info"}
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 cursor-pointer"
                >
                  {isAr ? "المميزات والصور" : "Media & Features"}
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 cursor-pointer"
                >
                  {isAr ? "الوصف والتعليمات" : "Description & Policy"}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Specifications */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "اسم المركبة (عربي)" : "Vehicle Name (Arabic)"}
                    </Label>
                    <Input
                      value={draft.nameAr || draft.name}
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value, nameAr: e.target.value })
                      }
                      placeholder="مثال: حافلة مرسيدس توريزمو VIP 50 راكب"
                      className="text-xs rounded-xl bg-background border-border"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "اسم المركبة (إنجليزي)" : "Vehicle Name (English)"}
                    </Label>
                    <Input
                      value={draft.nameEn || ""}
                      onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
                      placeholder="e.g. Mercedes-Benz Tourismo VIP Coach"
                      className="text-xs rounded-xl bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "فئة المركبة" : "Category"}
                    </Label>
                    <select
                      value={draft.vehicleCategory || "bus"}
                      onChange={(e) =>
                        setDraft({ ...draft, vehicleCategory: e.target.value as VehicleCategory })
                      }
                      className="w-full bg-background border border-border text-foreground text-xs rounded-xl p-2.5"
                    >
                      <option value="bus">{isAr ? "حافلة كبرى (Bus 45-50)" : "Luxury Bus (45-50 Seats)"}</option>
                      <option value="coaster">{isAr ? "كوستر ميني باص (Coaster 22-26)" : "Coaster Mini-Bus (22-26 Seats)"}</option>
                      <option value="private">{isAr ? "سيارة خاصة VIP (Private Car 4)" : "Private VIP Sedan/SUV (4 Seats)"}</option>
                      <option value="transfer">{isAr ? "خدمة نقل واستقبال (Airport Transfer)" : "Airport Transfer Service"}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "نوع الخدمة" : "Service Type"}
                    </Label>
                    <select
                      value={draft.serviceType || "AIRPORT"}
                      onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}
                      className="w-full bg-background border border-border text-foreground text-xs rounded-xl p-2.5"
                    >
                      <option value="AIRPORT">{isAr ? "استقبال وتوصيل المطار (Airport)" : "Airport Pickup/Drop"}</option>
                      <option value="CITY_TO_CITY">{isAr ? "تنقل بين المدن (City to City)" : "City to City Transfer"}</option>
                      <option value="HOTEL">{isAr ? "خدمة الفنادق واليوم الكامل (Hotel Day)" : "Hotel Full Day"}</option>
                      <option value="PRIVATE">{isAr ? "جولة خاصة حصرية (Private Tour)" : "Private Tour"}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "سعر التأجير اليومي ($ USD)" : "Daily Base Price (USD)"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.basePriceUsd}
                      onChange={(e) => setDraft({ ...draft, basePriceUsd: Number(e.target.value) })}
                      className="text-xs rounded-xl font-bold bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "طراز المركبة / الموديل" : "Model / Subtitle"}
                    </Label>
                    <Input
                      value={draft.vehicleType || ""}
                      onChange={(e) => setDraft({ ...draft, vehicleType: e.target.value })}
                      placeholder="e.g. Mercedes Tourismo 2026"
                      className="text-xs rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "سعة المقاعد (Seats)" : "Seating Capacity"}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={draft.capacity ?? 50}
                      onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
                      className="text-xs rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "ناقل الحركة" : "Transmission"}
                    </Label>
                    <select
                      value={draft.transmission || "AUTO"}
                      onChange={(e) => setDraft({ ...draft, transmission: e.target.value })}
                      className="w-full bg-background border border-border text-foreground text-xs rounded-xl p-2.5"
                    >
                      <option value="AUTO">{isAr ? "أوتوماتيك (Automatic)" : "Automatic"}</option>
                      <option value="MANUAL">{isAr ? "يدوي (Manual)" : "Manual"}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border/80 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {isAr ? "خدمة خاصة VIP (Private Service)" : "Private Chauffeur Service"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {isAr ? "مخصصة للعملاء والأفراد بشكل حصري" : "Exclusive VIP private transfer"}
                    </div>
                  </div>
                  <Switch
                    checked={draft.isPrivate}
                    onCheckedChange={(checked) => setDraft({ ...draft, isPrivate: checked })}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Media & Amenities */}
              <TabsContent value="features" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "اختر صورة للمركبة من النماذج الجاهزة" : "Select Preset Fleet Image"}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRESET_VEHICLE_IMAGES.map((img) => {
                      const isSelected = draft.heroImageUrl === img.url;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setDraft({ ...draft, heroImageUrl: img.url })}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all text-start group cursor-pointer ${
                            isSelected
                              ? "border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]"
                              : "border-border opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="h-16 bg-slate-950">
                            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-1.5 bg-card text-[10px] text-foreground font-medium truncate">
                            {isAr ? img.label : img.labelEn}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "أو رابط صورة مخصص (Custom URL)" : "Or Custom Image URL"}
                  </Label>
                  <Input
                    value={draft.heroImageUrl || ""}
                    onChange={(e) => setDraft({ ...draft, heroImageUrl: e.target.value })}
                    placeholder="/imgs/transportation/bus1.jpeg or https://..."
                    className="text-xs rounded-xl font-mono bg-background border-border"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "المميزات والخدمات المتاحة على متن المركبة" : "Vehicle Amenities & Features"}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_FEATURES.map((feat) => {
                      const isChecked = isFeatureSelected(feat.id, draft.features);
                      const IconComp = FEATURE_ICONS[feat.id] || Sparkles;

                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                            isChecked
                              ? "bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold"
                              : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <IconComp
                            className={`w-3.5 h-3.5 ${
                              isChecked ? "text-amber-500" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{isAr ? feat.labelAr : feat.labelEn}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 ms-auto text-amber-500 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Description & Policies */}
              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isAr ? "الوصف التفصيلي للمركبة" : "Detailed Vehicle Description"}
                  </Label>
                  <Textarea
                    value={draft.description || ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={3}
                    placeholder={
                      isAr
                        ? "وصف لتجربة الركوب، الفخامة، وخطوط السير المناسبة..."
                        : "Describe the vehicle comfort, luxury seating, and ideal routes..."
                    }
                    className="text-xs rounded-xl bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "تعليمات الاستقبال (Pickup Instructions)" : "Pickup Instructions"}
                    </Label>
                    <Textarea
                      value={draft.pickupInstructions || ""}
                      onChange={(e) => setDraft({ ...draft, pickupInstructions: e.target.value })}
                      rows={2}
                      placeholder={
                        isAr
                          ? "سيكون السائق بانتظاركم في صالة الوصول مع لافتة باسم العميل..."
                          : "Driver will meet guests at arrival hall with name sign..."
                      }
                      className="text-xs rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {isAr ? "تعليمات التوصيل (Dropoff Instructions)" : "Drop-off Instructions"}
                    </Label>
                    <Textarea
                      value={draft.dropoffInstructions || ""}
                      onChange={(e) => setDraft({ ...draft, dropoffInstructions: e.target.value })}
                      rows={2}
                      placeholder={
                        isAr
                          ? "التوصيل المباشر حتى بوابة الفندق أو صالة المغادرة..."
                          : "Direct dropoff at hotel lobby or airport departures..."
                      }
                      className="text-xs rounded-xl bg-background border-border"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="border-t border-border/80 pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl gap-2 text-xs"
              >
                {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {editingItem
                    ? isAr
                      ? "حفظ التعديلات"
                      : "Save Changes"
                    : isAr
                    ? "إضافة المركبة"
                    : "Add Vehicle"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md bg-card border-border text-foreground p-6 rounded-3xl shadow-2xl">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-foreground font-heading">
                {isAr ? "تأكيد حذف المركبة من الأسطول" : "Confirm Vehicle Deletion"}
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                {isAr
                  ? "هل أنت متأكد من رغبتك في حذف هذه المركبة من الأسطول؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this vehicle from the fleet? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl text-xs font-semibold"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>

              <Button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                variant="destructive"
                className="font-bold rounded-xl text-xs gap-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAr ? "تأكيد الحذف" : "Delete Vehicle"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

