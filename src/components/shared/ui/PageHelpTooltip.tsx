"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHelpTooltipProps {
  description: string;
  className?: string;
}

export function PageHelpTooltip({ description, className }: PageHelpTooltipProps) {
  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label="Page help"
          className={cn(
            "inline-flex items-center justify-center",
            "w-5 h-5 rounded-full",
            "text-muted-foreground/60 hover:text-amber-500",
            "hover:bg-amber-500/10 transition-colors duration-150",
            "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            "shrink-0 cursor-help",
            className
          )}
        >
          <HelpCircle className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-xs text-xs sm:text-sm leading-relaxed text-start"
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
