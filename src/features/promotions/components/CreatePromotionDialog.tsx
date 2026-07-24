"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreatePromotionPayload, Promotion, UpdatePromotionPayload } from "../types";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  discountPercent: z.coerce.number().min(1, "Minimum 1%").max(100, "Maximum 100%"),
  validFrom: z.string().min(1, "Required"),
  validUntil: z.string().min(1, "Required"),
  maxUses: z.coerce.number().min(1, "Minimum 1 use"),
  isActive: z.boolean().default(true),
});

interface CreatePromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePromotionPayload | UpdatePromotionPayload) => void;
  isSubmitting?: boolean;
  initialData?: Promotion | null;
}

export function CreatePromotionDialog({ open, onOpenChange, onSubmit, isSubmitting, initialData }: CreatePromotionDialogProps) {
  const tPromotions = useTranslations("promotions");
  const tCommon = useTranslations("common");

  const isEditing = !!initialData;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code: "",
      discountPercent: 10,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      maxUses: 100,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code,
        discountPercent: initialData.discountPercent,
        validFrom: new Date(initialData.validFrom).toISOString().split("T")[0],
        validUntil: new Date(initialData.validUntil).toISOString().split("T")[0],
        maxUses: initialData.maxUses,
        isActive: initialData.isActive,
      });
    } else if (!open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? tCommon("edit") : tPromotions("createPromotion")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control as any}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tPromotions("promoCode")}</FormLabel>
                  <FormControl>
                    <Input placeholder="SUMMER2026" className="dir-ltr text-start font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="discountPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tPromotions("discountValue")}</FormLabel>
                  <FormControl>
                    <Input type="number" className="dir-ltr text-start font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPromotions("validFrom")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPromotions("validUntil")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tPromotions("usedCount")}</FormLabel>
                  <FormControl>
                    <Input type="number" className="dir-ltr text-start font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{tCommon("status")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
