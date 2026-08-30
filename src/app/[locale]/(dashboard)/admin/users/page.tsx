"use client";

import { useState, Suspense } from "react";
import { UsersTable } from "@/features/users/components/UsersTable/UsersTable";
import { UserMonitoringMetricsBanner } from "@/features/users/components/UserMonitoringMetricsBanner";
import { LiveActivityStream } from "@/features/users/components/LiveActivityStream";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

export default function UserMonitoringPage() {
  const tUsers = useTranslations("users");
  const [activeMainTab, setActiveMainTab] = useState<string>("directory");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tUsers("monitoringTitle")}
        description={tUsers("monitoringDescription")}
      />

      {/* Global Live Monitoring Metrics Strip */}
      <UserMonitoringMetricsBanner />

      {/* Navigation Tabs between Users Directory, Live Activity Stream, and Suspended Accounts */}
      <Tabs
        defaultValue="directory"
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-3 w-full sm:w-[500px] h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="directory" className="text-xs font-bold gap-1.5 rounded-lg">
              <Users className="h-3.5 w-3.5" />
              <span>{tUsers("usersDirectoryTab")}</span>
            </TabsTrigger>
            <TabsTrigger value="live-stream" className="text-xs font-bold gap-1.5 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              <span>{tUsers("liveActivityTab")}</span>
            </TabsTrigger>
            <TabsTrigger value="suspended" className="text-xs font-bold gap-1.5 rounded-lg">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              <span>{tUsers("suspendedTab")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ???????? TAB 1: USERS DIRECTORY ???????? */}
        <TabsContent value="directory" className="space-y-4 pt-1">
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <UsersTable />
            </Suspense>
          </div>
        </TabsContent>

        {/* ???????? TAB 2: LIVE ACTIVITY STREAM ???????? */}
        <TabsContent value="live-stream" className="space-y-4 pt-1">
          <Suspense fallback={<TableSkeleton />}>
            <LiveActivityStream />
          </Suspense>
        </TabsContent>

        {/* ???????? TAB 3: SUSPENDED ACCOUNTS ???????? */}
        <TabsContent value="suspended" className="space-y-4 pt-1">
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <UsersTable initialStatus="SUSPENDED" />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
