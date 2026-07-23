"use client";

import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { MessageSquare } from "lucide-react";

export default function InquiriesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Inquiries & Leads
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage custom tailor-made tour requests, client proposals, and lead statuses.
          </p>
        </div>
      </div>

      <InquiriesView />
    </div>
  );
}
