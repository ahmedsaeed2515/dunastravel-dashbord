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
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(customer)}>
          <Eye className="mr-2 h-4 w-4" /> View 360° Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleVip(customer)}>
          <Star className={`mr-2 h-4 w-4 ${customer.isVip ? 'text-amber-500 fill-amber-500' : ''}`} /> 
          {customer.isVip ? "Remove VIP Status" : "Mark as VIP"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus(customer)} className={customer.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}>
          <ShieldBan className="mr-2 h-4 w-4" /> 
          {customer.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
