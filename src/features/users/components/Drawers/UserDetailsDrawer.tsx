"use client";

import { useState } from "react";
import { User, UserMonitoringDetail } from "../../types";
import {
  useUserMonitoringDetail,
  useSuspendUser,
  useActivateUser,
  useRevokeUserSessions,
  useAddUserMonitoringNote,
} from "../../hooks/useUsers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDistanceToNow } from "date-fns";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  DollarSign,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Activity,
  LogIn,
  CalendarCheck,
  HelpCircle,
  Star,
  Heart,
  FileText,
  AlertTriangle,
  Building,
  RotateCcw,
  LogOut,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Loader2,
  Edit,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface UserDetailsDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: User) => void;
}

const formatDateSafe = (dateStr?: string | Date | null, fmt = "yyyy-MM-dd HH:mm") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
};

const formatRelativeSafe = (dateStr?: string | Date | null) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
};

export function UserDetailsDrawer({
  user,
  open,
  onOpenChange,
  onEdit,
}: UserDetailsDrawerProps) {
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");

  const userId = user?.id;
  const { data: detailData, isLoading } = useUserMonitoringDetail(open && userId ? userId : null);

  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();
  const { mutate: revokeSessions, isPending: isRevoking } = useRevokeUserSessions();
  const { mutate: addNote, isPending: isAddingNote } = useAddUserMonitoringNote();

  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);

  if (!user) return null;

  const fullUser = detailData?.user || user;
  const metrics = detailData?.metrics || {
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    totalInquiries: 0,
    totalReviews: 0,
    totalFavorites: 0,
    notesCount: 0,
    documentsCount: 0,
  };
  const timeline = detailData?.activityTimeline || [];
  const bookings = detailData?.bookings || [];
  const inquiries = detailData?.inquiries || [];
  const reviews = detailData?.reviews || [];
  const notes = detailData?.notes || [];

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    suspendUser(
      { id: fullUser.id, reason: suspendReason },
      {
        onSuccess: () => {
          setShowSuspendDialog(false);
          setSuspendReason("");
        },
      }
    );
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    addNote(
      { id: fullUser.id, content: newNoteContent, noteType: "MONITORING" },
      {
        onSuccess: () => {
          setNewNoteContent("");
        },
      }
    );
  };

  const getTimelineIcon = (type: string, action: string) => {
    if (type === "AUTH" || action.includes("LOGIN")) return LogIn;
    if (type === "BOOKING") return CalendarCheck;
    if (type === "INQUIRY") return HelpCircle;
    if (type === "REVIEW") return Star;
    if (type === "FAVORITE") return Heart;
    if (action.includes("SUSPEND") || action.includes("FAILED")) return ShieldAlert;
    return Activity;
  };

  const getTimelineBadgeColor = (type: string, action: string) => {
    if (action.includes("FAILED") || action.includes("SUSPEND")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (type === "AUTH") return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (type === "BOOKING") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (type === "INQUIRY") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (type === "REVIEW") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    if (type === "FAVORITE") return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    return "text-purple-500 bg-purple-500/10 border-purple-500/20";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl sm:max-w-5xl h-[90vh] max-h-[860px] p-0 overflow-hidden flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-5 sm:p-6 border-b border-border/70 pb-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 font-extrabold text-2xl shrink-0 shadow-xs">
                  {fullUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                      {fullUser.name}
                    </DialogTitle>
                    {fullUser.isVip && (
                      <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-500 bg-amber-500/10 font-bold text-[11px]">
                        <Crown className="h-3 w-3" /> VIP
                      </Badge>
                    )}
                    <Badge
                      variant={fullUser.status === "ACTIVE" ? "outline" : "destructive"}
                      className={
                        fullUser.status === "ACTIVE"
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-xs gap-1"
                          : "font-bold text-xs gap-1"
                      }
                    >
                      {fullUser.status === "ACTIVE" ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      <span>{fullUser.status}</span>
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {fullUser.email}
                    </span>
                    {fullUser.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono dir-ltr">
                          <Phone className="h-3.5 w-3.5" />
                          {fullUser.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(fullUser as User)}
                    className="rounded-xl font-bold text-xs gap-1.5 h-9"
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                    <span>تعديل الصلاحيات</span>
                  </Button>
                )}

                {fullUser.status === "SUSPENDED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => activateUser(fullUser.id)}
                    disabled={isActivating}
                    className="rounded-xl font-bold text-xs gap-1.5 h-9 text-emerald-600 border-emerald-500/40"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>تفعيل الحساب</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowSuspendDialog(true)}
                    className="rounded-xl font-bold text-xs gap-1.5 h-9"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>إيقاف الحساب</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-border/60">
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">{tUsers("totalBookings")}</div>
                <div className="text-base font-black font-mono">{metrics.totalBookings}</div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">{tUsers("totalSpent")}</div>
                <div className="text-base font-black font-mono text-amber-500">${metrics.totalSpent.toLocaleString()}</div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">{tUsers("inquiries")}</div>
                <div className="text-base font-black font-mono">{metrics.totalInquiries}</div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">{tUsers("lastActivity")}</div>
                <div className="text-xs font-bold text-foreground truncate">
                  {fullUser.lastActiveAt ? formatRelativeSafe(fullUser.lastActiveAt) : "—"}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col p-5 sm:p-6 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-4 h-10 p-1 bg-muted/60 rounded-xl shrink-0">
                <TabsTrigger value="timeline" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  <span>{tUsers("activityTimelineTab")} ({timeline.length})</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-xs font-bold gap-1.5 rounded-lg">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{tUsers("profileTab")}</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs font-bold gap-1.5 rounded-lg">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>{tUsers("bookingsTab")} ({bookings.length})</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  <span>{tUsers("securityTab")} ({notes.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: TIMELINE */}
              <TabsContent value="timeline" className="flex-1 overflow-y-auto space-y-3 pt-3 pe-1">
                {isLoading ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Activity className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="text-sm font-semibold">{tUsers("noUserActivity")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((item) => {
                      const Icon = getTimelineIcon(item.type, item.action);
                      const colorClass = getTimelineBadgeColor(item.type, item.action);

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-card rounded-2xl border border-border/70 shadow-xs flex items-start justify-between gap-3 hover:border-amber-500/30 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-2.5 rounded-xl border ${colorClass} shrink-0 mt-0.5`}>
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-foreground">
                                  {item.title}
                                </span>
                                {item.status && (
                                  <Badge
                                    variant={item.status === "FAILED" ? "destructive" : "outline"}
                                    className="text-[10px] font-bold"
                                  >
                                    {item.status}
                                  </Badge>
                                )}
                              </div>

                              {item.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                                {item.ipAddress && (
                                  <span className="font-mono flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {item.ipAddress}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-end shrink-0">
                            <div className="text-[11px] font-semibold text-foreground">
                              {formatRelativeSafe(item.timestamp)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {formatDateSafe(item.timestamp, "yyyy-MM-dd HH:mm")}
                            </div>
                            {item.metadata && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMeta(item.metadata)}
                                className="h-6 px-1.5 text-[10px] text-amber-500 font-bold mt-1"
                              >
                                <Code className="h-3 w-3 me-1" />
                                <span>{tUsers("metadata")}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: PROFILE */}
              <TabsContent value="profile" className="flex-1 overflow-y-auto space-y-4 pt-3 pe-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                    <div className="text-xs font-black uppercase text-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-amber-500" />
                      <span>بيانات الحساب الأساسية</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">{tUsers("role")}</span>
                        <Badge variant="outline" className="font-bold text-[10px] uppercase mt-0.5">
                          {fullUser.role}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">{tUsers("registeredAt")}</span>
                        <span className="font-mono">{formatDateSafe(fullUser.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">{tUsers("nationality")}</span>
                        <span className="font-bold">{fullUser.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">{tUsers("preferredCurrency")}</span>
                        <span className="font-mono font-bold uppercase">{fullUser.preferredCurrency || "USD"}</span>
                      </div>
                    </div>
                  </div>

                  {fullUser.company && (
                    <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                      <div className="text-xs font-black uppercase text-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-blue-500" />
                        <span>{tUsers("company")}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-sm text-foreground">{fullUser.company.name}</div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          Code: #{fullUser.company.referenceCode || fullUser.company.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 3: BOOKINGS */}
              <TabsContent value="bookings" className="flex-1 overflow-y-auto space-y-3 pt-3 pe-1">
                {bookings.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-12">{tUsers("noBookings")}</p>
                ) : (
                  bookings.map((b: any) => (
                    <div key={b.id} className="p-4 bg-card border border-border/70 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-foreground flex items-center gap-2">
                          <span>{b.tourTitle || "رحلة سياحية"}</span>
                          <Badge variant="outline" className="text-[10px] font-bold">{b.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Ref: #{b.bookingReference || b.id.slice(0, 8)} • ${b.totalPrice || 0}
                        </div>
                      </div>
                      <div className="text-end text-[11px] text-muted-foreground font-mono">
                        {formatDateSafe(b.startDate || b.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* TAB 4: SECURITY & NOTES */}
              <TabsContent value="security" className="flex-1 overflow-y-auto space-y-4 pt-3 pe-1">
                {/* Active Sessions Control Card */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground">{tUsers("activeSessions")}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {tUsers("sessionsDesc")} <span className="font-mono font-bold">v{fullUser.sessionVersion || 1}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revokeSessions(fullUser.id)}
                      disabled={isRevoking}
                      className="rounded-xl font-bold text-xs gap-1.5 h-8 text-rose-500 border-rose-500/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{tUsers("revokeAllSessions")}</span>
                    </Button>
                  </div>
                </div>

                {/* Notes Form */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                  <div className="text-xs font-bold">{tUsers("adminMonitoringNotes")}</div>
                  <Textarea
                    placeholder={tUsers("writeNotePlaceholder")}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[80px] rounded-xl text-xs bg-card"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNoteContent.trim()}
                      variant="gold"
                      className="rounded-xl text-xs font-bold gap-1.5 h-8"
                    >
                      {isAddingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>إضافة ملاحظة</span>
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {notes.map((n: any) => (
                    <div key={n.id} className="p-3 bg-card border border-border/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">{n.user?.name || "مسؤول النظام"}</span>
                        <span className="font-mono">{formatDateSafe(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-foreground">{n.content}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span>{tUsers("suspendAccountTitle")}: {fullUser.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {tUsers("suspendAccountConfirmDesc")}
            </p>
            <Textarea
              placeholder={tUsers("suspendReasonRequired")}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="text-xs min-h-[80px] rounded-xl"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuspendDialog(false)}
                className="rounded-xl font-bold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || isSuspending}
                className="rounded-xl font-bold"
              >
                {isSuspending ? tCommon("loading") : tUsers("confirmSuspend")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payload Metadata Inspector Modal */}
      <Dialog open={Boolean(selectedMeta)} onOpenChange={(open) => !open && setSelectedMeta(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Code className="h-4 w-4 text-amber-500" />
              <span>{tUsers("eventDetails")}</span>
            </DialogTitle>
          </DialogHeader>
          <pre className="p-3 bg-muted/60 rounded-xl font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200 dir-ltr text-left">
            {JSON.stringify(selectedMeta, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
