import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";
import { Topbar } from "@/components/core/Topbar";

import { CommandPalette } from "@/components/core/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CommandPalette />
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-background">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
