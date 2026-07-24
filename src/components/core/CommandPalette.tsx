"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Calendar, Smile, Calculator, Settings } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const tDashboard = useTranslations("dashboard");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={tCommon("searchPlaceholder")} />
      <CommandList>
        <CommandEmpty>{tCommon("noResults")}</CommandEmpty>
        <CommandGroup heading={tCommon("options")}>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/bookings'))}>
            <Calendar className="me-2 h-4 w-4" />
            <span>{tDashboard("viewBookings")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/tours'))}>
            <Smile className="me-2 h-4 w-4" />
            <span>{tDashboard("manageTours")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/inquiries'))}>
            <Calculator className="me-2 h-4 w-4" />
            <span>{tNav("inquiries")}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={tNav("settings")}>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
            <Settings className="me-2 h-4 w-4" />
            <span>{tNav("settings")}</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
