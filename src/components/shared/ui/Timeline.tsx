import * as React from "react";
import { cn } from "@/lib/utils";

export function Timeline({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative border-l border-border ml-3 space-y-8", className)}>
      {children}
    </div>
  );
}

interface TimelineItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  time: string;
  isLast?: boolean;
}

export function TimelineItem({ icon, title, description, time }: TimelineItemProps) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[-1.1rem] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm">
        {icon || <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <time className="text-xs text-muted-foreground whitespace-nowrap">{time}</time>
      </div>
      {description && (
        <div className="text-sm text-muted-foreground mt-1">
          {description}
        </div>
      )}
    </div>
  );
}
