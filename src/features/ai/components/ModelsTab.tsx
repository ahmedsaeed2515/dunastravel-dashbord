"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  Plus, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ArrowUpDown, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Lock, 
  ExternalLink,
  HelpCircle,
  Clock,
  DollarSign,
  X
} from "lucide-react";
import { toast } from "sonner";
import { ApiKeyPoolEntry, ModelCapabilityItem, aiApi } from "../api/aiApi";

interface ModelsTabProps {
  keyPool: ApiKeyPoolEntry[];
  onRefresh: () => void;
  t: any;
  isAr: boolean;
}

export function ModelsTab({ keyPool, onRefresh, t, isAr }: ModelsTabProps) {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyPoolEntry | null>(null);

  // Form State
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("claude-3-5-sonnet-20241022");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Model Registry State
  const [registryModels, setRegistryModels] = useState<ModelCapabilityItem[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);

  useEffect(() => {
    aiApi.getAllModels()
      .then((res) => {
        setRegistryModels(res.models || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRegistry(false));
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await aiApi.testPoolKey(id);
      if (res.success) {
        toast.success(
          isAr 
            ? `تم التحقق من الاتصال بنجاح! (${res.latencyMs}ms)` 
            : `Connection verified! (${res.latencyMs}ms latency)`
        );
      } else {
        toast.error(res.error || "Connection test failed.");
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Test failed.");
    } finally {
      setTestingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingKey(null);
    setProvider("anthropic");
    setModel("claude-3-5-sonnet-20241022");
    setApiKey("");
    setBaseUrl("");
    setLabel("Anthropic Primary Sonnet");
    setPriority(keyPool.length + 1);
    setIsActive(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (k: ApiKeyPoolEntry) => {
    setEditingKey(k);
    setProvider(k.provider);
    setModel(k.model);
    setApiKey("");
    setBaseUrl(k.baseUrl || "");
    setLabel(k.label || "");
    setPriority(k.priority);
    setIsActive(k.isActive);
    setShowAddModal(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey && !apiKey.trim()) {
      toast.error(isAr ? "يرجى إدخال مفتاح API السري." : "API Key secret is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingKey) {
        await aiApi.updatePoolKey(editingKey.id, {
          provider,
          model,
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          label: label.trim() || undefined,
          priority: Number(priority),
          isActive,
        });
        toast.success(isAr ? "تم تحديث المفتاح بنجاح!" : "Key configuration updated!");
      } else {
        await aiApi.addPoolKey({
          provider,
          model,
          apiKey: apiKey.trim(),
          baseUrl: baseUrl.trim() || undefined,
          label: label.trim() || `${provider} - ${model}`,
          priority: Number(priority),
          isActive,
        });
        toast.success(isAr ? "تمت إضافة المفتاح بنجاح إلى مصفوفة التدوير!" : "New provider key added to failover pool!");
      }

      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save key.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المفتاح؟" : "Are you sure you want to remove this key?")) return;
    try {
      await aiApi.deletePoolKey(id);
      toast.success(isAr ? "تم الحذف بنجاح." : "Key removed.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete key.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-500" />
            {t("models.title")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("models.subtitle")}
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("models.addCredential")}
        </Button>
      </div>

      {/* Circuit Breaker Policy Explanation Card */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {t("models.circuitBreaker")}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-3xl">
              {t("models.circuitBreakerDesc")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0 self-start sm:self-auto">
          Zero Latency Failover
        </Badge>
      </div>

      {/* Failover Pool Keys Table */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            {isAr ? "مفاتيح المزودين ومصفوفة الأولوية" : "Configured Failover Pool & Key Priority"}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr ? "يتم استدعاء المفاتيح بالترتيب التصاعدي للأولوية (الأولوية 1 هي الأساسية)." : "Keys are called sequentially by priority rank (Priority 1 is primary)."}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{t("models.priority")}</th>
                <th className="px-4 py-3">{t("models.provider")}</th>
                <th className="px-4 py-3">{t("models.model")}</th>
                <th className="px-4 py-3">{t("models.apiKeySecret")}</th>
                <th className="px-4 py-3">{t("models.status")}</th>
                <th className="px-4 py-3">{t("models.latency")}</th>
                <th className="px-4 py-3 text-right">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {keyPool.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {isAr ? "لم تتم إضافة أية مفاتيح بعد." : "No API keys configured in failover pool."}
                  </td>
                </tr>
              ) : (
                keyPool
                  .sort((a, b) => a.priority - b.priority)
                  .map((entry) => {
                    const isHealthy = entry.lastStatus === 'HEALTHY';
                    const isFailed = entry.lastStatus === 'FAILED';
                    const isRateLimited = entry.lastStatus === 'RATE_LIMITED';

                    return (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-amber-500">
                          #{entry.priority}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground capitalize flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                            {entry.provider}
                          </span>
                          {entry.label && (
                            <span className="text-[10px] text-muted-foreground block">{entry.label}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground font-semibold">
                          {entry.model}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {entry.maskedKey || "••••••••••••••••"}
                        </td>
                        <td className="px-4 py-3">
                          {isHealthy ? (
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              Healthy
                            </Badge>
                          ) : isRateLimited ? (
                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                              429 Rate Limit
                            </Badge>
                          ) : isFailed ? (
                            <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                              Failed ({entry.failCount})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-muted text-muted-foreground text-[10px]">
                              Untested
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {entry.lastLatencyMs ? `${entry.lastLatencyMs}ms` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnection(entry.id)}
                              disabled={testingId === entry.id}
                              className="h-7 px-2 text-[11px] font-bold border-border/80 hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
                            >
                              <RefreshCw className={`h-3 w-3 ${testingId === entry.id ? "animate-spin text-emerald-500" : ""}`} />
                              {testingId === entry.id ? t("models.testing") : t("models.testConnection")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(entry)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(entry.id)}
                              className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
      </Card>

      {/* Model Capabilities & Token Pricing Registry */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            {t("models.capabilitiesMatrix")}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr ? "مقارنة دقيقة لإمكانيات الموديلات المدعومة ونوافذ السياق وأسعار التوكنز." : "Authoritative technical specs, context limits, and token pricing across all supported LLM providers."}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{isAr ? "الموديل" : "Model"}</th>
                <th className="px-4 py-3">{t("models.provider")}</th>
                <th className="px-4 py-3">{t("models.contextWindow")}</th>
                <th className="px-4 py-3">{t("models.inputPrice")}</th>
                <th className="px-4 py-3">{t("models.outputPrice")}</th>
                <th className="px-4 py-3">{t("models.multilingual")}</th>
                <th className="px-4 py-3">{isAr ? "الميزات" : "Features"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {registryModels.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-foreground block">{m.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground block">{m.id}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold uppercase text-[10px] text-muted-foreground">
                    {m.provider}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">
                    {(m.contextWindow / 1000).toLocaleString()}k
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${m.inputCostPer1M.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-bold">
                    ${m.outputCostPer1M.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      {m.multilingualRating}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {m.supportsToolCalling && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Tools
                        </span>
                      )}
                      {m.supportsVision && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Vision
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                {editingKey ? t("models.editCredential") : t("models.addCredential")}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("models.provider")}
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("models.priority")}
                  </label>
                  <Input 
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)}
                    className="font-mono font-bold h-9"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("models.model")}
                </label>
                <Input 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. claude-3-5-sonnet-20241022 or gemini-2.5-flash"
                  className="font-mono font-bold h-9"
                />
              </div>

              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("models.label")}
                </label>
                <Input 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Anthropic Primary Sonnet Key"
                  className="font-medium h-9"
                />
              </div>

              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("models.apiKeySecret")}
                </label>
                <Input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={editingKey ? "Leave blank to keep existing encrypted key" : "sk-ant-... or AIza..."}
                  className="font-mono text-xs h-9"
                />
              </div>

              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("models.baseUrl")}
                </label>
                <Input 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.anthropic.com/v1 (Optional)"
                  className="font-mono text-xs h-9"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ المفتاح" : "Save Credential")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
