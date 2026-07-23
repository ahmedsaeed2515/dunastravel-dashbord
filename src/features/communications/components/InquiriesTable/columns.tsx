"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inquiry } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, UserCheck } from "lucide-react";
import { useAssignInquiry } from "../../hooks/useCommunications";
import { useUsers } from "@/features/users/hooks/useUsers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Inquiry>[] = [
  {
    accessorKey: "referenceCode",
    header: "Ref Code",
    cell: ({ row }) => <div className="font-medium">{row.original.referenceCode}</div>,
  },
  {
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "destinations",
    header: "Destinations",
    cell: ({ row }) => {
      const dests = Array.isArray(row.original.destinations) ? row.original.destinations : [];
      return (
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {dests.length > 0 ? (
            dests.map(d => (
              <Badge key={d} variant="secondary" className="text-[10px] px-1 py-0">{d}</Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "NEW";
      const variants: Record<string, any> = {
        NEW: "default",
        IN_PROGRESS: "secondary",
        PROPOSAL_SENT: "outline",
        CLOSED: "destructive",
      };
      return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "assigneeId",
    header: "Assigned To",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.assigneeId ? (
            <span className="text-primary font-medium flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> Staff Assigned
            </span>
          ) : (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Received",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      if (!val) return <div className="text-muted-foreground text-sm">—</div>;
      const d = new Date(val);
      return (
        <div className="text-muted-foreground text-sm">
          {isNaN(d.getTime()) ? "—" : format(d, "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell inquiry={row.original} />,
  },
];

function ActionCell({ inquiry }: { inquiry: Inquiry }) {
  const assignInquiry = useAssignInquiry();
  const { data: usersData } = useUsers({ role: "ADMIN", limit: 50 });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>View Details</DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCheck className="mr-2 h-4 w-4" />
            Assign Staff
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {usersData?.data?.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => assignInquiry.mutate({ referenceCode: inquiry.referenceCode, assigneeId: user.id })}
                  disabled={assignInquiry.isPending}
                >
                  {user.name} ({user.email})
                </DropdownMenuItem>
              ))}
              {!usersData?.data?.length && (
                <DropdownMenuItem disabled>No agents found</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
