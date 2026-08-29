"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Edit2, Check, Cpu, Layers } from "lucide-react";

export interface ModelPreset {
  id: string;
  name: string;
  nameAr?: string;
  badge?: string;
  isPopular?: boolean;
}

export const PROVIDER_MODEL_PRESETS: Record<string, ModelPreset[]> = {
  google: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", nameAr: "جيميناي 2.5 برو (أعلى ذكاء وتحليل)", badge: "Flagship", isPopular: true },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", nameAr: "جيميناي 2.5 فلاش (سرعة فائقة وذكاء عالي)", badge: "Ultra Fast", isPopular: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", nameAr: "جيميناي 2.0 فلاش (الافتراضي المستقر)", badge: "Stable", isPopular: true },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", nameAr: "جيميناي 1.5 برو (سياق 2M)", badge: "2M Context" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", nameAr: "جيميناي 1.5 فلاش (اقتصادي)", badge: "Light" },
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Hybrid)", nameAr: "كلود 3.7 سونيت (تفكير هجين - الأحدث)", badge: "Latest", isPopular: true },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", nameAr: "كلود 3.5 سونيت (الرائد في الدقة)", badge: "Recommended", isPopular: true },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", nameAr: "كلود 3.5 هايكو (فائق السرعة)", badge: "Fast", isPopular: true },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", nameAr: "كلود 3 أوبوس (تحليل عميق)", badge: "Deep Writing" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Omni)", nameAr: "جي بي تي 4 أومني (متعدد الوسائط)", badge: "Flagship", isPopular: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", nameAr: "جي بي تي 4 أومني ميني (سريع واقتصادي)", badge: "Fast & Light", isPopular: true },
    { id: "o3-mini", name: "o3-mini", nameAr: "أو 3 ميني (تفكير واستنتاج فائق)", badge: "Reasoning", isPopular: true },
    { id: "o1", name: "o1 (Deep Reasoning)", nameAr: "أو 1 (تفكير منطقي عميق)", badge: "Complex Math" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", nameAr: "جي بي تي 4 توربو", badge: "Legacy" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek Chat (V3)", nameAr: "ديب سيك شات V3 (فائق السرعة والدقة)", badge: "Fast & Smart", isPopular: true },
    { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)", nameAr: "ديب سيك ريزنر R1 (سلسلة تفكير واستنتاج)", badge: "CoT Reasoning", isPopular: true },
  ],
  openrouter: [
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via OpenRouter)", nameAr: "ديب سيك R1 (عبر أوبن راوتر)", badge: "Open R1", isPopular: true },
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3 (via OpenRouter)", nameAr: "ديب سيك V3 (عبر أوبن راوتر)", badge: "V3", isPopular: true },
    { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct", nameAr: "كيوين 2.5 (72B متعدد اللغات)", badge: "Multi-Lang", isPopular: true },
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct", nameAr: "لاما 3.3 (70B مفتوح المصدر)", badge: "Open Source" },
    { id: "moonshotai/moonshot-v1-32k", name: "Moonshot Kimi 32k", nameAr: "مون شوت كيمي (32K سياق)", badge: "Chinese Leading" },
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
}

export function ModelSelector({
  provider,
  value,
  onChange,
  label,
  isAr = false,
}: ModelSelectorProps) {
  const normalizedProvider = (provider || "anthropic").toLowerCase();
  const presets = useMemo(() => {
    return PROVIDER_MODEL_PRESETS[normalizedProvider] || PROVIDER_MODEL_PRESETS.anthropic;
  }, [normalizedProvider]);

  const isPresetMatch = useMemo(() => {
    return presets.some((p) => p.id === value);
  }, [presets, value]);

  const [isCustomMode, setIsCustomMode] = useState(!isPresetMatch && Boolean(value));

  useEffect(() => {
    if (!isPresetMatch && value && !isCustomMode) {
      setIsCustomMode(true);
    }
  }, [isPresetMatch, value]);

  const handleSelectPreset = (modelId: string) => {
    if (modelId === "__CUSTOM__") {
      setIsCustomMode(true);
      return;
    }
    setIsCustomMode(false);
    onChange(modelId);
  };

  const handleCustomInput = (customVal: string) => {
    onChange(customVal);
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-amber-500" />
          {label || (isAr ? "اختيار أو كتابة الموديل (Model Name)" : "Model Name & Architecture")}
        </label>
        
        <button
          type="button"
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          {isCustomMode ? (
            <>
              <Layers className="h-3 w-3" />
              {isAr ? "العودة للقائمة الجاهزة" : "Select from Presets"}
            </>
          ) : (
            <>
              <Edit2 className="h-3 w-3" />
              {isAr ? "كتابة اسم موديل مخصص ✍️" : "Type Custom Model ✍️"}
            </>
          )}
        </button>
      </div>

      {!isCustomMode ? (
        <div className="space-y-2">
          {/* Quick Select Dropdown */}
          <div className="relative">
            <select
              value={isPresetMatch ? value : "__CUSTOM__"}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full p-2.5 pe-8 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
            >
              <optgroup label={isAr ? `الموديلات الشائعة لـ ${provider}` : `Popular Models for ${provider.toUpperCase()}`}>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.badge ? `[${p.badge}]` : ""} {isAr && p.nameAr ? `— ${p.nameAr}` : ""}
                  </option>
                ))}
              </optgroup>
              <option value="__CUSTOM__">
                {isAr ? "➕ كتابة موديل مخصص آخر (Custom Model Name)..." : "➕ Type Custom Model Name..."}
              </option>
            </select>
          </div>

          {/* Quick Click Chips for Top Models */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold me-1">
              {isAr ? "سريع:" : "Quick:"}
            </span>
            {presets.slice(0, 4).map((p) => {
              const isSelected = value === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-amber-500" />}
                  {p.id.split("-").slice(0, 3).join("-")}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Custom Free Typing Input */
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder={isAr ? "اكتب اسم الموديل هنا مثل: gemini-2.5-pro, claude-3-7-sonnet-20250219" : "e.g. gemini-2.5-pro, claude-3-7-sonnet-20250219, gpt-4o"}
              className="font-mono text-xs font-bold pe-8 bg-background border-amber-500/40 focus:border-amber-500"
            />
            {value && (
              <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isAr
              ? "💡 يمكنك كتابة أي معرف موديل جديد من مزود الخدمة مباشرة دون قيود."
              : "💡 Enter any valid model identifier supported by your API provider."}
          </p>
        </div>
      )}
    </div>
  );
}
