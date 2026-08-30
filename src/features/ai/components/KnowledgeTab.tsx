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
  Upload, 
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
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { KnowledgeItemData, KnowledgeChunkItem, aiApi } from "../api/aiApi";

interface KnowledgeTabProps {
  t: any;
  isAr: boolean;
}

export function KnowledgeTab({ t, isAr }: KnowledgeTabProps) {
  const [items, setItems] = useState<KnowledgeItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Retrieval Tester State
  const [testQuery, setTestQuery] = useState("");
  const [testLocale, setTestLocale] = useState("en");
  const [testingRetrieval, setTestingRetrieval] = useState(false);
  const [retrievalResult, setRetrievalResult] = useState<any>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadCategory, setUploadCategory] = useState("POLICIES");
  const [uploadLocale, setUploadLocale] = useState("en");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadPriority, setUploadPriority] = useState(15);
  const [uploading, setUploading] = useState(false);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const [knowledgeRes, healthRes] = await Promise.all([
        aiApi.getKnowledge({
          page,
          limit: 12,
          search: search || undefined,
          locale: selectedLocale !== "ALL" ? selectedLocale : undefined,
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        }),
        aiApi.getKnowledgeHealth().catch(() => null),
      ]);

      setItems(knowledgeRes.items || []);
      setTotalPages(knowledgeRes.totalPages || 1);
      setHealthData(healthRes);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load knowledge base items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [page, selectedLocale, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchKnowledge();
  };

  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const res = await aiApi.syncCatalogKnowledge();
      toast.success(
        isAr 
          ? `تمت مزامنة الكتالوج بنجاح! (${res.syncedTours * 5} مقطع رحلات)` 
          : `Catalog synced! ${res.syncedTours} tours ingested across 5 languages.`
      );
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err?.message || "Catalog sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const res = await aiApi.reindexKnowledge();
      toast.success(isAr ? `تمت إعادة الفهرسة بنجاح! (${res.reindexedCount} عنصر)` : `Re-indexed ${res.reindexedCount} items successfully.`);
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err?.message || "Re-indexing failed.");
    } finally {
      setReindexing(false);
    }
  };

  const handleRunRetrievalTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setTestingRetrieval(true);
    try {
      const res = await aiApi.testRetrieval({
        query: testQuery.trim(),
        locale: testLocale,
        limit: 5,
      });
      setRetrievalResult(res);
      toast.success(isAr ? "تم تنفيذ الاسترجاع الهجين بنجاح!" : "Hybrid retrieval test completed!");
    } catch (err: any) {
      toast.error(err?.message || "Retrieval test failed.");
    } finally {
      setTestingRetrieval(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      toast.error(isAr ? "يرجى كتابة العنوان والمحتوى." : "Title and Content are required.");
      return;
    }

    setUploading(true);
    try {
      await aiApi.uploadKnowledgeDocument({
        title: uploadTitle.trim(),
        content: uploadContent.trim(),
        category: uploadCategory,
        locale: uploadLocale,
        tags: uploadTags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      toast.success(isAr ? "تم رفع المستند المعرفي بنجاح!" : "Document uploaded successfully!");
      setShowUploadModal(false);
      setUploadTitle("");
      setUploadContent("");
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المستند؟" : "Are you sure you want to delete this document?")) return;
    try {
      await aiApi.deleteKnowledge(id);
      toast.success(isAr ? "تم الحذف بنجاح." : "Item deleted.");
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Ingestion Health & Controls */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-background to-blue-600/5 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {t("knowledge.title")}
              </h3>
              <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                {isAr ? "استرجاع هجين فوري" : "Hybrid RAG Active"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              {t("knowledge.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReindex}
              disabled={reindexing}
              className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reindexing ? "animate-spin text-blue-500" : ""}`} />
              {reindexing ? t("knowledge.reindexing") : t("knowledge.reindexAll")}
            </Button>
            <Button
              size="sm"
              onClick={handleSyncCatalog}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
            >
              <Database className="h-3.5 w-3.5" />
              {syncing ? t("knowledge.syncing") : t("knowledge.syncCatalog")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              {t("knowledge.uploadDoc")}
            </Button>
          </div>
        </div>

        {/* Health Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("knowledge.indexedDocs")}
            </span>
            <span className="text-sm font-bold text-foreground font-mono">
              {healthData?.totalArticles ?? items.length} {isAr ? "مستند" : "Articles"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("knowledge.publishedDocs")}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {healthData?.publishedCount ?? items.length} {isAr ? "منشور للـ AI" : "Published"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("knowledge.totalChunks")}
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
              {(healthData?.chunksCount ?? items.length * 5)} {isAr ? "مقطع بـ 5 لغات" : "5-Locale Chunks"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("knowledge.autoSyncCount")}
            </span>
            <span className="text-sm font-bold text-foreground font-mono">
              {healthData?.autoGeneratedCount ?? 38} {isAr ? "عنصر كتالوج حي" : "Catalog Synced"}
            </span>
          </div>
        </div>
      </div>

      {/* Relational Zero-Hallucination Assurance Notice */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {isAr ? "ضمان الحقيقة العلائقية ومنع الهلوسة" : "Live Relational Grounding & Zero Hallucination Guarantee"}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {t("knowledge.zeroHallucinationNotice")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
          PostgreSQL Grounded
        </Badge>
      </div>

      {/* Interactive Hybrid Retrieval Tester */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {t("knowledge.retrievalTester")}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr 
              ? "اختبر دقة استرجاع المقاطع والرحلات الحية من قاعدة البيانات فورياً بناءً على رسالة المسافر." 
              : "Simulate visitor queries to inspect matched multilingual chunks, live tours, hotels, and compiled system prompt injection."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRunRetrievalTest} className="flex flex-col sm:flex-row gap-2.5">
            <Input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder={t("knowledge.testQueryPlaceholder")}
              className="flex-1 text-xs font-medium h-10"
            />
            <select
              value={testLocale}
              onChange={(e) => setTestLocale(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold"
            >
              <option value="en">English (EN)</option>
              <option value="ar">العربية (AR)</option>
              <option value="es">Español (ES)</option>
              <option value="pt">Português (PT)</option>
              <option value="it">Italiano (IT)</option>
            </select>
            <Button
              type="submit"
              disabled={testingRetrieval || !testQuery.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {testingRetrieval ? (isAr ? "جاري الفحص..." : "Testing...") : t("knowledge.runTest")}
            </Button>
          </form>

          {/* Test Retrieval Results */}
          {retrievalResult && (
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "نتائج الاسترجاع الهجين" : "Hybrid Retrieval Results"}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Latency: {retrievalResult.latencyMs}ms • {retrievalResult.matchedChunksCount} chunks • {retrievalResult.matchedToursCount} live tours
                </span>
              </div>

              {/* Matched Live Tours Strip */}
              {retrievalResult.groundedTours?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                    {t("knowledge.matchedTours")}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {retrievalResult.groundedTours.map((tour: any) => (
                      <div key={tour.id} className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{tour.title}</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">${tour.basePriceUsd} USD</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          {tour.durationDays} Days • {tour.city} • <code className="text-amber-500">{tour.publicUrl}</code>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Summary Text Preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("knowledge.groundedContextPreview")}:
                </span>
                <pre className="p-3 rounded-lg bg-black/80 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-40 whitespace-pre-wrap">
                  {retrievalResult.groundedSummaryText || "No context matched."}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث في مقالات المعرفة..." : "Search knowledge articles by title, content, or tags..."}
            className="pl-9 text-xs h-9"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
          >
            <option value="ALL">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
            <option value="CUSTOM_TOURS">{isAr ? "الجولات المخصصة" : "Custom Tours"}</option>
            <option value="DESTINATION_INFO">{isAr ? "أدلة الوجهات" : "Destination Guides"}</option>
            <option value="FAQ">{isAr ? "الأسئلة الشائعة (FAQ)" : "FAQs"}</option>
            <option value="POLICIES">{isAr ? "جميع السياسات والشروط" : "All Policies & Terms"}</option>
            <option value="BOOKING_POLICY">{isAr ? "سياسة الحجز" : "Booking Policy"}</option>
            <option value="CANCELLATION_POLICY">{isAr ? "سياسة الإلغاء" : "Cancellation Policy"}</option>
            <option value="VISA_GUIDANCE">{isAr ? "إرشادات التأشيرة" : "Visa Guidance"}</option>
            <option value="HOTELS">{isAr ? "الفنادق والإقامة" : "Hotels"}</option>
            <option value="TRANSPORTATION">{isAr ? "النقل والمواصلات" : "Transportation"}</option>
          </select>


          {/* Locale Filter */}
          <select
            value={selectedLocale}
            onChange={(e) => { setSelectedLocale(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
          >
            <option value="ALL">{isAr ? "جميع اللغات (5)" : "All Locales"}</option>
            <option value="en">English (EN)</option>
            <option value="ar">العربية (AR)</option>
            <option value="es">Español (ES)</option>
            <option value="pt">Português (PT)</option>
            <option value="it">Italiano (IT)</option>
          </select>
        </div>
      </div>

      {/* Knowledge Base Table */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{isAr ? "العنوان" : "Title"}</th>
                <th className="px-4 py-3">{t("knowledge.sourceCategory")}</th>
                <th className="px-4 py-3">{t("knowledge.locale")}</th>
                <th className="px-4 py-3">{t("knowledge.priority")}</th>
                <th className="px-4 py-3">{isAr ? "المصدر" : "Source"}</th>
                <th className="px-4 py-3 text-right">{t("knowledge.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-500 mb-2" />
                    {isAr ? "جاري تحميل المقالات..." : "Loading knowledge articles..."}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {isAr ? "لم يتم العثور على أية مقالات مطابقة." : "No knowledge articles found."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] font-mono font-bold uppercase">
                        {item.locale}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.priority}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground font-mono">
                      {item.sourceEntityType || item.sourceType || "CUSTOM"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 text-xs"
              >
                {isAr ? "السابق" : "Prev"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-7 text-xs"
              >
                {isAr ? "التالي" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Custom Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                {t("knowledge.uploadDoc")}
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {isAr ? "عنوان المقال" : "Document Title"}
                </label>
                <Input 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. VIP Cairo Airport Meet & Assist Protocol"
                  className="font-bold h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("knowledge.sourceCategory")}
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                  >
                    <option value="POLICIES">POLICIES</option>
                    <option value="CUSTOM_TOURS">CUSTOM_TOURS</option>
                    <option value="DESTINATION_INFO">DESTINATION_INFO</option>
                    <option value="FAQS">FAQS</option>
                    <option value="HOTELS">HOTELS</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("knowledge.locale")}
                  </label>
                  <select
                    value={uploadLocale}
                    onChange={(e) => setUploadLocale(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                  >
                    <option value="en">English (EN)</option>
                    <option value="ar">العربية (AR)</option>
                    <option value="es">Español (ES)</option>
                    <option value="pt">Português (PT)</option>
                    <option value="it">Italiano (IT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {isAr ? "محتوى المقال" : "Content Text"}
                </label>
                <Textarea 
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  rows={5}
                  placeholder="Enter official verified policy or guidance text..."
                  className="font-medium text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                >
                  {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع وحفظ" : "Upload & Save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
