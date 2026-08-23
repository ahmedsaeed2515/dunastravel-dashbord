import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { Booking } from "../../types";

interface BookingRowActionsProps {
  booking: Booking;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  canManage: boolean;
}

export function BookingRowActions({
  booking,
  onView,
  onEdit,
  onDelete,
  canManage,
}: BookingRowActionsProps) {
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">{tAccess("openMenu")}</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(booking)}>
          <Eye className="me-2 h-4 w-4" /> {tCommon("viewDetails")}
        </DropdownMenuItem>
        {canManage && (
          <>
            <DropdownMenuItem onClick={() => onEdit(booking)}>
              <Edit className="me-2 h-4 w-4" /> {tCommon("edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(booking)} className="text-red-600">
              <Trash className="me-2 h-4 w-4" /> {tCommon("delete")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
