"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "gold" | "outline";
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  helpTooltip?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = "default",
  actions,
  children,
  className,
  helpTooltip,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-6 border-b border-border/60 mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
              {title}
            </h1>
            {helpTooltip && <PageHelpTooltip description={helpTooltip} />}
            {badge !== undefined && badge !== null && (
              <Badge variant={badgeVariant} className="font-semibold text-xs px-2.5 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
