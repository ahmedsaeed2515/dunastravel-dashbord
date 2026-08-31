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
} from "lucide-react";
import { DiscoveredModelItem } from "../api/aiApi";

export interface ModelPreset {
  id: string;
  name: string;
  nameAr?: string;
  badge?: string;
  isPopular?: boolean;
}

const RETIRED_GOOGLE_MODEL_IDS = new Set([
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
]);

export const PROVIDER_MODEL_PRESETS: Record<string, ModelPreset[]> = {
  google: [
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", nameAr: "جيمناي 3.7 فلاش (الموصى به للأعمال المعقدة والـ Agentic)", badge: "Flagship", isPopular: true },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", nameAr: "جيمناي 3.5 فلاش (عالي السرعة والإنتاجية)", badge: "Production", isPopular: true },
    { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", nameAr: "جيمناي 3.1 برو (أعلى ذكاء وتحليل عميق)", badge: "Reasoning", isPopular: true },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", nameAr: "جيمناي 3.1 فلاش لايت (اقتصادي وسريع جداً)", badge: "Economy", isPopular: true },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", nameAr: "جيمناي 2.5 فلاش (المستقر)", badge: "Stable", isPopular: false },
  ],
  openai: [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", nameAr: "جي بي تي 4 أومني ميني (سريع واقتصادي)", badge: "Economy", isPopular: true },
    { id: "gpt-4o", name: "GPT-4o (Omni)", nameAr: "جي بي تي 4 أومني (المتوازن المتقدم)", badge: "Balanced", isPopular: true },
    { id: "o3-mini", name: "o3-mini", nameAr: "أو 3 ميني (تفكير واستنتاج فائق)", badge: "Reasoning", isPopular: true },
  ],
  xai: [
    { id: "grok-3-mini", name: "Grok 3 Mini", nameAr: "غروك 3 ميني (اقتصادي وسريع)", badge: "Economy", isPopular: true },
    { id: "grok-3", name: "Grok 3", nameAr: "غروك 3 (المتوازن)", badge: "Balanced", isPopular: true },
    { id: "grok-3-fast", name: "Grok 3 Fast", nameAr: "غروك 3 فاست (استجابة فائقة السرعة)", badge: "Fast", isPopular: true },
  ],
  openrouter: [
    { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3 Flash (via OpenRouter)", nameAr: "ديب سيك V3 فلاش (عبر أوبن راوتر)", badge: "Fallback Primary", isPopular: true },
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via OpenRouter)", nameAr: "ديب سيك R1 (عبر أوبن راوتر)", badge: "Reasoning", isPopular: true },
    { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct", nameAr: "كيوين 2.5 (72B متعدد اللغات بدقة)", badge: "Multi-Lang", isPopular: true },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek V3 Chat (Direct)", nameAr: "ديب سيك شات V3 (مباشر)", badge: "Economy", isPopular: true },
    { id: "deepseek-reasoner", name: "DeepSeek R1 Reasoner (Direct)", nameAr: "ديب سيك ريزنر R1 (مباشر)", badge: "Reasoning", isPopular: true },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Legacy)", nameAr: "كلود 3.5 سونيت (موروث)", badge: "Legacy", isPopular: false },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Legacy)", nameAr: "كلود 3.5 هايكو (موروث)", badge: "Legacy Fast", isPopular: false },
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Legacy)", nameAr: "كلود 3.7 سونيت (موروث)", badge: "Legacy Latest", isPopular: false },
  ],
  custom: [
    { id: "custom-model", name: "Custom Model", nameAr: "موديل مخصص", badge: "User Defined" },
  ],
};

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

  // Presets as fallback only if no live models discovered
  const fallbackPresets = useMemo(() => {
    return PROVIDER_MODEL_PRESETS[normalizedProvider] || PROVIDER_MODEL_PRESETS.google;
  }, [normalizedProvider]);

  // Live models list
  const availableLiveModels = useMemo(() => {
    if (discoveredModels && discoveredModels.length > 0) {
      return discoveredModels.filter(
        (m) => m.status === "AVAILABLE" && !RETIRED_GOOGLE_MODEL_IDS.has(m.id)
      );
    }
    return [];
  }, [discoveredModels]);

  const hasLiveModels = availableLiveModels.length > 0;

  // Filtered live models based on search term
  const filteredLiveModels = useMemo(() => {
    if (!hasLiveModels) return [];
    if (!searchTerm.trim()) return availableLiveModels;
    const s = searchTerm.toLowerCase().trim();
    return availableLiveModels.filter(
      (m) =>
        m.id.toLowerCase().includes(s) ||
        (m.displayName || "").toLowerCase().includes(s)
    );
  }, [availableLiveModels, hasLiveModels, searchTerm]);

  // Check if current value is valid
  const isCurrentValueDeprecated = RETIRED_GOOGLE_MODEL_IDS.has(value);
  const isCurrentValueInLive = hasLiveModels ? availableLiveModels.some((m) => m.id === value) : true;
  const isCurrentValueInPresets = fallbackPresets.some((p) => p.id === value);

  const [isCustomMode, setIsCustomMode] = useState(
    normalizedProvider === "custom" && !isCurrentValueInPresets && Boolean(value)
  );

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-amber-500" />
          {label || (isAr ? "اختيار الموديل المعتمد" : "Model Architecture & Selection")}
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

      {/* Deprecation or Missing Warning */}
      {(isCurrentValueDeprecated || (!isCurrentValueInLive && value && hasLiveModels)) && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-[11px]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>
            {isCurrentValueDeprecated
              ? isAr
                ? `⚠️ الموديل الحالي '${value}' تم إيقافه رسمياً. حدّث قائمة الموديلات واختر موديلًا نشطًا.`
                : `⚠️ The current model '${value}' is shut down. Refresh the live list and select an active model.`
              : isAr
              ? `⚠️ الموديل المحدد (${value}) غير متاح في قائمة المزود الحية. يرجى اختيار موديل معتمد.`
              : `⚠️ The selected model (${value}) is not present in the live provider list. Please choose a valid live model.`}
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

      {/* LIVE MODELS MODE */}
      {hasLiveModels && !isCustomMode ? (
        <div className="space-y-2">
          {/* Search bar if many models */}
          {availableLiveModels.length > 5 && (
            <div className="relative">
              <Search className="h-3 w-3 absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? "تصفية الموديلات المكتشفة..." : "Search discovered models..."}
                className="h-8 text-xs ps-7 bg-background"
              />
            </div>
          )}

          {/* Model Selection Dropdown */}
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2.5 pe-8 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
            >
              <option value="" disabled>
                {isAr ? "-- اختر موديلاً معتمداً --" : "-- Select an active live model --"}
              </option>
              <optgroup label={isAr ? `موديلات حية من ${provider.toUpperCase()}` : `Live Models from ${provider.toUpperCase()}`}>
                {filteredLiveModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName || m.id} {m.contextWindow ? `(${Math.round(m.contextWindow / 1000)}k ctx)` : ""} {m.inputPricePer1M ? `— $${m.inputPricePer1M.toFixed(2)}/1M` : ""}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Selected Model Capabilities Badges */}
          {(() => {
            const selectedInfo = availableLiveModels.find((m) => m.id === value);
            if (!selectedInfo) return null;
            return (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
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
                    JSON Output
                  </Badge>
                )}
              </div>
            );
          })()}
        </div>
      ) : !isCustomMode ? (
        /* VERIFIED PRESETS DROPDOWN */
        <div className="space-y-2">
          <div className="relative">
            <select
              value={fallbackPresets.some((p) => p.id === value) ? value : value || fallbackPresets[0]?.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2.5 pe-8 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
            >
              <optgroup label={isAr ? `الموديلات المعتمدة لـ ${provider}` : `Verified Models for ${provider.toUpperCase()}`}>
                {fallbackPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.badge ? `[${p.badge}]` : ""} {isAr && p.nameAr ? `— ${p.nameAr}` : ""}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold me-1">
              {isAr ? "سريع:" : "Quick:"}
            </span>
            {fallbackPresets.slice(0, 4).map((p) => {
              const isSelected = value === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-amber-500" />}
                  {p.name.split(" ")[0]} {p.name.split(" ")[1] || ""}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* CUSTOM MODEL NAME INPUT (Only for provider=custom) */
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isAr ? "اكتب اسم الموديل المخصص هنا" : "e.g. my-custom-model-id"}
              className="font-mono text-xs font-bold pe-8 bg-background border-amber-500/40 focus:border-amber-500"
            />
            {value && (
              <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
