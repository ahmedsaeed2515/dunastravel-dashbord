"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash, ExternalLink, ArrowRightLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tour } from "../../types";

interface TourRowActionsProps {
  tour: Tour;
  onView?: (tour: Tour) => void;
  onEdit?: (tour: Tour) => void;
  onMove?: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
}

export function TourRowActions({
  tour,
  onView,
  onEdit,
  onMove,
  onDelete,
}: TourRowActionsProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{isAr ? "إدارة الرحلة" : "Tour Management"}</DropdownMenuLabel>
        {onMove && (
          <DropdownMenuItem onClick={() => onMove(tour)} className="font-semibold text-primary focus:text-primary">
            <ArrowRightLeft className="mr-2 h-4 w-4 text-primary" />
            {isAr ? "نقل الرحلة (Move Tour)" : "Move Tour"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}`}>
            <Eye className="mr-2 h-4 w-4" /> {isAr ? "عرض المواصفات الكاملة" : "View Full Specs"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> {isAr ? "محرر الرحلة الكامل" : "Full Tour Editor"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4 text-emerald-500" /> {isAr ? "معاينة كزائر" : "Preview as Visitor"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(tour)} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> {isAr ? "أرشفة الرحلة" : "Archive Tour"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

