"use client";

import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground text-sm font-medium">Loading content...</p>
    </div>
  );
}
