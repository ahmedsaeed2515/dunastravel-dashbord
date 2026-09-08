"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, MessageSquare, BellRing, Smartphone, Plus, Trash2, Edit } from "lucide-react";
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
import { CreateTemplateDialog } from "@/features/communications/components/CreateTemplateDialog";
import { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from "@/features/communications/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { format } from "date-fns";

export default function CommunicationsPage() {
  const tComm = useTranslations("communications");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");

  const [activeTab, setActiveTab] = useState("inquiries");
  
  // Template dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const handleCreateClick = () => {
    setEditingTemplate(null);
    setIsTemplateDialogOpen(true);
  };

  const handleEditClick = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`${tCommon("confirm")} ${tCommon("delete")} "${name}"?`)) {
      deleteTemplate(id);
    }
  };

  const handleTemplateSubmit = (payload: CreateEmailTemplatePayload | UpdateEmailTemplatePayload) => {
    if (editingTemplate) {
      updateTemplate({ id: editingTemplate.id, data: payload as UpdateEmailTemplatePayload }, {
        onSuccess: () => {
          setIsTemplateDialogOpen(false);
          setEditingTemplate(null);
        }
      });
    } else {
      createTemplate(payload as CreateEmailTemplatePayload, {
        onSuccess: () => {
          setIsTemplateDialogOpen(false);
        }
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="صندوق رسائل الفريق — استفسارات العملاء حول جولات مخصصة، ورسائل التواصل والتسعير."
        title={tComm("title")}
        description={tComm("description")}
        actions={
          activeTab === "templates" ? (
            <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>{tCommon("create")}</span>
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTemplates ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">{tCommon("loading")}</div>
            ) : templates?.length ? (
              templates.map((template: any) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors group relative rounded-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="font-bold">بريد إلكتروني</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground line-clamp-3">
                      {template.bodyHtml ? template.bodyHtml.replace(/<[^>]*>?/gm, "") : "—"}
                    </div>
                  </CardContent>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 shadow-sm rounded-lg"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 shadow-sm rounded-lg"
                      onClick={() => handleDeleteClick(template.id, template.name)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">{tComm("noMessages")}</div>
            )}

            <Card 
              className="hover:border-primary/50 transition-colors cursor-pointer group border-dashed bg-muted/30 flex flex-col items-center justify-center min-h-[200px] rounded-2xl"
              onClick={handleCreateClick}
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm">إنشاء قالب جديد ➕</h3>
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

      <CreateTemplateDialog 
        open={isTemplateDialogOpen}
        onOpenChange={(v) => {
          setIsTemplateDialogOpen(v);
          if (!v) setEditingTemplate(null);
        }}
        onSubmit={handleTemplateSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingTemplate}
      />
    </div>
  );
}
