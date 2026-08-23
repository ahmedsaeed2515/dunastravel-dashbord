"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Inquiry } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, UserCheck, Copy, Check } from "lucide-react";
import { useAssignInquiry } from "../../hooks/useCommunications";
import { useUsers } from "@/features/users/hooks/useUsers";
import { usePermissions } from "@/hooks/usePermissions";
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

function RefCodeCell({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
      <span className="bg-muted px-2 py-0.5 rounded-md border border-border/60">{code}</span>
      <button
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        title="Copy reference code"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

export function getColumns(onView: (inquiry: Inquiry) => void): ColumnDef<Inquiry>[] { return [
  {
    accessorKey: "referenceCode",
    header: "Ref Code",
    cell: ({ row }) => <RefCodeCell code={row.original.referenceCode} />,
  },
  {
    accessorKey: "name",
    header: "Client & Contact",
    cell: ({ row }) => {
      const item = row.original as any;
      const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || "—";
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">{fullName}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.email && <span className="dir-ltr">{item.email}</span>}
            {item.phone && item.phone !== "N/A" && (
              <span className="text-[11px] font-mono text-muted-foreground/80 dir-ltr">({item.phone})</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "numberOfTravelers",
    header: "Party Size",
    cell: ({ row }) => {
      const item = row.original as any;
      const count = item.numberOfTravelers;
      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
            {count ?? "—"} {count === 1 ? "Traveler" : "Travelers"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const rawStatus = row.original.status?.toUpperCase();
      if (!rawStatus) return <span className="text-muted-foreground">—</span>;
      
      if (rawStatus === "NEWLY_RECEIVED" || rawStatus === "NEW") {
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            NEWLY RECEIVED
          </Badge>
        );
      }
      if (rawStatus === "IN_PROGRESS") {
        return (
          <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold">
            IN PROGRESS
          </Badge>
        );
      }
      if (rawStatus === "PROPOSAL_SENT") {
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold">
            PROPOSAL SENT
          </Badge>
        );
      }
      if (rawStatus === "CLOSED") {
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs font-medium">
            CLOSED
          </Badge>
        );
      }
      return <Badge variant="outline">{rawStatus}</Badge>;
    },
  },
  {
    accessorKey: "assigneeId",
    header: "Assigned Staff",
    cell: ({ row }) => {
      return (
        <div className="text-xs">
          {row.original.assigneeId ? (
            <span className="text-amber-500 font-semibold flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" /> Assigned
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
    header: "Received Date",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      if (!val) return <div className="text-muted-foreground text-xs">—</div>;
      const d = new Date(val);
      return (
        <div className="text-muted-foreground text-xs font-mono">
          {isNaN(d.getTime()) ? "—" : format(d, "MMM d, yyyy • HH:mm")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell inquiry={row.original} onView={onView} />,
  },
]; }

function ActionCell({ inquiry, onView }: { inquiry: Inquiry; onView: (inquiry: Inquiry) => void }) {
  const assignInquiry = useAssignInquiry();
  const { isAdmin } = usePermissions();
  const { data: usersData, isError: agentsError } = useUsers({ role: "AGENT", limit: 50 });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(inquiry)}>View Details</DropdownMenuItem>
        
        {isAdmin && <DropdownMenuSeparator />}
        
        {isAdmin && <DropdownMenuSub>
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
                <DropdownMenuItem disabled>{agentsError ? "Failed to load agents" : "No agents found"}</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
