import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "gold" | "danger" | "success";
  className?: string;
}

export function StatisticCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = "default",
  className,
}: StatisticCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/80",
        variant === "gold" && "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
        variant === "danger" && "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center [&_svg]:size-4",
            variant === "gold" && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
            variant === "danger" && "bg-rose-500/20 text-rose-600 dark:text-rose-400",
            variant === "success" && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading tracking-tight text-foreground">
          {value}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
            {trend && (
              <span
                className={cn(
                  "font-semibold px-1 py-0.2 rounded text-[11px]",
                  trend.isPositive
                    ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400"
                    : "text-rose-700 bg-rose-500/10 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
