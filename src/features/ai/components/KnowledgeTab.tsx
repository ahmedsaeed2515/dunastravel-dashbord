"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Languages, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  FileText, 
  Plus, 
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  Car,
  MapPin,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Eye,
  Sliders,
  RotateCcw,
  Sparkle,
  MoreVertical,
  SlidersHorizontal,
  History,
  Send,
  AlertTriangle,
  FileCheck2,
  Globe2,
  Zap,
  Lock,
  Flame,
  Clock,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { 
  CanonicalKnowledgeEntity, 
  KnowledgeProblemsSummary, 
  AiKnowledgeVersionItem,
  aiApi 
} from "../api/aiApi";

interface KnowledgeTabProps {
  t: any;
  isAr: boolean;
}

const SUPPORTED_LOCALES = [
  { code: "ar", label: "العربية (AR)", flag: "🇪🇬" },
  { code: "en", label: "English (EN)", flag: "🇬🇧" },
  { code: "es", label: "Español (ES)", flag: "🇪🇸" },
  { code: "pt", label: "Português (PT)", flag: "🇧🇷" },
  { code: "it", label: "Italiano (IT)", flag: "🇮🇹" },
];

export function KnowledgeTab({ t, isAr }: KnowledgeTabProps) {
  const [entities, setEntities] = useState<CanonicalKnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAiStatus, setSelectedAiStatus] = useState("ALL");
  const [selectedSyncStatus, setSelectedSyncStatus] = useState("ALL");
  const [selectedSourceType, setSelectedSourceType] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Problem Center
  const [problems, setProblems] = useState<KnowledgeProblemsSummary | null>(null);
  const [showProblemsBanner, setShowProblemsBanner] = useState(true);

  // Syncing
  const [syncingAll, setSyncingAll] = useState(false);

  // Drawer / Modal State
  const [activeDrawerEntity, setActiveDrawerEntity] = useState<CanonicalKnowledgeEntity | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"content" | "override" | "history" | "test">("content");
  const [selectedDrawerLocale, setSelectedDrawerLocale] = useState("ar");

  // Override Form Inside Drawer
  const [overrideInstructions, setOverrideInstructions] = useState("");
  const [overrideValidityStart, setOverrideValidityStart] = useState("");
  const [overrideValidityEnd, setOverrideValidityEnd] = useState("");
  const [isRecAllowed, setIsRecAllowed] = useState(true);
  const [savingOverride, setSavingOverride] = useState(false);

  // Manual Edit Inside Drawer
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editStatus, setEditStatus] = useState<"PUBLISHED" | "DRAFT" | "ARCHIVED">("PUBLISHED");
  const [savingContent, setSavingContent] = useState(false);

  // Version History Inside Drawer
  const [versions, setVersions] = useState<AiKnowledgeVersionItem[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Drawer Test Query
  const [drawerTestQuery, setDrawerTestQuery] = useState("");
  const [drawerTestResult, setDrawerTestResult] = useState<any>(null);
  const [drawerTesting, setDrawerTesting] = useState(false);

  // Top Source Cards
  const SOURCE_CARDS = [
    { id: "ALL", title: isAr ? "الكل" : "All", icon: "📚", count: "375", countEn: "375 Items" },
    { id: "CUSTOM_TOURS", title: isAr ? "الرحلات السياحية" : "Tours", icon: "🚢", count: "60 رحلة", countEn: "60 Tours" },
    { id: "HOTELS", title: isAr ? "الفنادق الفاخرة" : "Hotels", icon: "🏨", count: "24 فندق", countEn: "24 Hotels" },
    { id: "TRANSPORTATION", title: isAr ? "النقل والليموزين" : "Transfers", icon: "🚗", count: "12 خدمة", countEn: "12 Services" },
    { id: "DESTINATION_INFO", title: isAr ? "الوجهات والمعالم" : "Destinations", icon: "🏛️", count: "18 وجهة", countEn: "18 Destinations" },
    { id: "POLICIES", title: isAr ? "السياسات والأسئلة" : "Policies & FAQ", icon: "📋", count: "35 مقال", countEn: "35 Policies" },
  ];

  const fetchCanonicalEntities = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getCanonicalEntities({
        page,
        limit: 15,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        aiStatus: selectedAiStatus !== "ALL" ? selectedAiStatus : undefined,
        syncStatus: selectedSyncStatus !== "ALL" ? selectedSyncStatus : undefined,
        sourceType: selectedSourceType !== "ALL" ? selectedSourceType : undefined,
        search: search.trim() || undefined,
      });

      setEntities(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load knowledge items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const prob = await aiApi.getKnowledgeProblems();
      setProblems(prob);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchCanonicalEntities();
  }, [page, selectedCategory, selectedAiStatus, selectedSyncStatus, selectedSourceType]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await aiApi.syncCatalogKnowledge();
      toast.success(
        isAr
          ? `✓ تمت مزامنة الكتالوج بنجاح (${res.syncedTours} رحلة، ${res.syncedDestinations} وجهة)!`
          : `✓ Catalog synchronized (${res.syncedTours} tours, ${res.syncedDestinations} destinations)!`
      );
      fetchCanonicalEntities();
      fetchProblems();
    } catch (err: any) {
      toast.error(err?.message || "Sync failed.");
    } finally {
      setSyncingAll(false);
    }
  };

  // 1-Click AI Activation Toggle
  const handleToggleCanonicalAi = async (entity: CanonicalKnowledgeEntity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newExcludedState = !entity.isExcludedFromAi;

    // Optimistic UI
    setEntities((prev) =>
      prev.map((item) =>
        item.canonicalEntityId === entity.canonicalEntityId
          ? { ...item, isExcludedFromAi: newExcludedState }
          : item
      )
    );

    try {
      await aiApi.toggleCanonicalAi(entity.canonicalEntityId, newExcludedState);
      toast.success(
        newExcludedState
          ? isAr ? "تم استبعاد العنصر من ردود GuideR." : "Item excluded from GuideR."
          : isAr ? "تم تفعيل استخدام العنصر لـ GuideR بنجاح ✓" : "Enabled for GuideR ✓"
      );
    } catch (err: any) {
      toast.error(err?.message || "Toggle failed.");
      fetchCanonicalEntities();
    }
  };

  // Open Detail Drawer
  const handleOpenDrawer = (entity: CanonicalKnowledgeEntity, tab: "content" | "override" | "history" | "test" = "content") => {
    setActiveDrawerEntity(entity);
    setActiveDrawerTab(tab);
    setSelectedDrawerLocale("ar");

    // Populate Override fields
    setOverrideInstructions(entity.aiOverrideInstructions || "");
    setIsRecAllowed(entity.isRecommendationAllowed ?? true);
    setOverrideValidityStart(entity.validityStart ? entity.validityStart.slice(0, 10) : "");
    setOverrideValidityEnd(entity.validityEnd ? entity.validityEnd.slice(0, 10) : "");

    // Populate Content fields for active locale
    const locItem = entity.locales["ar"] || Object.values(entity.locales)[0];
    if (locItem) {
      setEditTitle(locItem.title || entity.title);
      setEditContent(locItem.content || "");
      setEditStatus((locItem.status as any) || "PUBLISHED");
    } else {
      setEditTitle(entity.title);
      setEditContent("");
      setEditStatus("PUBLISHED");
    }

    setDrawerTestQuery(`ما هي تفاصيل ${entity.title}؟`);
    setDrawerTestResult(null);

    // Fetch versions if history tab
    if (locItem) {
      fetchVersions(locItem.id);
    }
  };

  const handleDrawerLocaleChange = (loc: string) => {
    setSelectedDrawerLocale(loc);
    if (!activeDrawerEntity) return;

    const locItem = activeDrawerEntity.locales[loc];
    if (locItem) {
      setEditTitle(locItem.title);
      setEditContent(locItem.content);
      setEditStatus((locItem.status as any) || "PUBLISHED");
      fetchVersions(locItem.id);
    } else {
      setEditTitle("");
      setEditContent("");
      setEditStatus("DRAFT");
      setVersions([]);
    }
  };

  const fetchVersions = async (id: string) => {
    setLoadingVersions(true);
    try {
      const vers = await aiApi.getKnowledgeVersions(id);
      setVersions(vers || []);
    } catch {
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Save AI Override Layer
  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrawerEntity) return;

    setSavingOverride(true);
    try {
      await aiApi.updateCanonicalOverride(activeDrawerEntity.canonicalEntityId, {
        aiOverrideInstructions: overrideInstructions.trim(),
        isRecommendationAllowed: isRecAllowed,
        validityStart: overrideValidityStart || undefined,
        validityEnd: overrideValidityEnd || undefined,
      });

      toast.success(isAr ? "✓ تم حفظ تخصيص GuideR بنجاح!" : "✓ GuideR customization saved!");
      fetchCanonicalEntities();
      setActiveDrawerEntity({
        ...activeDrawerEntity,
        aiOverrideInstructions: overrideInstructions.trim() || null,
        isRecommendationAllowed: isRecAllowed,
        isManuallyOverridden: Boolean(overrideInstructions.trim()),
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save override.");
    } finally {
      setSavingOverride(false);
    }
  };

  // Clear AI Override Layer
  const handleClearOverride = async () => {
    if (!activeDrawerEntity) return;
    if (!confirm(isAr ? "هل أنت متأكد من مسح تخصيص GuideR والعودة للبيانات الأصلية؟" : "Clear GuideR customization?")) return;

    try {
      await aiApi.clearCanonicalOverride(activeDrawerEntity.canonicalEntityId);
      toast.success(isAr ? "تمت إزالة التخصيص والعودة للمعلومات الأصلية." : "Customization cleared.");
      setOverrideInstructions("");
      fetchCanonicalEntities();
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear override.");
    }
  };

  // Save Manual Content (for manually-managed policies/FAQs)
  const handleSaveManualContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrawerEntity) return;

    const locItem = activeDrawerEntity.locales[selectedDrawerLocale];
    setSavingContent(true);

    try {
      if (locItem) {
        await aiApi.updateKnowledge(locItem.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
          status: editStatus,
        });
      } else {
        await aiApi.createKnowledge({
          title: editTitle.trim(),
          content: editContent.trim(),
          locale: selectedDrawerLocale,
          category: activeDrawerEntity.category,
          status: editStatus,
          sourceEntityType: activeDrawerEntity.sourceEntityType !== "MANUAL" ? activeDrawerEntity.sourceEntityType : undefined,
          sourceEntityId: activeDrawerEntity.sourceEntityId,
        });
      }

      toast.success(isAr ? "✓ تم حفظ وتحديث المحتوى!" : "✓ Content saved!");
      fetchCanonicalEntities();
      if (locItem) fetchVersions(locItem.id);

      setActiveDrawerEntity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: selectedDrawerLocale === "en" || selectedDrawerLocale === "ar" ? editTitle.trim() : prev.title,
          locales: {
            ...prev.locales,
            [selectedDrawerLocale]: {
              ...(prev.locales[selectedDrawerLocale] || {}),
              id: locItem?.id || prev.locales[selectedDrawerLocale]?.id || "saved-item",
              title: editTitle.trim(),
              content: editContent.trim(),
              status: editStatus,
              locale: selectedDrawerLocale,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save content.");
    } finally {
      setSavingContent(false);
    }
  };

  // Restore Version Snapshot
  const handleRestoreVersion = async (versionId: string) => {
    const locItem = activeDrawerEntity?.locales[selectedDrawerLocale];
    if (!locItem) return;

    if (!confirm(isAr ? "هل أنت متأكد من استعادة هذه النسخة السابقة؟" : "Restore this historical version?")) return;

    try {
      await aiApi.restoreKnowledgeVersion(locItem.id, versionId);
      toast.success(isAr ? "✓ تمت استعادة النسخة بنجاح!" : "✓ Version restored!");
      fetchCanonicalEntities();
      fetchVersions(locItem.id);
    } catch (err: any) {
      toast.error(err?.message || "Restore failed.");
    }
  };

  // Test Query with GuideR in Drawer
  const handleRunDrawerTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerTestQuery.trim()) return;

    setDrawerTesting(true);
    setDrawerTestResult(null);

    try {
      const res = await aiApi.testRetrieval({
        query: drawerTestQuery.trim(),
        locale: selectedDrawerLocale,
        limit: 4,
      });

      setDrawerTestResult(res);
      toast.success(isAr ? "✓ تم فحص الاسترجاع والتأصيل!" : "✓ Retrieval verified!");
    } catch (err: any) {
      toast.error(err?.message || "Test failed.");
    } finally {
      setDrawerTesting(false);
    }
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === entities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entities.map((e) => e.canonicalEntityId));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExecuteBulk = async (action: "ENABLE_AI" | "DISABLE_AI" | "ARCHIVE") => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);

    try {
      // Gather all underlying localized IDs for selected canonical entities
      const directIds: string[] = [];
      entities
        .filter((e) => selectedIds.includes(e.canonicalEntityId))
        .forEach((e) => {
          Object.values(e.locales).forEach((l) => directIds.push(l.id));
        });

      await aiApi.executeBulkAction(action, directIds);
      toast.success(isAr ? `✓ تم تنفيذ الإجراء على ${selectedIds.length} كياناً بنجاح!` : `✓ Bulk action applied!`);
      setSelectedIds([]);
      fetchCanonicalEntities();
    } catch (err: any) {
      toast.error(err?.message || "Bulk action failed.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              {isAr ? "معرفة GuideR (Guider Knowledge Center)" : "Guider Knowledge Center"}
            </h2>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              ✓ {isAr ? "محدثة ومؤصلة" : "Synchronized"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            {isAr
              ? "التحكم الكامل في المعلومات والرحلات والسياسات التي يعتمد عليها GuideR مع حماية كاملة لبيانات الكتالوج وقواعد الإسناد."
              : "Direct governance over what GuideR knows, custom sales overrides, and automated catalog synchronization."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncingAll ? "animate-spin" : ""}`} />
            {syncingAll ? (isAr ? "جاري تحديث المعرفة..." : "Syncing...") : (isAr ? "تحديث معلومات GuideR" : "Sync All Catalogs")}
          </Button>
        </div>
      </div>

      {/* ── 2. TOP SOURCE CARDS (CLICKABLE CATEGORY FILTERS) ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SOURCE_CARDS.map((card) => {
          const isSelected = selectedCategory === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setSelectedCategory(card.id);
                setPage(1);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-xs"
                  : "border-border/80 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl">{card.icon}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-500" />}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">{card.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{isAr ? card.count : card.countEn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 3. ACTIONABLE PROBLEM CENTER BANNER ─────────────────────────── */}
      {problems && problems.totalIssues > 0 && showProblemsBanner && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                ⚠️
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {isAr
                    ? `تنبيهات المعرفة: يوجد ${problems.totalIssues} عنصر بحاجة إلى مراجعة وتحديث`
                    : `Actionable Knowledge Alerts: ${problems.totalIssues} items need attention`}
                </h4>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
                  {isAr
                    ? `${problems.missingTranslationCount} رحلة تنقصها ترجمات • ${problems.expiredOverrideCount} تخصيص منتهي الصلاحية • ${problems.failedSyncCount} خطأ مزامنة`
                    : `${problems.missingTranslationCount} missing translations • ${problems.expiredOverrideCount} expired overrides`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedSyncStatus("FAILED");
                  setPage(1);
                }}
                className="h-7 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
              >
                {isAr ? "عرض العناصر" : "Review Issues"}
              </Button>
              <button
                type="button"
                onClick={() => setShowProblemsBanner(false)}
                className="text-amber-600 hover:text-amber-800 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. SEARCH & HUMAN FILTERS BAR ───────────────────────────────── */}
      <Card className="border-border/60 bg-card shadow-xs rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={isAr ? "ابحث بالاسم أو الرحلة أو السياسة..." : "Search tours, hotels, policies..."}
              className="ps-9 h-9 text-xs bg-background"
            />
          </div>

          {/* AI Status Filter */}
          <select
            value={selectedAiStatus}
            onChange={(e) => {
              setSelectedAiStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground shrink-0"
          >
            <option value="ALL">{isAr ? "كل حالات GuideR" : "All AI Status"}</option>
            <option value="ENABLED">{isAr ? "● يستخدمها GuideR" : "Enabled for GuideR"}</option>
            <option value="DISABLED">{isAr ? "○ مستبعدة من GuideR" : "Excluded from GuideR"}</option>
          </select>

          {/* Source Type Filter */}
          <select
            value={selectedSourceType}
            onChange={(e) => {
              setSelectedSourceType(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground shrink-0"
          >
            <option value="ALL">{isAr ? "كل المصادر" : "All Sources"}</option>
            <option value="SOURCE_MANAGED">{isAr ? "قاعدة البيانات (رحلات وفنادق)" : "Source Database (Tours/Hotels)"}</option>
            <option value="MANUALLY_MANAGED">{isAr ? "معلومات يدوية (سياسات ومستندات)" : "Manual Documents (Policies/FAQ)"}</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-9 text-xs font-bold gap-1.5 cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showAdvancedFilters ? (isAr ? "إخفاء الفلاتر" : "Less") : (isAr ? "مزيد من الفلاتر" : "More Filters")}</span>
          </Button>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                {isAr ? "حالة المزامنة (Sync State)" : "Sync Status"}
              </label>
              <select
                value={selectedSyncStatus}
                onChange={(e) => {
                  setSelectedSyncStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs"
              >
                <option value="ALL">{isAr ? "الكل" : "All"}</option>
                <option value="SYNCED">{isAr ? "✓ متزامنة ومحدثة" : "Synced"}</option>
                <option value="OUTDATED">{isAr ? "⚠ يوجد تحديث متاح" : "Update Available"}</option>
                <option value="FAILED">{isAr ? "❌ فشلت المزامنة" : "Failed"}</option>
                <option value="SOURCE_DELETED">{isAr ? "🗑 تم حذف المصدر" : "Source Deleted"}</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                {isAr ? "التخصيص اليدوي" : "Manual Override"}
              </label>
              <span className="text-[11px] text-muted-foreground block pt-1.5">
                {isAr ? "يتم فرز وتحديد التخصيصات النشطة تلقائياً" : "Active AI Overrides highlighted in table"}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* ── 5. BULK ACTION TOOLBAR (VISIBLE WHEN ROWS SELECTED) ─────────── */}
      {selectedIds.length > 0 && (
        <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-3.5 flex items-center justify-between gap-3 animate-in fade-in text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="px-2 py-0.5 rounded bg-blue-500 text-white text-[11px] font-mono">
              {selectedIds.length}
            </span>
            <span>{isAr ? "عناصر محددة" : "Items selected"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleExecuteBulk("ENABLE_AI")}
              disabled={bulkActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
            >
              {isAr ? "تفعيل لـ GuideR" : "Enable for GuideR"}
            </Button>

            <Button
              size="sm"
              onClick={() => handleExecuteBulk("DISABLE_AI")}
              disabled={bulkActionLoading}
              className="bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs h-8 cursor-pointer shadow-2xs"
            >
              {isAr ? "استبعاد من GuideR" : "Exclude from GuideR"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExecuteBulk("ARCHIVE")}
              disabled={bulkActionLoading}
              className="text-rose-600 border-rose-500/40 hover:bg-rose-500/10 font-bold text-xs h-8 cursor-pointer"
            >
              {isAr ? "أرشفة" : "Archive"}
            </Button>
          </div>
        </div>
      )}

      {/* ── 6. CANONICAL ENTITY TABLE ──────────────────────────────────── */}
      <Card className="border-border/60 bg-card shadow-xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === entities.length && entities.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-3">{isAr ? "اسم العنصر والكيان" : "Entity Name"}</th>
                <th className="px-4 py-3">{isAr ? "نوع المصدر" : "Source Type"}</th>
                <th className="px-4 py-3">{isAr ? "اللغات المكتملة" : "5 Languages"}</th>
                <th className="px-4 py-3">{isAr ? "حالة GuideR" : "AI Status"}</th>
                <th className="px-4 py-3">{isAr ? "حالة المزامنة" : "Sync State"}</th>
                <th className="px-4 py-3 text-right">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>{isAr ? "جاري تحميل قاعدة معرفة GuideR..." : "Loading knowledge base..."}</span>
                  </td>
                </tr>
              ) : entities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-bold">{isAr ? "لم يتم العثور على عناصر مطابقة للبحث." : "No knowledge entities found."}</p>
                  </td>
                </tr>
              ) : (
                entities.map((entity) => {
                  const isSelected = selectedIds.includes(entity.canonicalEntityId);
                  const isSourceManaged = entity.sourceType === "SOURCE_MANAGED";
                  const isAiActive = !entity.isExcludedFromAi;

                  return (
                    <tr
                      key={entity.canonicalEntityId}
                      onClick={() => handleOpenDrawer(entity)}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-500/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3" onClick={(e) => handleToggleSelectOne(entity.canonicalEntityId, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-border cursor-pointer"
                        />
                      </td>

                      {/* Name & Title */}
                      <td className="px-4 py-3">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground truncate">{entity.title}</span>
                            {entity.isManuallyOverridden && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                {isAr ? "تخصيص GuideR" : "AI Override"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            ID: {entity.sourceEntityType}:{entity.sourceEntityId?.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Source Type */}
                      <td className="px-4 py-3">
                        {isSourceManaged ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {entity.sourceEntityType === "TOUR" ? (isAr ? "رحلة كتالوج" : "Tour DB") : isAr ? "قاعدة البيانات" : "Database"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {isAr ? "مستند يدوي" : "Manual Doc"}
                          </span>
                        )}
                      </td>

                      {/* 5-Language Completeness */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {entity.languages.map((l) => (
                            <span
                              key={l.locale}
                              title={`${l.locale.toUpperCase()}: ${l.isComplete ? "Complete" : "Missing"}`}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                l.isComplete
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground/50 border border-border line-through"
                              }`}
                            >
                              {l.locale}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* AI Status Toggle */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleCanonicalAi(entity, e)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isAiActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25"
                              : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isAiActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                          <span>{isAiActive ? (isAr ? "يستخدمها GuideR" : "Enabled") : (isAr ? "مستبعدة" : "Excluded")}</span>
                        </button>
                      </td>

                      {/* Sync State */}
                      <td className="px-4 py-3">
                        {entity.syncStatus === "SYNCED" ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {isAr ? "محدثة" : "Synced"}
                          </span>
                        ) : entity.syncStatus === "FAILED" ? (
                          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {isAr ? "فشل التحديث" : "Failed"}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entity.syncStatus}
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDrawer(entity, "override")}
                            title={isAr ? "تخصيص لـ GuideR" : "Customize GuideR Override"}
                            className="h-8 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer gap-1"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{isAr ? "تخصيص" : "Override"}</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleOpenDrawer(entity, "content")}
                            className="h-8 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer shadow-2xs gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>{isAr ? "عرض" : "View"}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-mono">
            {isAr ? `إجمالي الكيانات: ${totalCount}` : `Total entities: ${totalCount}`} (Page {page} of {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 text-xs font-bold cursor-pointer"
            >
              {isAr ? "السابق" : "Previous"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 text-xs font-bold cursor-pointer"
            >
              {isAr ? "التالي" : "Next"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 7. POLISHED KNOWLEDGE DETAIL DRAWER ─────────────────────────── */}
      {activeDrawerEntity && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-end animate-in fade-in">
          <div className="bg-card border-s border-border w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-border/60 bg-muted/20 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{activeDrawerEntity.title}</h3>
                    {activeDrawerEntity.sourceType === "SOURCE_MANAGED" ? (
                      <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 font-bold text-[10px]">
                        {isAr ? "مستمد من الكتالوج" : "Source Managed"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-600 font-bold text-[10px]">
                        {isAr ? "مستند يدوي" : "Manual Document"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Canonical ID: {activeDrawerEntity.canonicalEntityId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleCanonicalAi(activeDrawerEntity, e)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !activeDrawerEntity.isExcludedFromAi
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/40"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    <span>{!activeDrawerEntity.isExcludedFromAi ? (isAr ? "● متاح لـ GuideR" : "Enabled") : (isAr ? "○ مستبعد" : "Excluded")}</span>
                  </button>

                  <button
                    onClick={() => setActiveDrawerEntity(null)}
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs Inside Drawer */}
              <div className="flex items-center gap-1 border-b border-border/40 pt-1">
                {[
                  { id: "content", label: isAr ? "المحتوى واللغات" : "Content & Languages", icon: "🌐" },
                  { id: "override", label: isAr ? "تخصيص GuideR" : "GuideR Customization", icon: "✨" },
                  { id: "history", label: isAr ? "تاريخ التعديلات" : "Version History", icon: "📜" },
                  { id: "test", label: isAr ? "اختبار مع GuideR" : "Test Query", icon: "💬" },
                ].map((tTab) => (
                  <button
                    key={tTab.id}
                    type="button"
                    onClick={() => setActiveDrawerTab(tTab.id as any)}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeDrawerTab === tTab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{tTab.icon}</span>
                    <span>{tTab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: CONTENT & MULTI-LINGUAL */}
              {activeDrawerTab === "content" && (
                <div className="space-y-4 text-xs">
                  {/* Language Selector Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SUPPORTED_LOCALES.map((loc) => {
                      const hasLoc = Boolean(activeDrawerEntity.locales[loc.code]);
                      const isSel = selectedDrawerLocale === loc.code;
                      return (
                        <button
                          key={loc.code}
                          type="button"
                          onClick={() => handleDrawerLocaleChange(loc.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSel
                              ? "bg-blue-600 text-white shadow-xs"
                              : hasLoc
                              ? "bg-muted/60 border border-border text-foreground hover:bg-muted"
                              : "bg-muted/30 border border-border/50 text-muted-foreground/60"
                          }`}
                        >
                          <span>{loc.flag}</span>
                          <span>{loc.label}</span>
                          {hasLoc && <Check className="h-3 w-3 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Informative Header / Notice */}
                  {activeDrawerEntity.sourceType === "SOURCE_MANAGED" && (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                          {isAr ? "تعديل محتوى وتفاصيل المعلومة" : "Edit Content & Knowledge Details"}
                        </span>
                        {activeDrawerEntity.sourceEntityType === "TOUR" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/tours`, "_blank")}
                            className="h-6 text-[10px] font-bold gap-1 cursor-pointer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {isAr ? "معاينة في الكتالوج" : "View in Catalog"}
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isAr
                          ? "يمكنك تعديل العنوان والمحتوى وحفظهما مباشرة. سيتم تحديث معرفة الذكاء الاصطناعي بهذه التعديلات فوراً لهذه اللغة."
                          : "You can edit the title and content and save them directly. AI knowledge will be updated immediately for this language."}
                      </p>
                    </div>
                  )}

                  {/* Form for editing content */}
                  <form onSubmit={handleSaveManualContent} className="space-y-3.5">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                        {isAr ? "العنوان" : "Title"}
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder={isAr ? "اكتب عنوان المعلومة..." : "Enter title..."}
                        className="h-9 text-xs font-bold bg-background"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                        {isAr ? "النص الكامل للمعلومة" : "Content Text"}
                      </label>
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder={isAr ? "اكتب النص الكامل للمعلومة هنا..." : "Enter content text here..."}
                        rows={10}
                        className="text-xs leading-relaxed bg-background"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold cursor-pointer"
                      >
                        <option value="PUBLISHED">{isAr ? "منشور (Published)" : "Published"}</option>
                        <option value="DRAFT">{isAr ? "مسودة (Draft)" : "Draft"}</option>
                        <option value="ARCHIVED">{isAr ? "مؤرشف (Archived)" : "Archived"}</option>
                      </select>

                      <Button
                        type="submit"
                        disabled={savingContent}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingContent ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التعديلات" : "Save Content")}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: GUIDER AI OVERRIDE LAYER */}
              {activeDrawerTab === "override" && (
                <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1.5">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {isAr ? "تخصيص GuideR (AI Knowledge Override)" : "GuideR Customization Layer"}
                    </h4>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
                      {isAr
                        ? "هذا التخصيص يوجه GuideR أثناء الرد على المسافرين (مثل: التركيز على ميزة معينة أو التوصية للأزواج) دون المساس ببيانات الرحلة في الموقع إطلاقاً."
                        : "Customizes how GuideR pitches this item to travelers without altering canonical website data."}
                    </p>
                  </div>

                  <div>
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      {isAr ? "تعليمات خاصة لـ GuideR حول هذا العنصر:" : "Special GuideR Instructions:"}
                    </label>
                    <Textarea
                      value={overrideInstructions}
                      onChange={(e) => setOverrideInstructions(e.target.value)}
                      placeholder={isAr ? "مثال: ركز على الخصوصية والدهبيات النيلية الفاخرة عند اقتراح هذه الرحلة للأزواج أو رحلات شهر العسل." : "e.g. Highlight sunset sailing and privacy for honeymooners."}
                      rows={4}
                      className="text-xs leading-relaxed bg-background"
                    />
                  </div>

                  {/* Validity Window */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                        {isAr ? "ساري من تاريخ (اختياري)" : "Valid From (Optional)"}
                      </label>
                      <Input
                        type="date"
                        value={overrideValidityStart}
                        onChange={(e) => setOverrideValidityStart(e.target.value)}
                        className="h-9 text-xs bg-background"
                      />
                    </div>
                    <div>
                      <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                        {isAr ? "ينتهي في تاريخ (اختياري)" : "Valid Until (Optional)"}
                      </label>
                      <Input
                        type="date"
                        value={overrideValidityEnd}
                        onChange={(e) => setOverrideValidityEnd(e.target.value)}
                        className="h-9 text-xs bg-background"
                      />
                    </div>
                  </div>

                  {/* Recommendation Policy */}
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block">
                      {isAr ? "سياسة التوصية التلقائية:" : "Recommendation Policy:"}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="recPolicy"
                          checked={isRecAllowed}
                          onChange={() => setIsRecAllowed(true)}
                        />
                        <span>{isAr ? "السماح بالتوصية الاستباقية" : "Proactive Recommendation Allowed"}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="recPolicy"
                          checked={!isRecAllowed}
                          onChange={() => setIsRecAllowed(false)}
                        />
                        <span>{isAr ? "الرد فقط عند سؤال المسافر مباشرة" : "Answer on direct question only"}</span>
                      </label>
                    </div>
                  </div>

                  {/* Live AI Context Preview */}
                  <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      {isAr ? "معاينة: كيف سيرى GuideR هذا الكيان؟" : "Preview: What GuideR will see"}
                    </span>
                    <div className="p-3 rounded-lg bg-muted/50 font-mono text-[11px] text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">CANONICAL DATA: {activeDrawerEntity.title}</p>
                      {overrideInstructions && (
                        <p className="text-amber-600 dark:text-amber-400">
                          + [GUIDER SPECIAL INSTRUCTION]: {overrideInstructions}
                        </p>
                      )}
                      {!isRecAllowed && (
                        <p className="text-rose-500">
                          + [DIRECT QUESTIONS ONLY - DO NOT PROACTIVELY RECOMMEND]
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    {activeDrawerEntity.aiOverrideInstructions ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearOverride}
                        className="h-9 text-xs font-bold text-rose-600 border-rose-500/40 hover:bg-rose-500/10 cursor-pointer"
                      >
                        {isAr ? "مسح التخصيص والعودة للأصل" : "Clear Override"}
                      </Button>
                    ) : <div />}

                    <Button
                      type="submit"
                      disabled={savingOverride}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-sm"
                    >
                      {savingOverride ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ تخصيص GuideR" : "Save Customization")}
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 3: VERSION HISTORY */}
              {activeDrawerTab === "history" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{isAr ? "سجل التعديلات والإصدارات" : "Audit Version Snapshots"}</span>
                  </div>

                  {loadingVersions ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto text-blue-500 mb-1" />
                      <span>{isAr ? "جاري تحميل السجل..." : "Loading versions..."}</span>
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                      {isAr ? "لا توجد تعديلات سابقة مسجلة." : "No version history recorded."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((ver) => (
                        <div
                          key={ver.id}
                          className="p-3 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">الإصدار #{ver.versionNumber}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {new Date(ver.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{ver.changeSummary || "تعديل محتوى"}</p>
                            <span className="text-[10px] text-blue-500 font-mono">بواسطة: {ver.changedBy || "Admin"}</span>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreVersion(ver.id)}
                            className="h-7 text-[10px] font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            {isAr ? "استعادة" : "Restore"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TEST WITH GUIDER */}
              {activeDrawerTab === "test" && (
                <div className="space-y-4 text-xs">
                  <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      {isAr ? "اختبار تأصيل هذه المعلومة مع GuideR" : "Test Retrieval for this Entity"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr
                        ? "اطرح سؤالاً وتأكد من أن GuideR يعثر على هذا الكيان ويطبق التخصيصات والأسعار المحدثة."
                        : "Verify that GuideR correctly retrieves and grounds this entity during live conversation."}
                    </p>
                  </div>

                  <form onSubmit={handleRunDrawerTest} className="flex gap-2">
                    <Input
                      value={drawerTestQuery}
                      onChange={(e) => setDrawerTestQuery(e.target.value)}
                      placeholder={isAr ? "اكتب سؤال المسافر..." : "Type question..."}
                      className="h-9 text-xs bg-background"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={drawerTesting}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shrink-0 cursor-pointer shadow-sm"
                    >
                      {drawerTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>{isAr ? "اختبار" : "Test"}</span>
                    </Button>
                  </form>

                  {drawerTestResult && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {isAr ? `تم العثور على ${drawerTestResult.matchedChunksCount} مقاطع متطابقة` : `Matched ${drawerTestResult.matchedChunksCount} chunks`}
                        </span>
                        <span className="font-mono text-emerald-600 font-bold text-[11px]">
                          Latency: {drawerTestResult.latencyMs}ms
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/40 font-mono text-[10px] space-y-1 text-muted-foreground">
                        <p className="font-bold text-foreground">Grounded Summary Text sent to LLM:</p>
                        <p className="whitespace-pre-line">{drawerTestResult.groundedSummaryText || "No context produced."}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
