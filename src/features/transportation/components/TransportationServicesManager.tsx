"use client";

import React, { useState, useMemo, useRef } from "react";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";
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
  RefreshCw,
  X,
  Loader2,
  Check,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  DoorClosed,
  Plane,
  DollarSign,
  Globe2,
  Copy,
  Archive,
  RotateCcw,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  Wand2,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  FileText,
  Navigation,
  User,
  Luggage,
  MessageCircle,
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
import { Textarea } from "@/components/ui/textarea";

import { TransportationService, ServiceDraft, VehicleCategory } from "../types";
import { transportationApi } from "../api/transportationApi";
import { DEFAULT_FLEET, AVAILABLE_FEATURES } from "../data/default-fleet";
import { MediaLibraryPickerModal, SelectedMediaAsset } from "@/components/media/MediaLibraryPickerModal";
import { useUploadMedia } from "@/features/media/hooks/useMedia";
import { MediaEntityType } from "@/features/media/types";
import { autoTranslateMissingEntityFields } from "@/lib/translationService";

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
  luxury_van: {
    labelAr: "فان سياحي VIP",
    labelEn: "VIP Luxury Van",
    icon: Car,
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    dotColor: "bg-indigo-500",
  },
  sedan: {
    labelAr: "سيدان رجال أعمال",
    labelEn: "Executive Sedan",
    icon: Car,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dotColor: "bg-rose-500",
  },
  suv: {
    labelAr: "دفع رباعي VIP SUV",
    labelEn: "VIP Luxury SUV",
    icon: Car,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    dotColor: "bg-teal-500",
  },
};

function inferCategory(item: Partial<TransportationService>): string {
  const cat = (item.vehicleCategory || "").toLowerCase().trim();
  if (cat === "bus" || cat.includes("bus")) return "bus";
  if (cat === "coaster" || cat.includes("coaster") || cat.includes("mini")) return "coaster";
  if (cat === "private" || cat.includes("private") || cat.includes("sedan") || cat.includes("suv")) return "private";
  if (cat === "luxury_van" || cat.includes("van")) return "luxury_van";

  const st = (item.serviceType || "").toUpperCase().trim();
  if (st === "AIRPORT" || st === "CITY_TO_CITY" || st === "HOTEL") return "transfer";
  if (st === "COASTER") return "coaster";
  if (st === "BUS") return "bus";
  return "bus";
}

function getFallbackImage(category: string): string {
  switch (category) {
    case "coaster":
      return "/imgs/transportation/costar.jpeg";
    case "private":
    case "transfer":
    case "sedan":
    case "suv":
    case "luxury_van":
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
  nameEs: "",
  namePt: "",
  nameIt: "",
  serviceType: "AIRPORT",
  vehicleCategory: "bus",
  vehicleType: "VIP Tour Bus 50-Seater",
  capacity: 50,
  doors: 2,
  transmission: "AUTO",
  basePriceUsd: 150,
  heroImageUrl: "/imgs/transportation/bus1.jpeg",
  heroMediaId: null,
  heroImageAlt: null,
  isPrivate: false,
  isActive: true,
  rating: 5.0,
  reviews: 50,
  features: ["Air Conditioning", "WiFi", "Professional Driver"],
  description: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionEs: "",
  descriptionPt: "",
  descriptionIt: "",
  pickupInstructions: "",
  dropoffInstructions: "",
});

export function TransportationServicesManager() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const queryClient = useQueryClient();

  const [mainTab, setMainTab] = useState<"fleet" | "bookings">("fleet");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ACTIVE" | "ARCHIVED" | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Bookings management state
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedBookingForDriver, setSelectedBookingForDriver] = useState<any | null>(null);
  const [driverNameInput, setDriverNameInput] = useState("");
  const [driverNotesInput, setDriverNotesInput] = useState("");
  const [driverStatusInput, setDriverStatusInput] = useState("ASSIGNED");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportationService | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TransportationService | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [langSubTab, setLangSubTab] = useState<"en" | "ar" | "es" | "pt" | "it">("en");

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadHeroMutation = useUploadMedia();

  const {
    data: apiServices,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-transportation-services", selectedCategory, selectedStatus, search],
    queryFn: async () => {
      try {
        const list = await transportationApi.list({
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          search: search.trim() || undefined,
          locale,
        });
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn("Error fetching admin transportation services:", err);
        return [];
      }
    },
    staleTime: 30_000,
  });

  const {
    data: rawBookings = [],
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["admin-transportation-bookings", bookingStatusFilter],
    queryFn: async () => {
      try {
        const list = await transportationApi.listBookings(bookingStatusFilter);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn("Error fetching admin transportation bookings:", err);
        return [];
      }
    },
    staleTime: 15_000,
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      driverName,
      notes,
    }: {
      id: string;
      status: string;
      driverName?: string;
      notes?: string;
    }) => {
      return await transportationApi.updateBookingStatus(id, { status, driverName, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transportation-bookings"] });
      toast.success(isAr ? "تم تحديث حالة الحجز وتعيين السائق بنجاح! ✨" : "Booking status & driver updated! ✨");
      setSelectedBookingForDriver(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isAr ? "تعذر تحديث الحجز" : "Failed to update booking"));
    },
  });

  const fleetData = useMemo(() => {
    const sourceList = apiServices && apiServices.length > 0 ? apiServices : DEFAULT_FLEET;
    return sourceList.map((item: any) => {
      const resolvedCategory = inferCategory(item);
      const rawFeatures =
        (Array.isArray(item.featuresJsonb) && item.featuresJsonb.length > 0
          ? item.featuresJsonb
          : Array.isArray(item.features) && item.features.length > 0
          ? item.features
          : ["Air Conditioning", "WiFi", "Professional Driver"]);

      const defaultPrice =
        resolvedCategory === "private" || resolvedCategory === "transfer"
          ? 150
          : resolvedCategory === "coaster"
          ? 250
          : 350;

      const nameJsonb = item.nameJsonb || item.featuresJsonb?.nameJsonb || {
        en: item.nameEn || item.name,
        ar: item.nameAr || item.name,
        es: item.nameEs || item.name,
        pt: item.namePt || item.name,
        it: item.nameIt || item.name,
      };

      const descriptionJsonb = item.descriptionJsonb || item.featuresJsonb?.descriptionJsonb || {
        en: item.descriptionEn || item.description || "",
        ar: item.descriptionAr || item.description || "",
        es: item.descriptionEs || item.description || "",
        pt: item.descriptionPt || item.description || "",
        it: item.descriptionIt || item.description || "",
      };

      return {
        ...item,
        id: item.id,
        name: isAr ? (nameJsonb.ar || item.name) : (nameJsonb.en || item.name),
        nameAr: nameJsonb.ar || item.nameAr || item.name,
        nameEn: nameJsonb.en || item.nameEn || item.name,
        nameEs: nameJsonb.es || item.name,
        namePt: nameJsonb.pt || item.name,
        nameIt: nameJsonb.it || item.name,
        nameJsonb,
        description: isAr ? (descriptionJsonb.ar || item.description) : (descriptionJsonb.en || item.description),
        descriptionAr: descriptionJsonb.ar || item.description || "",
        descriptionEn: descriptionJsonb.en || item.description || "",
        descriptionEs: descriptionJsonb.es || item.description || "",
        descriptionPt: descriptionJsonb.pt || item.description || "",
        descriptionIt: descriptionJsonb.it || item.description || "",
        descriptionJsonb,
        heroImageUrl: item.heroImageUrl || getFallbackImage(resolvedCategory),
        capacity: item.capacity ?? (resolvedCategory === "private" ? 4 : resolvedCategory === "coaster" ? 24 : 50),
        doors: item.doors ?? (resolvedCategory === "private" ? 4 : 2),
        transmission: item.transmission || "AUTO",
        basePriceUsd: Number(item.basePriceUsd) || defaultPrice,
        vehicleCategory: resolvedCategory,
        vehicleType:
          item.vehicleType ||
          (resolvedCategory === "private"
            ? "Luxury Sedan & SUV"
            : resolvedCategory === "coaster"
            ? "Toyota Coaster Executive"
            : resolvedCategory === "transfer"
            ? "VIP Chauffeur & Transfer"
            : "VIP Tour Coach"),
        serviceType: item.serviceType || "AIRPORT",
        features: rawFeatures,
        featuresJsonb: rawFeatures,
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        isArchived: item.isArchived !== undefined ? Boolean(item.isArchived) : !item.isActive,
        isPrivate: item.isPrivate !== undefined ? Boolean(item.isPrivate) : resolvedCategory === "private",
        pickupInstructions: item.pickupInstructions || "",
        dropoffInstructions: item.dropoffInstructions || "",
      } as TransportationService;
    });
  }, [apiServices, isAr]);

  const stats = useMemo(() => {
    const total = fleetData.length;
    const active = fleetData.filter((v) => v.isActive && !v.isArchived).length;
    const archived = fleetData.filter((v) => !v.isActive || v.isArchived).length;
    const buses = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "bus").length;
    const coasters = fleetData.filter((v) => (v.vehicleCategory || "").toLowerCase() === "coaster").length;
    const privates = fleetData.filter((v) => {
      const cat = (v.vehicleCategory || "").toLowerCase();
      return cat === "private" || cat === "transfer" || cat === "luxury_van" || cat === "sedan" || cat === "suv";
    }).length;
    const totalCapacity = fleetData
      .filter((v) => v.isActive && !v.isArchived)
      .reduce((acc, v) => acc + (Number(v.capacity) || 0), 0);

    return { total, active, archived, buses, coasters, privates, totalCapacity };
  }, [fleetData]);

  const filteredFleet = useMemo(() => {
    return fleetData.filter((item) => {
      if (selectedStatus === "ACTIVE" && (!item.isActive || item.isArchived)) return false;
      if (selectedStatus === "ARCHIVED" && (item.isActive && !item.isArchived)) return false;

      const cat = (item.vehicleCategory || "bus").toLowerCase();
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "private") {
          if (cat !== "private" && cat !== "transfer" && cat !== "luxury_van" && cat !== "sedan" && cat !== "suv") return false;
        } else if (cat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName =
          item.name.toLowerCase().includes(q) ||
          (item.nameAr && item.nameAr.toLowerCase().includes(q)) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(q));
        const matchType = item.vehicleType && item.vehicleType.toLowerCase().includes(q);
        const matchDesc = item.description && item.description.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchDesc) return false;
      }

      return true;
    });
  }, [fleetData, selectedCategory, selectedStatus, search]);

  const bookingStats = useMemo(() => {
    const total = rawBookings.length;
    const submitted = rawBookings.filter((b: any) => b.status === "SUBMITTED").length;
    const confirmed = rawBookings.filter((b: any) => b.status === "CONFIRMED").length;
    const assigned = rawBookings.filter((b: any) => b.status === "ASSIGNED").length;
    const completed = rawBookings.filter((b: any) => b.status === "COMPLETED").length;
    const cancelled = rawBookings.filter((b: any) => b.status === "CANCELLED").length;
    const totalRevenue = rawBookings
      .filter((b: any) => b.status !== "CANCELLED")
      .reduce((acc: number, b: any) => acc + (Number(b.totalAmountUsd) || 0), 0);

    return { total, submitted, confirmed, assigned, completed, cancelled, totalRevenue };
  }, [rawBookings]);

  const filteredBookings = useMemo(() => {
    return rawBookings.filter((b: any) => {
      if (bookingStatusFilter !== "ALL" && b.status !== bookingStatusFilter) return false;
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase().trim();
        const matchRef = b.referenceCode?.toLowerCase().includes(q);
        const matchCustomer =
          b.user?.name?.toLowerCase().includes(q) ||
          b.user?.email?.toLowerCase().includes(q) ||
          b.notes?.toLowerCase().includes(q);
        const matchPickup = b.pickupLocation?.toLowerCase().includes(q);
        const matchDropoff = b.dropoffLocation?.toLowerCase().includes(q);
        const matchFlight = b.flightNumber?.toLowerCase().includes(q);
        const matchDriver = b.driverName?.toLowerCase().includes(q);
        const matchService = b.service?.name?.toLowerCase().includes(q);
        if (!matchRef && !matchCustomer && !matchPickup && !matchDropoff && !matchFlight && !matchDriver && !matchService) {
          return false;
        }
      }
      return true;
    });
  }, [rawBookings, bookingStatusFilter, bookingSearch]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ServiceDraft) => {
      const fallbackNameEn = payload.vehicleType?.trim() || payload.nameEn?.trim() || payload.name?.trim() || "VIP Luxury Vehicle";
      const fallbackNameAr = payload.nameAr?.trim() || (payload.vehicleType?.trim() ? `مركبة فاخرة (${payload.vehicleType.trim()})` : "مركبة سياحية فاخرة");

      const nameJsonb = {
        en: payload.nameEn?.trim() || fallbackNameEn,
        ar: payload.nameAr?.trim() || fallbackNameAr,
        es: payload.nameEs?.trim() || payload.nameEn?.trim() || fallbackNameEn,
        pt: payload.namePt?.trim() || payload.nameEn?.trim() || fallbackNameEn,
        it: payload.nameIt?.trim() || payload.nameEn?.trim() || fallbackNameEn,
      };

      const baseDesc = payload.descriptionEn?.trim() || payload.description?.trim() || "Executive luxury transport service.";
      const descriptionJsonb = {
        en: payload.descriptionEn?.trim() || baseDesc,
        ar: payload.descriptionAr?.trim() || payload.description?.trim() || "خدمة نقل سياحية فاخرة ومريحة مع سائق معتمد.",
        es: payload.descriptionEs?.trim() || baseDesc,
        pt: payload.descriptionPt?.trim() || baseDesc,
        it: payload.descriptionIt?.trim() || baseDesc,
      };

      const backendPayload = {
        name: fallbackNameEn,
        nameJsonb,
        nameAr: payload.nameAr?.trim() || fallbackNameAr,
        nameEn: payload.nameEn?.trim() || fallbackNameEn,
        serviceType: payload.serviceType || "AIRPORT",
        description: baseDesc,
        descriptionJsonb,
        vehicleCategory: payload.vehicleCategory || "bus",
        vehicleType: payload.vehicleType?.trim() || fallbackNameEn,
        capacity: Number(payload.capacity) > 0 ? Number(payload.capacity) : 50,
        doors: Number(payload.doors) > 0 ? Number(payload.doors) : 2,
        transmission: payload.transmission || "AUTO",
        heroImageUrl: payload.heroImageUrl?.trim() || getFallbackImage(String(payload.vehicleCategory)),
        heroMediaId: payload.heroMediaId && payload.heroMediaId.trim() ? payload.heroMediaId.trim() : undefined,
        isPrivate: Boolean(payload.isPrivate),
        isActive: Boolean(payload.isActive),
        pickupInstructions: payload.pickupInstructions?.trim() || undefined,
        dropoffInstructions: payload.dropoffInstructions?.trim() || undefined,
        features: Array.isArray(payload.features) ? payload.features : [],
        basePriceUsd: Number(payload.basePriceUsd) >= 0 ? Number(payload.basePriceUsd) : 150,
      };

      if (editingItem?.id && !editingItem.id.startsWith("tr-custom-")) {
        return await transportationApi.update(editingItem.id, backendPayload);
      } else {
        return await transportationApi.create(backendPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transportation-services"] });
      toast.success(
        editingItem
          ? (isAr ? "تم تحديث بيانات المركبة بنجاح! ✨" : "Vehicle updated successfully! ✨")
          : (isAr ? "تمت إضافة المركبة الجديدة إلى الأسطول بنجاح! 🚗" : "New vehicle added to fleet! 🚗")
      );
      setIsEditorOpen(false);
      setEditingItem(null);
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
      toast.error(displayError || (isAr ? "تعذر حفظ بيانات المركبة." : "Failed to save vehicle."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await transportationApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transportation-services"] });
      toast.success(isAr ? "تم حذف المركبة بنجاح! 🗑️" : "Vehicle deleted successfully! 🗑️");
      setDeleteConfirmItem(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isAr ? "تعذر حذف المركبة." : "Failed to delete vehicle."));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await transportationApi.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transportation-services"] });
      toast.success(isAr ? "تم نقل المركبة إلى الأرشيف! 📦" : "Vehicle moved to archives! 📦");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isAr ? "تعذر أرشفة المركبة." : "Failed to archive vehicle."));
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await transportationApi.unarchive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transportation-services"] });
      toast.success(isAr ? "تم استعادة المركبة إلى الأسطول النشط! 🔄" : "Vehicle restored to active fleet! 🔄");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isAr ? "تعذر استعادة المركبة." : "Failed to restore vehicle."));
    },
  });

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." : "Image size must not exceed 10MB.");
      return;
    }

    setIsUploadingHero(true);
    try {
      const res = await uploadHeroMutation.mutateAsync({
        file,
        entityType: "GENERAL" as MediaEntityType,
        categorySlug: "fleet",
      });
      const secureUrl = res.secureUrl || res.url;
      setDraft((prev) => ({
        ...prev,
        heroMediaId: res.id,
        heroImageUrl: secureUrl,
      }));
      toast.success(isAr ? "تم رفع صورة المركبة بنجاح! 📸" : "Vehicle photo uploaded! 📸");
    } catch {
      toast.error(isAr ? "تعذر رفع الصورة." : "Failed to upload image.");
    } finally {
      setIsUploadingHero(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectMediaFromPicker = (asset: SelectedMediaAsset) => {
    setDraft((prev) => ({
      ...prev,
      heroMediaId: asset.id,
      heroImageUrl: asset.url,
      heroImageAlt: asset.altText,
    }));
    setIsMediaPickerOpen(false);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  const handleSmartFillTranslations = async () => {
    setIsTranslating(true);
    try {
      const fallbackName = draft.vehicleType || draft.name || "VIP Luxury Vehicle";
      const fallbackDesc = draft.description || (draft.vehicleCategory === "bus" ? "حافلة سياحية فاخرة 50 مقعداً مجهزة لنقل المجموعات والرحلات الطويلة بأعلى درجات الراحة." : "خدمة نقل سياحية فاخرة ومريحة مع سائق محترف ومعتمد.");

      const updated = await autoTranslateMissingEntityFields(draft, {
        nameKeys: { ar: "nameAr", en: "nameEn", es: "nameEs", pt: "namePt", it: "nameIt" },
        descKeys: { ar: "descriptionAr", en: "descriptionEn", es: "descriptionEs", pt: "descriptionPt", it: "descriptionIt" },
        fallbackName,
        fallbackDesc,
      });

      setDraft(updated);
      toast.success(isAr ? "✨ تمت ترجمة الحقول الشاغرة للغات الخمس بنجاح!" : "✨ Empty fields translated across 5 languages successfully!");
    } catch (err: any) {
      toast.error(isAr ? "تعذر إكمال الترجمة التلقائية." : "Auto-translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setDraft(emptyDraft());
    setActiveTab("basic");
    setLangSubTab("en");
    setIsEditorOpen(true);
  };

  const openEditModal = (item: TransportationService) => {
    setEditingItem(item);
    setDraft({
      name: item.name,
      nameAr: item.nameAr || item.nameJsonb?.ar || item.name,
      nameEn: item.nameEn || item.nameJsonb?.en || item.name,
      nameEs: item.nameEs || item.nameJsonb?.es || item.name,
      namePt: item.namePt || item.nameJsonb?.pt || item.name,
      nameIt: item.nameIt || item.nameJsonb?.it || item.name,
      serviceType: item.serviceType || "AIRPORT",
      vehicleCategory: inferCategory(item),
      vehicleType: item.vehicleType || "VIP Tour Coach",
      capacity: item.capacity ?? 50,
      doors: item.doors ?? 2,
      transmission: item.transmission || "AUTO",
      basePriceUsd: Number(item.basePriceUsd) || 150,
      heroImageUrl: item.heroImageUrl || getFallbackImage(inferCategory(item)),
      heroMediaId: item.heroMediaId || null,
      heroImageAlt: item.heroImageAlt || null,
      isPrivate: item.isPrivate ?? false,
      isActive: item.isActive ?? true,
      rating: item.rating || 5.0,
      reviews: item.reviews || 50,
      features: item.features ? [...item.features] : ["Air Conditioning", "WiFi"],
      description: item.description || "",
      descriptionAr: item.descriptionAr || item.descriptionJsonb?.ar || item.description || "",
      descriptionEn: item.descriptionEn || item.descriptionJsonb?.en || item.description || "",
      descriptionEs: item.descriptionEs || item.descriptionJsonb?.es || item.description || "",
      descriptionPt: item.descriptionPt || item.descriptionJsonb?.pt || item.description || "",
      descriptionIt: item.descriptionIt || item.descriptionJsonb?.it || item.description || "",
      pickupInstructions: item.pickupInstructions || "",
      dropoffInstructions: item.dropoffInstructions || "",
    });
    setActiveTab("basic");
    setLangSubTab("en");
    setIsEditorOpen(true);
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-card to-card border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
              <Bus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                <span>{isAr ? "إدارة أسطول النقل السياحي الفاخر" : "Luxury Transportation & Fleet"}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
                <PageHelpTooltip description="إدارة خدمات وأسطول النقل — التحكم في الحافلات، السيارات الخاصة، الأسعار، وتعيين السائقين للجولات." />
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                {isAr
                  ? "التحكم في الحافلات، الكوستر، والسيارات الخاصة VIP، والترجمات الـ 5، والأسعار، والحجوزات."
                  : "Manage luxury coaches, executive coasters, VIP private transfers, 5-locale content & pricing."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mainTab === "fleet" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-2xl h-11 text-xs font-bold gap-2 border-border cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-500" : ""}`} />
                <span>{isAr ? "تحديث الأسطول" : "Refresh"}</span>
              </Button>

              <Button
                type="button"
                onClick={openCreateModal}
                className="rounded-2xl h-11 text-xs font-bold px-5 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? "إضافة مركبة جديدة +" : "Add Vehicle +"}</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchBookings()}
              disabled={isBookingsFetching}
              className="rounded-2xl h-11 text-xs font-bold gap-2 border-border cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isBookingsFetching ? "animate-spin text-amber-500" : ""}`} />
              <span>{isAr ? "تحديث الحجوزات" : "Refresh Bookings"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top-Level Tab Switcher: Fleet vs Bookings */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/40 border w-fit">
        <button
          type="button"
          onClick={() => setMainTab("fleet")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === "fleet"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{isAr ? "أسطول النقل والمركبات" : "Fleet & Vehicles"}</span>
          <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
            {stats.total}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("bookings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === "bookings"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isAr ? "حجوزات وطلبات التوصيل" : "Transfer Bookings"}</span>
          {bookingStats.submitted > 0 ? (
            <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0 animate-pulse">
              {bookingStats.submitted} {isAr ? "جديد" : "New"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
              {bookingStats.total}
            </Badge>
          )}
        </button>
      </div>

      {mainTab === "fleet" ? (
        <>
          {/* 3. Metric Highlight Cards (Fleet) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "إجمالي الأسطول" : "Total Fleet"}</span>
            <Bus className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "مركبة مسجلة" : "Vehicles configured"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{isAr ? "المركبات النشطة" : "Active Live"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "متاحة للحجز في الموقع" : "Live on catalog"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
            <span>{isAr ? "سعة الركاب الإجمالية" : "Passenger Capacity"}</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.totalCapacity}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "مقعد ركاب متاح" : "Total available seats"}</div>
        </Card>

        <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "المؤرشفة / غير النشطة" : "Archived / Draft"}</span>
            <Archive className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.archived}</div>
          <div className="text-[10px] text-muted-foreground">{isAr ? "مخفية من الموقع" : "Hidden from search"}</div>
        </Card>
      </div>

      {/* 3. Filters, Tabs & Search Bar */}
      <div className="space-y-3 p-4 rounded-3xl bg-card border shadow-xs">
        {/* Status Lifecycle Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                selectedStatus === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{isAr ? "جميع المركبات 📋" : "All Vehicles 📋"}</span>
              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
                {stats.total}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("ACTIVE")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                selectedStatus === "ACTIVE"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "المركبات النشطة ✨" : "Active Fleet ✨"}</span>
              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
                {stats.active}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("ARCHIVED")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                selectedStatus === "ARCHIVED"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isAr ? "الأرشيف 📦" : "Archived 📦"}</span>
              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
                {stats.archived}
              </Badge>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              className="rounded-xl cursor-pointer"
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("table")}
              className="rounded-xl cursor-pointer"
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={isAr ? "البحث بالاسم، الموديل، المواصفات أو الوصف..." : "Search by vehicle name, model, specs..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 text-xs pr-9 rtl:pr-9 ltr:pl-9 rounded-2xl font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "ALL", labelAr: "الكل", labelEn: "All Types" },
              { id: "bus", labelAr: "حافلات سياحية 🚌", labelEn: "Coaches 🚌" },
              { id: "coaster", labelAr: "كوستر وميني باص 🚐", labelEn: "Coasters 🚐" },
              { id: "private", labelAr: "سيارات خاصة VIP 🚗", labelEn: "Private VIP 🚗" },
              { id: "transfer", labelAr: "توصيل واستقبال ✈️", labelEn: "Airport Transfers ✈️" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Vehicles Listing (Grid / Table) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-muted-foreground">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs font-bold">{isAr ? "جاري تحميل أسطول النقل..." : "Loading fleet catalog..."}</span>
        </div>
      ) : filteredFleet.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-center">
          <Bus className="w-12 h-12 text-muted-foreground/40" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-foreground">
              {isAr ? "لم يتم العثور على مركبات مطابقة" : "No vehicles found matching criteria"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {isAr
                ? "يمكنك تغيير فلاتر البحث أو إضافة مركبة جديدة إلى الأسطول."
                : "Try adjusting search filters or add a new luxury vehicle."}
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateModal}
            className="mt-2 text-xs font-bold px-4 gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl"
          >
            <Plus className="w-3.5 h-3.5 stroke-3" />
            <span>{isAr ? "إضافة مركبة جديدة الآن" : "Add Vehicle Now"}</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFleet.map((item) => {
            const catMeta = CATEGORY_MAP[item.vehicleCategory || "bus"] || CATEGORY_MAP.bus;
            const CatIcon = catMeta.icon;

            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-3xl border bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Hero Photo Header */}
                  <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                    <img
                      src={item.heroImageUrl || getFallbackImage(String(item.vehicleCategory))}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 rtl:right-3 ltr:left-3 flex items-center gap-1.5">
                      <Badge className={`${catMeta.badgeClass} backdrop-blur-xs text-[10px] font-black border gap-1`}>
                        <CatIcon className="w-3 h-3" />
                        <span>{isAr ? catMeta.labelAr : catMeta.labelEn}</span>
                      </Badge>
                    </div>

                    <div className="absolute top-3 left-3 rtl:left-3 ltr:right-3">
                      {item.isActive && !item.isArchived ? (
                        <Badge className="bg-emerald-500/80 text-slate-950 font-black text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? "نشط" : "Active"}</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-950/80 text-amber-400 border border-amber-400/20 font-black text-[10px] gap-1">
                          <Archive className="w-3 h-3" />
                          <span>{isAr ? "مؤرشف" : "Archived"}</span>
                        </Badge>
                      )}
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-3 right-3 rtl:right-3 ltr:left-3">
                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-xs border border-amber-500/30 text-amber-400 font-mono font-black text-sm flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.basePriceUsd}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{isAr ? "/ رحلة" : "/ trip"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-black text-base text-foreground leading-snug line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">{item.vehicleType}</p>
                    </div>

                    {/* Specs Row */}
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground border-y py-2.5">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.capacity} {isAr ? "ركاب" : "seats"}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <DoorClosed className="w-3.5 h-3.5 text-sky-500" />
                        <span>{item.doors} {isAr ? "أبواب" : "doors"}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{item.transmission}</span>
                      </span>
                    </div>

                    {/* Features Chips */}
                    {Array.isArray(item.features) && item.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground border"
                          >
                            {feat}
                          </span>
                        ))}
                        {item.features.length > 3 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            +{item.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-muted/30 border-t flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    className="h-9 text-xs font-bold gap-1.5 rounded-xl border-border cursor-pointer flex-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? "تعديل المركبة" : "Edit"}</span>
                  </Button>

                  {item.isActive && !item.isArchived ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => archiveMutation.mutate(item.id)}
                      disabled={archiveMutation.isPending}
                      className="h-9 text-xs font-bold gap-1 rounded-xl text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                      title={isAr ? "أرشفة المركبة وإخفاؤها من الموقع" : "Archive Vehicle"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isAr ? "أرشفة" : "Archive"}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => unarchiveMutation.mutate(item.id)}
                      disabled={unarchiveMutation.isPending}
                      className="h-9 text-xs font-bold gap-1 rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                      title={isAr ? "استعادة المركبة إلى الأسطول النشط" : "Restore to Active"}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isAr ? "استعادة" : "Restore"}</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteConfirmItem(item)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                    title={isAr ? "مسح نهائي 🗑️" : "Delete Vehicle 🗑️"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="rounded-3xl border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse">
              <thead className="bg-muted/60 text-muted-foreground font-black border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">{isAr ? "المركبة" : "Vehicle"}</th>
                  <th className="p-4">{isAr ? "الفئة والنوع" : "Category & Type"}</th>
                  <th className="p-4">{isAr ? "السعة والأبواب" : "Capacity"}</th>
                  <th className="p-4">{isAr ? "السعر الأساسي" : "Base Price"}</th>
                  <th className="p-4">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-4 text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFleet.map((item) => {
                  const catMeta = CATEGORY_MAP[item.vehicleCategory || "bus"] || CATEGORY_MAP.bus;
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.heroImageUrl || getFallbackImage(String(item.vehicleCategory))}
                            alt={item.name}
                            className="w-12 h-10 object-cover rounded-xl border bg-slate-950 shrink-0"
                          />
                          <div>
                            <div className="font-black text-foreground">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground">{item.vehicleType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${catMeta.badgeClass} text-[10px] font-bold border`}>
                          {isAr ? catMeta.labelAr : catMeta.labelEn}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold text-muted-foreground">
                        <span>{item.capacity} {isAr ? "ركاب" : "seats"}</span> · <span>{item.doors} {isAr ? "أبواب" : "doors"}</span>
                      </td>
                      <td className="p-4 font-mono font-black text-amber-500">
                        ${item.basePriceUsd}
                      </td>
                      <td className="p-4">
                        {item.isActive && !item.isArchived ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            {isAr ? "نشط ومتاح" : "Active"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] font-bold">
                            {isAr ? "مؤرشف" : "Archived"}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEditModal(item)}
                            className="rounded-xl hover:bg-muted text-amber-500"
                            title={isAr ? "تعديل" : "Edit"}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          {item.isActive && !item.isArchived ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => archiveMutation.mutate(item.id)}
                              className="rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              title={isAr ? "أرشفة" : "Archive"}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => unarchiveMutation.mutate(item.id)}
                              className="rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              title={isAr ? "استعادة" : "Restore"}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="rounded-xl hover:bg-destructive/10 text-destructive"
                            title={isAr ? "مسح نهائي" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </>
      ) : (
        /* ========================================================================= */
        /* TRANSPORTATION BOOKINGS WORKSPACE */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Bookings Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>{isAr ? "إجمالي طلبات النقل" : "Total Transfers"}</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-foreground">{bookingStats.total}</div>
              <div className="text-[10px] text-muted-foreground">{isAr ? "طلب حجز مسجل" : "Registered requests"}</div>
            </Card>

            <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>{isAr ? "جديدة بانتظار التأكيد" : "Pending Confirmation"}</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{bookingStats.submitted}</div>
              <div className="text-[10px] text-muted-foreground">{isAr ? "بحاجة لمراجعة وتعيين سائق" : "Requires driver assignment"}</div>
            </Card>

            <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>{isAr ? "حجوزات مؤكدة ومجدولة" : "Confirmed & Scheduled"}</span>
                <UserCheck className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{bookingStats.confirmed + bookingStats.assigned}</div>
              <div className="text-[10px] text-muted-foreground">{isAr ? "قيد التنفيذ والمتابعة" : "Scheduled & in progress"}</div>
            </Card>

            <Card className="p-4 rounded-3xl bg-card border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{isAr ? "الإيرادات الإجمالية" : "Total Revenue"}</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${bookingStats.totalRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">{bookingStats.completed} {isAr ? "رحلة مكتملة" : "completed trips"}</div>
            </Card>
          </div>

          {/* 2. Bookings Filter & Search Bar */}
          <div className="space-y-3 p-4 rounded-3xl bg-card border shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: "ALL", labelAr: "جميع الحجوزات 📋", labelEn: "All Bookings 📋", count: bookingStats.total },
                  { id: "SUBMITTED", labelAr: "جديد بانتظار التأكيد ⏳", labelEn: "Submitted ⏳", count: bookingStats.submitted },
                  { id: "CONFIRMED", labelAr: "مؤكد ⚡", labelEn: "Confirmed ⚡", count: bookingStats.confirmed },
                  { id: "ASSIGNED", labelAr: "تم تعيين سائق 🚗", labelEn: "Driver Assigned 🚗", count: bookingStats.assigned },
                  { id: "COMPLETED", labelAr: "مكتمل بنجاح ✅", labelEn: "Completed ✅", count: bookingStats.completed },
                  { id: "CANCELLED", labelAr: "ملغي ❌", labelEn: "Cancelled ❌", count: bookingStats.cancelled },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBookingStatusFilter(st.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      bookingStatusFilter === st.id
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <span>{isAr ? st.labelAr : st.labelEn}</span>
                    <Badge variant="secondary" className="mr-1.5 text-[10px] font-bold px-1.5 py-0">
                      {st.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder={isAr ? "البحث بالرقم المرجعي، اسم العميل، موقع الاستقبال، أو رقم الرحلة..." : "Search reference, guest name, location, flight..."}
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="h-10 text-xs pr-9 rtl:pr-9 ltr:pl-9 rounded-2xl font-medium"
                />
                {bookingSearch && (
                  <button
                    type="button"
                    onClick={() => setBookingSearch("")}
                    className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Bookings List Cards */}
          {isBookingsLoading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-muted-foreground">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-xs font-bold">{isAr ? "جاري تحميل حجوزات النقل والتوصيل..." : "Loading transfer bookings..."}</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3 rounded-3xl bg-card border text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/40" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-foreground">
                  {isAr ? "لا توجد حجوزات نقل مطابقة" : "No transfer bookings found matching criteria"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "ستظهر طلبات النقل الخاصة بالمطارات والتنقلات VIP فور قيام العملاء بالحجز من الموقع." : "VIP transfer requests will appear here when guests book online."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b: any) => {
                let customerName = b.user?.name || "Guest Traveler";
                let customerEmail = b.user?.email || "";
                let customerPhone = b.user?.phone || "";

                if (b.notes && b.notes.includes("[Contact:")) {
                  const matchName = b.notes.match(/Name:\s*([^|\]]+)/);
                  const matchEmail = b.notes.match(/Email:\s*([^|\]]+)/);
                  const matchPhone = b.notes.match(/Phone:\s*([^|\]]+)/);
                  if (matchName && matchName[1]) customerName = matchName[1].trim();
                  if (matchEmail && matchEmail[1]) customerEmail = matchEmail[1].trim();
                  if (matchPhone && matchPhone[1]) customerPhone = matchPhone[1].trim();
                }

                const statusBadgeConfig: Record<string, { label: string; class: string }> = {
                  SUBMITTED: { label: isAr ? "جديد بانتظار التأكيد" : "Submitted", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
                  CONFIRMED: { label: isAr ? "مؤكد" : "Confirmed", class: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
                  ASSIGNED: { label: isAr ? "تم تعيين سائق" : "Driver Assigned", class: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
                  COMPLETED: { label: isAr ? "مكتمل" : "Completed", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                  CANCELLED: { label: isAr ? "ملغي" : "Cancelled", class: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
                };

                const currentBadge = statusBadgeConfig[b.status] || { label: b.status, class: "bg-muted text-muted-foreground border-border" };

                return (
                  <Card key={b.id} className="p-5 rounded-3xl bg-card border shadow-xs space-y-4 hover:border-amber-500/40 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                          <Car className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-foreground">{b.referenceCode}</span>
                            <Badge className={`text-[10px] font-bold ${currentBadge.class}`}>
                              {currentBadge.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            <span>{b.service?.name || "VIP Chauffeur Transfer"}</span>
                            {b.flightNumber && (
                              <span className="font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px]">
                                ✈️ {b.flightNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          aria-label={isAr ? "تغيير حالة الحجز" : "Change booking status"}
                          value={b.status}
                          onChange={(e) => updateBookingStatusMutation.mutate({ id: b.id, status: e.target.value })}
                          disabled={updateBookingStatusMutation.isPending}
                          className="h-9 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                        >
                          <option value="SUBMITTED">{isAr ? "جديد (SUBMITTED)" : "Submitted"}</option>
                          <option value="CONFIRMED">{isAr ? "مؤكد (CONFIRMED)" : "Confirmed"}</option>
                          <option value="ASSIGNED">{isAr ? "تم تعيين سائق (ASSIGNED)" : "Driver Assigned"}</option>
                          <option value="COMPLETED">{isAr ? "مكتمل (COMPLETED)" : "Completed"}</option>
                          <option value="CANCELLED">{isAr ? "ملغي (CANCELLED)" : "Cancelled"}</option>
                        </select>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setSelectedBookingForDriver(b);
                            setDriverNameInput(b.driverName || "");
                            setDriverNotesInput(b.notes || "");
                            setDriverStatusInput(b.status === "SUBMITTED" ? "ASSIGNED" : b.status);
                          }}
                          className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{b.driverName ? (isAr ? `السائق: ${b.driverName}` : `Driver: ${b.driverName}`) : (isAr ? "تعيين سائق 🚗" : "Assign Driver 🚗")}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      {/* Customer */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? "بيانات العميل" : "Guest Customer"}</span>
                        </div>
                        <div className="font-black text-foreground">{customerName}</div>
                        {customerEmail && <div className="text-muted-foreground text-[11px] truncate dir-ltr">{customerEmail}</div>}
                        {customerPhone && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="font-mono text-[11px] text-foreground dir-ltr">{customerPhone}</span>
                            <a
                              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold inline-flex items-center gap-1"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 inline" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Schedule */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? "موعد الاستقبال والتوصيل" : "Pickup Schedule"}</span>
                        </div>
                        <div className="font-black text-foreground">
                          {new Date(b.pickupDate).toLocaleDateString(locale, { dateStyle: 'medium' })}
                        </div>
                        <div className="text-muted-foreground text-[11px] flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{b.pickupTime || "10:00 AM"}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-semibold">
                          👥 {b.passengerCount} {isAr ? "ركاب" : "passengers"} · 🧳 {b.luggageCount || 0} {isAr ? "حقائب" : "bags"}
                        </div>
                      </div>

                      {/* Route */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? "مسار الرحلة" : "Transfer Route"}</span>
                        </div>
                        <div className="text-muted-foreground text-[11px] flex items-start gap-1">
                          <span className="text-amber-500 font-bold shrink-0">📍</span>
                          <span className="font-bold text-foreground truncate">{b.pickupLocation}</span>
                        </div>
                        <div className="text-muted-foreground text-[11px] flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">🏁</span>
                          <span className="font-bold text-foreground truncate">{b.dropoffLocation}</span>
                        </div>
                      </div>

                      {/* Financials & Driver */}
                      <div className="space-y-1 md:text-left rtl:md:text-right">
                        <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? "القيمة والسائق" : "Financials & Driver"}</span>
                        </div>
                        <div className="text-lg font-black text-amber-500">
                          ${Number(b.totalAmountUsd).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-semibold text-muted-foreground">
                          {b.driverName ? (
                            <span className="text-emerald-600 dark:text-emerald-400">🚗 {b.driverName}</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">⚠️ {isAr ? "بانتظار تعيين سائق" : "Unassigned"}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-3 rounded-2xl bg-muted/40 text-[11px] text-muted-foreground leading-relaxed border">
                        <span className="font-bold text-foreground ml-1">{isAr ? "ملاحظات وتفاصيل إضافية:" : "Notes / Requests:"}</span>
                        <span>{b.notes}</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Driver Assignment Dialog */}
      <Dialog open={Boolean(selectedBookingForDriver)} onOpenChange={(open) => !open && setSelectedBookingForDriver(null)}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <DialogTitle className="text-center text-lg font-black text-foreground">
              {isAr ? "تعيين وتحديث بيانات السائق" : "Assign Chauffeur & Driver"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              {isAr
                ? `طلب الحجز رقم ${selectedBookingForDriver?.referenceCode} - ${selectedBookingForDriver?.service?.name || "VIP Transfer"}`
                : `Booking ${selectedBookingForDriver?.referenceCode} - ${selectedBookingForDriver?.service?.name || "VIP Transfer"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{isAr ? "اسم السائق ورقم الاتصال *" : "Driver Name & Contact *"}</label>
              <Input
                placeholder={isAr ? "مثال: الكابتن أحمد حسني (+20 100 123 4567)" : "e.g. Captain Ahmed Hosny (+20 100 123 4567)"}
                value={driverNameInput}
                onChange={(e) => setDriverNameInput(e.target.value)}
                className="rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{isAr ? "حالة الحجز التشغيلية" : "Operational Status"}</label>
              <select
                aria-label={isAr ? "حالة الحجز التشغيلية" : "Operational status"}
                value={driverStatusInput}
                onChange={(e) => setDriverStatusInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
              >
                <option value="ASSIGNED">{isAr ? "تم تعيين سائق (ASSIGNED)" : "Driver Assigned"}</option>
                <option value="CONFIRMED">{isAr ? "مؤكد (CONFIRMED)" : "Confirmed"}</option>
                <option value="COMPLETED">{isAr ? "مكتمل (COMPLETED)" : "Completed"}</option>
                <option value="CANCELLED">{isAr ? "ملغي (CANCELLED)" : "Cancelled"}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{isAr ? "ملاحظات تشغيلية داخلية" : "Internal Operational Notes"}</label>
              <Textarea
                rows={3}
                placeholder={isAr ? "أي تعليمات خاصة بالسائق أو رقم لوحة السيارة..." : "Vehicle license plate number, special pickup coordinates..."}
                value={driverNotesInput}
                onChange={(e) => setDriverNotesInput(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedBookingForDriver(null)}
              disabled={updateBookingStatusMutation.isPending}
              className="text-xs font-bold rounded-xl flex-1 cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedBookingForDriver) {
                  updateBookingStatusMutation.mutate({
                    id: selectedBookingForDriver.id,
                    status: driverStatusInput,
                    driverName: driverNameInput.trim() || undefined,
                    notes: driverNotesInput.trim() || undefined,
                  });
                }
              }}
              disabled={updateBookingStatusMutation.isPending}
              className="text-xs font-bold rounded-xl flex-1 gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md"
            >
              {updateBookingStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isAr ? "حفظ وتعيين السائق ✨" : "Save & Assign ✨"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Comprehensive Vehicle Modal Editor (4 Tabs + 5 Languages + Media Picker) */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-3xl bg-card">
          <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
                  <Bus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                    <span>
                      {editingItem
                        ? (isAr ? "تعديل بيانات المركبة والترجمات" : "Edit Vehicle & Localizations")
                        : (isAr ? "إضافة مركبة جديدة إلى الأسطول" : "Add Luxury Vehicle to Fleet")}
                    </span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                    {isAr
                      ? "إعداد الصورة الرئيسية، الترجمات الـ 5، المواصفات الفنية، والمميزات الفاخرة."
                      : "Configure hero photo, 5-language content, technical specifications & amenities."}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Form Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-muted/60 p-1 rounded-2xl mb-6">
                <TabsTrigger value="basic" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "البيانات الأساسية والصورة" : "Basic Info & Media"}
                </TabsTrigger>
                <TabsTrigger value="translations" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "الترجمات الـ 5 🌐" : "5 Languages 🌐"}
                </TabsTrigger>
                <TabsTrigger value="features" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "المميزات والرفاهية" : "Features & Luxury"}
                </TabsTrigger>
                <TabsTrigger value="instructions" className="text-xs font-bold rounded-xl py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                  {isAr ? "التعليمات والسياسات" : "Instructions"}
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC INFO & MEDIA */}
              <TabsContent value="basic" className="space-y-5">
                {/* HERO PHOTO SECTION */}
                <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <span>{isAr ? "صورة المركبة الرئيسية ومعرض الوسائط" : "Vehicle Hero Image & Media"}</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        {isAr
                          ? "الصورة الأساسية التي تظهر في بطاقة المركبة وصفحة الحجز بالموقع العام."
                          : "Primary photo featured on customer booking cards and fleet showcase."}
                      </p>
                    </div>

                    <div>
                      {draft.heroImageUrl ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1">
                          <Check className="w-3 h-3 stroke-3" />
                          <span>{isAr ? "الصورة محددة ✓" : "Photo Configured ✓"}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] font-bold">
                          {isAr ? "لم تحدد صورة" : "No photo selected"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleHeroFileUpload}
                  />

                  {/* Photo Preview or Empty State */}
                  {draft.heroImageUrl ? (
                    <div className="space-y-3">
                      <div className="relative aspect-16/8 sm:aspect-21/9 rounded-2xl overflow-hidden border bg-slate-950 shadow-md">
                        <img
                          src={draft.heroImageUrl}
                          alt="Vehicle Hero Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 rtl:left-3 ltr:right-3 flex items-center gap-1.5">
                          <Badge className="bg-slate-950/80 text-amber-400 font-mono text-[10px] border border-amber-400/30">
                            {draft.heroMediaId ? `Media ID: ${draft.heroMediaId.slice(0, 8)}...` : "Direct Photo"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingHero}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                        >
                          {isUploadingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          <span>{isUploadingHero ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "تغيير الصورة 📸" : "Upload New 📸")}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{isAr ? "اختيار من مكتبة الوسائط 🖼️" : "Pick from Library 🖼️"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                          className="rounded-xl text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>{isAr ? "تعديل الرابط 🔗" : "Edit URL 🔗"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDraft((p) => ({ ...p, heroImageUrl: "", heroMediaId: null }))}
                          className="rounded-xl text-xs font-bold gap-1 text-destructive hover:bg-destructive/10 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "إزالة" : "Remove"}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-border rounded-2xl bg-card flex flex-col items-center justify-center text-center gap-3">
                      <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <ImageIcon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="space-y-1 max-w-md">
                        <h5 className="text-xs font-black text-foreground">
                          {isAr ? "لم يتم تعيين صورة رئيسية للمركبة" : "No Photo Configured"}
                        </h5>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {isAr
                            ? "ارفع صورة مباشرة من جهازك أو اختر من مكتبة الوسائط المتوفرة بالمشروع."
                            : "Upload directly from your device, choose from Media Library, or paste a URL."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingHero}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                        >
                          {isUploadingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          <span>{isUploadingHero ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع صورة من الجهاز 📸" : "Upload Photo 📸")}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{isAr ? "اختيار من مكتبة الوسائط 🖼️" : "Pick from Library 🖼️"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                          className="rounded-xl text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>{isAr ? "إدخال رابط مباشر 🔗" : "Direct URL 🔗"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {showCustomUrlInput && (
                    <div className="p-3.5 rounded-2xl bg-card border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? "رابط الصورة المباشر (URL)" : "Direct Image URL"}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCustomUrlInput(false)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="https://res.cloudinary.com/... or /imgs/transportation/..."
                          value={draft.heroImageUrl || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, heroImageUrl: e.target.value }))}
                          className="h-9 text-xs font-mono"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowCustomUrlInput(false)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-3 rounded-xl cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "فئة المركبة *" : "Vehicle Category *"}</label>
                    <select
                      value={draft.vehicleCategory || "bus"}
                      onChange={(e) => setDraft((p) => ({ ...p, vehicleCategory: e.target.value as VehicleCategory }))}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                    >
                      <option value="bus">🚌 حافلة كبرى فاخرة (Luxury Tour Coach)</option>
                      <option value="coaster">🚐 كوستر وميني باص (Executive Coaster)</option>
                      <option value="private">🚗 سيارة خاصة VIP (Luxury Sedan & SUV)</option>
                      <option value="transfer">✈️ توصيل واستقبال VIP (Airport Transfer)</option>
                      <option value="luxury_van">🚐 فان سياحي VIP (Luxury Mercedes Van)</option>
                    </select>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "نوع الخدمة *" : "Service Type *"}</label>
                    <select
                      value={draft.serviceType || "AIRPORT"}
                      onChange={(e) => setDraft((p) => ({ ...p, serviceType: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                    >
                      <option value="AIRPORT">✈️ مطارات واستقبال (Airport Transfer)</option>
                      <option value="HOTEL">🏨 فنادق وتنقلات داخلية (Hotel Transfer)</option>
                      <option value="CITY_TO_CITY">🛣️ رحلات بين المدن والمحافظات (City to City)</option>
                      <option value="FULL_DAY">⏱️ استئجار يوم كامل مع سائق (Full Day Chauffeur)</option>
                      <option value="VIP_ESCORT">👑 مرافقة VIP خاصة (VIP Escort)</option>
                    </select>
                  </div>

                  {/* Model / Spec */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "طراز ومواصفات المركبة *" : "Vehicle Model & Specs *"}</label>
                    <Input
                      value={draft.vehicleType || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, vehicleType: e.target.value }))}
                      placeholder="e.g. Mercedes-Benz Travego VIP 50-Seater"
                      className="h-10 text-xs font-bold"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? "سعة المقاعد للركاب *" : "Passenger Capacity *"}</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={150}
                      value={draft.capacity || 50}
                      onChange={(e) => setDraft((p) => ({ ...p, capacity: Number(e.target.value) }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Doors */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                      <DoorClosed className="w-3.5 h-3.5 text-sky-500" />
                      <span>{isAr ? "عدد الأبواب *" : "Door Count *"}</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={draft.doors || 2}
                      onChange={(e) => setDraft((p) => ({ ...p, doors: Number(e.target.value) }))}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Transmission */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "نوع ناقل الحركة (Transmission)" : "Transmission"}</label>
                    <select
                      value={draft.transmission || "AUTO"}
                      onChange={(e) => setDraft((p) => ({ ...p, transmission: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold cursor-pointer"
                    >
                      <option value="AUTO">أوتوماتيك (Automatic)</option>
                      <option value="MANUAL">يدوي (Manual)</option>
                    </select>
                  </div>

                  {/* Base Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? "السعر الأساسي للرحلة ($ USD) *" : "Base Price ($ USD) *"}</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.basePriceUsd}
                      onChange={(e) => setDraft((p) => ({ ...p, basePriceUsd: Number(e.target.value) }))}
                      className="h-10 text-xs font-mono font-bold text-amber-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActiveToggle"
                      checked={draft.isActive}
                      onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                    />
                    <label htmlFor="isActiveToggle" className="text-xs font-extrabold text-foreground cursor-pointer">
                      {isAr ? "تفعيل المركبة في الكتالوج العام للموقع" : "Active on public catalog & search"}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPrivateToggle"
                      checked={draft.isPrivate}
                      onChange={(e) => setDraft((p) => ({ ...p, isPrivate: e.target.checked }))}
                      className="w-4 h-4 text-purple-500 rounded cursor-pointer"
                    />
                    <label htmlFor="isPrivateToggle" className="text-xs font-extrabold text-foreground cursor-pointer">
                      {isAr ? "خدمة خاصة وحصرية (Private Chauffeur)" : "Private exclusive chauffeur vehicle"}
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: 5 LANGUAGES LOCALIZATION */}
              <TabsContent value="translations" className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Globe2 className="w-4 h-4 shrink-0" />
                    <span>{isAr ? "دعم كامل للغات الخمس العالمية (الإنجليزية، العربية، الإسبانية، البرتغالية، الإيطالية)." : "Full 5-language editorial localization suite."}</span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSmartFillTranslations}
                    disabled={isTranslating}
                    className="h-8 text-xs font-bold gap-1.5 rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 cursor-pointer shrink-0 shadow-xs"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isAr ? "جاري الترجمة الذكية..." : "Translating..."}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{isAr ? "✨ ترجمة الحقول الشاغرة بالذكاء الاصطناعي" : "✨ AI Auto-Translate Missing"}</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Subtabs for 5 languages */}
                <div className="flex items-center gap-1.5 border-b pb-2 overflow-x-auto">
                  {(
                    [
                      { id: "en", label: "🇬🇧 English", nameKey: "nameEn" },
                      { id: "ar", label: "🇸🇦 العربية", nameKey: "nameAr" },
                      { id: "es", label: "🇪🇸 Español", nameKey: "nameEs" },
                      { id: "pt", label: "🇵🇹 Português", nameKey: "namePt" },
                      { id: "it", label: "🇮🇹 Italiano", nameKey: "nameIt" },
                    ] as const
                  ).map((lang) => {
                    const isActive = langSubTab === lang.id;
                    const hasName = Boolean(draft[lang.nameKey]);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLangSubTab(lang.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {hasName && <Check className={`w-3 h-3 ${isActive ? "text-slate-950" : "text-emerald-500"}`} />}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab Content */}
                <div className="space-y-4 pt-2">
                  {langSubTab === "en" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇬🇧 Vehicle Name (English) *</label>
                        <Input
                          value={draft.nameEn || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, nameEn: e.target.value }))}
                          placeholder="Luxury VIP Tour Bus Golden"
                          className="h-10 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇬🇧 Full Description & Overview (English)</label>
                        <Textarea
                          rows={4}
                          value={draft.descriptionEn || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, descriptionEn: e.target.value }))}
                          placeholder="50-seater luxury coach equipped with state-of-the-art entertainment, leather seats and professional multilingual chauffeur..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {langSubTab === "ar" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇸🇦 اسم المركبة (العربية) *</label>
                        <Input
                          value={draft.nameAr || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, nameAr: e.target.value }))}
                          placeholder="حافلة سياحية كبرى فاخرة VIP"
                          className="h-10 text-xs font-bold"
                          dir="rtl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇸🇦 الوصف الكامل للمركبة (العربية)</label>
                        <Textarea
                          rows={4}
                          value={draft.descriptionAr || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, descriptionAr: e.target.value }))}
                          placeholder="حافلة سياحية فاخرة 50 مقعداً مجهزة بأحدث وسائل الراحة والترفيه وشاشات العرض للرحلات الطويلة..."
                          className="text-xs leading-relaxed"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  )}

                  {langSubTab === "es" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇪🇸 Nombre del Vehículo (Español)</label>
                        <Input
                          value={draft.nameEs || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, nameEs: e.target.value }))}
                          placeholder="Autobús Turístico VIP Golden"
                          className="h-10 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇪🇸 Descripción (Español)</label>
                        <Textarea
                          rows={4}
                          value={draft.descriptionEs || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, descriptionEs: e.target.value }))}
                          placeholder="Autobús de lujo de 50 plazas equipado con entretenimiento de última generación..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {langSubTab === "pt" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇵🇹 Nome do Veículo (Português)</label>
                        <Input
                          value={draft.namePt || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, namePt: e.target.value }))}
                          placeholder="Ônibus Turístico VIP Golden"
                          className="h-10 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇵🇹 Descrição (Português)</label>
                        <Textarea
                          rows={4}
                          value={draft.descriptionPt || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, descriptionPt: e.target.value }))}
                          placeholder="Ônibus de luxo de 50 lugares equipado com entretenimento de última geração..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {langSubTab === "it" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇮🇹 Nome del Veicolo (Italiano)</label>
                        <Input
                          value={draft.nameIt || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, nameIt: e.target.value }))}
                          placeholder="Autobus Turistico VIP Golden"
                          className="h-10 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground">🇮🇹 Descrizione (Italiano)</label>
                        <Textarea
                          rows={4}
                          value={draft.descriptionIt || ""}
                          onChange={(e) => setDraft((p) => ({ ...p, descriptionIt: e.target.value }))}
                          placeholder="Autobus di lusso da 50 posti dotato di intrattenimento all'avanguardia..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 3: FEATURES & LUXURY AMENITIES */}
              <TabsContent value="features" className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/40 border text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <span>{isAr ? "انقر على وسائل الراحة لتفعيلها في بطاقة المركبة:" : "Click luxury amenities to toggle on vehicle profile:"}</span>
                  <Badge variant="outline" className="text-amber-500 font-bold border-amber-500/30">
                    {draft.features.length} {isAr ? "ميزات مختارة" : "Selected"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AVAILABLE_FEATURES.map((feat) => {
                    const isSelected = isFeatureSelected(feat.id, draft.features);

                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeature(feat.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs"
                            : "bg-card border-border text-muted-foreground hover:border-amber-500/50 hover:text-foreground"
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-500" : "text-muted-foreground"}`} />
                        <span className="truncate">{isAr ? feat.labelAr : feat.labelEn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto rtl:ml-0 rtl:mr-auto text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 4: INSTRUCTIONS & POLICIES */}
              <TabsContent value="instructions" className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "تعليمات نقطة الالتقاء والاستقبال (Pickup Instructions)" : "Pickup & Meeting Point Instructions"}</label>
                    <Textarea
                      rows={3}
                      value={draft.pickupInstructions || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, pickupInstructions: e.target.value }))}
                      placeholder={isAr ? "سيكون السائق بانتظارك حاملاً لافتة باسمك في صالة الوصول رقم 3..." : "Our chauffeur will wait for you holding a name board at Arrival Hall 3..."}
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-foreground">{isAr ? "تعليمات الوصول والتوصيل والأمتعة (Dropoff Instructions)" : "Dropoff & Luggage Guidelines"}</label>
                    <Textarea
                      rows={3}
                      value={draft.dropoffInstructions || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, dropoffInstructions: e.target.value }))}
                      placeholder={isAr ? "توصيل مباشر إلى مدخل الفندق مع مساعدة كاملة في نقل الحقائب والأمتعة..." : "Direct drop-off at hotel main lobby with full luggage assistance..."}
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Modal Footer Actions */}
          <DialogFooter className="p-4 bg-muted/40 border-t flex flex-row items-center justify-between">
            <div className="text-xs text-muted-foreground font-semibold">
              {draft.capacity} {isAr ? "مقاعد" : "seats"} · ${draft.basePriceUsd}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                disabled={saveMutation.isPending}
                className="h-10 text-xs font-semibold px-4 cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>

              <Button
                type="button"
                onClick={() => saveMutation.mutate(draft)}
                disabled={saveMutation.isPending}
                className="h-10 text-xs font-bold px-6 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingItem ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المركبة الآن" : "Create Vehicle")}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmItem)} onOpenChange={(o) => !o && setDeleteConfirmItem(null)}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border border-destructive/30 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <DialogTitle className="text-center text-lg font-black text-foreground">
              {isAr ? "تأكيد مسح المركبة نهائياً" : "Confirm Permanent Deletion"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف المركبة "${deleteConfirmItem?.name}" نهائياً من قاعدة البيانات؟`
                : `Are you sure you want to permanently delete vehicle "${deleteConfirmItem?.name}"?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row items-center justify-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmItem(null)}
              disabled={deleteMutation.isPending}
              className="text-xs font-bold rounded-xl flex-1 cursor-pointer"
            >
              {isAr ? "إلغاء التراجع" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteConfirmItem && deleteMutation.mutate(deleteConfirmItem.id)}
              disabled={deleteMutation.isPending}
              className="text-xs font-bold rounded-xl flex-1 gap-1.5 cursor-pointer bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isAr ? "نعم، مسح نهائي 🗑️" : "Yes, Delete 🗑️"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Media Library Picker Modal */}
      <MediaLibraryPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMediaFromPicker}
        selectedAssetId={draft.heroMediaId}
        selectedAssetUrl={draft.heroImageUrl}
        locale={locale}
        defaultCategory="fleet"
      />
    </div>
  );
}
