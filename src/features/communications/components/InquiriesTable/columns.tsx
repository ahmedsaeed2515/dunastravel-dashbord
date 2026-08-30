"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inquiry } from "../../types";
import { Badge } from "@/components/ui/badge";
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
    header: "المرجع",
    cell: ({ row }) => <div className="font-bold font-mono text-xs">{row.original.referenceCode}</div>,
  },
  {
    id: "client",
    header: "العميل",
    cell: ({ row }) => {
      const name = row.original.fullName || `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || 'عميل دوناس';
      return (
        <div className="flex flex-col">
          <span className="font-bold text-xs">{name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email}</span>
        </div>
      );
    },
  },
  {
    id: "partner",
    header: "الشريك / كود التعاقد",
    cell: ({ row }) => {
      const code = row.original.partnerCode;
      const comp = row.original.company;
      if (!code && !comp) {
        return <span className="text-[10px] text-muted-foreground italic">عميل مباشر (B2C)</span>;
      }
      return (
        <div className="flex flex-col gap-0.5">
          {comp ? (
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-amber-600 dark:text-amber-400">{comp.name}</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold">
                {comp.tier || 'PLATINUM'}
              </Badge>
            </div>
          ) : null}
          <div className="font-mono text-[11px] font-bold text-primary flex items-center gap-1 dir-ltr inline-flex">
            <span className="text-muted-foreground text-[10px]">كود:</span>
            <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded font-mono font-bold">
              {code || comp?.taxId || comp?.referenceCode}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "destinations",
    header: "الوجهات",
    cell: ({ row }) => {
      const dests = Array.isArray(row.original.destinations) ? row.original.destinations : [];
      return (
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {dests.length > 0 ? (
            dests.map(d => (
              <Badge key={d} variant="secondary" className="text-[10px] px-1 py-0 font-bold">{d}</Badge>
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
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.original.status || "NEW";
      const statusLabels: Record<string, string> = {
        NEW: "جديد (New)",
        IN_PROGRESS: "قيد المتابعة",
        PROPOSAL_SENT: "تم إرسال العرض",
        CLOSED: "مغلق ومكتمل",
      };
      const variants: Record<string, any> = {
        NEW: "default",
        IN_PROGRESS: "secondary",
        PROPOSAL_SENT: "outline",
        CLOSED: "destructive",
      };
      return <Badge variant={variants[status] || "outline"} className="text-[10px] font-bold">{statusLabels[status] || status}</Badge>;
    },
  },
  {
    accessorKey: "assigneeId",
    header: "المسؤول المكلّف",
    cell: ({ row }) => {
      return (
        <div className="text-xs">
          {row.original.assigneeId ? (
            <span className="text-primary font-bold flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> تم التعيين
            </span>
          ) : (
            <span className="text-muted-foreground italic font-medium">غير معيّن</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "تاريخ الاستلام",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      if (!val) return <div className="text-muted-foreground text-xs">—</div>;
      const d = new Date(val);
      return (
        <div className="text-muted-foreground text-xs font-mono">
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
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer">
        <span className="sr-only">فتح القائمة</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-bold text-xs">
        <DropdownMenuLabel>إجراءات الاستفسار</DropdownMenuLabel>
        <DropdownMenuItem className="cursor-pointer">عرض التفاصيل</DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <UserCheck className="mr-2 h-4 w-4" />
            تعيين موظف مسؤول
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="font-bold text-xs">
              {usersData?.data?.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => assignInquiry.mutate({ referenceCode: inquiry.referenceCode, assigneeId: user.id })}
                  disabled={assignInquiry.isPending}
                  className="cursor-pointer"
                >
                  {user.name} ({user.email})
                </DropdownMenuItem>
              ))}
              {!usersData?.data?.length && (
                <DropdownMenuItem disabled>لا يوجد موظفون متاحون</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
