"use client";

import { useState } from "react";
import { User } from "../../types";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSuspendUser, useActivateUser, useRevokeUserSessions } from "../../hooks/useUsers";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";

interface UserRowActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserRowActions({ user, onView, onEdit, onDelete }: UserRowActionsProps) {
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tAccess = useTranslations("accessibility");
  const { isSuperAdmin, isAdmin, user: currentUser } = usePermissions();

  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();
  const { mutate: revokeSessions, isPending: isRevoking } = useRevokeUserSessions();

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const isSuspended = user.status === "SUSPENDED";
  const canEdit = isSuperAdmin || (isAdmin && user.role !== "SUPER_ADMIN");
  const canManageStatus = (isSuperAdmin || isAdmin) && user.role !== "SUPER_ADMIN" && user.id !== currentUser?.id;
  const canDelete = isSuperAdmin && user.role !== "SUPER_ADMIN" && user.id !== currentUser?.id;

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    suspendUser(
      { id: user.id, reason: suspendReason },
      {
        onSuccess: () => {
          setShowSuspendDialog(false);
          setSuspendReason("");
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
        >
          <span className="sr-only">{tAccess("openMenu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => onView(user)} className="gap-2 font-medium cursor-pointer">
            <Eye className="h-4 w-4 text-amber-500" />
            <span>{tUsers("viewProfileAndActivity")}</span>
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem onClick={() => onEdit(user)} className="gap-2 font-medium cursor-pointer">
              <Edit className="h-4 w-4 text-blue-500" />
              <span>{tUsers("editRoleAndData")}</span>
            </DropdownMenuItem>
          )}

          {canManageStatus && (
            <>
              <DropdownMenuSeparator />

              {isSuspended ? (
                <DropdownMenuItem
                  onClick={() => activateUser(user.id)}
                  disabled={isActivating}
                  className="gap-2 font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{tUsers("reactivateAccount")}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setShowSuspendDialog(true)}
                  className="gap-2 font-medium text-amber-600 dark:text-amber-400 cursor-pointer"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{tUsers("suspendAccount")}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => revokeSessions(user.id)}
                disabled={isRevoking}
                className="gap-2 font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{tUsers("revokeSessions")}</span>
              </DropdownMenuItem>
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="gap-2 font-medium text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash className="h-4 w-4" />
                <span>{tCommon("delete")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span>{tUsers("suspendAccountTitle")}: {user.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {tUsers("suspendAccountConfirmDesc", {
                defaultValue: "          .",
              })}
            </p>
            <Textarea
              placeholder={tUsers("suspendReasonRequired")}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="text-xs min-h-[80px] rounded-xl"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuspendDialog(false)}
                className="rounded-xl font-bold"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || isSuspending}
                className="rounded-xl font-bold"
              >
                {isSuspending ? tCommon("loading") : tUsers("confirmSuspend")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
