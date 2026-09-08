"use client";

import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function InquiriesPage() {
  const tInquiries = useTranslations("inquiries");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="صندوق رسائل الفريق — استفسارات العملاء حول جولات مخصصة، ورسائل التواصل والتسعير."
        title={tInquiries("title")}
        description={tInquiries("description")}
      />

      <InquiriesView />
    </div>
  );
}
