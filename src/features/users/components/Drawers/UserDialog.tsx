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
  canManageRoles: boolean;
}

export function UserDialog({ user, open, onOpenChange, canManageRoles }: UserDialogProps) {
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isEdit = !!user;
  const isPending = isCreating || isUpdating;

  const handleSubmit = (values: UserFormValues) => {
    const { confirmPassword, ...fields } = values;
    void confirmPassword;
    const payload = {
      ...fields,
      ...(fields.phone?.trim() ? { phone: fields.phone.trim() } : { phone: undefined }),
      ...(fields.password ? { password: fields.password } : { password: undefined }),
    };
    if (isEdit && user) {
      updateUser({ id: user.id, data: payload }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createUser(payload as UserFormValues, {
        onSuccess: () => onOpenChange(false)
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
            canManageRoles={canManageRoles}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
