"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/5 border border-destructive/20 rounded-xl my-4">
      <div className="p-3 bg-destructive/10 rounded-full mb-3">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || t("somethingWentWrong")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {message || t("unexpectedErrorOccurred")}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
