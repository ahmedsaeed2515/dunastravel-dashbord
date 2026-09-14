"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Check,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Search,
  Zap,
  Wrench,
  FileCode,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DiscoveredModelItem } from "../api/aiApi";

export interface ModelPreset {
  id: string;
  name: string;
  nameAr?: string;
  badge?: string;
  isPopular?: boolean;
}

// Truly retired Google models that Google shut down
const RETIRED_GOOGLE_MODEL_IDS = new Set<string>([
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
  "gemini-1.0-pro",
  "gemini-1.0-pro-vision",
  "gemini-pro",
  "gemini-pro-vision",
]);

// Top 5 Curated Recommended Models Per Provider
export const PROVIDER_MODEL_PRESETS: Record<string, ModelPreset[]> = {
  google: [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", nameAr: "جيمناي 2.5 فلاش (الموصى به للإنتاجية — استجابة فائقة)", badge: "Best Overall", isPopular: true },
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", nameAr: "جيمناي 3.5 فلاش لايت (اقتصادي خفيف وسريع — الأحدث)", badge: "Best Value", isPopular: true },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", nameAr: "جيمناي 3.5 فلاش (الجيل الأحدث السريع)", badge: "Fast & Smart", isPopular: true },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", nameAr: "جيمناي 2.5 برو (تحليل عميق وتفكير فائق — سياق 2M)", badge: "Highest Quality", isPopular: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", nameAr: "جيمناي 2.0 فلاش (مستقر وعالي السرعة)", badge: "Fast & Stable", isPopular: true },
  ],

  openai: [
    { id: "gpt-4o", name: "GPT-4o", nameAr: "جي بي تي 4 أومني (الرئيسي المتوازن)", badge: "Best Overall", isPopular: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", nameAr: "جي بي تي 4 أومني ميني (سريع واقتصادي)", badge: "Best Value", isPopular: true },
    { id: "o3-mini", name: "o3-mini", nameAr: "أو 3 ميني (استدلال واستنتاج فائق)", badge: "Highest Quality", isPopular: true },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", nameAr: "جي بي تي 4 تيربو", badge: "Advanced", isPopular: false },
  ],
  xai: [
    { id: "grok-3", name: "Grok 3", nameAr: "غروك 3 (الرئيسي المتوازن)", badge: "Best Overall", isPopular: true },
    { id: "grok-3-mini", name: "Grok 3 Mini", nameAr: "غروك 3 ميني (اقتصادي وسريع)", badge: "Best Value", isPopular: true },
    { id: "grok-3-fast", name: "Grok 3 Fast", nameAr: "غروك 3 فاست (استجابة فائقة)", badge: "Fastest", isPopular: true },
  ],
  openrouter: [
    { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3 (via OpenRouter)", nameAr: "ديب سيك V3 (عبر أوبن راوتر)", badge: "Best Value", isPopular: true },
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via OpenRouter)", nameAr: "ديب سيك R1 (استدلال عميق)", badge: "Highest Quality", isPopular: true },
    { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct", nameAr: "كيوين 2.5 (دقة لغوية متعددة)", badge: "Best Overall", isPopular: true },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek V3 Chat (Direct)", nameAr: "ديب سيك شات V3 (مباشر)", badge: "Best Value", isPopular: true },
    { id: "deepseek-reasoner", name: "DeepSeek R1 Reasoner (Direct)", nameAr: "ديب سيك ريزنر R1 (مباشر)", badge: "Highest Quality", isPopular: true },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Legacy)", nameAr: "كلود 3.5 سونيت (موروث)", badge: "Legacy", isPopular: false },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Legacy)", nameAr: "كلود 3.5 هايكو (موروث)", badge: "Legacy Fast", isPopular: false },
  ],
  custom: [
    { id: "custom-model", name: "Custom Model", nameAr: "موديل مخصص", badge: "User Defined" },
  ],
};

function getBadgeStyle(badge?: string): string {
  switch (badge) {
    case "Best Overall":
    case "Official Primary":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    case "Best Value":
    case "Economy":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "Highest Quality":
    case "Reasoning":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
    case "Fastest":
    case "Fast & Stable":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30";
  }
}

interface ModelSelectorProps {
  provider: string;
  value: string;
  onChange: (model: string) => void;
  label?: string;
  isAr?: boolean;
  discoveredModels?: DiscoveredModelItem[];
  isLoadingModels?: boolean;
  onRefreshModels?: () => void;
  discoveryError?: string | null;
}

export function ModelSelector({
  provider,
  value,
  onChange,
  label,
  isAr = false,
  discoveredModels,
  isLoadingModels = false,
  onRefreshModels,
  discoveryError,
}: ModelSelectorProps) {
  const normalizedProvider = (provider || "google").toLowerCase();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRawDrawer, setShowRawDrawer] = useState(false);

  // Fallback Presets
  const fallbackPresets = useMemo(() => {
    return PROVIDER_MODEL_PRESETS[normalizedProvider] || PROVIDER_MODEL_PRESETS.google;
  }, [normalizedProvider]);

  // Available live models excluding deprecated ones
  const availableLiveModels = useMemo(() => {
    if (discoveredModels && discoveredModels.length > 0) {
      return discoveredModels.filter(
        (m) => m.status === "AVAILABLE" && !RETIRED_GOOGLE_MODEL_IDS.has(m.id)
      );
    }
    return [];
  }, [discoveredModels]);

  const hasLiveModels = availableLiveModels.length > 0;

  // Partition into Top 5 Curated vs Raw Drawer Models
  const { curatedList, rawList } = useMemo(() => {
    if (hasLiveModels) {
      const explicitCurated = availableLiveModels.filter((m) => m.isCurated || Boolean(m.curatedBadge));
      if (explicitCurated.length > 0) {
        const top5 = explicitCurated.slice(0, 5);
        const top5Ids = new Set(top5.map((m) => m.id));
        const raw = availableLiveModels.filter((m) => !top5Ids.has(m.id));
        return { curatedList: top5, rawList: raw };
      }

      // Map against presets priority
      const presetIds = new Set(fallbackPresets.map((p) => p.id));
      const presetMatched = availableLiveModels.filter((m) => presetIds.has(m.id));
      const top5 = (presetMatched.length > 0 ? presetMatched : availableLiveModels).slice(0, 5);
      const top5Ids = new Set(top5.map((m) => m.id));
      const raw = availableLiveModels.filter((m) => !top5Ids.has(m.id));
      return { curatedList: top5, rawList: raw };
    }

    return { curatedList: [], rawList: [] };
  }, [availableLiveModels, fallbackPresets, hasLiveModels]);

  // Filtered raw models based on search
  const filteredRawModels = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const s = searchTerm.toLowerCase().trim();
    return rawList.filter(
      (m) =>
        m.id.toLowerCase().includes(s) ||
        (m.displayName || "").toLowerCase().includes(s)
    );
  }, [rawList, searchTerm]);

  // Validation
  const isCurrentValueDeprecated = RETIRED_GOOGLE_MODEL_IDS.has(value);
  const isCurrentValueInCurated = curatedList.some((m) => m.id === value);
  const isCurrentValueInRaw = rawList.some((m) => m.id === value);
  const isCurrentValueInPresets = fallbackPresets.some((p) => p.id === value);
  const isCurrentValueInLive = hasLiveModels ? (isCurrentValueInCurated || isCurrentValueInRaw) : true;

  const [isCustomMode, setIsCustomMode] = useState(
    normalizedProvider === "custom" && !isCurrentValueInPresets && Boolean(value)
  );

  // Auto-migrate retired or empty model selection to active primary model
  useEffect(() => {
    if (isCustomMode) return;
    if (isCurrentValueDeprecated || !value) {
      const bestFallback = hasLiveModels
        ? (curatedList[0]?.id || availableLiveModels[0]?.id)
        : (fallbackPresets[0]?.id || (normalizedProvider === "google" ? "gemini-2.5-flash" : "gpt-4o-mini"));
      if (bestFallback && bestFallback !== value) {
        onChange(bestFallback);
      }
    }
  }, [isCurrentValueDeprecated, value, hasLiveModels, curatedList, availableLiveModels, fallbackPresets, isCustomMode, normalizedProvider, onChange]);

  // Auto-open raw drawer if current value is in rawList
  useEffect(() => {
    if (isCurrentValueInRaw) {
      setShowRawDrawer(true);
    }
  }, [isCurrentValueInRaw]);

  return (
    <div className="space-y-3 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          {label || (isAr ? "اختيار موديل جايدر المعتمد" : "GuideR Model Selection")}
        </label>

        <div className="flex items-center gap-2">
          {onRefreshModels && (
            <button
              type="button"
              onClick={onRefreshModels}
              disabled={isLoadingModels}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingModels ? "animate-spin" : ""}`} />
              {isAr ? "تحديث الموديلات الحية" : "Refresh Live"}
            </button>
          )}

          {normalizedProvider === "custom" && (
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isCustomMode ? (
                <>
                  <Layers className="h-3 w-3" />
                  {isAr ? "العودة للقائمة" : "Select from List"}
                </>
              ) : (
                <>
                  <Edit2 className="h-3 w-3" />
                  {isAr ? "كتابة اسم مخصص ✍️" : "Type Custom ✍️"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Deprecation Warning */}
      {(isCurrentValueDeprecated || (!isCurrentValueInLive && value && hasLiveModels)) && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-[11px]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>
            {isCurrentValueDeprecated
              ? isAr
                ? `⚠️ الموديل الحالي '${value}' تم إيقافه رسمياً. يرجى اختيار موديل معتمد.`
                : `⚠️ The current model '${value}' is deprecated. Please select a supported model.`
              : isAr
              ? `⚠️ الموديل المحدد (${value}) غير متاح في قائمة المزود الحية. يرجى اختيار موديل معتمد.`
              : `⚠️ The selected model (${value}) is not present in the live provider list.`}
          </span>
        </div>
      )}

      {/* Discovery Error */}
      {discoveryError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center gap-2 text-amber-700 dark:text-amber-300 text-[11px]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>{discoveryError}</span>
        </div>
      )}

      {/* TOP 5 CURATED RECOMMENDED MODELS (Cards View) */}
      {!isCustomMode && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              {isAr ? "أبرز الموديلات الموصى بها للإنتاج (Top 5):" : "Top 5 Curated Production Models:"}
            </span>
            <span className="text-[10px] text-zinc-400">
              {isAr ? "جاهزة للعمل بدون تأخير" : "Capability-vetted"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(hasLiveModels ? curatedList : fallbackPresets.slice(0, 5)).map((item: any) => {
              const modelId = item.id;
              const isSelected = value === modelId;
              const badgeText = item.curatedBadge || item.badge || (modelId.includes("pro") ? "Highest Quality" : modelId.includes("lite") ? "Best Value" : "Best Overall");
              const displayName = item.displayName || item.name || modelId;

              return (
                <div
                  key={modelId}
                  onClick={() => onChange(modelId)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-blue-600/10 dark:bg-blue-500/15 border-blue-500 shadow-xs ring-1 ring-blue-500/30"
                      : "bg-muted/30 hover:bg-muted/60 border-border/80 hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-foreground truncate" title={displayName}>
                      {displayName}
                    </span>
                    {isSelected && (
                      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white shrink-0">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-bold border ${getBadgeStyle(badgeText)}`}>
                      {badgeText}
                    </Badge>
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[110px]" title={modelId}>
                      {modelId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRIMARY SELECT DROPDOWN */}
      {!isCustomMode && (
        <div className="relative pt-1">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 pe-8 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
          >
            <option value="" disabled>
              {isAr ? "-- اختر الموديل --" : "-- Select Active Model --"}
            </option>

            {hasLiveModels ? (
              <>
                <optgroup label={isAr ? `موديلات موصى بها (${curatedList.length})` : `Curated Recommended Models (${curatedList.length})`}>
                  {curatedList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName || m.id} {m.contextWindow ? `(${Math.round(m.contextWindow / 1000)}k ctx)` : ""} {m.curatedBadge ? `— [${m.curatedBadge}]` : ""}
                    </option>
                  ))}
                </optgroup>

                {isCurrentValueInRaw && (
                  <optgroup label={isAr ? "موديل مختار من القائمة الكاملة" : "Selected Model from Raw List"}>
                    <option value={value}>
                      {rawList.find((m) => m.id === value)?.displayName || value} [Raw Discovered]
                    </option>
                  </optgroup>
                )}
              </>
            ) : (
              <optgroup label={isAr ? `موديلات معتمدة لـ ${provider.toUpperCase()}` : `Verified Models for ${provider.toUpperCase()}`}>
                {fallbackPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.badge ? `[${p.badge}]` : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* RAW MODELS DIAGNOSTICS DRAWER (Accordion) */}
      {hasLiveModels && rawList.length > 0 && !isCustomMode && (
        <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/10 transition-all">
          <button
            type="button"
            onClick={() => setShowRawDrawer(!showRawDrawer)}
            className="w-full px-3 py-2 text-[11px] font-semibold flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              {isAr
                ? `عرض باقي الموديلات المكتشفة من المزود (${rawList.length})`
                : `Advanced: All Discovered Models (${rawList.length})`}
            </span>
            {showRawDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showRawDrawer && (
            <div className="p-2.5 pt-0 space-y-2 border-t border-border/40">
              <div className="relative pt-2">
                <Search className="h-3 w-3 absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? "بحث في باقي الموديلات المكتشفة..." : "Search raw discovered models..."}
                  className="h-8 text-xs ps-7 bg-background"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pe-1">
                {filteredRawModels.map((m) => {
                  const isSelected = value === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => onChange(m.id)}
                      className={`p-2 rounded-lg text-[11px] flex items-center justify-between cursor-pointer border transition-colors ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                          : "hover:bg-muted/40 border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="truncate max-w-[220px]" title={m.displayName || m.id}>
                        {m.displayName || m.id}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.contextWindow && (
                          <span className="text-[10px] text-zinc-400">
                            {Math.round(m.contextWindow / 1000)}k ctx
                          </span>
                        )}
                        {isSelected && <Check className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SELECTED MODEL CAPABILITY CHIPS */}
      {(() => {
        const selectedInfo = availableLiveModels.find((m) => m.id === value);
        if (!selectedInfo) return null;
        return (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Live Provider
            </Badge>
            {selectedInfo.contextWindow && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                {(selectedInfo.contextWindow / 1000).toLocaleString()}k Context
              </Badge>
            )}
            {selectedInfo.supportsStreaming && (
              <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30 gap-1">
                <Zap className="h-2.5 w-2.5" />
                Streaming
              </Badge>
            )}
            {selectedInfo.supportsTools && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1">
                <Wrench className="h-2.5 w-2.5" />
                Tools
              </Badge>
            )}
            {selectedInfo.supportsStructuredOutput && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                <FileCode className="h-2.5 w-2.5" />
                JSON
              </Badge>
            )}
          </div>
        );
      })()}

      {/* CUSTOM MODEL MODE (provider=custom only) */}
      {isCustomMode && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isAr ? "اكتب اسم الموديل المخصص هنا" : "e.g. my-custom-model-id"}
              className="font-mono text-xs font-bold pe-8 bg-background border-blue-500/40 focus:border-blue-500"
            />
            {value && (
              <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
