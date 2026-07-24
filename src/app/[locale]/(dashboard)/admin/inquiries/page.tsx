"use client";

import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { PageHeader } from "@/components/shared/PageHeader";

export default function InquiriesPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Inquiries & Leads"
        description="Manage tailor-made tour requests, client trip inquiries, sales leads, and conversion pipelines."
      />

      <InquiriesView />
    </div>
  );
}
