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
  LogOut
} from "lucide-react";
import { authApi } from "@/features/auth/api/auth";

export function AppSidebar() {
  const pathname = usePathname();
  // const t = useTranslations("Sidebar");

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
    { title: "Tours & Trips", url: "/admin/tours", icon: Map },
    { title: "Customers", url: "/admin/users", icon: Users },
    { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
    { title: "Media Library", url: "/admin/media", icon: ImageIcon },
  ];

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
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest text-xs font-semibold text-muted-foreground/70">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={<Link href={item.url} className="transition-all duration-300" />}
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
