"use client";

import { useState } from "react";
import { 
  useTours, 
  useSoftDeleteTour, 
  useBulkUpdateTours,
  useTourStats
} from "../../hooks/useTours";
import { toursApi } from "../../api/toursApi";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns } from "./columns";
import { Tour, TourStatus } from "../../types";
import { TourDetailsDrawer } from "../Drawers/TourDetailsDrawer";
import { MoveTourDialog } from "../Drawers/MoveTourDialog";
import { BulkMoveToursDialog } from "../Drawers/BulkMoveToursDialog";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import type { TripModel } from "@/types/dunas-suite";
import { TourCardGrid } from "../TourCardGrid/TourCardGrid";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  CheckSquare, 
  Loader2, 
  Sparkles, 
  Compass, 
  Users, 
  Percent, 
  LayoutGrid, 
  Table as TableIcon,
  MapPin,
  Filter,
  X,
  RotateCcw,
  Globe,
  ArrowRightLeft,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import { useDataContext } from "@/context/DataContext";
import { useMemo } from "react";
import { extractToursList } from "@/lib/extract-tours";

function tourToTripModel(tour: Tour): TripModel {
  const arTitle = tour.titleJsonb?.ar || tour.titleJsonb?.en || tour.slug;
  const enTitle = tour.titleJsonb?.en || tour.slug;
  const esTitle = tour.titleJsonb?.es || enTitle;
  const ptTitle = tour.titleJsonb?.pt || enTitle;
  const itTitle = tour.titleJsonb?.it || enTitle;

  const arOverview = tour.overviewJsonb?.ar || tour.overviewJsonb?.en || '';
  const enOverview = tour.overviewJsonb?.en || arOverview;
  const esOverview = tour.overviewJsonb?.es || enOverview;
  const ptOverview = tour.overviewJsonb?.pt || enOverview;
  const itOverview = tour.overviewJsonb?.it || enOverview;

  const duration = tour.durationJsonb?.ar || tour.durationJsonb?.en || '4 Days / 3 Nights';
  const price = Number(tour.basePriceUsd || 650);

  const images = (tour.images && tour.images.length > 0)
    ? tour.images.map(img => img.imageUrl)
    : [tour.heroImage || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800'];

  const itinerary = (tour.itineraries && tour.itineraries.length > 0)
    ? tour.itineraries.map((itin, idx) => ({
        day: idx + 1,
        title: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || itin.dayLabel || `اليوم ${idx + 1}`,
        description: (itin.descriptionJsonb?.ar as string) || (itin.descriptionJsonb?.en as string) || '',
        meals: (itin.mealsJsonb?.ar as string) || (itin.mealsJsonb?.en as string) || 'الإفطار',
      }))
    : [{ day: 1, title: 'الوصول والتسكين', description: 'الوصول للمطار واستقبال في الفندق والتسكين.', meals: 'الإفطار' }];

  return {
    id: tour.id,
    slug: tour.slug,
    title: arTitle,
    subtitle: tour.subtitleJsonb?.ar || tour.subtitleJsonb?.en || '',
    destination: (tour.country?.toLowerCase() || 'egypt'),
    market: 'Global',
    language: 'ar',
    type: (tour.category || 'Classic') as any,
    duration,
    departures: 'Daily / Diário',
    price,
    hotelCategory: '5-Star Luxury',
    rating: 4.9,
    reviewCount: tour.reviewCount || 48,
    popular: !!tour.isFeatured,
    familyFriendly: true,
    honeymoon: false,
    luxury: true,
    cultural: true,
    adventure: false,
    overview: arOverview,
    highlights: (tour.highlightJsonb?.ar as string[]) || (tour.highlightJsonb?.en as string[]) || [''],
    included: (tour.includedServicesJsonb?.ar as string[]) || (tour.includedServicesJsonb?.en as string[]) || [''],
    excluded: (tour.excludedServicesJsonb?.ar as string[]) || (tour.excludedServicesJsonb?.en as string[]) || [''],
    images,
    hotels: '5-Star Luxury Hotels',
    accommodation: [{ destination: tour.city || 'Cairo', nights: 3, regime: 'Bed & Breakfast' }],
    itinerary,
    translations: {
      ar: { title: arTitle, overview: arOverview, highlights: (tour.highlightJsonb?.ar as string[]) || [''], included: (tour.includedServicesJsonb?.ar as string[]) || [''], excluded: (tour.excludedServicesJsonb?.ar as string[]) || [''] },
      en: { title: enTitle, overview: enOverview, highlights: (tour.highlightJsonb?.en as string[]) || [''], included: (tour.includedServicesJsonb?.en as string[]) || [''], excluded: (tour.excludedServicesJsonb?.en as string[]) || [''] },
      es: { title: esTitle, overview: esOverview, highlights: (tour.highlightJsonb?.es as string[]) || [''], included: (tour.includedServicesJsonb?.es as string[]) || [''], excluded: (tour.excludedServicesJsonb?.es as string[]) || [''] },
      pt: { title: ptTitle, overview: ptOverview, highlights: (tour.highlightJsonb?.pt as string[]) || [''], included: (tour.includedServicesJsonb?.pt as string[]) || [''], excluded: (tour.excludedServicesJsonb?.pt as string[]) || [''] },
      it: { title: itTitle, overview: itOverview, highlights: (tour.highlightJsonb?.it as string[]) || [''], included: (tour.includedServicesJsonb?.it as string[]) || [''], excluded: (tour.excludedServicesJsonb?.it as string[]) || [''] },
    },
  };
}

function tripModelToTour(trip: TripModel): Tour {
  return {
    id: trip.id,
    slug: trip.slug,
    titleJsonb: {
      ar: trip.translations?.ar?.title || trip.title,
      en: trip.translations?.en?.title || trip.title,
      pt: trip.translations?.pt?.title || trip.title,
      es: trip.title,
      it: trip.title,
    },
    overviewJsonb: {
      ar: trip.translations?.ar?.overview || trip.overview,
      en: trip.translations?.en?.overview || trip.overview,
      pt: trip.translations?.pt?.overview || trip.overview,
      es: trip.overview,
      it: trip.overview,
    },
    durationJsonb: { ar: trip.duration, en: trip.duration, pt: trip.duration },
    category: trip.destination || 'egypt',
    country: trip.destination || 'egypt',
    city: 'Cairo',
    basePriceUsd: String(trip.price || 450) as any,
    currency: 'USD',
    isActive: true,
    isFeatured: trip.popular || false,
    status: 'PUBLISHED',
    highlightJsonb: { ar: trip.translations?.ar?.highlights || trip.highlights, en: trip.translations?.en?.highlights || trip.highlights, pt: trip.highlights },
    includedServicesJsonb: { ar: trip.included, en: trip.included, pt: trip.included },
    excludedServicesJsonb: { ar: trip.excluded, en: trip.excluded, pt: trip.excluded },
    images: (trip.images || []).map((url, idx) => ({ id: `img-${idx}`, tourId: trip.id, imageUrl: url, sortOrder: idx, isHero: idx === 0 })),
    itineraries: (trip.itinerary || []).map((item, idx) => ({ id: `itin-${idx}`, tourId: trip.id, dayLabel: item.title, sortOrder: idx, descriptionJsonb: { ar: item.description, en: item.description, pt: item.description }, mealsJsonb: { ar: item.meals, en: item.meals, pt: item.meals } })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Tour;
}

function queryErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Tours could not be loaded from the backend.";
}

export function ToursTable() {
  const tTours = useTranslations("tours");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tDashboard = useTranslations("dashboard");
  const currentLocale = useLocale();
  const { trips: contextTrips } = useDataContext();

  // View mode state (cards/grid vs table)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters & Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 24 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [selectedMarket, setSelectedMarket] = useState<string>("ALL");

  const queryFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...(search ? { search } : {}),
    ...(activeTab !== "ALL" ? { status: activeTab } : {}),
    ...(selectedDestination !== "ALL" ? { destination: selectedDestination } : {}),
    ...(selectedMarket !== "ALL" ? { market: selectedMarket } : {}),
  };

  const hasActiveFilters = Boolean(
    search || 
    activeTab !== "ALL" || 
    selectedDestination !== "ALL" || 
    selectedMarket !== "ALL"
  );

  const resetFilters = () => {
    setSearch("");
    setActiveTab("ALL");
    setSelectedDestination("ALL");
    setSelectedMarket("ALL");
    setPagination({ pageIndex: 0, pageSize: 24 });
  };

  const { data, isLoading, error, refetch } = useTours(queryFilters);
  const { data: stats } = useTourStats();
  const deleteTour = useSoftDeleteTour();
  const bulkUpdate = useBulkUpdateTours();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isViewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedTripForModal, setSelectedTripForModal] = useState<TripModel | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tourToMove, setTourToMove] = useState<Tour | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [bulkMoveSlugs, setBulkMoveSlugs] = useState<string[]>([]);
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleView = (tour: Tour) => {
    setSelectedTour(tour);
    setViewDrawerOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setSelectedTripForModal(tourToTripModel(tour));
    setIsTripModalOpen(true);
  };

  const handleOpenAddTrip = () => {
    setSelectedTripForModal(null);
    setIsTripModalOpen(true);
  };

  const handleMove = (tour: Tour) => {
    setTourToMove(tour);
    setIsMoveDialogOpen(true);
  };

  const handleOpenBulkMove = (slugs: string[]) => {
    setBulkMoveSlugs(slugs);
    setIsBulkMoveOpen(true);
  };

  const handleDelete = async (tour: Tour) => {
    if (!window.confirm(`${tCommon("confirm")} ${tCommon("delete")} ${tour.slug}?`)) return;
    await deleteTour.mutateAsync(tour.slug);
    toast.success(tCommon("success"));
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await toursApi.exportToursCsv(queryFilters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tours_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success(tCommon("success"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns(handleView, handleEdit, handleMove, handleDelete, tTours, tCommon, currentLocale);

  const rawTours: Tour[] = useMemo(() => extractToursList(data), [data]);

  const toursList: Tour[] = useMemo(() => {
    const apiSlugs = new Set(rawTours.map((t) => t.slug.toLowerCase()));
    const missingContextTours = (contextTrips || [])
      .filter((ct) => !apiSlugs.has(ct.slug.toLowerCase()))
      .map(tripModelToTour);
    return [...rawTours, ...missingContextTours];
  }, [rawTours, contextTrips]);

  const totalCount: number = (data as any)?.meta?.total ?? toursList.length;
  const overallTotal: number | null = stats?.totalTours ?? null;

  // Custom Toolbar Actions for Bulk Management & Export
  const renderToolbarActions = (table: any) => {
    const selectedRows = table ? table.getFilteredSelectedRowModel().rows : [];
    const slugs = selectedRows.map((row: any) => row.original.slug);

    const handleBulkStatus = async (status: TourStatus) => {
      await bulkUpdate.mutateAsync({ slugs, status });
      if (table) table.toggleAllRowsSelected(false);
      toast.success(tCommon("success"));
    };

    const handleBulkFeatured = async (isFeatured: boolean) => {
      await bulkUpdate.mutateAsync({ slugs, isFeatured });
      if (table) table.toggleAllRowsSelected(false);
      toast.success(tCommon("success"));
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        {slugs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger type="button" className="h-8 shadow-sm inline-flex items-center justify-center rounded-md text-sm font-medium px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-1.5">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>{tCommon("actions")} ({slugs.length})</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleOpenBulkMove(slugs)} className="font-semibold text-primary focus:text-primary">
                <ArrowRightLeft className="h-4 w-4 mr-2 text-primary" />
                {currentLocale === "ar" ? "نقل الرحلات المحددة" : "Move Selected Tours"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{tCommon("status")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkStatus("PUBLISHED")}>
                {tStatus("PUBLISHED")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("DRAFT")}>
                {tStatus("DRAFT")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatus("ARCHIVED")} className="text-red-600">
                {tStatus("ARCHIVED")}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>{tCommon("options")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkFeatured(true)}>
                {tCommon("yes")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkFeatured(false)}>
                {tCommon("no")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* View Switcher Button Group */}
        <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-xs font-semibold"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {tCommon("grid")}
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-xs font-semibold"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-3.5 w-3.5" />
            {tCommon("table")}
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 shadow-sm flex items-center gap-1.5"
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>{tCommon("exportCsv")}</span>
        </Button>

        <Button
          onClick={handleOpenAddTrip}
          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 px-4 h-8 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-3" />
          <span>{currentLocale === "ar" ? "إضافة رحلة جديدة +" : "Create Tour +"}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tDashboard("totalTours")}</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-foreground">
              {hasActiveFilters ? totalCount : (overallTotal ?? "—")}
            </span>
            {hasActiveFilters && (
              <span className="text-xs text-muted-foreground font-medium">
                / {overallTotal ?? "—"} total
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {hasActiveFilters ? (
              <span className="font-semibold text-primary">
                {totalCount} matching filters ({totalCount} رحلة مطابقة)
              </span>
            ) : (
              <span className="font-semibold text-foreground">
                {(stats?.publishedTours ?? "—")} {tDashboard("publishedTours")}
              </span>
            )}
          </p>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tTours("title")}</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.featuredTours ?? "—"}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tDashboard("occupancyRate")}</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {stats?.occupancyRate === undefined || stats.occupancyRate === null ? "—" : `${stats.occupancyRate}%`}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tTours("draft")}</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {stats?.draftTours ?? "—"}
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </div>
      </div>

      {/* 🇪🇬 Egypt Interface Folders Banner - ONLY shown when Destination is Egypt */}
      {selectedDestination === "Egypt" && (
        <div className="bg-linear-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-600 rounded-xl shrink-0 text-2xl border border-amber-500/30">
              🇪🇬
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>{currentLocale === "ar" ? "واجهة مصر والبرامج المرتبطة" : "Egypt destination & related programs"}</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
                  {currentLocale === "ar" ? "مصدر بيانات حقيقي" : "Persisted data"}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentLocale === "ar"
                  ? "أدر المحتوى، ترتيب الرحلات، الظهور، والترجمات من واجهات الوجهات المحفوظة."
                  : "Manage content, tour order, visibility, and translations from persisted destination interfaces."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${currentLocale}/admin/destinations`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLocale === "ar" ? "فتح إدارة الوجهات" : "Open destination management"}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Advanced Filter & Toolbar Controls */}
      <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Left Controls: Search & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-55 sm:w-65">
              <Input 
                aria-label={tCommon("search")}
                placeholder={`${tCommon("search")} ${tTours("title")}...`} 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="h-9 pr-8 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Destination / Country Filter */}
            <Select value={selectedDestination} onValueChange={(val: any) => setSelectedDestination(val || "ALL")}>
              <SelectTrigger className="h-9 w-42.5 text-xs font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="Destination" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon("all")} Destinations</SelectItem>
                <SelectItem value="Egypt">Egypt (مصر)</SelectItem>
                <SelectItem value="Turkey">Turkey (تركيا)</SelectItem>
                <SelectItem value="Jordan">Jordan (الأردن)</SelectItem>
                <SelectItem value="Morocco">Morocco (المغرب)</SelectItem>
                <SelectItem value="Dubai">Dubai & UAE (دبي)</SelectItem>
                <SelectItem value="Tunisia">Tunisia (تونس)</SelectItem>
                <SelectItem value="Greece">Greece (اليونان)</SelectItem>
                <SelectItem value="Middle East">Multi-Country (مشترك)</SelectItem>
              </SelectContent>
            </Select>

            {/* Market / Category Filter */}
            <Select value={selectedMarket} onValueChange={(val: any) => setSelectedMarket(val || "ALL")}>
              <SelectTrigger className="h-9 w-37.5 text-xs font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="Market" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon("all")} Markets</SelectItem>
                <SelectItem value="Brasil">Brasil (PT)</SelectItem>
                <SelectItem value="España">España (ES)</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Multi-Country">Multi-Country</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Tabs */}
            <Tabs defaultValue="ALL" value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="w-auto">
              <TabsList className="h-9">
                <TabsTrigger value="ALL" className="text-xs h-7">{tCommon("all")}</TabsTrigger>
                <TabsTrigger value="PUBLISHED" className="text-xs h-7">{tStatus("PUBLISHED")}</TabsTrigger>
                <TabsTrigger value="DRAFT" className="text-xs h-7">{tStatus("DRAFT")}</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {/* Right Controls: View Switcher, Bulk, Export & Create */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            {renderToolbarActions(null)}
          </div>
        </div>

        {/* Results Counter & Active Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span className="font-semibold flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md">
              <Filter className="h-3.5 w-3.5" />
              <span>{isLoading ? "Loading..." : `${totalCount} ${totalCount === 1 ? "Tour" : "Tours"} Found (${totalCount} رحلة)`}</span>
            </span>
            {search && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Search: &quot;{search}&quot;
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSearch("")} />
              </Badge>
            )}
            {selectedDestination !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Destination: {selectedDestination}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSelectedDestination("ALL")} />
              </Badge>
            )}
            {selectedMarket !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Market: {selectedMarket}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSelectedMarket("ALL")} />
              </Badge>
            )}
            {activeTab !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Status: {tStatus(activeTab)}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setActiveTab("ALL")} />
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Showing {toursList.length} of {totalCount}
          </div>
        </div>
      </div>

      {/* Body View Rendering */}
      {error ? (
        <div data-testid="tours-load-error" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          <p className="font-semibold">Tours could not be loaded.</p>
          <p className="mt-1 text-destructive/90">{queryErrorMessage(error)}</p>
          <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-24" data-testid="table-skeleton-row">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "grid" ? (
        <TourCardGrid
          tours={toursList}
          onView={handleView}
          onEdit={handleEdit}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      ) : (
        <DataTable
          columns={columns}
          data={toursList}
          isLoading={isLoading}
          renderToolbarActions={renderToolbarActions}
          pageCount={data?.meta?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={true}
        />
      )}

      {/* Modals & Drawers Layer */}
      <TourDetailsDrawer
        tour={selectedTour}
        open={isViewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
      />

      {/* 6-Tab Trip & 5-Lang Editor Modal (Commit 8a9ab4f) */}
      <TripEditorModal
        trip={selectedTripForModal}
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setSelectedTripForModal(null);
        }}
      />

      <MoveTourDialog
        tour={tourToMove}
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
      />

      <BulkMoveToursDialog
        slugs={bulkMoveSlugs}
        open={isBulkMoveOpen}
        onOpenChange={setIsBulkMoveOpen}
      />

    </div>
  );
}
