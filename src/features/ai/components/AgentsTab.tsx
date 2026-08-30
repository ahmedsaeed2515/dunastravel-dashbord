"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Shield, 
  Cpu, 
  Languages, 
  Layers, 
  Check, 
  X, 
  Sliders, 
  Settings2,
  Calendar,
  DollarSign,
  Compass,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { AgentItemData, aiApi } from "../api/aiApi";
import { ModelSelector } from "./ModelSelector";

interface AgentsTabProps {
  agents: AgentItemData[];
  onRefresh: () => void;
  onNavigateToLab: (agentSlug: string) => void;
  t: any;
  isAr: boolean;
}

export function AgentsTab({
  agents,
  onRefresh,
  onNavigateToLab,
  t,
  isAr,
}: AgentsTabProps) {
  const [editingAgent, setEditingAgent] = useState<AgentItemData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [role, setRole] = useState("Travel Concierge");
  const [avatar, setAvatar] = useState("👑");
  const [primaryModel, setPrimaryModel] = useState("claude-3-5-sonnet-20241022");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [personalityGuidelines, setPersonalityGuidelines] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [allowedSources, setAllowedSources] = useState<string[]>(["tours", "destinations", "policies"]);
  const [allowedTools, setAllowedTools] = useState<string[]>(["search_catalog", "check_availability", "tailor_itinerary"]);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingAgent(null);
    setSlug(`agent-${Date.now().toString(36)}`);
    setNameEn("VIP Luxury Advisor");
    setNameAr("مستشار الرحلات الملكية VIP");
    setDescEn("Dedicated advisor for custom VIP tour planning.");
    setDescAr("مستشار مخصص لتخطيط الرحلات الفاخرة لكبار الشخصيات.");
    setRole("VIP Concierge");
    setAvatar("💎");
    setPrimaryModel("claude-3-5-sonnet-20241022");
    setTemperature(0.7);
    setMaxTokens(1200);
    setPersonalityGuidelines("Refined, attentive, and knowledgeable about exclusive Egyptian luxury.");
    setSystemPrompt("You are a bespoke luxury travel designer for Dunas Travel.");
    setAllowedSources(["tours", "destinations", "policies", "hotels"]);
    setAllowedTools(["search_catalog", "check_availability", "tailor_itinerary"]);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (agent: AgentItemData) => {
    setEditingAgent(agent);
    setSlug(agent.slug);
    setNameEn(agent.nameJsonb?.en || agent.displayName || "");
    setNameAr(agent.nameJsonb?.ar || "");
    setDescEn(agent.descriptionJsonb?.en || agent.displayDescription || "");
    setDescAr(agent.descriptionJsonb?.ar || "");
    setRole(agent.role || "Travel Concierge");
    setAvatar(agent.avatar || "🤖");
    setPrimaryModel(agent.primaryModel || "claude-3-5-sonnet-20241022");
    setTemperature(agent.temperature ?? 0.7);
    setMaxTokens(agent.maxTokens ?? 1024);
    setPersonalityGuidelines(agent.personalityGuidelines || "");
    setSystemPrompt(agent.systemPrompt || "");
    setAllowedSources(agent.allowedSources || ["tours", "destinations"]);
    setAllowedTools(agent.allowedTools || ["search_catalog"]);
    setIsActive(agent.isActive);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !nameEn.trim()) {
      toast.error(isAr ? "يرجى كتابة المعرف البرمجي واسم الوكيل." : "Slug and Name are required.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<AgentItemData> = {
        slug: slug.trim().toLowerCase(),
        nameJsonb: {
          en: nameEn.trim(),
          ar: nameAr.trim() || nameEn.trim(),
          es: nameEn.trim(),
          pt: nameEn.trim(),
          it: nameEn.trim(),
        },
        descriptionJsonb: {
          en: descEn.trim(),
          ar: descAr.trim() || descEn.trim(),
          es: descEn.trim(),
          pt: descEn.trim(),
          it: descEn.trim(),
        },
        role: role.trim(),
        avatar: avatar.trim(),
        primaryModel,
        temperature,
        maxTokens,
        personalityGuidelines,
        systemPrompt,
        allowedSources,
        allowedTools,
        isActive,
      };

      if (editingAgent) {
        await aiApi.updateAgent(editingAgent.id, payload);
        toast.success(isAr ? "تم تحديث بيانات الوكيل بنجاح!" : "Agent updated successfully!");
      } else {
        await aiApi.createAgent(payload);
        toast.success(isAr ? "تم إنشاء الوكيل الذكي بنجاح!" : "New agent created successfully!");
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to save agent.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, agentSlug: string) => {
    if (agentSlug === 'guider') {
      toast.error(isAr ? "لا يمكن حذف الوكيل الأساسي GuideR." : "The core GuideR agent cannot be deleted.");
      return;
    }

    if (!confirm(t("agents.confirmDelete"))) return;

    setDeletingId(id);
    try {
      await aiApi.deleteAgent(id);
      toast.success(isAr ? "تم حذف الوكيل بنجاح." : "Agent deleted successfully.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete agent.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSource = (source: string) => {
    if (allowedSources.includes(source)) {
      setAllowedSources(allowedSources.filter((s) => s !== source));
    } else {
      setAllowedSources([...allowedSources, source]);
    }
  };

  const toggleTool = (tool: string) => {
    if (allowedTools.includes(tool)) {
      setAllowedTools(allowedTools.filter((t) => t !== tool));
    } else {
      setAllowedTools([...allowedTools, tool]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-amber-500" />
            {t("agents.title")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("agents.subtitle")}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("agents.newAgent")}
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id || agent.slug} 
            className="border-border/60 bg-card hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xl flex items-center justify-center shadow-xs">
                    {agent.avatar || "🤖"}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {agent.displayName || agent.nameJsonb?.en || agent.slug}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      @{agent.slug} • {agent.role}
                    </span>
                  </div>
                </div>

                <Badge 
                  variant="outline" 
                  className={`text-[10px] font-bold ${
                    agent.isActive 
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {agent.isActive ? t("agents.active") : t("agents.inactive")}
                </Badge>
              </div>

              <CardDescription className="text-xs mt-2 line-clamp-2">
                {agent.displayDescription || agent.descriptionJsonb?.en || agent.personalityGuidelines || "Luxury travel specialist."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Model & Temperature Info */}
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Cpu className="h-3 w-3 text-amber-500" /> {t("agents.primaryModel")}:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {agent.primaryModel.split('-').slice(0, 3).join('-')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Sliders className="h-3 w-3 text-blue-500" /> {isAr ? "الحرارة الإبداعية" : "Temperature"}:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {agent.temperature ?? 0.7}
                  </span>
                </div>
              </div>

              {/* Allowed Sources Badges */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("agents.allowedSources")}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(agent.allowedSources || ["tours", "destinations"]).map((src) => (
                    <span key={src} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToLab(agent.slug)}
                  className="flex-1 text-[11px] font-bold border-border/80 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 h-8 gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {t("agents.testAgent")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(agent)}
                  className="h-8 w-8 p-0 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                {agent.slug !== 'guider' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(agent.id, agent.slug)}
                    disabled={deletingId === agent.id}
                    className="h-8 w-8 p-0 border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-amber-500" />
                {editingAgent ? t("agents.editAgent") : t("agents.newAgent")}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Avatar Icon */}
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.avatar")}
                  </label>
                  <Input 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)} 
                    placeholder="👑 or 💎"
                    className="text-lg font-bold text-center h-10"
                  />
                </div>

                {/* Slug */}
                <div className="sm:col-span-2">
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.agentSlug")}
                  </label>
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="e.g. vip_sales_concierge"
                    disabled={editingAgent?.slug === 'guider'}
                    className="font-mono font-bold h-10"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.agentName")} (EN)
                  </label>
                  <Input 
                    value={nameEn} 
                    onChange={(e) => setNameEn(e.target.value)} 
                    placeholder="Royal Luxury Concierge"
                    className="font-bold h-10"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.agentName")} (AR)
                  </label>
                  <Input 
                    value={nameAr} 
                    onChange={(e) => setNameAr(e.target.value)} 
                    placeholder="الكونسيرج الملكي الفاخر"
                    className="font-bold h-10"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("agents.role")}
                </label>
                <Input 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="e.g. VIP Travel Designer & Cruise Specialist"
                  className="font-medium h-10"
                />
              </div>

              {/* Model Selector Component */}
              <ModelSelector
                provider="anthropic"
                value={primaryModel}
                onChange={(m) => setPrimaryModel(m)}
                label={t("agents.primaryModel")}
                isAr={isAr}
              />

              {/* Temperature & Max Tokens */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.temperature")}: <span className="font-mono text-amber-500 font-bold">{temperature}</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {t("agents.maxTokens")}
                  </label>
                  <Input 
                    type="number"
                    value={maxTokens} 
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 1024)} 
                    className="font-mono font-bold h-10"
                  />
                </div>
              </div>

              {/* Allowed Knowledge Sources */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1.5">
                  {t("agents.allowedSources")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["tours", "destinations", "policies", "hotels", "transportation"].map((src) => {
                    const selected = allowedSources.includes(src);
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleSource(src)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selected
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-amber-500" />}
                        <span className="capitalize">{src}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permitted Tools */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1.5">
                  {t("agents.allowedTools")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["search_catalog", "check_availability", "tailor_itinerary", "book_tour", "escalate_to_human", "translate_hieroglyphics"].map((tool) => {
                    const selected = allowedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selected
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 shadow-xs"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-blue-500" />}
                        <code>{tool}</code>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personality Guidelines */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("agents.personalityGuidelines")}
                </label>
                <Textarea 
                  value={personalityGuidelines} 
                  onChange={(e) => setPersonalityGuidelines(e.target.value)} 
                  rows={3}
                  placeholder="e.g. Speak with white-glove executive hospitality, highlight presidential suites and private Nile dahabiyas..."
                  className="font-medium text-xs resize-none"
                />
              </div>

              {/* System Prompt Instructions */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("agents.systemPrompt")}
                </label>
                <Textarea 
                  value={systemPrompt} 
                  onChange={(e) => setSystemPrompt(e.target.value)} 
                  rows={4}
                  placeholder="You are the specialized AI Concierge for Dunas Travel..."
                  className="font-mono text-xs"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : t("agents.saveAgent")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
