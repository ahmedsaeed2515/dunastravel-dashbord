"use client";

import { User } from "../../types";
import { ViewDetailsDrawer } from "@/components/shared/drawers/ViewDetailsDrawer";
import { Timeline, TimelineItem } from "@/components/shared/ui/Timeline";
import { format } from "date-fns";
import { Mail, Phone, CalendarDays, Shield, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSuspendUser, useActivateUser } from "../../hooks/useUsers";

interface UserDetailsDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDateSafe = (dateStr?: string | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, fmt);
  } catch {
    return "N/A";
  }
};

export function UserDetailsDrawer({ user, open, onOpenChange }: UserDetailsDrawerProps) {
  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();
  
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  if (!user) return null;

  const handleSuspend = () => {
    if (!suspendReason) return;
    suspendUser(
      { id: user.id, reason: suspendReason },
      { onSuccess: () => { setShowSuspendDialog(false); setSuspendReason(""); } }
    );
  };

  return (
    <ViewDetailsDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="User Details"
      description="View full profile and activity logs."
    >
      <div className="space-y-8">
        {/* Profile Header section */}
        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {user.phone}
              </div>
            )}
          </div>
          <div className="ml-auto">
            {user.status === "SUSPENDED" ? (
              <Badge variant="destructive" className="mb-2 block text-center font-bold">حساب موقوف</Badge>
            ) : (
              <Badge variant="outline" className="mb-2 block text-center border-green-500 text-green-600 font-bold">حساب نشط</Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-bold">
              <Shield className="h-3 w-3" /> الصلاحية والدور
            </span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="font-bold">
              {user.role === "ADMIN" ? "مدير نظام (Admin)" : user.role === "AGENT" ? "وكيل سياحي (Agent)" : user.role === "COMPANY" ? "شركة سياحية (Company)" : user.role}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-bold">
              <CalendarDays className="h-3 w-3" /> تاريخ الانضمام
            </span>
            <span className="text-sm font-bold font-mono">
              {formatDateSafe(user.createdAt)}
            </span>
          </div>
        </div>

        {/* Audit Timeline */}
        <div>
          <h4 className="text-sm font-bold mb-4 border-b pb-2">سجل العمليات والتدقيق</h4>
          <Timeline>
            <TimelineItem
              icon={<Shield className="h-4 w-4 text-primary" />}
              title="تم إنشاء الحساب"
              description={`الدور المسند: ${user.role}`}
              time={formatDateSafe(user.createdAt, "PPp")}
            />
            {user.updatedAt !== user.createdAt && (
              <TimelineItem
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                title="تم تحديث الملف الشخصي"
                time={formatDateSafe(user.updatedAt, "PPp")}
              />
            )}
          </Timeline>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-border">
        {user.status === "SUSPENDED" ? (
          <div className="space-y-4">
            <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong className="font-bold">الحساب موقوف حالياً</strong>
                <p className="mt-1 font-medium">{user.suspendReason || "لا يوجد سبب مسجل."}</p>
                <p className="mt-1 text-xs opacity-80 font-mono">تاريخ الإيقاف: {formatDateSafe(user.suspendedAt, "PPp")}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-green-500 text-green-600 hover:bg-green-50 font-bold rounded-xl"
              onClick={() => activateUser(user.id)}
              disabled={isActivating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isActivating ? "جاري التفعيل..." : "إعادة تفعيل الحساب"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!showSuspendDialog ? (
              <Button 
                variant="destructive" 
                className="w-full font-bold rounded-xl"
                onClick={() => setShowSuspendDialog(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                إيقاف الحساب مؤقتاً
              </Button>
            ) : (
              <div className="p-4 border border-destructive/20 rounded-xl bg-destructive/5 space-y-3">
                <h4 className="text-sm font-bold text-destructive">إيقاف حساب المستخدم</h4>
                <textarea 
                  className="w-full min-h-[80px] p-2 text-sm border rounded-xl"
                  placeholder="سبب الإيقاف (مطلوب)"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowSuspendDialog(false)} className="rounded-xl font-bold">إلغاء</Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={!suspendReason || isSuspending}
                    onClick={handleSuspend}
                    className="rounded-xl font-bold"
                  >
                    تأكيد الإيقاف
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ViewDetailsDrawer>
  );
}
