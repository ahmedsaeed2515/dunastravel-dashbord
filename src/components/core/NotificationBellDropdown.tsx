"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  notificationsApi,
  InAppNotificationItem,
} from "@/features/notifications/api/notificationsApi";
import { formatDistanceToNow } from "date-fns";
import { playNotificationSound } from "@/lib/sound";

export function NotificationBellDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  const isInitializedRef = useRef<boolean>(false);
  const prevUnreadCountRef = useRef<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications({ limit: 10 });
      const newUnread = res?.unreadCount ?? 0;
      setNotifications(res?.items ?? []);
      
      if (isInitializedRef.current && newUnread > prevUnreadCountRef.current) {
        playNotificationSound();
      }
      
      setUnreadCount(newUnread);
      prevUnreadCountRef.current = newUnread;
      isInitializedRef.current = true;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for near-real-time delivery
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => {
        const updated = Math.max(0, prev - 1);
        prevUnreadCountRef.current = updated;
        return updated;
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleItemClick = (item: InAppNotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);

    if (item.deepLink) {
      let link = item.deepLink;
      if (link.includes("/admin/crm/inquiries")) {
        link = link.replace("/admin/crm/inquiries", "/admin/inquiries");
      }
      const currentLocale = pathname.split("/").filter(Boolean)[0] || "ar";
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
        return <CalendarCheck className="w-4 h-4 text-emerald-500" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "INQUIRY":
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case "TOUR":
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case "WALLET":
      case "COMMISSION":
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  const currentLocale = pathname.split("/").filter(Boolean)[0] || "ar";
  const validLocale = ["en", "ar", "es", "pt", "it"].includes(currentLocale)
    ? currentLocale
    : "ar";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative p-2 rounded-xl bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer shadow-2xs"
          title="Notifications / الإشعارات"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse z-10">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl border border-border/80 bg-background/95 backdrop-blur-md z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">
              {validLocale === "ar" ? "الإشعارات" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                {unreadCount} {validLocale === "ar" ? "جديد" : "new"}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-primary gap-1 h-7 px-2"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{validLocale === "ar" ? "قراءة الكل" : "Mark all read"}</span>
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs">{validLocale === "ar" ? "جاري التحميل..." : "Loading notifications..."}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">
                {validLocale === "ar" ? "لا توجد إشعارات حالياً" : "No new notifications"}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !item.isRead ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                }`}
              >
                <div className="p-2 rounded-xl bg-background border border-border/60 shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              router.push(`/${validLocale}/admin/notifications`);
            }}
            className="w-full text-xs text-primary hover:text-primary/80 gap-1 h-8 justify-center font-medium"
          >
            <span>{validLocale === "ar" ? "عرض جميع الإشعارات" : "View all notifications"}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
