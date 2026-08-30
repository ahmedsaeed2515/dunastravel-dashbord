"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  UserCheck, 
  Bot, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  RefreshCw,
  User,
  ShieldCheck,
  X
} from "lucide-react";
import { toast } from "sonner";
import { ConversationDetailData, ConversationListItem, aiApi } from "../api/aiApi";

interface ConversationsTabProps {
  onRefreshOverview: () => void;
  t: any;
  isAr: boolean;
}

export function ConversationsTab({ onRefreshOverview, t, isAr }: ConversationsTabProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState<ConversationDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getConversations({
        limit: 25,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setConversations(res.items || []);
      if (res.items?.length > 0 && !selectedConvo) {
        handleSelectConversation(res.items[0].id);
      }

    } catch (err: any) {
      toast.error(err?.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const handleSelectConversation = async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await aiApi.getConversationDetail(id);
      setSelectedConvo(detail);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load conversation transcript.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConvo) return;
    try {
      await aiApi.takeoverConversation(selectedConvo.id);
      toast.success(isAr ? "تم استلام المحادثة بنجاح! تم إيقاف الرد الآلي للذكاء الاصطناعي." : "Chat taken over! Autonomous AI replies paused for this traveler.");
      handleSelectConversation(selectedConvo.id);
      fetchConversations();
      onRefreshOverview();
    } catch (err: any) {
      toast.error(err?.message || "Failed to take over chat.");
    }
  };

  const handleReturnToAi = async () => {
    if (!selectedConvo) return;
    try {
      await aiApi.returnToAi(selectedConvo.id);
      toast.success(isAr ? "تمت إعادة المحادثة للذكاء الاصطناعي بنجاح." : "Returned to autonomous AI management.");
      handleSelectConversation(selectedConvo.id);
      fetchConversations();
      onRefreshOverview();
    } catch (err: any) {
      toast.error(err?.message || "Failed to return to AI.");
    }
  };

  const handleResolve = async () => {
    if (!selectedConvo) return;
    try {
      await aiApi.resolveConversation(selectedConvo.id);
      toast.success(isAr ? "تم إنهاء وإغلاق المحادثة بنجاح." : "Conversation resolved and closed.");
      handleSelectConversation(selectedConvo.id);
      fetchConversations();
      onRefreshOverview();
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve conversation.");
    }
  };

  const handleSendStaffReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvo || !staffMessage.trim()) return;

    setSendingReply(true);
    try {
      await aiApi.staffReply(selectedConvo.id, staffMessage.trim());
      setStaffMessage("");
      toast.success(isAr ? "تم إرسال الرد بنجاح للمسافر!" : "Staff reply sent to traveler!");
      handleSelectConversation(selectedConvo.id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send staff reply.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            {t("conversations.title")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("conversations.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold"
          >
            <option value="ALL">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="ACTIVE">Active (AI Autonomous)</option>
            <option value="HUMAN_ACTIVE">Human Active (Staff)</option>
            <option value="HANDED_OFF">Handed Off</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            disabled={loading}
            className="h-9 text-xs font-bold border-border/80 hover:bg-muted cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Sessions List vs Live Transcript Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-500 mb-2" />
              {isAr ? "جاري تحميل المحادثات..." : "Loading live chats..."}
            </div>
          ) : conversations.length === 0 ? (
            <Card className="border-border/60 p-8 text-center text-muted-foreground text-xs">
              {t("conversations.noConversations")}
            </Card>
          ) : (
            conversations.map((c) => {
              const isSelected = selectedConvo?.id === c.id;
              const isHuman = c.status === "HUMAN_ACTIVE";
              const isQualified = c.leadStatus === "QUALIFIED";

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-blue-500/60 bg-blue-500/10 shadow-sm"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold text-xs">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {c.visitorName || (isAr ? "مسافر غير معروف" : "Anonymous Traveler")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          {c.locale?.toUpperCase()} • {new Date(c.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isQualified && (
                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[9px]">
                          VIP Lead
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          isHuman
                            ? "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isHuman ? "Staff Active" : "AI GuideR"}
                      </Badge>
                    </div>
                  </div>

                  {c.messages && c.messages.length > 0 && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {c.messages[0]?.textContent || "..."}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Drawer: Transcript & Live Staff Controls (7 cols) */}
        <div className="lg:col-span-7">
          {selectedConvo ? (
            <Card className="border-border/60 bg-card shadow-md flex flex-col h-[700px]">
              {/* Drawer Top Header */}
              <CardHeader className="pb-3 border-b border-border/60 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold text-foreground">
                        {selectedConvo.visitorName || (isAr ? "المسافر" : "Traveler Session")}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {selectedConvo.locale?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      {selectedConvo.visitorEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {selectedConvo.visitorEmail}
                        </span>
                      )}
                      {selectedConvo.visitorPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {selectedConvo.visitorPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Takeover / Return Buttons */}
                  <div className="flex items-center gap-1.5">
                    {selectedConvo.status === "HUMAN_ACTIVE" ? (
                      <Button
                        size="sm"
                        onClick={handleReturnToAi}
                        variant="outline"
                        className="text-xs font-bold border-border/80 h-8 gap-1 cursor-pointer"
                      >
                        <Bot className="h-3.5 w-3.5 text-blue-500" />
                        {t("conversations.returnToAiBtn")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleTakeover}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 gap-1 cursor-pointer shadow-xs"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {t("conversations.takeoverBtn")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleResolve}
                      variant="ghost"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {t("conversations.resolveBtn")}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Message Transcript Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 text-xs">
                {selectedConvo.messages?.map((msg: any) => {
                  const isUser = msg.role === "user";
                  const isStaff = msg.role === "staff";
                  const isAi = msg.role === "assistant";


                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
                        {isUser ? (
                          <span className="font-bold">{selectedConvo.visitorName || "Traveler"}</span>
                        ) : isStaff ? (
                          <span className="font-bold text-purple-600 dark:text-purple-400">Staff Specialist</span>
                        ) : (
                          <span className="font-bold text-amber-600 dark:text-amber-400">GuideR AI Concierge</span>
                        )}
                        <span>• {new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          isUser
                            ? "bg-card border border-border/80 text-foreground rounded-tl-xs"
                            : isStaff
                            ? "bg-purple-600 text-white rounded-tr-xs shadow-xs font-medium"
                            : "bg-amber-500/15 border border-amber-500/30 text-foreground rounded-tr-xs font-medium"
                        }`}
                      >
                        {msg.textContent}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Staff Direct Reply Box */}
              <form onSubmit={handleSendStaffReply} className="p-3 border-t border-border/60 bg-card shrink-0 flex gap-2">
                <Input
                  value={staffMessage}
                  onChange={(e) => setStaffMessage(e.target.value)}
                  placeholder={t("conversations.staffReplyPlaceholder")}
                  className="flex-1 text-xs h-10 font-medium"
                />
                <Button
                  type="submit"
                  disabled={sendingReply || !staffMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("conversations.sendReply")}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="border-border/60 p-12 text-center text-muted-foreground text-xs h-[700px] flex items-center justify-center">
              {isAr ? "حدد محادثة من القائمة لعرض سجل الرسائل." : "Select a conversation to view transcript and manage live takeover."}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
