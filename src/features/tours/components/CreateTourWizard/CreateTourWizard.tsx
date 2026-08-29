"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import { useLocale } from "next-intl";

interface CreateTourWizardProps {
  buttonText?: string;
  className?: string;
}

export function CreateTourWizard({ buttonText, className }: CreateTourWizardProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={`h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black gap-1.5 shadow-sm text-xs rounded-xl cursor-pointer ${className || ""}`}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{buttonText || (isAr ? "إضافة رحلة جديدة (5 لغات)" : "Add New Tour (5-Lang)")}</span>
      </Button>

      <TripEditorModal
        trip={null}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

