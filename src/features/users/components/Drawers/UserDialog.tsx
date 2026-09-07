"use client";

import { User } from "../../types";
import { UserFormValues } from "../../schemas/user.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "../UserForms/UserForm";
import { useCreateUser, useUpdateUser } from "../../hooks/useUsers";

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update the user's role and basic information."
              : "Create a new user account and set an initial password."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
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
