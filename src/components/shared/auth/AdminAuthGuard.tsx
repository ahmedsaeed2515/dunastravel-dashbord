"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ALLOWED_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!role || !ALLOWED_ADMIN_ROLES.includes(role)) {
      logout().finally(() => {
        router.replace("/login");
      });
    }
  }, [isLoading, isAuthenticated, user, role, router, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060D23]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-amber-400 font-medium">
            Verifying Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !role || !ALLOWED_ADMIN_ROLES.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
