"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, 
  Palette, 
  MailCheck, 
  HelpCircle, 
  MessageSquare 
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CommunicationsView } from "@/features/communications/components/CommunicationsView";
import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { ContactSubmissionsView } from "@/features/communications/components/ContactSubmissionsView";
import { CampaignBroadcastDialog } from "@/features/communications/components/CampaignBroadcastDialog";
import { VisualTemplateStudio } from "@/features/communications/components/VisualTemplateStudio";
import { useTemplates, useCreateTemplate } from "@/features/communications/hooks/useCommunications";

export default function CommunicationsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const tComm = useTranslations("communications");

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  const { data: templates } = useTemplates();
  const { mutate: createTemplate, isPending: isSavingTemplate } = useCreateTemplate();

  const handleSaveTemplate = (payload: {
    name: string;
    subject: string;
    bodyHtml: string;
    variables: string[];
  }) => {
    createTemplate(payload, {
      onSuccess: () => {
        setIsStudioOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tComm("title") || (isAr ? "المراسلات والحملات البريدية" : "Communications & Broadcast")}
        description={
          tComm("description") ||
          (isAr
            ? "إرسال الحملات والإعلانات البريدية للعملاء، متابعة سجلات التسليم، وإدارة استفسارات وتواصل العملاء."
            : "Broadcast marketing campaigns to customers, monitor delivery logs, and manage customer inquiries.")
        }
        helpTooltip={
          isAr
            ? "يمكنك إطلاق حملة بريدية تستهدف جميع المستخدمين، المشتركين بالتسويق، أو عملاء محددين، وتجربة الإرسال قبل الإطلاق."
            : "Broadcast campaigns to all users, marketing opt-ins, or custom lists, and send test emails before launching."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsStudioOpen(true)}
              className="gap-2 border-primary/30 hover:bg-primary/5 text-primary font-bold shadow-xs rounded-xl"
            >
              <Palette className="h-4 w-4" />
              <span>{isAr ? "استوديو القوالب" : "Template Studio"}</span>
            </Button>

            <Button
              onClick={() => setIsBroadcastOpen(true)}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-sm rounded-xl"
            >
              <Megaphone className="h-4 w-4" />
              <span>{isAr ? "إطلاق حملة بريدية" : "New Campaign"}</span>
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/70 border border-border/60 p-1 rounded-2xl h-auto gap-1">
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs sm:text-sm py-2 px-4 gap-2"
          >
            <MailCheck className="h-4 w-4" />
            <span>{isAr ? "سجلات الإرسال والمراقبة" : "Delivery Logs"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="inquiries"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs sm:text-sm py-2 px-4 gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{isAr ? "طلبات تفصيل الرحلات" : "Custom Trip Inquiries"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="contacts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-xl text-xs sm:text-sm py-2 px-4 gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{isAr ? "رسائل التواصل" : "Contact Submissions"}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="focus-visible:outline-hidden space-y-6">
          <CommunicationsView />
        </TabsContent>

        <TabsContent value="inquiries" className="focus-visible:outline-hidden space-y-6">
          <InquiriesView />
        </TabsContent>

        <TabsContent value="contacts" className="focus-visible:outline-hidden space-y-6">
          <ContactSubmissionsView />
        </TabsContent>
      </Tabs>

      {/* Broadcast Campaign Dialog */}
      <CampaignBroadcastDialog
        open={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        templates={templates || []}
      />

      {/* Visual Template Studio Modal */}
      <VisualTemplateStudio
        open={isStudioOpen}
        onOpenChange={setIsStudioOpen}
        onSave={handleSaveTemplate}
        isSaving={isSavingTemplate}
      />
    </div>
  );
}
