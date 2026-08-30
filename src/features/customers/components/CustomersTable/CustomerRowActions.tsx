"use client";

import { MoreHorizontal, Eye, Edit, Star, ShieldBan, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer } from "../../types";
import { useTranslations } from "next-intl";

interface CustomerRowActionsProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onToggleVip: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

export function CustomerRowActions({
  customer,
  onView,
  onEdit,
  onToggleVip,
  onToggleStatus,
}: CustomerRowActionsProps) {
  const tCommon = useTranslations("common");
  const tCustomers = useTranslations("customers");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer"
      >
        <span className="sr-only">فتح القائمة</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 font-medium text-xs">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => onView(customer)} className="cursor-pointer gap-2 font-semibold">
          <Eye className="h-4 w-4 text-amber-500" />
          <span>عرض الملف الشامل (360°)</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEdit(customer)} className="cursor-pointer gap-2 font-semibold">
          <Edit className="h-4 w-4 text-blue-500" />
          <span>تعديل بيانات العميل</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onToggleVip(customer)} className="cursor-pointer gap-2">
          <Star className={`h-4 w-4 ${customer.isVip ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
          <span>{customer.isVip ? "إلغاء صفة VIP" : "ترقية إلى VIP ⭐"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onToggleStatus(customer)}
          className={`cursor-pointer gap-2 ${customer.status === "ACTIVE" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {customer.status === "ACTIVE" ? (
            <>
              <ShieldBan className="h-4 w-4" />
              <span>تعطيل الحساب</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>تفعيل الحساب</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
