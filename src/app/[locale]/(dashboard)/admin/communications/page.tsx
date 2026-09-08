"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  MessageSquare, 
  BellRing, 
  Plus, 
  Trash2, 
  Edit, 
  Megaphone, 
  Sparkles, 
  CheckCircle,
  Eye,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { CommunicationsView } from "@/features/communications/components/CommunicationsView";
import { ContactSubmissionsView } from "@/features/communications/components/ContactSubmissionsView";
import { 
  useTemplates, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
} from "@/features/communications/hooks/useCommunications";
import { VisualTemplateStudio } from "@/features/communications/components/VisualTemplateStudio";
import { CampaignBroadcastDialog } from "@/features/communications/components/CampaignBroadcastDialog";
import { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from "@/features/communications/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function CommunicationsPage() {
  const tComm = useTranslations("communications");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState("inquiries");
  
  // Visual Studio dialog state
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Broadcast Campaign dialog state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const handleCreateClick = () => {
    setEditingTemplate(null);
    setIsStudioOpen(true);
  };

  const handleEditClick = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsStudioOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`${tCommon("confirm")} ${tCommon("delete")} "${name}"?`)) {
      deleteTemplate(id);
    }
  };

  const handleTemplateSave = (payload: { name: string; subject: string; bodyHtml: string; variables: string[] }) => {
    if (editingTemplate) {
      updateTemplate({ 
        id: editingTemplate.id, 
        data: payload as UpdateEmailTemplatePayload 
      }, {
        onSuccess: () => {
          setIsStudioOpen(false);
          setEditingTemplate(null);
        }
      });
    } else {
      createTemplate(payload as CreateEmailTemplatePayload, {
        onSuccess: () => {
          setIsStudioOpen(false);
        }
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="صندوق رسائل الفريق — استفسارات العملاء حول جولات مخصصة، ورسائل التواصل، والتسعير، وقوالب البريد المرئية."
        title={tComm("title")}
        description={tComm("description")}
        actions={
          activeTab === "templates" ? (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsBroadcastOpen(true)} 
                size="sm" 
                variant="outline" 
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              >
                <Megaphone className="h-4 w-4" />
                <span>إرسال حملة بريدية</span>
              </Button>
              <Button 
                onClick={handleCreateClick} 
                size="sm" 
                variant="gold" 
                className="gap-1.5 shadow-sm shadow-amber-500/20"
              >
                <Sparkles className="h-4 w-4" />
                <span>استوديو القوالب المرئي</span>
              </Button>
            </div>
          ) : null
        }
      />

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "inquiries")} className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50 font-bold">
          <TabsTrigger value="inquiries" className="gap-2"><MessageSquare className="h-4 w-4" /> {tComm("tabInquiries")}</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2"><MessageSquare className="h-4 w-4" /> {tComm("tabInbox")}</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><Mail className="h-4 w-4" /> {tComm("tabTemplates")}</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><BellRing className="h-4 w-4" /> {tComm("tabLogs")}</TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="m-0 space-y-6">
          <InquiriesView />
        </TabsContent>

        <TabsContent value="templates" className="m-0 space-y-6">
          {/* Subheader summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/60">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>إدارة وتصميم قوالب البريد الإلكتروني الذكية</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                تُستخدم هذه القوالب مباشرة في إشعارات تأكيد الحجز، ورموز التحقق الأمني OTP، وحملات العروض التسويقية.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsBroadcastOpen(true)} 
                size="sm" 
                variant="secondary" 
                className="text-xs gap-1.5"
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span>إرسال حملة للعملاء</span>
              </Button>
              <Button 
                onClick={handleCreateClick} 
                size="sm" 
                variant="gold" 
                className="text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إنشاء قالب جديد</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTemplates ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">{tCommon("loading")}</div>
            ) : templates?.length ? (
              templates.map((template: EmailTemplate) => {
                const isVerification = template.name === "user_verification";
                const isBooking = template.name === "booking_customer_confirmation";

                return (
                  <Card 
                    key={template.id} 
                    className="hover:border-amber-500/50 transition-all duration-300 group relative rounded-2xl bg-card border-border flex flex-col justify-between overflow-hidden shadow-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isVerification && (
                            <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border-amber-500/30">
                              🔐 التحقق والـ OTP النشط
                            </Badge>
                          )}
                          {isBooking && (
                            <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                              🎟️ تأكيد الحجوزات النشط
                            </Badge>
                          )}
                          {!isVerification && !isBooking && (
                            <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                              قالب مخصص
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold tracking-tight">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-1 font-medium text-foreground/80">
                        {template.subject}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2.5 rounded-xl border border-border/40 font-mono leading-relaxed">
                        {template.bodyHtml ? template.bodyHtml.replace(/<[^>]*>?/gm, "").substring(0, 140) : "—"}
                      </div>

                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.variables.slice(0, 4).map((v) => (
                            <span 
                              key={v} 
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                          {template.variables.length > 4 && (
                            <span className="text-[10px] text-muted-foreground font-mono self-center">
                              +{template.variables.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Bottom Actions */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 font-bold px-2.5"
                          onClick={() => handleEditClick(template)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>فتح الاستوديو</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                            onClick={() => handleDeleteClick(template.id, template.name)}
                            disabled={isDeleting}
                            title="حذف القالب"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-2xl">
                {tComm("noMessages")}
              </div>
            )}

            {/* Quick Add Card */}
            <Card 
              className="hover:border-amber-500/60 transition-all duration-200 cursor-pointer group border-dashed bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center min-h-[220px] rounded-2xl"
              onClick={handleCreateClick}
            >
              <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 mb-3 group-hover:scale-110 transition-transform border border-amber-500/20 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground">إنشاء وتصميم قالب جديد ✨</h3>
              <p className="text-xs text-muted-foreground mt-1">عبر استوديو التصميم المرئي السريع</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="m-0 space-y-6">
          <ContactSubmissionsView />
        </TabsContent>

        <TabsContent value="logs" className="m-0 space-y-6">
          <CommunicationsView />
        </TabsContent>
      </Tabs>

      {/* Visual Template Studio Modal */}
      <VisualTemplateStudio 
        open={isStudioOpen}
        onOpenChange={(v) => {
          setIsStudioOpen(v);
          if (!v) setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleTemplateSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Broadcast Campaign Modal */}
      <CampaignBroadcastDialog
        open={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        templates={templates || []}
      />
    </div>
  );
}
