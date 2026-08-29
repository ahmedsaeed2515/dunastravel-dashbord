"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { CreateAgentPayload, Agent, UpdateAgentPayload } from "../types";
import { useTranslations } from "next-intl";
import { Building2, User, Mail, Phone, Lock, Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().optional(),
  companyId: z.string().optional(),
});

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentPayload | UpdateAgentPayload) => void;
  isSubmitting?: boolean;
  initialData?: Agent | null;
}

export function CreateAgentDialog({ open, onOpenChange, onSubmit, isSubmitting, initialData }: CreateAgentDialogProps) {
  const tAgents = useTranslations("agents");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");

  const isEditing = !!initialData;

  // Load companies for dynamic selector
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies({ limit: 100 });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      companyId: "",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || "",
        password: "",
        companyId: initialData.companyId || "",
      });
    } else if (!open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        password: "",
        companyId: "",
      });
    }
  }, [initialData, open, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: any = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      companyId: values.companyId && values.companyId !== "NONE" ? values.companyId : undefined,
    };
    if (!isEditing && values.password) {
      payload.password = values.password;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? (tCommon("edit") || "Edit Travel Agent Profile") : (tCommon("create") || "Register New Travel Agent")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure travel agent credentials, contact info, and corporate agency affiliation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3.5 pt-2 text-xs">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3 text-primary" /> {tCommon("name") || "Agent Name"} *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tarek Mansour" {...field} className="text-xs font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3 text-primary" /> {tAuth("emailLabel") || "Email Address"} *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="agent@dunas.com" 
                      disabled={isEditing} 
                      className="dir-ltr text-start text-xs font-semibold" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 text-primary" /> {tCommon("phone") || "Phone Number"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+20 100 987 6543" 
                      className="dir-ltr text-start text-xs" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3 text-primary" /> {tAuth("passwordLabel") || "Initial Password"} *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="dir-ltr text-start text-xs font-mono" 
                        {...field} 
                        required={!isEditing} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Affiliated Agency Selector */}
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-amber-500" /> Agency Affiliation (الشركة / الوكالة التابع لها)
                  </FormLabel>
                  <Select
                    value={field.value || "NONE"}
                    onValueChange={(val) => field.onChange(val === "NONE" ? "" : val)}
                  >
                    <FormControl>
                      <SelectTrigger className="text-xs font-semibold">
                        <SelectValue placeholder="Select Affiliated Agency or Independent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">
                        👤 Independent Agent (وكيل سياحي مستقل بدون شركة)
                      </SelectItem>
                      {companiesData?.data?.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          🏢 [{comp.companyType}] {comp.name} ({comp.referenceCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={isSubmitting} className="font-bold gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{tCommon("saving") || "Saving..."}</span>
                  </>
                ) : isEditing ? (
                  <span>{tCommon("saveChanges") || "Save Changes"}</span>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{tCommon("create") || "Register Agent"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
