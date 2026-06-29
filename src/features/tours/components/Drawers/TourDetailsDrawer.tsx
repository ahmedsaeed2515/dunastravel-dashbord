"use client";

import { Tour } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Star, CheckCircle, Navigation, DollarSign, Calendar, MapPin, Layers } from "lucide-react";

interface TourDetailsDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TourDetailsDrawer({ tour, open, onOpenChange }: TourDetailsDrawerProps) {
  if (!tour) return null;

  const titleEn = tour.titleJsonb?.["en"] || tour.slug;
  const descriptionEn = tour.descriptionJsonb?.["en"] || "No description provided.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[750px] md:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={tour.status === "PUBLISHED" ? "default" : tour.status === "DRAFT" ? "secondary" : "destructive"}>
                  {tour.status}
                </Badge>
                {tour.isFeatured && (
                  <Badge variant="outline" className="border-amber-400 bg-amber-500/10 text-amber-500 gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Featured
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold font-serif tracking-tight">
                {titleEn}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs text-muted-foreground">
                SLUG: {tour.slug}
              </SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary font-mono">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: tour.currency || "USD" }).format(parseFloat(tour.basePriceUsd))}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Created {format(new Date(tour.createdAt), "MMM do, yyyy")}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-12 mb-4 bg-muted/40 p-1 rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="media">Media & Assets</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Rules</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)] pr-4">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="bg-card p-4 rounded-xl border shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm leading-relaxed text-foreground">{descriptionEn}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Geography
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block">Country</span>
                      <span className="font-medium">{tour.country || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">City</span>
                      <span className="font-medium">{tour.city || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Latitude</span>
                      <span className="font-mono text-xs">{tour.latitude || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Longitude</span>
                      <span className="font-mono text-xs">{tour.longitude || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> Logistics & Capacity
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block">Total Capacity</span>
                      <span className="font-medium">{tour.capacity} Seats</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Remaining Seats</span>
                      <span className="font-medium text-emerald-600 font-semibold">{tour.remainingSeats} Seats</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Min Participants</span>
                      <span className="font-medium">{tour.minParticipants} Pax</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Max Participants</span>
                      <span className="font-medium">{tour.maxParticipants || "Unlimited"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SEO & Taxonomy</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">SEO Title</span>
                    <span className="font-medium">{tour.seoTitle || titleEn}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">SEO Description</span>
                    <span className="text-muted-foreground text-xs block mt-1 bg-muted p-2 rounded">
                      {tour.seoDescription || "No custom meta description provided."}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1.5">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tour.tags?.length ? (
                        tour.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)
                      ) : (
                        <span className="text-muted-foreground text-xs">No tags assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ITINERARY TAB */}
            <TabsContent value="itinerary" className="space-y-4">
              {tour.itineraries && tour.itineraries.length > 0 ? (
                <div className="space-y-4">
                  {tour.itineraries.map((it, i) => (
                    <div key={it.id || i} className="border rounded-xl p-5 bg-card shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-base text-primary">
                          {it.dayLabel || `Day ${it.sortOrder}`}
                        </span>
                        <Badge variant="outline">Step {it.sortOrder}</Badge>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {it.descriptionJsonb?.["en"] || "No description for this day."}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
                        <div>
                          <span className="text-muted-foreground block font-medium">Meals</span>
                          <span className="truncate block font-mono">{JSON.stringify(it.mealsJsonb || {})}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Hotels</span>
                          <span className="truncate block font-mono">{JSON.stringify(it.hotelsJsonb || {})}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Activities</span>
                          <span className="truncate block font-mono">{JSON.stringify(it.activitiesJsonb || {})}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Transport</span>
                          <span className="truncate block font-mono">{JSON.stringify(it.transportationJsonb || {})}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-xl bg-card">
                  No itinerary day plans recorded for this tour.
                </div>
              )}
            </TabsContent>

            {/* MEDIA TAB */}
            <TabsContent value="media" className="space-y-4">
              {tour.images && tour.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {tour.images.map((img, i) => (
                    <div key={img.id || i} className="group relative border rounded-xl overflow-hidden bg-muted shadow-sm aspect-video flex items-center justify-center">
                      <img src={img.imageUrl} alt={img.altText || "Tour asset"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      {img.isHero && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-primary-foreground text-xs shadow">Hero Asset</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-xl bg-card">
                  No images or media assets attached.
                </div>
              )}
            </TabsContent>

            {/* PRICING TAB */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary" /> Seasonal Pricing Rules
                </h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  {JSON.stringify(tour.seasonPricingJsonb || { defaultMargin: "25%", dynamicSurge: false }, null, 2)}
                </div>
              </div>

              <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> Operating Days Schedule
                </h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  {JSON.stringify(tour.operatingDaysJsonb || { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }, null, 2)}
                </div>
              </div>
            </TabsContent>

            {/* AUDIT LOGS TAB */}
            <TabsContent value="audit" className="space-y-4">
              {tour.activityLogs && tour.activityLogs.length > 0 ? (
                <div className="relative border-l border-muted ml-3 space-y-6">
                  {tour.activityLogs.map((log: any, i: number) => (
                    <div key={log.id || i} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5" />
                      <div className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{format(new Date(log.createdAt), "MMM do, yyyy h:mm a")}</div>
                      <div className="text-xs mt-2 p-2.5 bg-muted rounded-lg font-mono overflow-x-auto">
                        {JSON.stringify(log.details)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-xl bg-card">
                  No audit logs recorded for this tour.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
