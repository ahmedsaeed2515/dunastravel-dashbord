"use client";

import { User } from "../../types";
import { UserFormValues } from "../../schemas/user.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "../UserForms/UserForm";
import { useCreateUser, useUpdateUser } from "../../hooks/useUsers";

import { useLocale } from "next-intl";

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isEdit = !!user;
  const isPending = isCreating || isUpdating;

  const handleSubmit = (values: UserFormValues) => {
    if (isEdit && user) {
      const updatePayload: Partial<UserFormValues> = {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role: values.role,
      };
      if (values.password && values.password.trim().length > 0) {
        updatePayload.password = values.password.trim();
      }
      updateUser(
        { id: user.id, data: updatePayload },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      const { confirmPassword: _, ...createPayload } = values;
      createUser(createPayload as any, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-[95vw] sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-border/80 shadow-2xl">
        <DialogHeader className="space-y-1 text-start">
          <DialogTitle className="text-base sm:text-lg font-black text-foreground">
            {isEdit 
              ? (isAr ? "تعديل رتبة وصلاحيات المستخدم" : "Edit User & Role") 
              : (isAr ? "إضافة مستخدم جديد" : "Create New User")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {isEdit 
              ? (isAr ? "تحديث بيانات الحساب وتعيين الدور والصلاحيات المناسبة." : "Update the user's role and basic information.")
              : (isAr ? "إنشاء حساب جديد في المنصة وتحديد كلمة المرور والدور المطلوب." : "Create a new user account and set an initial password.")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 sm:mt-4">
          <UserForm 
            initialData={user || undefined}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
