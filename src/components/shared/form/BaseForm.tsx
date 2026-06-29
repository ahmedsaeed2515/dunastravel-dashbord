"use client";

import { FieldValues, UseFormReturn, SubmitHandler } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

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
  submitLabel = "Submit",
  isSubmitting = false,
  globalError,
}: BaseFormProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {globalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {globalError}
          </div>
        )}
        
        {children}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting ? "Processing..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
