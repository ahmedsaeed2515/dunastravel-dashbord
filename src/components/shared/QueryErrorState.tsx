"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type QueryErrorStateProps = { message: string; onRetry: () => void };

export function QueryErrorState({ message, onRetry }: QueryErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <p className="max-w-xl text-sm font-semibold text-foreground">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry} className="gap-2"><RefreshCw className="h-4 w-4" />إعادة المحاولة</Button>
    </div>
  );
}
