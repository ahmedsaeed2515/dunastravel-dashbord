"use client";

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
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Map, 
  Users, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  LogOut,
  Building2,
  Briefcase,
  Wallet,
  ShieldCheck,
  Bot,
  BellRing,
  ClipboardList,
  Tag
} from "lucide-react";
import { authApi } from "@/features/auth/api/auth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppSidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const { isB2B, isAdmin, canAccessFullOperations, canManageAdmins, isLoading } = usePermissions();

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  if (isLoading) {
    return <Sidebar className="bg-background/50 border-e" />;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-e border-border/70 bg-sidebar shadow-xs">
      <SidebarHeader className="flex items-center justify-between px-4 py-4 h-16 border-b border-border/60">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm text-foreground font-heading">
              {tCommon("appName")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {tCommon("adminSuite")}
            </span>
          </div>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex w-8 h-8 rounded-lg bg-primary items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
          D
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* OVERVIEW */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
            {tNav("overview")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href={adminRoutes.dashboard} className="transition-all duration-300" />} isActive={pathname === adminRoutes.dashboard} tooltip={tNav("dashboard")}>
                  <LayoutDashboard />
                  <span>{tNav("dashboard")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OPERATIONS (Admins) */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("operations")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.bookings} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.bookings)} tooltip={tNav("bookings")}>
                    <CalendarCheck />
                    <span>{tNav("bookings")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.tours} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.tours)} tooltip={tNav("tours")}>
                    <Map />
                    <span>{tNav("tours")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.promotions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.promotions)} tooltip={tNav("promotions")}>
                    <Tag />
                    <span>{tNav("promotions")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.media} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.media)} tooltip={tNav("media")}>
                    <ImageIcon />
                    <span>{tNav("media")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* B2B SELF SERVICE (Companies & Agents) */}
        {isB2B && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("myOperations")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.bookings} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.bookings)} tooltip={tNav("myBookings")}>
                    <CalendarCheck />
                    <span>{tNav("myBookings")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.commissions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.commissions)} tooltip={tNav("myCommissions")}>
                    <Briefcase />
                    <span>{tNav("myCommissions")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.wallet} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.wallet)} tooltip={tNav("myWallet")}>
                    <Wallet />
                    <span>{tNav("myWallet")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* CUSTOMER RELATIONS */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("customerRelations")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.customers} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.customers)} tooltip={tNav("customers")}>
                    <Users />
                    <span>{tNav("customers")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.inquiries} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.inquiries)} tooltip={tNav("inquiries")}>
                    <MessageSquare />
                    <span>{tNav("inquiries")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* B2B ENTERPRISE */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("b2bEnterprise")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.companies} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.companies)} tooltip={tNav("companies")}>
                    <Building2 />
                    <span>{tNav("companies")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.agents} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.agents)} tooltip={tNav("agents")}>
                    <Users />
                    <span>{tNav("agents")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* FINANCE */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("finance")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.commissions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.commissions)} tooltip={tNav("commissions")}>
                    <Briefcase />
                    <span>{tNav("commissions")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.wallet} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.wallet)} tooltip={tNav("wallets")}>
                    <Wallet />
                    <span>{tNav("wallets")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* SYSTEM & AI */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              {tNav("systemAi")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.ai} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.ai)} tooltip={tNav("aiConcierge")}>
                    <Bot />
                    <span>{tNav("aiConcierge")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.communications} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.communications)} tooltip={tNav("communications")}>
                    <BellRing />
                    <span>{tNav("communications")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.content} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.content)} tooltip={tNav("content")}>
                    <ClipboardList />
                    <span>{tNav("content")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {canManageAdmins && (
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link href={adminRoutes.audit} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.audit)} tooltip={tNav("auditLog")}>
                      <ClipboardList />
                      <span>{tNav("auditLog")}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.roles} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.roles)} tooltip={tNav("usersRoles")}>
                    <ShieldCheck />
                    <span>{tNav("usersRoles")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href={adminRoutes.settings} />} tooltip={tNav("settings")}>
                <Settings />
                <span>{tNav("settings")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>{tNav("logOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
