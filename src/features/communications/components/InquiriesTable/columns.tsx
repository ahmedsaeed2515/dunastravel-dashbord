"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Inquiry } from "../../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, UserCheck } from "lucide-react";
import { useAssignInquiry } from "../../hooks/useCommunications";
import { useUsers } from "@/features/users/hooks/useUsers";
import { InquiryDetailsDrawer } from "../InquiryDetailsDrawer";
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
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold font-mono text-xs text-foreground">{row.original.referenceCode}</span>
        {row.original.bookingId && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
            🎟️ حجز رسمي
          </span>
        )}
      </div>
    ),
  },
  {
    id: "client",
    header: "العميل والتواصل",
    cell: ({ row }) => {
      const name = row.original.fullName || `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || 'عميل دوناس';
      const cleanPhone = (row.original.phone || '').replace(/[^0-9]/g, '');
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-xs text-foreground">{name}</span>
          <span className="text-[10px] text-muted-foreground dir-ltr">{row.original.email}</span>
          {cleanPhone && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground dir-ltr">{row.original.phone}</span>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5"
                title="WhatsApp"
              >
                💬 واتساب
              </a>
            </div>
          )}
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
    header: "الوجهات والمسافرين",
    cell: ({ row }) => {
      const dests = Array.isArray(row.original.destinations) ? row.original.destinations : [];
      const pax = row.original.numberOfTravelers || row.original.adults || 1;
      return (
        <div className="flex flex-col gap-1 max-w-[200px]">
          <div className="flex gap-1 flex-wrap">
            {dests.length > 0 ? (
              dests.map(d => (
                <Badge key={d} variant="secondary" className="text-[10px] px-1 py-0 font-bold">{d}</Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">
            👥 {pax} مسافرين {row.original.departureDate ? `· 📅 ${row.original.departureDate}` : ''}
          </span>
        </div>
      );
    },
  },
  {
    id: "financials",
    header: "الميزانية / عرض السعر",
    cell: ({ row }) => {
      const quoted = row.original.quotedAmountUsd;
      const budget = row.original.budgetAmount;
      const curr = row.original.budgetCurrency || 'USD';

      if (quoted) {
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400">
              ${Number(quoted).toLocaleString()}
            </span>
            <span className="text-[9px] text-muted-foreground font-bold">عرض سعر معتمد</span>
          </div>
        );
      }

      if (budget) {
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-foreground">
              ${Number(budget).toLocaleString()} {curr}
            </span>
            <span className="text-[9px] text-muted-foreground">ميزانية تقديرية</span>
          </div>
        );
      }

      return <span className="text-xs text-muted-foreground italic">مرنة / غير محددة</span>;
    },
  },
  {
    accessorKey: "status",
    header: "الحالة التشغيلية",
    cell: ({ row }) => {
      const status = row.original.status || "NEWLY_RECEIVED";
      const statusMap: Record<string, { label: string; class: string }> = {
        NEW: { label: "جديد (New)", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
        NEWLY_RECEIVED: { label: "جديد بانتظار المراجعة", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
        IN_PROGRESS: { label: "قيد المتابعة", class: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
        QUOTED: { label: "تم تقديم العرض 💰", class: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
        PROPOSAL_SENT: { label: "تم تقديم العرض 💰", class: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
        APPROVED: { label: "موافقة العميل ✨", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
        CONVERTED_TO_BOOKING: { label: "حجز رسمي 🎟️", class: "bg-emerald-600 text-white border-emerald-700" },
        CLOSED: { label: "مغلق 🔒", class: "bg-muted text-muted-foreground border-border" },
      };
      const current = statusMap[status] || { label: status, class: "bg-muted text-muted-foreground border-border" };
      return <Badge className={`text-[10px] font-bold ${current.class}`}>{current.label}</Badge>;
    },
  },
  {
    accessorKey: "assigneeId",
    header: "المسؤول المكلّف",
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      return (
        <div className="text-xs">
          {assignee ? (
            <span className="text-primary font-bold flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> {assignee.name}
            </span>
          ) : row.original.assigneeId ? (
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const assignInquiry = useAssignInquiry();
  const { data: adminsData } = useUsers({ role: "ADMIN", limit: 50 });
  const { data: agentsData } = useUsers({ role: "AGENT", limit: 50 });
  const staffUsers = [
    ...(adminsData?.data || []),
    ...(agentsData?.data || []),
  ].filter((u, index, self) => index === self.findIndex((t) => t.id === u.id));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer">
          <span className="sr-only">فتح القائمة</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-bold text-xs">
          <DropdownMenuLabel>إجراءات الاستفسار</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setDetailsOpen(true)} className="cursor-pointer">
            عرض التفاصيل والطلب
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <UserCheck className="mr-2 h-4 w-4" />
              تعيين موظف مسؤول
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="font-bold text-xs">
                {staffUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => assignInquiry.mutate({ referenceCode: inquiry.referenceCode, assigneeId: user.id })}
                    disabled={assignInquiry.isPending}
                    className="cursor-pointer"
                  >
                    {user.name} ({user.email}) - {user.role}
                  </DropdownMenuItem>
                ))}
                {!staffUsers.length && (
                  <DropdownMenuItem disabled>لا يوجد موظفون متاحون</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

        </DropdownMenuContent>
      </DropdownMenu>

      <InquiryDetailsDrawer
        inquiry={inquiry}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
