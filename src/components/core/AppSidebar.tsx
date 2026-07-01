"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
  ClipboardList
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
    <Sidebar variant="inset" collapsible="icon" className="border-r border-white/5 shadow-sm dark:shadow-none bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="flex items-center justify-center py-6 h-20 border-b border-white/5">
        <div className="font-display font-bold text-2xl text-primary flex items-center gap-2 group-data-[collapsible=icon]:hidden transition-all duration-500">
          <span className="text-gold-500">D</span>unas
        </div>
        <div className="font-display font-bold text-2xl text-gold-500 hidden group-data-[collapsible=icon]:block transition-all duration-500 scale-110">
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
                <SidebarMenuButton render={<Link href="/dashboard" className="transition-all duration-300" />} isActive={pathname === "/dashboard"} tooltip="Dashboard">
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
                  <SidebarMenuButton render={<Link href="/admin/bookings" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/bookings")} tooltip="Bookings">
                    <CalendarCheck />
                    <span>Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/tours" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/tours")} tooltip="Tours & Products">
                    <Map />
                    <span>Tours & Products</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/media" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/media")} tooltip="Media Library">
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
                  <SidebarMenuButton render={<Link href="/admin/bookings" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/bookings")} tooltip="My Bookings">
                    <CalendarCheck />
                    <span>My Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/finance/commissions" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/finance/commissions")} tooltip="My Commissions">
                    <Briefcase />
                    <span>My Commissions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/finance/wallet" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/finance/wallet")} tooltip="My Wallet">
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
                  <SidebarMenuButton render={<Link href="/admin/users" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/users")} tooltip="Customers">
                    <Users />
                    <span>Customers (CRM)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/inquiries" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/inquiries")} tooltip="Inquiries & Leads">
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
                  <SidebarMenuButton render={<Link href="/admin/companies" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/companies")} tooltip="Companies">
                    <Building2 />
                    <span>Companies</span>
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
                  <SidebarMenuButton render={<Link href="/admin/finance/commissions" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/finance/commissions")} tooltip="Commissions">
                    <Briefcase />
                    <span>Commissions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/finance/wallet" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/finance/wallet")} tooltip="Wallets">
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
                  <SidebarMenuButton render={<Link href="/admin/ai" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/ai")} tooltip="AI Concierge">
                    <Bot />
                    <span>AI Concierge</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/communications" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/communications")} tooltip="Communications">
                    <BellRing />
                    <span>Communications</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/content" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/content")} tooltip="Content & CMS">
                    <ClipboardList />
                    <span>Content & CMS</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {canManageAdmins && (
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link href="/admin/audit" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/audit")} tooltip="Audit Log">
                      <ClipboardList />
                      <span>Audit Log</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/settings/roles" className="transition-all duration-300" />} isActive={pathname.startsWith("/admin/settings/roles")} tooltip="Users & Roles">
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
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/admin/settings" />} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
