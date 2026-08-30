"use client";

import { Tour } from "../../types";
import { getTourTitle } from "../ToursTable/columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Eye, Edit3, MoreVertical, Sparkles, Image as ImageIcon, ArrowRightLeft, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";
import { getFrontendTourUrl } from "@/lib/frontend-urls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBulkUpdateTours } from "../../hooks/useTours";
import { useTranslations, useLocale } from "next-intl";

interface TourCardGridProps {
  tours: Tour[];
  onView: (tour: Tour) => void;
  onEdit: (tour: Tour) => void;
  onMove?: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
}

export function TourCardGrid({ tours, onView, onEdit, onMove, onDelete }: TourCardGridProps) {
  const bulkUpdate = useBulkUpdateTours();
  const tTours = useTranslations("tours");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tDashboard = useTranslations("dashboard");
  const currentLocale = useLocale();
  const isAr = currentLocale === "ar";

  const handleTogglePublish = async (tour: Tour) => {
    const nextStatus = tour.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await bulkUpdate.mutateAsync({ slugs: [tour.slug], status: nextStatus });
  };

  const handleToggleFeatured = async (tour: Tour) => {
    await bulkUpdate.mutateAsync({ slugs: [tour.slug], isFeatured: !tour.isFeatured });
  };

  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-16 bg-card border rounded-2xl p-8">
        <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground">{tTours("noTours")}</h3>
        <p className="text-sm text-muted-foreground mt-1">{tTours("noToursDesc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map((tour) => {
        const title = getTourTitle(tour, currentLocale);
        const heroImg = tour.heroImage || (tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : null);
        const amount = parseFloat(tour.basePriceUsd || "0");
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(amount);

        const remaining = tour.remainingSeats ?? 30;
        const capacity = tour.capacity ?? 30;
        const sold = Math.max(0, capacity - remaining);
        const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

        return (
          <div
            key={tour.id || tour.slug}
            className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col"
          >
            {/* Image Banner & Badges */}
            <div className="relative h-48 w-full bg-muted overflow-hidden">
              {heroImg ? (
                <img
                  src={heroImg}
                  alt={title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

              {/* Status & Featured Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <Badge
                  variant={tour.status === "PUBLISHED" ? "default" : tour.status === "DRAFT" ? "secondary" : "destructive"}
                  className="font-bold text-xs shadow-sm"
                >
                  {tStatus(tour.status)}
                </Badge>
                {tour.isFeatured && (
                  <Badge variant="secondary" className="bg-linear-to-r from-amber-500 to-amber-600 text-white border-none font-bold text-xs flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-white text-white" />
                    {isAr ? "مميزة ⭐" : "Featured ⭐"}
                  </Badge>
                )}
                {tour.displayOrder !== undefined && tour.displayOrder !== null && tour.displayOrder > 0 && (
                  <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-white/20 font-mono text-xs">
                    #{tour.displayOrder}
                  </Badge>
                )}
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-white/20 text-[10px] uppercase font-bold tracking-wider">
                  {tour.category || "General"}
                </Badge>
              </div>

              {/* Price Tag */}
              <div className="absolute bottom-3 right-3 text-right bg-background/90 backdrop-blur-md px-3 py-1 rounded-xl border shadow-sm">
                <span className="text-xs text-muted-foreground block text-[10px]">{tTours("priceFrom")}</span>
                <span className="font-mono font-extrabold text-foreground text-sm">{formattedPrice}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                </div>

                <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                  {tour.slug}
                </p>

                {tour.country && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{tour.country}</span>
                    {tour.city && <span>• {tour.city}</span>}
                  </div>
                )}
              </div>

              {/* Occupancy Bar */}
              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {tDashboard("occupancyRate")}
                  </span>
                  <span className="font-mono font-bold text-foreground">{sold} / {capacity} ({percent}%)</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${percent > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-1.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 gap-1.5 text-xs font-semibold cursor-pointer"
                  onClick={() => onView(tour)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {tCommon("view")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 h-9 gap-1.5 text-xs font-semibold cursor-pointer"
                  onClick={() => onEdit(tour)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {tCommon("edit")}
                </Button>

                <a
                  href={getFrontendTourUrl(tour.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 hover:bg-sky-500/15 hover:text-sky-400 text-sky-500 rounded-xl border border-border/80 transition-colors cursor-pointer shrink-0"
                  title={isAr ? "عرض في الموقع المباشر (الفرونت)" : "View on Live Website (Frontend)"}
                  aria-label={isAr ? "عرض في الموقع" : "View on Website"}
                >
                  <Globe className="h-4 w-4" />
                </a>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer font-bold text-sky-500 focus:text-sky-500">
                      <a href={getFrontendTourUrl(tour.slug)} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2 text-sky-500" />
                        {isAr ? "عرض في الموقع (الفرونت)" : "View on Live Website"}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer font-bold text-emerald-500 focus:text-emerald-500">
                      <Link href={`/${currentLocale}/admin/tours/${tour.slug}/preview`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2 text-emerald-500" />
                        {isAr ? "معاينة كزائر في الداشبورد" : "Admin Visitor Preview"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onMove && (
                      <DropdownMenuItem onClick={() => onMove(tour)} className="font-bold text-primary focus:text-primary cursor-pointer">
                        <ArrowRightLeft className="h-4 w-4 mr-2 text-primary" />
                        {isAr ? "نقل الرحلة (Move)" : "Move Tour"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleTogglePublish(tour)} className="cursor-pointer">
                      {tour.status === "PUBLISHED" ? tStatus("DRAFT") : tStatus("PUBLISHED")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(tour)} className="cursor-pointer">
                      {tTours("title")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(tour)}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      {tCommon("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
