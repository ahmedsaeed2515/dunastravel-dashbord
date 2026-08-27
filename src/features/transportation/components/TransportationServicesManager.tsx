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
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DEFAULT_FLEET, PRESET_VEHICLE_IMAGES, AVAILABLE_FEATURES } from "../data/default-fleet";

const CATEGORY_MAP: Record<string, { labelAr: string; labelEn: string; icon: any; color: string; badgeClass: string }> = {
  bus: {
    labelAr: "حافلة سياحية كبرى",
    labelEn: "Luxury Tour Bus",
    icon: Bus,
    color: "text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  coaster: {
    labelAr: "كوستر وميني باص",
    labelEn: "Executive Coaster",
    icon: Bus,
    color: "text-sky-400",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  private: {
    labelAr: "سيارة خاصة VIP",
    labelEn: "Private VIP Vehicle",
    icon: Car,
    color: "text-purple-400",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

const FEATURE_ICONS: Record<string, any> = {
  ac: Wind,
  wifi: Wifi,
  driver: ShieldCheck,
  leather: Armchair,
  restroom: Coffee,
  usb: Sparkles,
  fridge: Coffee,
  sound: Tv,
  luggage: Bus,
  gps: Navigation,
};

const emptyDraft = (): ServiceDraft => ({
  name: "",
  nameAr: "",
  nameEn: "",
  serviceType: "AIRPORT",
  vehicleCategory: "bus",
  vehicleType: "",
  capacity: 50,
  doors: 2,
  transmission: "Auto",
  basePriceUsd: 400,
  heroImageUrl: "/imgs/transportation/bus1.jpeg",
  heroMediaId: null,
  isPrivate: false,
  isActive: true,
  rating: 5.0,
  reviews: 50,
  features: ["تكييف هوائي مركزي", "واي فاي فائق السرعة", "سائق محترف ومعتمد"],
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
  const [localFleet, setLocalFleet] = useState<TransportationService[]>(DEFAULT_FLEET);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportationService | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const { data: apiServices, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["transportation-services"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<TransportationService[], TransportationService[]>("/admin/transportation/services");
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.warn("Using default fleet fallback for transportation services:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const fleetData = useMemo(() => {
    if (apiServices && apiServices.length > 0) {
      return apiServices.map((apiItem) => {
        const fallback = DEFAULT_FLEET.find((d) => d.id === apiItem.id);
        return {
          ...fallback,
          ...apiItem,
          name: apiItem.name || fallback?.name || "مركبة Dunas Travel",
          heroImageUrl: apiItem.heroImageUrl || fallback?.heroImageUrl || "/imgs/transportation/bus1.jpeg",
          capacity: apiItem.capacity ?? fallback?.capacity ?? 45,
          doors: apiItem.doors ?? fallback?.doors ?? 2,
          transmission: apiItem.transmission || fallback?.transmission || "Auto",
          basePriceUsd: Number(apiItem.basePriceUsd) || fallback?.basePriceUsd || 350,
          vehicleCategory: (apiItem.vehicleCategory || fallback?.vehicleCategory || "bus").toLowerCase(),
          vehicleType: apiItem.vehicleType || fallback?.vehicleType || "VIP Tour Bus",
          features: Array.isArray(apiItem.features) && apiItem.features.length > 0
            ? apiItem.features
            : (fallback?.features || ["تكييف", "واي فاي", "سائق محترف"]),
          isActive: apiItem.isActive ?? true,
        };
      });
    }
    return localFleet;
  }, [apiServices, localFleet]);

  const stats = useMemo(() => {
    const total = fleetData.length;
    const active = fleetData.filter((v) => v.isActive).length;
    const buses = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "bus").length;
    const coasters = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "coaster").length;
    const privates = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "private").length;
    const totalCapacity = fleetData.reduce((acc, v) => acc + (v.capacity || 0), 0);
    return { total, active, buses, coasters, privates, totalCapacity };
  }, [fleetData]);

  const filteredFleet = useMemo(() => {
    return fleetData.filter((item) => {
      const cat = (item.vehicleCategory || "bus").toLowerCase();
      if (selectedCategory !== "ALL" && cat !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchType = (item.vehicleType || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchFeatures = (item.features || []).some((f) => f.toLowerCase().includes(q));
        if (!matchName && !matchType && !matchDesc && !matchFeatures) return false;
      }
      return true;
    });
  }, [fleetData, selectedCategory, search]);

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
      vehicleCategory: (item.vehicleCategory || "bus").toLowerCase(),
      vehicleType: item.vehicleType || "",
      capacity: item.capacity ?? 50,
      doors: item.doors ?? 2,
      transmission: item.transmission || "Auto",
      basePriceUsd: Number(item.basePriceUsd) || 400,
      heroImageUrl: item.heroImageUrl || "/imgs/transportation/bus1.jpeg",
      heroMediaId: item.heroMediaId || null,
      isPrivate: item.isPrivate ?? false,
      isActive: item.isActive ?? true,
      rating: item.rating || 5.0,
      reviews: item.reviews || 50,
      features: item.features ? [...item.features] : ["تكييف هوائي", "واي فاي"],
      description: item.description || "",
      pickupInstructions: item.pickupInstructions || "",
      dropoffInstructions: item.dropoffInstructions || "",
    });
    setActiveTab("basic");
    setIsEditorOpen(true);
  }, []);

  const toggleFeature = (featLabel: string) => {
    setDraft((prev) => {
      const exists = prev.features.includes(featLabel);
      const updated = exists
        ? prev.features.filter((f) => f !== featLabel)
        : [...prev.features, featLabel];
      return { ...prev, features: updated };
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: ServiceDraft) => {
      try {
        if (editingItem?.id) {
          return await apiClient.put(`/admin/transportation/services/${editingItem.id}`, payload);
        } else {
          return await apiClient.post("/admin/transportation/services", payload);
        }
      } catch (err) {
        console.warn("Backend save failed, updating local state:", err);
        return payload;
      }
    },
    onSuccess: () => {
      const finalItem: TransportationService = {
        id: editingItem?.id || `tr-custom-${Date.now()}`,
        name: draft.nameAr || draft.name || draft.nameEn || "مركبة Dunas Travel",
        nameAr: draft.nameAr || draft.name,
        nameEn: draft.nameEn || draft.name,
        serviceType: draft.serviceType,
        vehicleCategory: draft.vehicleCategory,
        vehicleType: draft.vehicleType || (draft.vehicleCategory === "private" ? "Luxury Sedan VIP" : "Tour Coach"),
        capacity: draft.capacity || (draft.vehicleCategory === "private" ? 4 : 50),
        doors: draft.doors || 2,
        transmission: draft.transmission || "Auto",
        basePriceUsd: Number(draft.basePriceUsd) || 350,
        heroImageUrl: draft.heroImageUrl || "/imgs/transportation/bus1.jpeg",
        heroMediaId: draft.heroMediaId,
        isPrivate: draft.isPrivate,
        isActive: draft.isActive,
        rating: 5.0,
        reviews: 20,
        features: draft.features,
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
          ? (isAr ? "تم تحديث بيانات المركبة بنجاح ✨" : "Vehicle updated successfully ✨")
          : (isAr ? "تمت إضافة المركبة الجديدة إلى الأسطول بنجاح 🚍" : "Vehicle added to fleet successfully 🚍")
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
    }
    setLocalFleet((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, isActive: updated } : v))
    );
    queryClient.invalidateQueries({ queryKey: ["transportation-services"] });
    toast.success(
      updated
        ? (isAr ? `تم تفعيل ${item.name}` : `${item.name} activated`)
        : (isAr ? `تم تعطيل ${item.name}` : `${item.name} deactivated`)
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
    <div className="space-y-8 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#1c2128] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{isAr ? "إدارة أسطول التنقل والسيارات" : "Transportation Fleet Management"}</span>
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs py-0.5 px-2.5 rounded-full font-bold">
                    Dunas Fleet VIP
                  </Badge>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {isAr
                    ? "إدارة ومتابعة حافلات وسيارات Dunas Travel المتاحة للتوصيل والجولات السياحية الفاخرة."
                    : "Manage and monitor Dunas Travel coaches, executive vans, and VIP private chauffeurs."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.info(isAr ? "جاري تحديث بيانات الأسطول..." : "Refreshing fleet data...");
              }}
              disabled={isFetching}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 h-auto text-xs font-semibold gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
              <span>{isAr ? "تحديث" : "Refresh"}</span>
            </Button>

            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl px-5 py-2.5 h-auto text-sm font-bold gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>{isAr ? "إضافة مركبة جديدة" : "Add New Vehicle"}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{isAr ? "إجمالي الأسطول" : "Total Fleet"}</div>
              <div className="text-xl font-black text-white">{stats.total} <span className="text-xs text-slate-500 font-normal">{isAr ? "مركبة" : "units"}</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{isAr ? "مركبات مفعلة" : "Active Vehicles"}</div>
              <div className="text-xl font-black text-emerald-400">{stats.active} <span className="text-xs text-slate-500 font-normal">{isAr ? "جاهزة" : "ready"}</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{isAr ? "حافلات سياحية" : "Luxury Coaches"}</div>
              <div className="text-xl font-black text-white">{stats.buses} <span className="text-xs text-slate-500 font-normal">50-Seater</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{isAr ? "كوستر وميني باص" : "Coasters"}</div>
              <div className="text-xl font-black text-white">{stats.coasters} <span className="text-xs text-slate-500 font-normal">26-Seater</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{isAr ? "السعة الاستيعابية" : "Total Capacity"}</div>
              <div className="text-xl font-black text-amber-400">{stats.totalCapacity} <span className="text-xs text-slate-500 font-normal">{isAr ? "مقعد" : "seats"}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#161b22] border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", labelAr: "الكل", labelEn: "All Fleet", count: stats.total },
            { id: "bus", labelAr: "حافلات كبرى", labelEn: "Luxury Buses", count: stats.buses },
            { id: "coaster", labelAr: "كوستر وميني باص", labelEn: "Coasters", count: stats.coasters },
            { id: "private", labelAr: "سيارات خاصة VIP", labelEn: "Private VIP", count: stats.privates },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث في الأسطول والمميزات..." : "Search fleet and features..."}
            className="bg-slate-900/90 border-slate-800 text-white text-xs pl-3 pr-9 py-2 rounded-xl focus:border-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredFleet.length === 0 ? (
        <div className="text-center py-16 bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isAr ? "لم يتم العثور على مركبات مطابقة" : "No matching vehicles found"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isAr
              ? "جرب تغيير فئة البحث أو مسح كلمة البحث الحالية لعرض أسطول النقل."
              : "Try adjusting your search criteria or filter to see available vehicles."}
          </p>
          <Button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
            }}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-xs font-bold"
          >
            {isAr ? "عرض جميع المركبات" : "Show All Vehicles"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFleet.map((item) => {
            const catInfo = CATEGORY_MAP[item.vehicleCategory?.toLowerCase() || "bus"] || CATEGORY_MAP.bus;
            const CategoryIcon = catInfo.icon;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-[#161b22] hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.heroImageUrl || "/imgs/transportation/bus1.jpeg"}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/imgs/transportation/bus1.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/20 to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge variant="outline" className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${catInfo.badgeClass}`}>
                      <CategoryIcon className="w-3 h-3 mr-1 inline" />
                      {isAr ? catInfo.labelAr : catInfo.labelEn}
                    </Badge>
                  </div>

                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => toggleActiveStatus(item)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border transition-all flex items-center gap-1.5 ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {item.isActive ? (isAr ? "مفعل وجاهز" : "Active") : (isAr ? "معطل" : "Inactive")}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">{isAr ? "من" : "From"}</span>
                      <span className="text-base font-black text-amber-400">${item.basePriceUsd}</span>
                      <span className="text-[10px] text-slate-400">/{isAr ? "يوم" : "day"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {item.vehicleType || "Mercedes Tour Bus VIP"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold">{item.capacity}</span>
                      <span className="text-[10px] text-slate-500">{isAr ? "مقعد" : "seats"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Fuel className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-medium text-[11px]">{item.doors} {isAr ? "أبواب" : "doors"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="font-medium text-[11px]">{item.transmission || "Auto"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(item.features || []).slice(0, 4).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-800"
                      >
                        {f}
                      </span>
                    ))}
                    {(item.features || []).length > 4 && (
                      <span className="text-[10px] bg-slate-900/90 text-amber-400 px-1.5 py-0.5 rounded-lg border border-slate-800 font-bold">
                        +{item.features.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(item)}
                      className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-3 py-1.5 h-auto rounded-xl gap-1.5 font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? "تعديل" : "Edit"}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 h-auto rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl bg-[#161b22] border-slate-800 text-white p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-400" />
              <span>
                {editingItem
                  ? (isAr ? `تعديل المركبة: ${editingItem.name}` : `Edit Vehicle: ${editingItem.name}`)
                  : (isAr ? "إضافة مركبة جديدة إلى أسطول النقل" : "Add New Vehicle to Fleet")}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {isAr
                ? "قم بإدخال تفاصيل المركبة، السعة، الأسعار والمميزات لتظهر في أنظمة الحجز والرحلات."
                : "Enter vehicle specifications, seating capacity, pricing, and amenities."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-4">
                <TabsTrigger value="basic" className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "البيانات الأساسية" : "Basic Info"}
                </TabsTrigger>
                <TabsTrigger value="features" className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "المميزات والصور" : "Media & Features"}
                </TabsTrigger>
                <TabsTrigger value="details" className="text-xs font-bold rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "الوصف والتعليمات" : "Description & Policy"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "اسم المركبة (عربي)" : "Vehicle Name (Arabic)"}</Label>
                    <Input
                      value={draft.nameAr || draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value, nameAr: e.target.value })}
                      placeholder="مثال: حافلة مرسيدس توريزمو VIP 50 راكب"
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "اسم المركبة (إنجليزي)" : "Vehicle Name (English)"}</Label>
                    <Input
                      value={draft.nameEn || ""}
                      onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
                      placeholder="e.g. Mercedes-Benz Tourismo VIP Coach"
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "نوع المركبة" : "Category"}</Label>
                    <select
                      value={draft.vehicleCategory}
                      onChange={(e) => setDraft({ ...draft, vehicleCategory: e.target.value as VehicleCategory })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                    >
                      <option value="bus">{isAr ? "حافلة كبرى (Bus 45-50)" : "Luxury Bus (45-50 Seats)"}</option>
                      <option value="coaster">{isAr ? "كوستر ميني باص (Coaster 22-26)" : "Coaster Mini-Bus (22-26 Seats)"}</option>
                      <option value="private">{isAr ? "سيارة خاصة VIP (Private Car 4)" : "Private VIP Sedan/SUV (4 Seats)"}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "موديل المركبة / الطراز" : "Model / Subtitle"}</Label>
                    <Input
                      value={draft.vehicleType || ""}
                      onChange={(e) => setDraft({ ...draft, vehicleType: e.target.value })}
                      placeholder="e.g. Mercedes Tourismo 2026"
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "سعر التأجير اليومي ($ USD)" : "Daily Base Price (USD)"}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.basePriceUsd}
                      onChange={(e) => setDraft({ ...draft, basePriceUsd: Number(e.target.value) })}
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "سعة المقاعد (Passengers)" : "Seats Capacity"}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={draft.capacity ?? 50}
                      onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "عدد الأبواب" : "Doors Count"}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={draft.doors ?? 2}
                      onChange={(e) => setDraft({ ...draft, doors: Number(e.target.value) })}
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "ناقل الحركة" : "Transmission"}</Label>
                    <select
                      value={draft.transmission || "Auto"}
                      onChange={(e) => setDraft({ ...draft, transmission: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                    >
                      <option value="Auto">{isAr ? "أوتوماتيك (Automatic)" : "Automatic"}</option>
                      <option value="Manual">{isAr ? "يدوي (Manual)" : "Manual"}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white">{isAr ? "خدمة خاصة VIP (Private Service)" : "Private Chauffeur Service"}</div>
                    <div className="text-[11px] text-slate-400">{isAr ? "مخصصة للعملاء والأفراد بشكل حصري" : "Exclusive VIP transfer"}</div>
                  </div>
                  <Switch
                    checked={draft.isPrivate}
                    onCheckedChange={(checked) => setDraft({ ...draft, isPrivate: checked })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300 font-semibold">{isAr ? "اختر صورة للمركبة من النماذج الجاهزة" : "Select Preset Fleet Image"}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRESET_VEHICLE_IMAGES.map((img) => {
                      const isSelected = draft.heroImageUrl === img.url;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setDraft({ ...draft, heroImageUrl: img.url })}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all text-right group ${
                            isSelected ? "border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]" : "border-slate-800 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="h-16 bg-slate-900">
                            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-1.5 bg-slate-950 text-[10px] text-slate-300 font-medium truncate">
                            {img.label}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">{isAr ? "أو رابط صورة مخصص (Custom URL)" : "Or Custom Image URL"}</Label>
                  <Input
                    value={draft.heroImageUrl || ""}
                    onChange={(e) => setDraft({ ...draft, heroImageUrl: e.target.value })}
                    placeholder="/imgs/transportation/bus1.jpeg or https://..."
                    className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-slate-300 font-semibold">{isAr ? "المميزات والخدمات المتاحة على متن المركبة" : "Vehicle Amenities & Features"}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_FEATURES.map((feat) => {
                      const isChecked = draft.features.includes(feat.labelAr) || draft.features.includes(feat.labelEn);
                      const IconComp = FEATURE_ICONS[feat.id] || Sparkles;

                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(isAr ? feat.labelAr : feat.labelEn)}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                            isChecked
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isChecked ? "text-amber-400" : "text-slate-500"}`} />
                          <span className="truncate">{isAr ? feat.labelAr : feat.labelEn}</span>
                          {isChecked && <Check className="w-3 h-3 mr-auto text-amber-400 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">{isAr ? "الوصف التفصيلي للمركبة" : "Detailed Vehicle Description"}</Label>
                  <Textarea
                    value={draft.description || ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={3}
                    placeholder={isAr ? "وصف لتجربة الركوب، الفخامة، وخطوط السير المناسبة..." : "Describe the vehicle comfort and routes..."}
                    className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "تعليمات الاستقبال (Pickup Instructions)" : "Pickup Instructions"}</Label>
                    <Textarea
                      value={draft.pickupInstructions || ""}
                      onChange={(e) => setDraft({ ...draft, pickupInstructions: e.target.value })}
                      rows={2}
                      placeholder={isAr ? "سيكون السائق بانتظاركم في صالة الوصول مع لافتة باسم العميل..." : "Driver will meet guests at arrival hall..."}
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">{isAr ? "تعليمات التوصيل (Dropoff Instructions)" : "Drop-off Instructions"}</Label>
                    <Textarea
                      value={draft.dropoffInstructions || ""}
                      onChange={(e) => setDraft({ ...draft, dropoffInstructions: e.target.value })}
                      rows={2}
                      placeholder={isAr ? "التوصيل المباشر حتى بوابة الفندق أو صالة المغادرة..." : "Direct dropoff at hotel lobby..."}
                      className="bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="border-t border-slate-800 pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                className="border-slate-700 bg-slate-800 text-slate-300 rounded-xl"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl gap-2"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingItem ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المركبة" : "Add Vehicle")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md bg-[#161b22] border-slate-800 text-white p-6 rounded-3xl">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-white">
                {isAr ? "تأكيد حذف المركبة من الأسطول" : "Confirm Vehicle Deletion"}
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-slate-400">
                {isAr
                  ? "هل أنت متأكد من رغبتك في حذف هذه المركبة من الأسطول؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this vehicle from the fleet? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="border-slate-700 bg-slate-800 text-slate-300 rounded-xl"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>

              <Button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isAr ? "تأكيد الحذف" : "Delete Vehicle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
