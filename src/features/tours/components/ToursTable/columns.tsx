"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star, MapPin, Users, Image as ImageIcon } from "lucide-react";
import { TourRowActions } from "./TourRowActions";
import Image from "next/image";

export function getTourTitle(tour: Tour, lang: string = "en"): string {
  const titleObj = tour.titleJsonb || {};
  if (titleObj[lang] && typeof titleObj[lang] === "string" && titleObj[lang].trim() !== "") {
    return titleObj[lang];
  }
  const fallbackOrder = ["en", "es", "ar", "pt", "it"];
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
  onDelete: (tour: Tour) => void
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
      header: "Tour Product",
      cell: ({ row }) => {
        const tour = row.original;
        const title = getTourTitle(tour, "en");
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
              <span className="text-xs font-mono text-muted-foreground truncate">{tour.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category & Destination",
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
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const isActive = row.original.isActive;

        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (status === "PUBLISHED" && isActive) variant = "default";
        if (status === "DRAFT") variant = "secondary";
        if (status === "ARCHIVED") variant = "destructive";

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant} className="w-fit font-semibold text-xs py-0.5 px-2">
              {status}
            </Badge>
            {!isActive && (
              <span className="text-[10px] text-muted-foreground font-medium">Inactive</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "basePriceUsd",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("basePriceUsd") || "0");
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(amount);
        return (
          <div className="flex flex-col">
            <span className="font-semibold font-mono text-sm text-foreground">{formatted}</span>
            <span className="text-[10px] text-muted-foreground">per person</span>
          </div>
        );
      },
    },
    {
      accessorKey: "remainingSeats",
      header: "Occupancy",
      cell: ({ row }) => {
        const remaining = row.original.remainingSeats ?? 30;
        const capacity = row.original.capacity ?? 30;
        const sold = Math.max(0, capacity - remaining);
        const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

        return (
          <div className="w-[120px] space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">{sold}/{capacity}</span>
              <span className="font-mono text-foreground font-semibold">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${percent > 80 ? 'bg-amber-500' : percent > 50 ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min(100, percent)}%` }} 
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
