import { MoreHorizontal, Eye, Star, ShieldBan } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer } from "../../types";

interface CustomerRowActionsProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onToggleVip: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

export function CustomerRowActions({
  customer,
  onView,
  onToggleVip,
  onToggleStatus,
}: CustomerRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer">
        <span className="sr-only">فتح القائمة</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 font-bold text-xs">
        <DropdownMenuLabel>إجراءات العميل</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(customer)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4 text-primary" /> عرض الملف الشامل (360°)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleVip(customer)} className="cursor-pointer">
          <Star className={`mr-2 h-4 w-4 ${customer.isVip ? 'text-amber-500 fill-amber-500' : ''}`} /> 
          {customer.isVip ? "إلغاء صفة VIP" : "تعيين كعميل VIP ⭐"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus(customer)} className={`cursor-pointer ${customer.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`}>
          <ShieldBan className="mr-2 h-4 w-4" /> 
          {customer.status === 'ACTIVE' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
