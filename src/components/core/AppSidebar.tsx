"use client";

import React, { memo, useState, useMemo, useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { adminRoutes } from "@/config/admin-routes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CalendarCheck,
  Map,
  Users,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  Briefcase,
  Wallet,
  ShieldCheck,
  Bot,
  Bell,
  ClipboardList,
  Compass,
  Hotel,
  Sparkles,
  DollarSign,
  Package,
  Film,
  FileText,
  MessageCircle,
  CarFront,
  BookOpen,
  Search,
  ChevronDown,
  HelpCircle,
  X,
  Shield,
  Layers,
  Activity,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemConfig {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: "amber" | "blue" | "emerald" | "purple" | "rose";
  exact?: boolean;
}

interface NavSectionConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavItemConfig[];
  rolesAllowed?: boolean;
}

export const AppSidebar = memo(function AppSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations("navigation");
  const { user, logout } = useAuth();
  const { isB2B, isAgent, isCompany, isAdmin, canAccessFullOperations, canManageAdmins, canManageRoles, isLoading } = usePermissions();
  const { isMobile, setOpenMobile, state } = useSidebar();

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const isAr = locale === "ar";

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    if (typeof document !== "undefined") {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;";
    }
    try {
      await logout();
    } catch {
      // Ignore error
    } finally {
      const first = pathname.split("/").filter(Boolean)[0];
      const validLocale = ["en", "ar", "es", "pt", "it"].includes(first) ? first : "ar";
      window.location.href = `/${validLocale}/login?logout=1`;
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Define navigation sections
  const sections: NavSectionConfig[] = useMemo(() => {
    if (isAgent && !isAdmin) {
      return [
        {
          id: "agent-operations",
          title: tNav("myOperations") || (isAr ? "عمليات الوكيل" : "Agent Operations"),
          icon: Briefcase,
          items: [
            { href: adminRoutes.dashboard, icon: LayoutDashboard, label: tNav("dashboard"), exact: true },
            { href: adminRoutes.inquiries, icon: HelpCircle, label: tNav("inquiries") || (isAr ? "استفسارات الرحلات" : "Inquiries"), badge: isAr ? "جديد" : "New", badgeColor: "amber" },
            { href: adminRoutes.communications, icon: MessageSquare, label: tNav("communications") || (isAr ? "المحادثات والرسائل" : "Communications") },
            { href: adminRoutes.bookings, icon: CalendarCheck, label: tNav("bookings") || (isAr ? "الحجوزات" : "Bookings") },
          ],
        },
      ];
    }

    if (isCompany && !isAdmin) {
      return [
        {
          id: "b2b-operations",
          title: tNav("myOperations") || (isAr ? "عملياتي B2B" : "My Operations"),
          icon: Briefcase,
          items: [
            { href: adminRoutes.dashboard, icon: LayoutDashboard, label: tNav("dashboard"), exact: true },
            { href: adminRoutes.bookings, icon: CalendarCheck, label: tNav("myBookings") || (isAr ? "حجوزاتي" : "My Bookings") },
            { href: adminRoutes.finance.commissions, icon: Briefcase, label: tNav("myCommissions") || (isAr ? "عمولاتي" : "My Commissions") },
            { href: adminRoutes.finance.wallet, icon: Wallet, label: tNav("myWallet") || (isAr ? "محفظتي" : "My Wallet") },
          ],
        },
      ];
    }

    if (!canAccessFullOperations) {
      return [
        {
          id: "overview",
          title: tNav("overview") || (isAr ? "نظرة عامة" : "Overview"),
          icon: LayoutDashboard,
          items: [
            { href: adminRoutes.dashboard, icon: LayoutDashboard, label: tNav("dashboard"), exact: true },
          ],
        },
      ];
    }

    return [
      {
        id: "operations",
        title: isAr ? "العمليات والرحلات" : "Operations & Catalog",
        icon: Compass,
        items: [
          { href: adminRoutes.bookings, icon: CalendarCheck, label: tNav("bookings") },
          { href: adminRoutes.inquiries, icon: HelpCircle, label: tNav("inquiries") || (isAr ? "استفسارات الرحلات" : "Inquiries"), badge: isAr ? "جديد" : "New", badgeColor: "amber" },
          { href: adminRoutes.tours, icon: Map, label: tNav("tours") },
          { href: adminRoutes.destinations, icon: Compass, label: tNav("destinations") },
          { href: adminRoutes.hotels, icon: Hotel, label: tNav("hotels") },
          { href: adminRoutes.transportation, icon: CarFront, label: tNav("transportation") },
          { href: adminRoutes.promotions, icon: Package, label: tNav("promotions") },
        ],
      },
      {
        id: "finance-b2b",
        title: isAr ? "المالية وشركاء B2B" : "Finance & B2B Partners",
        icon: DollarSign,
        items: [
          { href: adminRoutes.finance.root, icon: DollarSign, label: tNav("finance") || (isAr ? "المالية والتسويات" : "Finance & Payouts"), badge: "USD", badgeColor: "emerald" },
          { href: adminRoutes.finance.wallet, icon: Wallet, label: tNav("wallets") || (isAr ? "محافظ الشركاء" : "Partner Wallets") },
          { href: adminRoutes.finance.commissions, icon: Briefcase, label: tNav("commissions") || (isAr ? "عمولات الوكلاء" : "Commissions") },
          { href: adminRoutes.companies, icon: Building2, label: tNav("companies") },
          { href: adminRoutes.agents, icon: Briefcase, label: tNav("agents") || (isAr ? "وكلاء السفر" : "Travel Agents") },
          { href: adminRoutes.customers, icon: User, label: tNav("customers") },
        ],
      },
      {
        id: "cms-media",
        title: isAr ? "المحتوى والتسويق" : "CMS & Media Library",
        icon: Layers,
        items: [
          // { href: adminRoutes.content, icon: FileText, label: tNav("content"), badge: "CMS", badgeColor: "purple" },
          { href: adminRoutes.media, icon: Film, label: tNav("media") },
          { href: adminRoutes.mediaShowcase, icon: Sparkles, label: isAr ? "معرض الواجهة الرئيسية" : "Homepage Showcase", badge: "Live", badgeColor: "blue" },
          // { href: adminRoutes.blogs, icon: BookOpen, label: tNav("blogs") },
          { href: adminRoutes.reviews, icon: MessageCircle, label: tNav("reviews") },
        ],
      },
      {
        id: "ai-concierge",
        title: isAr ? "الذكاء الاصطناعي والتواصل" : "AI & Communications",
        icon: Bot,
        items: [
          { href: adminRoutes.ai, icon: Bot, label: tNav("aiConcierge"), badge: "AI 2.0", badgeColor: "amber" },
          { href: adminRoutes.communications, icon: MessageSquare, label: tNav("communications") },
          { href: adminRoutes.notifications, icon: Bell, label: tNav("notifications") },
        ],
      },
      {
        id: "governance",
        title: isAr ? "الحوكمة والنظام" : "System & Governance",
        icon: Shield,
        items: [
          { href: adminRoutes.users, icon: Users, label: tNav("usersMonitoring") || (isAr ? "المستخدمين والمراقبة" : "Users & Staff") },
          ...(canManageAdmins ? [{ href: adminRoutes.audit, icon: ClipboardList, label: tNav("auditLog") }] : []),
          ...(canManageRoles ? [{ href: adminRoutes.roles, icon: ShieldCheck, label: tNav("usersRoles") }] : []),
          ...(isAdmin ? [{ href: adminRoutes.settings, icon: Settings, label: tNav("settings") }] : []),
        ],
      },
    ];
  }, [isB2B, isAdmin, canAccessFullOperations, canManageAdmins, canManageRoles, tNav, isAr]);

  const cleanPath = useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname]);

  const allNavHrefs = useMemo(() => {
    const hrefs: string[] = [adminRoutes.dashboard];
    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        hrefs.push(item.href.replace(/\/$/, ""));
      });
    });
    return hrefs;
  }, [sections]);

  const isActiveRoute = (href: string, exact = false) => {
    const cleanHref = href.replace(/\/$/, "");
    if (cleanPath === cleanHref) return true;
    if (exact) return false;
    if (!cleanPath.startsWith(cleanHref + "/")) return false;

    // Do not mark parent routes active if a more specific sidebar route matches the current path
    return !allNavHrefs.some(
      (otherHref) =>
        otherHref !== cleanHref &&
        otherHref.length > cleanHref.length &&
        (cleanPath === otherHref || cleanPath.startsWith(otherHref + "/"))
    );
  };

  // Auto-expand section containing the active route on initial load or route changes
  useEffect(() => {
    sections.forEach((sec) => {
      const hasActive = sec.items.some((item) => isActiveRoute(item.href, item.exact));
      if (hasActive) {
        setCollapsedSections((prev) => ({ ...prev, [sec.id]: false }));
      }
    });
  }, [pathname, sections]);

  // Filter sections and items based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();

    return sections
      .map((sec) => {
        const matchingItems = sec.items.filter(
          (it) => it.label.toLowerCase().includes(q) || it.href.toLowerCase().includes(q) || (it.badge && it.badge.toLowerCase().includes(q))
        );
        return {
          ...sec,
          items: matchingItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [sections, searchQuery]);

  if (isLoading) {
    return <Sidebar className="border-e border-border/80 bg-card/90 backdrop-blur-xl" />;
  }

  const getBadgeStyle = (color?: string, active?: boolean) => {
    if (active) {
      return "bg-amber-500/25 text-amber-500 dark:text-amber-300 border-amber-500/40 shadow-2xs";
    }
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "purple":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "rose":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "amber":
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  const userDisplayName = user?.name || "Attia Yamany";
  const userInitials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const userRoleLabel =
    user?.role === "SUPER_ADMIN"
      ? isAr ? "المدير العام (Super Admin)" : "Executive Super Admin"
      : user?.role === "ADMIN"
      ? isAr ? "مسؤول النظام (Admin)" : "System Administrator"
      : isAr ? "شريك B2B" : "B2B Partner";

  return (
    <TooltipProvider delay={200}>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-e border-border/70 bg-card/95 backdrop-blur-2xl transition-all duration-300 select-none shadow-xs"
      >
        {/* ======================================================== */}
        {/* 1. Header: Luxury Logo & Live Status Indicator            */}
        {/* ======================================================== */}
        <SidebarHeader className="px-4 py-3.5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 border-b border-border/70 bg-card/90 backdrop-blur-md">
          <Link
            href={adminRoutes.dashboard}
            className="flex items-center justify-between group-data-[collapsible=icon]:justify-center w-full gap-2.5 group transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:justify-center">
              <div className="relative flex items-center justify-center shrink-0">
                <img
                  src="/dunas-travel-logo.png"
                  alt="Dunas Travel"
                  className="h-10 sm:h-11 group-data-[collapsible=icon]:h-8 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 shrink-0 group-data-[collapsible=icon]:hidden">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-wide text-amber-600 dark:text-amber-400 uppercase font-mono">
                Suite 2.0
              </span>
            </div>
          </Link>

          {/* Quick Search Input */}
          <div className="relative mt-2.5 group-data-[collapsible=icon]:hidden">
            <Search className="absolute inset-s-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث سريع في القوائم..." : "Quick find..."}
              className="h-8 ps-8 pe-7 text-xs bg-muted/40 hover:bg-muted/60 focus:bg-background rounded-xl border-border/60 transition-all font-medium placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </SidebarHeader>

        {/* ======================================================== */}
        {/* 2. Main Content: Executive Dashboard + Grouped Accordions */}
        {/* ======================================================== */}
        <SidebarContent className="px-2.5 group-data-[collapsible=icon]:px-1.5 py-3 group-data-[collapsible=icon]:py-2 space-y-3 group-data-[collapsible=icon]:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
          {/* Executive Dashboard Shortcut (Always at Top) */}
          <SidebarGroup className="p-0">
            <SidebarMenu>
              <SidebarMenuItem>
                {(() => {
                  const active = isActiveRoute(adminRoutes.dashboard, true);
                  return (
                    <SidebarMenuButton
                      onClick={handleNavClick}
                      render={<Link href={adminRoutes.dashboard} />}
                      isActive={active}
                      tooltip={tNav("dashboard")}
                      className={`relative flex items-center justify-between group-data-[collapsible=icon]:justify-center px-3 py-2.5 group-data-[collapsible=icon]:p-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                        active
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs before:absolute before:inset-y-1.5 before:inset-s-1 before:w-1 before:rounded-full before:bg-amber-500 group-data-[collapsible=icon]:before:hidden"
                          : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            active
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <LayoutDashboard size={16} />
                        </div>
                        <span className="truncate group-data-[collapsible=icon]:hidden">{tNav("dashboard")}</span>
                      </div>
                      <Sparkles size={13} className={`group-data-[collapsible=icon]:hidden ${active ? "text-amber-500 animate-pulse" : "text-muted-foreground/40"}`} />
                    </SidebarMenuButton>
                  );
                })()}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Render Categorized Sections */}
          {filteredSections.map((section) => {
            const isCollapsed = !searchQuery && Boolean(collapsedSections[section.id]);
            const SectionIcon = section.icon;
            const hasActiveRoute = section.items.some((item) => isActiveRoute(item.href, item.exact));

            return (
              <SidebarGroup key={section.id} className="p-0">
                {/* Subtle Divider in Collapsed Icon Mode */}
                <div className="hidden group-data-[collapsible=icon]:block my-1.5 mx-auto w-6 h-px bg-border/60" />

                {/* Section Header Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors group cursor-pointer group-data-[collapsible=icon]:hidden"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <SectionIcon className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-amber-500 transition-colors shrink-0" />
                    <span className="truncate">{section.title}</span>
                    {/* Active dot if section is collapsed but contains active route */}
                    {isCollapsed && hasActiveRoute && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-xs shrink-0" />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-3 w-3 text-muted-foreground/60 transition-transform duration-200 shrink-0 ${
                      isCollapsed ? "-rotate-90 rtl:rotate-90" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Section Items */}
                {(!isCollapsed || state === "collapsed") && (
                  <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0">
                    <SidebarMenu className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = isActiveRoute(item.href, item.exact);
                        const ItemIcon = item.icon;

                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              onClick={handleNavClick}
                              render={<Link href={item.href} />}
                              isActive={active}
                              tooltip={item.label}
                              className={`relative flex items-center justify-between group-data-[collapsible=icon]:justify-center px-3 py-2 group-data-[collapsible=icon]:p-2 rounded-xl text-xs transition-all duration-200 ${
                                active
                                  ? "font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs before:absolute before:inset-y-1.5 before:inset-s-1 before:w-1 before:rounded-full before:bg-amber-500 group-data-[collapsible=icon]:before:hidden"
                                  : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                                <div
                                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                    active
                                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                      : "bg-transparent text-muted-foreground/80 group-hover:text-foreground"
                                  }`}
                                >
                                  <ItemIcon size={15} />
                                </div>
                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold border font-mono shrink-0 transition-colors group-data-[collapsible=icon]:hidden ${getBadgeStyle(
                                    item.badgeColor,
                                    active
                                  )}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              {isAr ? "لا توجد نتائج تطابق بحثك." : "No menu items match your search."}
            </div>
          )}
        </SidebarContent>

        {/* ======================================================== */}
        {/* 3. Footer: Luxury User Profile Card & Quick Actions       */}
        {/* ======================================================== */}
        <SidebarFooter className="border-t border-border/70 p-3 group-data-[collapsible=icon]:p-2 bg-card/95 backdrop-blur-md space-y-2.5 group-data-[collapsible=icon]:space-y-0">
          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center rounded-2xl bg-muted/40 border border-border/60 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0 font-mono">
                {userInitials || "AS"}
              </div>
              <div className="min-w-0 space-y-0.5 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold text-foreground truncate leading-tight">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold truncate">
                  {userRoleLabel}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0 group-data-[collapsible=icon]:hidden">
              {/* Profile Shortcut */}
              <Link
                href={adminRoutes.profile}
                title={tNav("profile")}
                className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                <User size={14} />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title={tNav("logOut")}
                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Subtle System Status */}
          <div className="px-1 flex items-center justify-between text-[10px] font-semibold text-muted-foreground/70 font-mono group-data-[collapsible=icon]:hidden">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-500" />
              <span>{isAr ? "المنظومة نشطة" : "Operational"}</span>
            </span>
            <span>Dunas Concierge Suite</span>
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
});
