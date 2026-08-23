"use client";

import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionDeniedState } from "@/components/shared/ui/PermissionDeniedState";
import { Skeleton } from "@/components/ui/skeleton";

export function RoutePermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAccessRoute, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!canAccessRoute(pathname)) {
    return <PermissionDeniedState />;
  }

  return <>{children}</>;
}
