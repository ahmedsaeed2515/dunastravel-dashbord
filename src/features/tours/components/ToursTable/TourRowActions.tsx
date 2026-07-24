"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash, ExternalLink } from "lucide-react";
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
  onDelete: (tour: Tour) => void;
}

export function TourRowActions({
  tour,
  onView,
  onEdit,
  onDelete,
}: TourRowActionsProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Tour Management</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}`}>
            <Eye className="mr-2 h-4 w-4" /> View Full Specs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Full Tour Editor
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4 text-emerald-500" /> Preview as Visitor (معاينة)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(tour)} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Archive Tour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

