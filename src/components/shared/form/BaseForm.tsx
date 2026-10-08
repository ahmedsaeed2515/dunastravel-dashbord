"use client";

import { FieldValues, UseFormReturn, SubmitHandler } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  globalError?: string | null;
}

export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  submitLabel,
  isSubmitting = false,
  globalError,
}: BaseFormProps<T>) {
  const tCommon = useTranslations("common");
  const defaultLabel = submitLabel || tCommon("saveChanges");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {globalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {globalError}
          </div>
        )}
        
        {children}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto font-bold rounded-xl h-10 px-5 text-sm cursor-pointer"
          >
            {isSubmitting ? tCommon("saving") : defaultLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
