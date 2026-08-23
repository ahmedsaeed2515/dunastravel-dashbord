import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";
import { Topbar } from "@/components/core/Topbar";

import { CommandPalette } from "@/components/core/CommandPalette";
import { RoutePermissionGuard } from "@/components/shared/auth/RoutePermissionGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CommandPalette />
      <AppSidebar />
      <main
        className="flex-1 flex flex-col min-h-screen overflow-hidden bg-background"
      >
        <Topbar />
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 custom-scrollbar bg-background"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <RoutePermissionGuard>{children}</RoutePermissionGuard>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}



