"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateAgentPayload, Agent, UpdateAgentPayload } from "../types";
import { useTranslations } from "next-intl";

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
      form.reset();
    }
  }, [initialData, open, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const common = {
      name: values.name.trim(),
      ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
      ...(values.companyId?.trim() ? { companyId: values.companyId.trim() } : {}),
    };
    if (isEditing) {
      onSubmit(common);
      return;
    }
    if (!values.password || values.password.length < 12) {
      form.setError("password", { message: "Password must be at least 12 characters" });
      return;
    }
    onSubmit({ ...common, email: values.email.trim(), password: values.password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `${tCommon("edit")}` : `${tCommon("create")}`}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tCommon("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tCommon("name")} {...field} />
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
                  <FormLabel>{tAuth("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="agent@example.com" disabled={isEditing} className="dir-ltr text-start" {...field} />
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
                  <FormLabel>{tCommon("phone")}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" className="dir-ltr text-start" {...field} />
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
                    <FormLabel>{tAuth("passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="dir-ltr text-start" {...field} required={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company ID</FormLabel>
                  <FormControl>
                    <Input placeholder="UUID" className="dir-ltr text-start" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? tCommon("saving") : isEditing ? tCommon("saveChanges") : tCommon("create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
