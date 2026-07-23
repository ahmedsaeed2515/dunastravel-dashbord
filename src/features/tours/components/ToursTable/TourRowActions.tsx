/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
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
  onView: (tour: Tour) => void;
  onEdit: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
}

export function TourRowActions({
  tour,
  onView,
  onEdit,
  onDelete,
}: TourRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Tour Management</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(tour)}>
          <Eye className="mr-2 h-4 w-4" /> View Specs & Logs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(tour)}>
          <Edit className="mr-2 h-4 w-4" /> Quick Edit Specs
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(tour)} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Archive Tour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
