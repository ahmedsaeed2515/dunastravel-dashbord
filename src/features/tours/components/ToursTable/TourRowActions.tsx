"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash, ExternalLink, ArrowRightLeft, Archive, RotateCcw, Send, Undo2, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tour } from "../../types";
import { useTourLifecycleAction } from "../../hooks/useTours";
import { getFrontendTourUrl } from "@/lib/frontend-urls";

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
  const publish = useTourLifecycleAction("publish");
  const unpublish = useTourLifecycleAction("unpublish");
  const archive = useTourLifecycleAction("archive");
  const unarchive = useTourLifecycleAction("unarchive");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer focus:outline-none"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50">
        <DropdownMenuLabel>{isAr ? "إدارة الرحلة" : "Tour Management"}</DropdownMenuLabel>
        <DropdownMenuItem asChild className="cursor-pointer font-bold text-sky-500 focus:text-sky-500">
          <a href={getFrontendTourUrl(tour.slug)} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4 text-sky-500" /> {isAr ? "عرض في الموقع المباشر (الفرونت)" : "View on Live Website"}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-bold text-emerald-500 focus:text-emerald-500">
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4 text-emerald-500" /> {isAr ? "معاينة كزائر في الداشبورد" : "Admin Visitor Preview"}
          </Link>
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(tour)} className="font-semibold text-amber-500 focus:text-amber-500 cursor-pointer">
            <Edit className="mr-2 h-4 w-4 text-amber-500" /> {isAr ? "تعديل الرحلة والترجمات" : "Edit Tour & Translations"}
          </DropdownMenuItem>
        )}
        {onMove && (
          <DropdownMenuItem onClick={() => onMove(tour)} className="font-semibold text-primary focus:text-primary cursor-pointer">
            <ArrowRightLeft className="mr-2 h-4 w-4 text-primary" />
            {isAr ? "نقل الرحلة (Move Tour)" : "Move Tour"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/${locale}/admin/tours/${tour.slug}`}>
            <Eye className="mr-2 h-4 w-4" /> {isAr ? "عرض المواصفات الكاملة" : "View Full Specs"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> {isAr ? "محرر الرحلة المتقدم" : "Advanced Tour Editor"}
          </Link>
        </DropdownMenuItem>
        {tour.status === "DRAFT" && (
          <DropdownMenuItem onClick={() => publish.mutate(tour.slug)} className="cursor-pointer text-emerald-600 focus:text-emerald-600">
            <Send className="mr-2 h-4 w-4" /> {isAr ? "نشر الرحلة" : "Publish Tour"}
          </DropdownMenuItem>
        )}
        {tour.status === "PUBLISHED" && (
          <DropdownMenuItem onClick={() => unpublish.mutate(tour.slug)} className="cursor-pointer text-amber-600 focus:text-amber-600">
            <Undo2 className="mr-2 h-4 w-4" /> {isAr ? "إلغاء النشر" : "Unpublish Tour"}
          </DropdownMenuItem>
        )}
        {tour.status !== "ARCHIVED" ? (
          <DropdownMenuItem onClick={() => archive.mutate(tour.slug)} className="cursor-pointer text-amber-600 focus:text-amber-600">
            <Archive className="mr-2 h-4 w-4" /> {isAr ? "أرشفة الرحلة" : "Archive Tour"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => unarchive.mutate(tour.slug)} className="cursor-pointer text-sky-600 focus:text-sky-600">
            <RotateCcw className="mr-2 h-4 w-4" /> {isAr ? "استعادة كمسودة" : "Restore as Draft"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(tour)} className="text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer">
          <Trash className="mr-2 h-4 w-4" /> {isAr ? "حذف الرحلة" : "Delete Tour"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

