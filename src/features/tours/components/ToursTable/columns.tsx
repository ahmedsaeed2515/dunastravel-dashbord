"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star, MapPin, ImageIcon } from "lucide-react";
import { TourRowActions } from "./TourRowActions";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useToggleFeatured } from "../../hooks/useTours";
import { Loader2 } from "lucide-react";

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


function FeaturedCell({ tour }: { tour: Tour }) {
  const { mutate: toggleFeatured, isPending } = useToggleFeatured();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFeatured({ slug: tour.slug, isFeatured: !tour.isFeatured });
      }}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
        tour.isFeatured
          ? "bg-amber-500/15 text-amber-500 border-amber-500/40 hover:bg-amber-500/25 shadow-xs font-semibold"
          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
      }`}
      title={tour.isFeatured ? "انقر لإلغاء التمييز" : "انقر لتمييز الرحلة وتثبيتها في المقدمة"}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
      ) : (
        <Star className={`h-3.5 w-3.5 ${tour.isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground/60"}`} />
      )}
      <span>{tour.isFeatured ? "مميزة ⭐" : "عادية"}</span>
    </button>
  );
}

export function getColumns(
  onView: (tour: Tour) => void,
  onEdit: (tour: Tour) => void,
  onMove: (tour: Tour) => void,
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
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "displayOrder",
      header: "# الأولوية",
      cell: ({ row }) => {
        const order = row.original.displayOrder ?? 0;
        return (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border">
            {order}
          </span>
        );
      },
    },
    {
      id: "isFeatured",
      header: "التمييز",
      cell: ({ row }) => <FeaturedCell tour={row.original} />,
    },
    {
      accessorKey: "titleJsonb",
      header: tTours("tourTitle"),
      cell: ({ row }) => {
        const tour = row.original;
        const title = getTourTitle(tour, currentLocale);
        const heroImg = tour.heroImage || (tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : null);

        return (
          <div className="flex items-center gap-3 min-w-70 max-w-95">
            <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted border shrink-0">
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
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />
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
          <div className="flex flex-col gap-1 min-w-35">
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
            onMove={onMove}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
