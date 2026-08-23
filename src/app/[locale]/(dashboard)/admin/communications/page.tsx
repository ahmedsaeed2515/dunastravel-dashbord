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
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { usePermissions } from "@/hooks/usePermissions";

export default function CommunicationsPage() {
  const tComm = useTranslations("communications");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { isSuperAdmin } = usePermissions();

  const [activeTab, setActiveTab] = useState("inquiries");
  
  // Template dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const { data: templates, isLoading: isLoadingTemplates, isError: isTemplatesError, refetch: refetchTemplates } = useTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const [logsPage, setLogsPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);

  const { data: deliveryLogsData, isLoading: isLoadingLogs, isError: isLogsError, refetch: refetchLogs } = useDeliveryLogs({ page: logsPage, limit: 10 });
  const { data: contactSubmissionsData, isLoading: isLoadingSubmissions, isError: isSubmissionsError, refetch: refetchSubmissions } = useContactSubmissions({ page: subsPage, limit: 10 });

  const subsList = Array.isArray(contactSubmissionsData) ? contactSubmissionsData : ((contactSubmissionsData as any)?.data || []);
  const subsTotal = (contactSubmissionsData as any)?.meta?.total ?? (contactSubmissionsData as any)?.total ?? subsList.length;
  const subsTotalPages = (contactSubmissionsData as any)?.meta?.totalPages ?? (contactSubmissionsData as any)?.totalPages ?? 1;

  const logsList = Array.isArray(deliveryLogsData) ? deliveryLogsData : ((deliveryLogsData as any)?.data || []);
  const logsTotal = (deliveryLogsData as any)?.meta?.total ?? (deliveryLogsData as any)?.total ?? logsList.length;
  const logsTotalPages = (deliveryLogsData as any)?.meta?.totalPages ?? (deliveryLogsData as any)?.totalPages ?? 1;

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
        title={tComm("title")}
        description={tComm("description")}
        actions={isSuperAdmin ?
          <Button onClick={handleCreateClick} size="sm" variant="gold" className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>{tCommon("create")}</span>
          </Button> : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val || "ALL")} className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-md border border-border/50">
          <TabsTrigger value="inquiries" className="gap-2 cursor-pointer"><MessageSquare className="h-4 w-4" /> {tNav("inquiries")}</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2 cursor-pointer">
            <MessageSquare className="h-4 w-4" /> Inbox ({subsTotal})
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 cursor-pointer">
            <Mail className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 cursor-pointer">
            <BellRing className="h-4 w-4" /> Delivery Logs ({logsTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="m-0 space-y-6">
          <InquiriesView />
        </TabsContent>

        <TabsContent value="templates" className="m-0 space-y-6">
          {isTemplatesError ? (
            <QueryErrorState message="تعذر تحميل قوالب الرسائل من الخادم." onRetry={() => void refetchTemplates()} />
          ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTemplates ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">{tCommon("loading")}</div>
            ) : (Array.isArray(templates) ? templates : ((templates as any)?.data || [])).length ? (
              (Array.isArray(templates) ? templates : ((templates as any)?.data || [])).map((template: any) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors group relative border-border/70 flex flex-col justify-between overflow-hidden shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase bg-muted/50">
                        EMAIL TEMPLATE
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1">{template.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-1 font-medium">{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="text-xs font-mono p-2.5 rounded-lg bg-muted/50 text-muted-foreground line-clamp-3 border border-border/50">
                      {template.bodyHtml ? template.bodyHtml.replace(/<[^>]+>/g, ' ') : "—"}
                    </div>

                    {/* Variables */}
                    {Array.isArray(template.variables) && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {template.variables.map((v: string) => (
                          <span key={v} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Actions footer */}
                  {isSuperAdmin && <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 cursor-pointer"
                      onClick={() => handleDeleteClick(template.id, template.name)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>}
                </Card>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">{tComm("noMessages")}</div>
            )}

            {isSuperAdmin && <Card
              className="hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group border-dashed bg-muted/30 flex flex-col items-center justify-center min-h-[220px] rounded-2xl"
              onClick={handleCreateClick}
            >
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{tCommon("create")} New Template</h3>
              <p className="text-xs text-muted-foreground mt-1">Add a reusable automated email</p>
            </Card>}
          </div>}
        </TabsContent>

        <TabsContent value="submissions" className="m-0 space-y-6">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">Contact Form Submissions</CardTitle>
                <CardDescription>Inbox messages received directly from the contact website form</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isSubmissionsError ? (
                <div className="p-6"><QueryErrorState message="تعذر تحميل رسائل نموذج التواصل من الخادم." onRetry={() => void refetchSubmissions()} /></div>
              ) : <><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Sender & Contact</TableHead>
                    <TableHead>Subject & Message</TableHead>
                    <TableHead>{tCommon("status")}</TableHead>
                    <TableHead>{tCommon("date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubmissions ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">{tCommon("loading")}</TableCell></TableRow>
                  ) : subsList.length ? (
                    subsList.map((sub: any) => {
                      const fullName = sub.name || `${sub.firstName || ''} ${sub.lastName || ''}`.trim() || "—";
                      return (
                        <TableRow key={sub.id || sub.referenceCode} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono text-xs font-bold dir-ltr">
                            <span className="bg-muted px-2 py-0.5 rounded-md border border-border/60">{sub.referenceCode}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-foreground">{fullName}</span>
                              <span className="text-xs text-muted-foreground dir-ltr text-start">{sub.email}</span>
                              {sub.phone && <span className="text-[11px] font-mono text-muted-foreground/80 dir-ltr">{sub.phone}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[320px]">
                            <div className="font-medium text-xs text-foreground line-clamp-1">{sub.subject || "—"}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{sub.message || "—"}</div>
                          </TableCell>
                          <TableCell>
                            {sub.status ? <StatusBadge status={sub.status} /> : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {new Date(sub.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">{tComm("noMessages")}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination bar for Submissions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 border-t border-border/60 bg-card/30">
                <div className="text-xs text-muted-foreground font-mono">
                  Page {subsPage} of {Math.max(1, subsTotalPages)} ({subsTotal} total submissions)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => setSubsPage(p => Math.max(1, p - 1))}
                    disabled={isLoadingSubmissions || subsPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => setSubsPage(p => Math.min(subsTotalPages, p + 1))}
                    disabled={isLoadingSubmissions || subsPage >= subsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div></>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="m-0">
          <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">Notification Delivery Logs</CardTitle>
                <CardDescription>Real-time audit log of all system emails and SMS notifications sent</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLogsError ? (
                <div className="p-6"><QueryErrorState message="تعذر تحميل سجل إرسال الإشعارات من الخادم." onRetry={() => void refetchLogs()} /></div>
              ) : <><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Event / Subject</TableHead>
                    <TableHead>Origin Ref</TableHead>
                    <TableHead>{tCommon("status")}</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>{tCommon("date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLogs ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">{tCommon("loading")}</TableCell></TableRow>
                  ) : logsList.length ? (
                    logsList.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                            {log.channel === 'SMS' ? <Smartphone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                            {log.channel || 'EMAIL'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium dir-ltr text-start text-xs font-mono">
                          {log.recipient || log.recipientEmail}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {log.subject || log.notificationType}
                        </TableCell>
                        <TableCell>
                          {log.originReferenceCode ? (
                            <Badge variant="secondary" className="font-mono text-[10px] dir-ltr">
                              {log.originReferenceCode}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.status === "SENT" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              SENT
                            </Badge>
                          ) : (
                            <StatusBadge status={log.status} />
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {log.attempts ?? 0}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">{tComm("noMessages")}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination bar for Delivery Logs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 border-t border-border/60 bg-card/30">
                <div className="text-xs text-muted-foreground font-mono">
                  Page {logsPage} of {Math.max(1, logsTotalPages)} ({logsTotal} total delivery logs)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                    disabled={isLoadingLogs || logsPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))}
                    disabled={isLoadingLogs || logsPage >= logsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div></>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isSuperAdmin && <CreateTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={(v) => {
          setIsTemplateDialogOpen(v);
          if (!v) setEditingTemplate(null);
        }}
        onSubmit={handleTemplateSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingTemplate}
      />}
    </div>
  );
}
