"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";

interface RequirePermissionProps {
  action: string;
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  action,
  resource,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <Skeleton className="w-full h-8" />;
  }

  if (!hasPermission(action, resource)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-4xl font-display font-bold text-destructive">403 Forbidden</h1>
        <p className="text-xl text-muted-foreground">You do not have permission to access this page.</p>
        <a href="/dashboard" className="text-primary hover:underline">Return to Dashboard</a>
      </div>
    );
  }

  return <>{children}</>;
}
