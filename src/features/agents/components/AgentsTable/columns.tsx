"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Agent } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function getColumns(
  onEdit: (agent: Agent) => void,
  onDelete: (agent: Agent) => void
): ColumnDef<Agent>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span>{row.original.phone || "-"}</span>,
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <span>{row.original.company?.name || <Badge variant="outline">Independent</Badge>}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => {
        let formatted = "-";
        if (row.original.createdAt) {
          const d = new Date(row.original.createdAt);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "MMM d, yyyy"); } catch {}
          }
        }
        return <span className="text-muted-foreground">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
