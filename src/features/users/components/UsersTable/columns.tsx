"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { UserRowActions } from "./UserRowActions";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

export function getColumns(
  onView: (user: User) => void,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  tUsers: (key: string) => string,
  tCommon: (key: string) => string
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
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: tCommon("email"),
      cell: ({ row }) => <div className="dir-ltr text-start font-mono text-xs">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: tCommon("role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <StatusBadge status={role} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        let formatted = "-";
        if (val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "MMM do, yyyy"); } catch {}
          }
        }
        return formatted;
      },
      meta: { className: "hidden lg:table-cell" }
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
