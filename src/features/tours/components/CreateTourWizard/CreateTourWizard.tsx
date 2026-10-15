"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateTourWizardProps {
  buttonText?: string;
  className?: string;
}

/**
 * "Add new trip" entry point used in the tours table toolbar.
 *
 * Navigates to the full-page trip editor (`/[locale]/admin/tours/new`) instead
 * of opening a dialog, matching the main page-header button.
 */
export function CreateTourWizard({ buttonText, className }: CreateTourWizardProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Button
      onClick={() => router.push(`/${locale}/admin/tours/new`)}
      className={`h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black gap-1.5 shadow-sm text-xs rounded-xl cursor-pointer ${className || ""}`}
    >
      <Plus className="h-3.5 w-3.5" />
      <span>{buttonText || (isAr ? "إضافة رحلة جديدة (5 لغات)" : "Add New Tour (5-Lang)")}</span>
    </Button>
  );
}
