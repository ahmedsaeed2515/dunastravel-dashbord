"use client";

import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface PermissionDeniedStateProps {
  title?: string;
  description?: string;
}

export function PermissionDeniedState({
  title,
  description,
}: PermissionDeniedStateProps) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card border border-border/60 rounded-xl shadow-xs animate-in fade-in duration-300">
      <div className="bg-destructive/10 p-5 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {title || t("permissionDenied")}
      </h2>
      <p className="text-muted-foreground max-w-md mb-6 text-sm">
        {description || t("permissionDeniedDescription")}
      </p>
      <Button render={<Link href="/dashboard" />} variant="default">
        {t("returnToDashboard")}
      </Button>
    </div>
  );
}
