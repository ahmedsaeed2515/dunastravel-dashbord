"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  HelpCircle,
  MapPin,
  Wallet,
  AlertCircle,
  Loader2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  notificationsApi,
  InAppNotificationItem,
} from "@/features/notifications/api/notificationsApi";
import { formatDistanceToNow } from "date-fns";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [readFilter, setReadFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const currentLocale = pathname.split("/").filter(Boolean)[0] || "ar";
  const isAr = currentLocale === "ar";

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      if (readFilter === "UNREAD") params.isRead = "false";
      if (readFilter === "READ") params.isRead = "true";

      const res = await notificationsApi.getNotifications(params);
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
      setTotalPages(res.meta.totalPages || 1);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, readFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const handleItemClick = (item: InAppNotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.deepLink) {
      let link = item.deepLink;
      if (link.includes("/admin/crm/inquiries")) {
        link = link.replace("/admin/crm/inquiries", "/admin/inquiries");
      }
      const validLocale = ["en", "ar", "es", "pt", "it"].includes(currentLocale)
        ? currentLocale
        : "ar";
      const targetUrl = link.startsWith("/")
        ? `/${validLocale}${link}`
        : link;
      router.push(targetUrl);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BOOKING":
        return <CalendarCheck className="w-5 h-5 text-emerald-500" />;
      case "PAYMENT":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case "INQUIRY":
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
      case "TOUR":
        return <MapPin className="w-5 h-5 text-purple-500" />;
      case "WALLET":
      case "COMMISSION":
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              {isAr ? "مركز الإشعارات" : "Notifications Center"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "متابعة كافة التنبيهات والأحداث الخاصة بالحجوزات، الاستفسارات والعمليات."
                : "Monitor all system alerts, bookings, inquiries, and business events."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? "تعليم الكل كـ مقروء" : "Mark all as read"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Read Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "UNREAD", "READ"].map((status) => (
              <Button
                key={status}
                variant={readFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setReadFilter(status);
                  setPage(1);
                }}
                className="text-xs h-8 px-3 rounded-full"
              >
                {status === "ALL" && (isAr ? "الكل" : "All")}
                {status === "UNREAD" && (
                  <span className="flex items-center gap-1">
                    <span>{isAr ? "غير مقروء" : "Unread"}</span>
                    {unreadCount > 0 && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
                        {unreadCount}
                      </Badge>
                    )}
                  </span>
                )}
                {status === "READ" && (isAr ? "مقروء" : "Read")}
              </Button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
              <option value="BOOKING">{isAr ? "الحجوزات" : "Bookings"}</option>
              <option value="PAYMENT">{isAr ? "المدفوعات" : "Payments"}</option>
              <option value="INQUIRY">{isAr ? "الاستفسارات" : "Inquiries"}</option>
              <option value="TOUR">{isAr ? "الجولات" : "Tours"}</option>
              <option value="SYSTEM">{isAr ? "النظام" : "System"}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border shadow-xs overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/60">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">{isAr ? "لا توجد إشعارات متطابقة" : "No notifications found"}</p>
              <p className="text-xs opacity-70 mt-1">
                {isAr ? "ستظهر الإشعارات عند حدوث عمليات جديدة." : "New business events and alerts will appear here."}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-muted/40 ${
                  !item.isRead ? "bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-l-amber-500" : ""
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-background border border-border/80 shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0">
                        {item.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {!item.isRead ? (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title={isAr ? "تعليم كـ مقروء" : "Mark as read"}
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground opacity-50">
                      {isAr ? "مقروء" : "Read"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2">
          <span className="text-xs text-muted-foreground">
            {isAr ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-8"
            >
              {isAr ? "السابق" : "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs h-8"
            >
              {isAr ? "التالي" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
