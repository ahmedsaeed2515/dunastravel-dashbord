"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, MessageSquare, BellRing, Smartphone, Plus, CheckCircle, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InquiriesView } from "@/features/communications/components/InquiriesView";
import { 
  useTemplates, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
  useDeliveryLogs,
  useContactSubmissions
} from "@/features/communications/hooks/useCommunications";
import { CreateTemplateDialog } from "@/features/communications/components/CreateTemplateDialog";
import { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from "@/features/communications/types";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("inquiries");
  
  // Template dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const { data: deliveryLogsData, isLoading: isLoadingLogs } = useDeliveryLogs({ page: 1, limit: 10 });
  const { data: contactSubmissionsData, isLoading: isLoadingSubmissions } = useContactSubmissions({ page: 1, limit: 10 });

  const handleCreateClick = () => {
    setEditingTemplate(null);
    setIsTemplateDialogOpen(true);
  };

  const handleEditClick = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
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
        title="Communications & Notifications"
        description="Manage customer inquiries, contact submissions, transactional email templates, and delivery logs."
        actions={
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="inquiries" className="gap-2"><MessageSquare className="h-4 w-4" /> Custom Inquiries</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2"><MessageSquare className="h-4 w-4" /> Contact Submissions</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><Mail className="h-4 w-4" /> Message Templates</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><BellRing className="h-4 w-4" /> Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="m-0 space-y-6">
          <InquiriesView />
        </TabsContent>

        <TabsContent value="templates" className="m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTemplates ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">Loading templates...</div>
            ) : templates?.length ? (
              templates.map((template: any) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors group relative">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Badge variant="outline">EMAIL</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground line-clamp-3">
                      {template.bodyHtml || "No preview available."}
                    </div>
                  </CardContent>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 shadow-sm"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 shadow-sm"
                      onClick={() => handleDeleteClick(template.id, template.name)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">No templates found.</div>
            )}

            <Card 
              className="hover:border-primary/50 transition-colors cursor-pointer group border-dashed bg-muted/30 flex flex-col items-center justify-center min-h-[200px]"
              onClick={handleCreateClick}
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">Create New Template</h3>
              <p className="text-xs text-muted-foreground mt-1">Add a new email template</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="m-0 space-y-6">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>Messages from the main website contact form.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubmissions ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-4">Loading...</TableCell></TableRow>
                  ) : contactSubmissionsData?.data?.length ? (
                    contactSubmissionsData.data.map((sub: any) => (
                      <TableRow key={sub.referenceCode}>
                        <TableCell className="font-medium">{sub.referenceCode}</TableCell>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sub.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-4">No submissions found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>System Delivery Logs</CardTitle>
                <CardDescription>Real-time audit of all outgoing communications.</CardDescription>
              </div>
              <Input placeholder="Search recipient..." className="w-64" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject / Context</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLogs ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-4">Loading...</TableCell></TableRow>
                  ) : deliveryLogsData?.data?.length ? (
                    deliveryLogsData.data.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5">
                            {log.channel === 'SMS' ? <Smartphone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                            {log.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.recipient}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className={log.status === 'DELIVERED' ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-red-500/10 text-red-600 border-none"}>
                            {log.status === 'DELIVERED' ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-4">No delivery logs found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
