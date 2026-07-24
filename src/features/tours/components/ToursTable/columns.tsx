"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star, MapPin, ImageIcon } from "lucide-react";
import { TourRowActions } from "./TourRowActions";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

export function getTourTitle(tour: Tour, lang: string = "en"): string {
  if ((tour as any).title && typeof (tour as any).title === "string" && (tour as any).title.trim() !== "") {
    return (tour as any).title;
  }
  const titleObj = tour.titleJsonb || {};
  if (titleObj[lang] && typeof titleObj[lang] === "string" && titleObj[lang].trim() !== "") {
    return titleObj[lang];
  }
  const fallbackOrder = ["en", "ar", "es", "pt", "it"];
  for (const l of fallbackOrder) {
    if (titleObj[l] && typeof titleObj[l] === "string" && titleObj[l].trim() !== "") {
      return titleObj[l];
    }
  }
  return tour.slug;
}

export function getColumns(
  onView: (tour: Tour) => void,
  onEdit: (tour: Tour) => void,
  onDelete: (tour: Tour) => void,
  tTours: (key: string) => string,
  tCommon: (key: string) => string,
  currentLocale: string = "en"
): ColumnDef<Tour>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "titleJsonb",
      header: tTours("tourTitle"),
      cell: ({ row }) => {
        const tour = row.original;
        const title = getTourTitle(tour, currentLocale);
        const heroImg = tour.heroImage || (tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : null);

        return (
          <div className="flex items-center gap-3 min-w-[280px] max-w-[380px]">
            <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
              {heroImg ? (
                <img
                  src={heroImg}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 font-medium text-foreground truncate text-sm">
                <span className="truncate">{title}</span>
                {tour.isFeatured && (
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground truncate dir-ltr text-start">{tour.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: tTours("destination"),
      cell: ({ row }) => {
        const tour = row.original;
        return (
          <div className="flex flex-col gap-1 min-w-[140px]">
            <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold tracking-wider py-0 px-2">
              {tour.category || "General"}
            </Badge>
            {tour.country && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                {tour.country}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "basePriceUsd",
      header: tTours("priceFrom"),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("basePriceUsd") || "0");
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(amount);
        return (
          <div className="flex flex-col">
            <span className="font-semibold font-mono text-sm text-foreground dir-ltr inline-block">{formatted}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const rawDate = row.getValue("createdAt") as string;
        let formatted = "—";
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) formatted = format(d, "MMM d, yyyy");
          } catch {}
        }
        return <span className="text-xs text-muted-foreground whitespace-nowrap">{formatted}</span>;
      },
      meta: { className: "hidden lg:table-cell" }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <TourRowActions
            tour={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
