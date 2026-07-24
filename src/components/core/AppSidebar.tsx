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
  const { isB2B, isAdmin, canAccessFullOperations, canManageAdmins, isLoading } = usePermissions();

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  if (isLoading) {
    return <Sidebar className="bg-background/50 border-r" />;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-border/70 bg-sidebar shadow-xs">
      <SidebarHeader className="flex items-center justify-between px-4 py-4 h-16 border-b border-border/60">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm text-foreground font-heading">
              Dunas Travel
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Admin Suite
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
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href={adminRoutes.dashboard} className="transition-all duration-300" />} isActive={pathname === adminRoutes.dashboard} tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OPERATIONS (Admins) */}
        {canAccessFullOperations && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.bookings} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.bookings)} tooltip="Bookings">
                    <CalendarCheck />
                    <span>Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.tours} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.tours)} tooltip="Tours & Products">
                    <Map />
                    <span>Tours & Products</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.promotions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.promotions)} tooltip="Promotions">
                    <Tag />
                    <span>Promotions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.media} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.media)} tooltip="Media Library">
                    <ImageIcon />
                    <span>Media Library</span>
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
              My Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.bookings} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.bookings)} tooltip="My Bookings">
                    <CalendarCheck />
                    <span>My Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.commissions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.commissions)} tooltip="My Commissions">
                    <Briefcase />
                    <span>My Commissions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.wallet} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.wallet)} tooltip="My Wallet">
                    <Wallet />
                    <span>My Wallet</span>
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
              Customer Relations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.customers} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.customers)} tooltip="Customers">
                    <Users />
                    <span>Customers (CRM)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.inquiries} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.inquiries)} tooltip="Inquiries & Leads">
                    <MessageSquare />
                    <span>Inquiries & Leads</span>
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
              B2B / Enterprise
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.companies} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.companies)} tooltip="Companies">
                    <Building2 />
                    <span>Companies</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.agents} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.agents)} tooltip="Agents">
                    <Users />
                    <span>Agents</span>
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
              Finance
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.commissions} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.commissions)} tooltip="Commissions">
                    <Briefcase />
                    <span>Commissions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.finance.wallet} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.finance.wallet)} tooltip="Wallets">
                    <Wallet />
                    <span>Wallets</span>
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
              System & AI
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.ai} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.ai)} tooltip="AI Concierge">
                    <Bot />
                    <span>AI Concierge</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.communications} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.communications)} tooltip="Communications">
                    <BellRing />
                    <span>Communications</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.content} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.content)} tooltip="Content & CMS">
                    <ClipboardList />
                    <span>Content & CMS</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {canManageAdmins && (
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link href={adminRoutes.audit} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.audit)} tooltip="Audit Log">
                      <ClipboardList />
                      <span>Audit Log</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={adminRoutes.roles} className="transition-all duration-300" />} isActive={pathname.startsWith(adminRoutes.roles)} tooltip="Users & Roles">
                    <ShieldCheck />
                    <span>Users & Roles</span>
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
              <SidebarMenuButton render={<Link href={adminRoutes.settings} />} tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
