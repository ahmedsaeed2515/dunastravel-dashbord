"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserRowActions } from "./UserRowActions";
import { Crown, Mail, Phone, Calendar, ShieldAlert, ShieldCheck } from "lucide-react";

export function getColumns(
  onView: (user: User) => void,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  tUsers: (key: string, options?: any) => string,
  tCommon: (key: string, options?: any) => string
): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: tUsers("userName"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <span className="truncate">{user.name}</span>
                {user.isVip && (
                  <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                {user.customerNumber ? `#${user.customerNumber}` : user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: tCommon("email"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-0.5 text-xs">
            <div className="dir-ltr text-start font-mono text-muted-foreground truncate">
              {user.email}
            </div>
            {user.phone && (
              <div className="dir-ltr text-start font-mono text-[11px] text-muted-foreground/80">
                {user.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: tCommon("role"),
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge
            variant={
              role === "ADMIN" || role === "SUPER_ADMIN"
                ? "default"
                : role === "COMPANY" || role === "AGENT"
                ? "secondary"
                : "outline"
            }
            className="font-bold text-xs uppercase"
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const isSuspended = row.original.status === "SUSPENDED";
        return isSuspended ? (
          <Badge variant="destructive" className="gap-1 font-bold text-xs">
            <ShieldAlert className="h-3 w-3" />
            <span>{tUsers("suspended")}</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 font-bold text-xs"
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{tUsers("active")}</span>
          </Badge>
        );
      },
    },
    {
      id: "activity",
      header: tUsers("activityStats"),
      cell: ({ row }) => {
        const user = row.original;
        const bookingsCount = user.bookingsCount ?? 0;
        const reviewsCount = user.reviewsCount ?? 0;
        return (
          <div className="flex items-center gap-2 text-xs font-mono">
            <Badge variant="outline" className="text-[11px] font-semibold">
              {bookingsCount} {tUsers("bookingsCount")}
            </Badge>
            {reviewsCount > 0 && (
              <Badge variant="outline" className="text-[11px] font-semibold text-amber-500 border-amber-500/30">
                {reviewsCount} ?
              </Badge>
            )}
          </div>
        );
      },
      meta: { className: "hidden md:table-cell" },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        let formatted = "";
        if (val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            try {
              formatted = format(d, "yyyy-MM-dd");
            } catch {}
          }
        }
        return <span className="font-mono text-xs text-muted-foreground">{formatted}</span>;
      },
      meta: { className: "hidden lg:table-cell" },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <UserRowActions
            user={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
