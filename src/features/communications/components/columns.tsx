"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NotificationDeliveryLog } from "../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, RotateCcw, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRetryNotification } from "../hooks/useCommunications";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export const columns: ColumnDef<NotificationDeliveryLog>[] = [
  {
    accessorKey: "recipientEmail",
    header: "البريد الإلكتروني",
    cell: ({ row }) => {
      const email = row.original.recipientEmail || (row.original as any).recipient || "—";
      return <div className="font-medium dir-ltr text-start">{email}</div>;
    },
  },
  {
    accessorKey: "notificationType",
    header: "نوع الإشعار والهدف",
    cell: ({ row }) => {
      const rawType = row.original.notificationType || (row.original as any).subject || "";
      const type = typeof rawType === "string" ? rawType : "";
      const typeLabels: Record<string, string> = {
        CUSTOMER_ACKNOWLEDGMENT: "تأكيد طلب العميل",
        INTERNAL_SALES_ALERT: "تنبيه مبيعات داخلي",
        USER_VERIFICATION: "رمز التحقق من الحساب",
        PASSWORD_RESET: "استعادة كلمة المرور",
        INQUIRY_RECEIVED: "استلام استفسار جديد",
        BOOKING_CONFIRMED: "تأكيد حجز",
        PAYMENT_SUCCESS: "نجاح عملية الدفع",
      };
      const label = (type && typeLabels[type]) || (type ? type.replace(/_/g, " ") : "إشعار نظام");
      return (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">{label}</span>
          {type && <span className="text-[10px] text-muted-foreground font-mono">{type}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "originReferenceCode",
    header: "المرجع",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs dir-ltr inline-block">
        {row.original.originReferenceCode || "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "الحالة التشغيلية",
    cell: ({ row }) => {
      const status = row.original.status || "UNKNOWN";
      const reason = row.original.failureReason;
      return (
        <div className="flex flex-col gap-1">
          <StatusBadge status={status} />
          {reason && (
            <span 
              title={reason} 
              className="text-[10px] text-rose-500 font-medium max-w-[180px] truncate cursor-help"
            >
              ⚠️ {reason}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "attempts",
    header: "المحاولات",
    cell: ({ row }) => {
      const attempts = typeof row.original.attempts === "number" ? row.original.attempts : 0;
      return (
        <div className="text-xs dir-ltr inline-flex items-center gap-1 font-mono font-bold">
          <span>{attempts} / 3</span>
          {attempts >= 3 && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "تاريخ وساعة الإرسال",
    cell: ({ row }) => {
      let formatted = "—";
      if (row.original.createdAt) {
        try {
          const d = new Date(row.original.createdAt);
          if (!isNaN(d.getTime())) {
            formatted = format(d, "dd/MM/yyyy HH:mm");
          }
        } catch {}
      }
      return <div className="text-muted-foreground text-xs font-mono dir-ltr text-start">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original;
      return <ActionCell log={log} />;
    },
  },
];

function ActionCell({ log }: { log: NotificationDeliveryLog }) {
  const retryMutation = useRetryNotification();
  const tCommon = useTranslations("common");

  if (!log?.id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs font-bold">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        
        {(log.status === "FAILED" || log.status === "EXHAUSTED") && (
          <DropdownMenuItem 
            onClick={() => retryMutation.mutate(log.id)}
            disabled={retryMutation.isPending}
            className="text-amber-600 focus:text-amber-600 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إعادة إرسال الإشعار (Retry)</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
