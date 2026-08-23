"use client";

import { User } from "../../types";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

interface UserRowActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  canManage: boolean;
}

export function UserRowActions({ user, onView, onEdit, onDelete, canManage }: UserRowActionsProps) {
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">{tAccess("openMenu")}</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(user)}>
          <Eye className="me-2 h-4 w-4" />
          {tCommon("viewDetails")}
        </DropdownMenuItem>
        
        {canManage && <DropdownMenuSeparator />}
        {canManage && <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="me-2 h-4 w-4" />
          {tCommon("edit")}
        </DropdownMenuItem>}
        {canManage && <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive">
          <Trash className="me-2 h-4 w-4" />
          {tCommon("delete")}
        </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
