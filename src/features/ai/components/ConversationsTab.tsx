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
  X,
  Compass,
  ArrowRight,
  Headphones,
  Tag,
  Sparkles,
  ExternalLink
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
      setConversations(res?.items || []);
      if (res?.items && res.items.length > 0 && !selectedConvo) {
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
      toast.error(err?.message || "Failed to return chat to AI.");
    }
  };

  const handleSendStaffMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMessage.trim() || !selectedConvo || sendingReply) return;

    setSendingReply(true);
    try {
      await aiApi.staffReply(selectedConvo.id, staffMessage.trim());
      toast.success(isAr ? "تم إرسال الرسالة إلى المسافر بنجاح!" : "Message sent to traveler!");
      setStaffMessage("");
      handleSelectConversation(selectedConvo.id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            {isAr ? "محادثات المسافرين وصندوق الوارد" : "Traveler Inquiries & Live Inbox"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "متابعة المحادثات المباشرة بين GuideR والعملاء مع إمكانية التدخل البشري الفوري في أي لحظة."
              : "Review live conversations, traveler preferences, and take over chats in real-time."}
          </p>
        </div>

        {/* Filter & Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground"
          >
            <option value="ALL">{isAr ? "جميع المحادثات" : "All Conversations"}</option>
            <option value="ACTIVE">{isAr ? "المحادثات النشطة الآن" : "Active Live"}</option>
            <option value="HANDED_OFF">{isAr ? "تحت التدخل البشري" : "Handed to Staff"}</option>
            <option value="CLOSED">{isAr ? "المحادثات المغلقة" : "Closed"}</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            disabled={loading}
            className="h-9 text-xs font-bold gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-500" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── 3-COLUMN INBOX LAYOUT ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        {/* Left Column: Conversation List (4 Cols) */}
        <Card className="lg:col-span-4 border-border/60 bg-card shadow-xs rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-border/60 bg-muted/20 flex items-center justify-between text-xs font-bold">
            <span>{isAr ? "قائمة المسافرين" : "Traveler Queue"}</span>
            <span className="text-muted-foreground font-mono font-normal">
              {conversations.length} {isAr ? "محادثة" : "chats"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p>{isAr ? "لا توجد محادثات مسجلة في هذا القسم." : "No conversations found."}</p>
              </div>
            ) : (
              conversations.map((convo) => {
                const isSelected = selectedConvo?.id === convo.id;
                const isHandedOff = convo.status === "HANDED_OFF" || convo.status === "HUMAN_ACTIVE";

                return (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={() => handleSelectConversation(convo.id)}
                    className={`w-full p-3.5 text-left transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? "bg-purple-500/10 border-s-4 border-purple-500"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground">
                          {(convo.visitorName || "Guest").slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-foreground truncate max-w-[120px]">
                          {convo.visitorName || (isAr ? "زائر VIP" : "Traveler")}
                        </span>
                      </div>

                      {isHandedOff ? (
                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[9px]">
                          Staff
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
                          AI Active
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{convo.locale.toUpperCase()} • {convo.visitorNationality || "VIP"}</span>
                      <span>{convo.leadScore ? `Score: ${convo.leadScore}` : "New"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Center Column: Message Thread (5 Cols) */}
        <Card className="lg:col-span-5 border-border/60 bg-card shadow-xs rounded-2xl flex flex-col overflow-hidden">
          {selectedConvo ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {selectedConvo.visitorName || (isAr ? "محادثة المسافر" : "Traveler Chat")}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Session: {selectedConvo.publicSessionId?.slice(0, 12)}...
                  </span>
                </div>

                <div>
                  {selectedConvo.status === "HANDED_OFF" || selectedConvo.status === "HUMAN_ACTIVE" ? (
                    <Button
                      size="sm"
                      onClick={handleReturnToAi}
                      className="h-7 px-2 text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer gap-1"
                    >
                      <RotateCcw className="h-3 w-3 text-emerald-500" />
                      {isAr ? "إعادة للرد الآلي" : "Return to AI"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleTakeover}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] h-7 px-2.5 cursor-pointer shadow-xs gap-1"
                    >
                      <Headphones className="h-3 w-3" />
                      {isAr ? "استلام والتحدث كفريق عمل" : "Take Over"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                {(selectedConvo.messages || []).map((msg: any, idx: number) => {
                  const isUser = msg.role === "user";
                  const isStaff = msg.role === "staff";
                  const structured = msg.structuredContent || {};
                  const structuredTours = Array.isArray(structured.tours) ? structured.tours : (Array.isArray(msg.tours) ? msg.tours : []);
                  const structuredProposal = structured.proposal || msg.proposal || null;
                  const structuredComparison = structured.comparison || msg.comparison || null;
                  const responseType = structured.responseType || (structuredTours.length > 0 ? "recommendation" : "text");

                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 max-w-[88%] ${
                        isUser ? "ms-auto flex-row-reverse" : "me-auto"
                      }`}
                    >
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                          isUser ? "bg-emerald-600 text-white" : isStaff ? "bg-amber-500/20 text-amber-600" : "bg-purple-500/20 text-purple-600"
                        }`}
                      >
                        {isUser ? "👤" : isStaff ? "👔" : "👑"}
                      </div>
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed space-y-2.5 ${
                          isUser
                            ? "bg-emerald-600 text-white font-medium rounded-se-none"
                            : isStaff
                            ? "bg-amber-500/10 border border-amber-500/30 text-foreground rounded-ss-none shadow-xs"
                            : "bg-card border border-border/80 text-foreground rounded-ss-none shadow-xs"
                        }`}
                      >
                        {/* Meta badge for assistant response type & model */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-border/40 text-[10px]">
                            {isStaff ? (
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30 font-bold px-1.5 py-0">
                                {isAr ? "رد موظف" : "Staff Reply"}
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold px-1.5 py-0 capitalize">
                                  {responseType}
                                </Badge>
                                {msg.model && (
                                  <span className="text-[9px] text-muted-foreground font-mono">
                                    {msg.model}
                                  </span>
                                )}
                                {msg.latencyMs && (
                                  <span className="text-[9px] text-muted-foreground font-mono">
                                    {msg.latencyMs}ms
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        <p className="whitespace-pre-line">{msg.textContent || msg.text || ""}</p>

                        {/* Grounded Tour Recommendation Cards */}
                        {structuredTours.length > 0 && (
                          <div className="pt-2 border-t border-border/50 space-y-2">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                              <Tag className="h-3 w-3" />
                              {isAr ? "الرحلات المقترحة من الكتالوج:" : "Recommended Catalog Tours:"}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {structuredTours.map((tItem: any, tIdx: number) => (
                                <div
                                  key={tIdx}
                                  className="p-2 rounded-lg bg-background/80 border border-border flex flex-col justify-between gap-1.5 text-[11px]"
                                >
                                  <div>
                                    <h5 className="font-bold text-foreground line-clamp-1">{tItem.title}</h5>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                      <span className="flex items-center gap-0.5">
                                        <MapPin className="h-2.5 w-2.5 text-amber-500" />
                                        {tItem.destination || "Egypt"}
                                      </span>
                                      {tItem.durationDays && <span>{tItem.durationDays}d</span>}
                                      <span className="font-bold text-emerald-600">
                                        {tItem.price > 0 ? `$${tItem.price} ${tItem.currency || 'USD'}` : (isAr ? 'عند الطلب' : 'Quote')}
                                      </span>
                                    </div>
                                  </div>
                                  {tItem.publicUrl && (
                                    <a
                                      href={tItem.publicUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 hover:text-purple-700 hover:underline pt-0.5"
                                    >
                                      <span>{isAr ? "استعراض الرحلة" : "View Tour"}</span>
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Itinerary Proposal Card */}
                        {structuredProposal && (
                          <div className="pt-2 border-t border-border/50 space-y-1.5">
                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                                  <Sparkles className="h-3 w-3" />
                                  {structuredProposal.title || (isAr ? "برنامج سياحي مخصص" : "Custom Itinerary Proposal")}
                                </span>
                                {structuredProposal.durationDays && (
                                  <Badge variant="outline" className="text-[9px] bg-background">
                                    {structuredProposal.durationDays} {isAr ? "أيام" : "Days"}
                                  </Badge>
                                )}
                              </div>
                              {structuredProposal.destinations && (
                                <p className="text-[10px] text-muted-foreground">
                                  {isAr ? "الوجهات:" : "Destinations:"} {Array.isArray(structuredProposal.destinations) ? structuredProposal.destinations.join(" • ") : structuredProposal.destinations}
                                </p>
                              )}
                              {structuredProposal.days && Array.isArray(structuredProposal.days) && (
                                <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto pr-1">
                                  {structuredProposal.days.map((day: any, dIdx: number) => (
                                    <div key={dIdx} className="text-[10px] p-1.5 rounded bg-background/90 border border-border/60">
                                      <span className="font-bold text-foreground">
                                        {isAr ? `اليوم ${day.dayNumber}: ` : `Day ${day.dayNumber}: `}
                                        {day.title}
                                      </span>
                                      <p className="text-muted-foreground line-clamp-2 mt-0.5">{day.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tour Comparison Card */}
                        {structuredComparison && structuredComparison.tours && (
                          <div className="pt-2 border-t border-border/50 space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                              <Compass className="h-3 w-3" />
                              {isAr ? "مقارنة البرامج السياحية:" : "Tour Comparison:"}
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              {structuredComparison.tours.map((cTour: any, cIdx: number) => (
                                <div key={cIdx} className="p-2 rounded bg-background/80 border border-border">
                                  <h6 className="font-bold text-foreground line-clamp-1">{cTour.title}</h6>
                                  <p className="text-muted-foreground mt-0.5">
                                    {cTour.durationDays ? `${cTour.durationDays}d • ` : ""}
                                    {cTour.price > 0 ? `$${cTour.price}` : "On Request"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Staff Reply Bar */}
              <form onSubmit={handleSendStaffMessage} className="p-2.5 border-t border-border/60 bg-card flex gap-2">
                <Input
                  value={staffMessage}
                  onChange={(e) => setStaffMessage(e.target.value)}
                  placeholder={isAr ? "اكتب ردك المباشر كأحد مستشاري السفر..." : "Reply as a travel consultant..."}
                  className="text-xs h-9 bg-background"
                />
                <Button
                  type="submit"
                  disabled={sendingReply || !staffMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-3 shrink-0 cursor-pointer shadow-xs gap-1"
                >
                  <Send className="h-3 w-3" />
                  <span>{isAr ? "إرسال" : "Send"}</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
              {isAr ? "اختر محادثة من القائمة لاستعراض التفاصيل." : "Select a conversation to view transcript."}
            </div>
          )}
        </Card>

        {/* Right Column: Traveler Context & Booking Intent (3 Cols) */}
        <Card className="lg:col-span-3 border-border/60 bg-card shadow-xs rounded-2xl p-4 space-y-4 overflow-y-auto">
          <div className="border-b border-border/60 pb-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <User className="h-4 w-4 text-emerald-500" />
              {isAr ? "بيانات المسافر واهتماماته" : "Traveler Profile & Intent"}
            </h4>
          </div>

          {selectedConvo ? (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "الاسم" : "Name"}</span>
                <p className="font-bold text-foreground">{selectedConvo.visitorName || "Guest Traveler"}</p>
              </div>

              {selectedConvo.visitorEmail && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                  <p className="font-mono text-foreground">{selectedConvo.visitorEmail}</p>
                </div>
              )}

              {selectedConvo.visitorPhone && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "الهاتف" : "Phone"}</span>
                  <p className="font-mono text-foreground">{selectedConvo.visitorPhone}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "الجنسية واللغة" : "Nationality & Lang"}</span>
                <p className="text-foreground">{selectedConvo.visitorNationality || "International"} ({selectedConvo.locale.toUpperCase()})</p>
              </div>

              {selectedConvo.budgetRange && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "الميزانية المتوقعة" : "Budget Range"}</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedConvo.budgetRange}</p>
                </div>
              )}

              <div className="pt-2 border-t border-border/40 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{isAr ? "درجة اهتمام العميل (Lead Score)" : "Lead Score"}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(selectedConvo.leadScore || 50, 100)}%` }}
                    />
                  </div>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedConvo.leadScore || 50}/100
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              {isAr ? "لا توجد بيانات متاحة." : "No profile selected."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
