"use client";

import * as React from "react";
import Link from "next/link";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
        <h1 className="text-4xl font-display font-bold text-destructive">403 غير مصرح بالدخول</h1>
        <p className="text-sm font-medium text-muted-foreground max-w-md">
          عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة أو المورد. You do not have permission to access this resource.
        </p>
        <Link href="/ar/admin" className="text-primary hover:underline font-bold text-sm">العودة إلى لوحة التحكم الرئيسية 🏠</Link>
      </div>
    );
  }

  return <>{children}</>;
}
