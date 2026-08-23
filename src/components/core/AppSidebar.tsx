"use client";

import React, { memo } from "react";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
  Star,
  MessageCircle,
  Bus,
  Tag
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export const AppSidebar = memo(function AppSidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("navigation");
  const { logout } = useAuth();
  const { isB2B, isAdmin, canAccessFullOperations, canManageAdmins, canManageRoles, isLoading } = usePermissions();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      const first = pathname.split('/').filter(Boolean)[0];
      const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(first) ? first : 'ar';
      window.location.href = `/${validLocale}/login`;
    }
  };

  if (isLoading) {
    return <Sidebar className="border-e border-border bg-card" />;
  }

  // Match active state exactly
  const isActiveRoute = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/') || pathname.startsWith(href);

  // Nav item renderer
  const NavItem = ({
    href,
    icon: Icon,
    label,
    badge,
    exact = false,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
    exact?: boolean;
  }) => {
    const active = isActiveRoute(href, exact);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleNavClick}
          render={<Link href={href} className="transition-all duration-200" />}
          isActive={active}
          tooltip={label}
          className={
            active
              ? "flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-[14px] bg-linear-to-r from-amber-500/20 to-amber-600/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5 transition-all duration-200"
              : "flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-[14px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-200"
          }
        >
          <div className="flex items-center gap-3">
            <Icon
              size={20}
              className={active ? "text-amber-500 dark:text-amber-400 shrink-0" : "text-slate-400 shrink-0"}
            />
            <span>{label}</span>
          </div>
          {badge && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                active
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              {badge}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-e border-border bg-card"
    >
      {/* Logo Header with Admin Suite Badge */}
      <SidebarHeader
        className="flex items-center justify-between px-4 py-3 h-20 border-b border-border bg-card"
      >
        <Link href={adminRoutes.dashboard} className="flex items-center justify-between w-full gap-2 transition-all duration-300 hover:opacity-90">
          <img
            src="/dunas-travel-logo.png"
            alt="Dunas Travel"
            className="h-12 sm:h-14 max-h-16 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
          />
          <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 shadow-xs">
            Admin Suite
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-card px-2 py-2">

        {/* =============================== */}
        {/* 1. OPERATIONS                   */}
        {/* =============================== */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">
            {tNav("operations") || "Operations"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <NavItem href={adminRoutes.dashboard} icon={LayoutDashboard} label={tNav("dashboard")} exact />
              {canAccessFullOperations && (
                <>
                  <NavItem href={adminRoutes.bookings} icon={CalendarCheck} label={tNav("bookings")} />
                  <NavItem href={adminRoutes.inquiries} icon={Star} label={tNav("inquiries")} />
                  <NavItem href={adminRoutes.customers} icon={Users} label={tNav("customers")} />
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* B2B SELF SERVICE */}
        {isB2B && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border">
              {tNav("myOperations")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem href={adminRoutes.bookings} icon={CalendarCheck} label={tNav("myBookings")} />
                <NavItem href={adminRoutes.finance.commissions} icon={Briefcase} label={tNav("myCommissions")} />
                <NavItem href={adminRoutes.finance.wallet} icon={Wallet} label={tNav("myWallet")} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* =============================== */}
        {/* 2. CATALOG & FLEET              */}
        {/* =============================== */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border/60">
              {tNav("destinations") ? (pathname.startsWith('/ar') ? "الكتالوج والأسطول" : "Catalog & Fleet") : "Catalog & Fleet"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem href={adminRoutes.tours} icon={Map} label={tNav("tours")} />
                <NavItem href={adminRoutes.packages} icon={Package} label={tNav("packages")} />
                <NavItem href={adminRoutes.hotels} icon={Hotel} label={tNav("hotels")} />
                <NavItem href={adminRoutes.transportation} icon={Bus} label={tNav("transportation")} />
                <NavItem href={adminRoutes.destinations} icon={Compass} label={tNav("destinations")} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* =============================== */}
        {/* 3. B2B ENTERPRISE & FINANCE     */}
        {/* =============================== */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border/60">
              {tNav("b2bEnterprise")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem href={adminRoutes.companies} icon={Building2} label={tNav("companies")} />
                <NavItem href={adminRoutes.agents} icon={Users} label={tNav("agents")} />
                <NavItem href={adminRoutes.finance.commissions} icon={DollarSign} label={tNav("commissions")} />
                <NavItem href={adminRoutes.finance.wallet} icon={Wallet} label={tNav("wallets")} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* =============================== */}
        {/* 4. CONTENT & MARKETING          */}
        {/* =============================== */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border/60">
              {tNav("content")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem href={adminRoutes.content} icon={FileText} label={tNav("content")} />
                <NavItem href={adminRoutes.media} icon={Film} label={tNav("media")} />
                <NavItem href={adminRoutes.promotions} icon={Tag} label={tNav("promotions")} />
                <NavItem href={adminRoutes.reviews} icon={MessageCircle} label={tNav("reviews")} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* =============================== */}
        {/* 5. COMMUNICATIONS & AI          */}
        {/* =============================== */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border/60">
              {tNav("communications")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem href={adminRoutes.communications} icon={MessageSquare} label={tNav("communications")} />
                <NavItem href={adminRoutes.notifications} icon={Bell} label={tNav("notifications")} />
                <NavItem href={adminRoutes.ai} icon={Bot} label={tNav("aiConcierge")} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* =============================== */}
        {/* 6. GOVERNANCE & SECURITY        */}
        {/* =============================== */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 pb-1.5 text-[12px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider border-t border-border/60">
              {tNav("auditLog") ? (pathname.startsWith('/ar') ? "الحوكمة والأمان" : "Governance & Audit") : "Governance"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {canManageAdmins && (
                  <NavItem href={adminRoutes.audit} icon={ClipboardList} label={tNav("auditLog")} />
                )}
                {canManageRoles && (
                  <NavItem href={adminRoutes.roles} icon={ShieldCheck} label={tNav("usersRoles")} />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      {/* Footer — Profile, Settings & Logout */}
      <SidebarFooter className="border-t border-border p-3 bg-card">
        <SidebarMenu className="space-y-1">
          {/* Profile */}
          <NavItem href={adminRoutes.profile} icon={User} label={tNav("profile")} />

          {/* Settings */}
          {isAdmin && (
            <NavItem href={adminRoutes.settings} icon={Settings} label={tNav("settings")} />
          )}

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={tNav("logOut")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] transition-all duration-200 w-full text-red-500 dark:text-red-400 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={19} className="text-red-500 dark:text-red-400 shrink-0" />
              <span>{tNav("logOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
});
