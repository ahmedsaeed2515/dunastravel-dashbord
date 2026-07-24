"use client";

import { useTranslations } from "next-intl";

export function useLocalizedStatus() {
  const t = useTranslations("status");

  return (status?: string | null): string => {
    if (!status) return "";
    const uppercaseKey = status.toUpperCase().trim();
    try {
      return t(uppercaseKey as any);
    } catch {
      return status;
    }
  };
}
