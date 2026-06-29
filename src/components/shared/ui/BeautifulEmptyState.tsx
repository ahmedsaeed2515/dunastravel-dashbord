import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeautifulEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function BeautifulEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: BeautifulEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4 animate-in fade-in duration-500">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <Icon className="w-16 h-16 text-muted-foreground opacity-50" strokeWidth={1} />
      </div>
      <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
