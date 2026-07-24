"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTour, useUpdateTour } from "@/features/tours/hooks/useTours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Edit, Eye, Star, ShieldAlert, Layers } from "lucide-react";
import { toast } from "sonner";

export default function TourDetailsPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const { data: tour, isLoading, error } = useTour(slug);
  const updateMutation = useUpdateTour();

  const [activeLocale, setActiveLocale] = useState("en");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading tour details...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Tour Not Found</h2>
        <p className="text-sm text-muted-foreground">
          Could not find tour with slug <code className="bg-muted px-1 rounded">{slug}</code>.
        </p>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Tours Catalog</Button>
        </Link>
      </div>
    );
  }

  const titleEn = tour.titleJsonb?.en || tour.slug;
  const activeTitle = tour.titleJsonb?.[activeLocale] || titleEn;
  const activeOverview = tour.overviewJsonb?.[activeLocale] || "";
  const activeDuration = tour.durationJsonb?.[activeLocale] || "";

  const togglePublishStatus = async () => {
    const newStatus = tour.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await updateMutation.mutateAsync({
        slug: tour.slug,
        data: { status: newStatus as any },
      });
      toast.success(`Tour status changed to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const occupiedSeats = (tour.capacity || 30) - (tour.remainingSeats ?? 30);
  const occupancyRate = (tour.capacity || 30) > 0 ? Math.round((occupiedSeats / (tour.capacity || 30)) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <Link href={`/${locale}/admin/tours`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tours & Products
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{titleEn}</h1>
            <Badge variant={tour.status === "PUBLISHED" ? "default" : "secondary"}>
              {tour.status}
            </Badge>
            {tour.isFeatured && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Star className="w-3 h-3 mr-1 fill-amber-500" /> Featured
              </Badge>
            )}
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Slug: /{tour.slug} • Category: {tour.category || "General"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" /> Preview as Visitor (معاينة كزائر)
            </Button>
          </Link>
          <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
            <Button size="sm" className="gap-1.5">
              <Edit className="w-4 h-4" /> Full Tour Editor
            </Button>
          </Link>
          <Button size="sm" variant={tour.status === "PUBLISHED" ? "secondary" : "default"} onClick={togglePublishStatus} disabled={updateMutation.isPending}>
            {tour.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">Base Price (USD)</div>
          <div className="text-2xl font-bold font-mono mt-1 text-primary">${tour.basePriceUsd} USD</div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">Capacity & Occupancy</div>
          <div className="text-2xl font-bold mt-1">
            {occupiedSeats} / {tour.capacity} <span className="text-xs font-normal text-muted-foreground">({occupancyRate}%)</span>
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">Interfaces Assigned</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-primary" />
            {tour.landingPages?.length || 0}
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">Itinerary & Media</div>
          <div className="text-2xl font-bold mt-1">
            {tour.itineraries?.length || 0} Days • {tour.images?.length || 0} Photos
          </div>
        </Card>
      </div>

      {/* Tabs Detail View */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translations">Locales & Content</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary ({tour.itineraries?.length || 0})</TabsTrigger>
          <TabsTrigger value="media">Gallery ({tour.images?.length || 0})</TabsTrigger>
          <TabsTrigger value="interfaces">Interfaces ({tour.landingPages?.length || 0})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({tour.bookings?.length || 0})</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Tour Overview ({activeLocale.toUpperCase()})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Title</h4>
                  <p className="text-lg font-medium">{activeTitle}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Overview</h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {activeOverview || "No overview provided for this language."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{tour.category || "General"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{tour.country || "Not specified"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-medium">{tour.city || "Not specified"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{activeDuration || "Not specified"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{tour.capacity} seats</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. TRANSLATIONS */}
        <TabsContent value="translations" className="space-y-4">
          <div className="flex gap-2 mb-4 border-b pb-2">
            {["en", "ar", "es", "pt", "it"].map((loc) => (
              <Button
                key={loc}
                variant={activeLocale === loc ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLocale(loc)}
                className="uppercase"
              >
                {loc}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multilingual Content for [{activeLocale.toUpperCase()}]</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Title</span>
                <p className="text-sm font-medium">{tour.titleJsonb?.[activeLocale] || "—"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subtitle</span>
                <p className="text-sm font-medium">{tour.subtitleJsonb?.[activeLocale] || "—"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Overview</span>
                <p className="text-sm text-muted-foreground">{tour.overviewJsonb?.[activeLocale] || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ITINERARY */}
        <TabsContent value="itinerary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day-by-Day Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tour.itineraries && tour.itineraries.length > 0 ? (
                tour.itineraries.map((day, idx) => (
                  <div key={day.id || idx} className="p-4 border rounded-lg bg-card space-y-2">
                    <div className="flex justify-between items-center font-semibold text-sm">
                      <span>{day.dayLabel || `Day ${idx + 1}`}</span>
                      {day.mealsJsonb?.[activeLocale] && (
                        <Badge variant="outline" className="text-xs">
                          {day.mealsJsonb[activeLocale]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {day.descriptionJsonb?.[activeLocale] || day.descriptionJsonb?.en || "No description."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No itinerary steps created.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MEDIA */}
        <TabsContent value="media" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tour.images && tour.images.length > 0 ? (
              tour.images.map((img) => (
                <div key={img.id || img.imageUrl} className="relative h-40 rounded-lg overflow-hidden border group bg-muted">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {img.isHero && (
                    <Badge className="absolute top-2 left-2 text-[10px]" variant="default">Hero Image</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground text-sm">No images linked to this tour.</div>
            )}
          </div>
        </TabsContent>

        {/* 5. INTERFACES */}
        <TabsContent value="interfaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tour Interfaces / Landing Pages Using This Tour</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.landingPages && tour.landingPages.length > 0 ? (
                <div className="divide-y border rounded-md">
                  {tour.landingPages.map((lp: any) => (
                    <div key={lp.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{lp.landingPage?.titleJsonb?.en || lp.landingPage?.slug}</div>
                        <div className="text-xs font-mono text-muted-foreground">/{lp.landingPage?.slug}</div>
                      </div>
                      <Badge variant="outline">{lp.landingPage?.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">This tour is not assigned to any landing page interface yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. BOOKINGS */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Bookings for This Tour</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.bookings && tour.bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tour.bookings.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs">{b.referenceCode}</TableCell>
                        <TableCell>{b.billingInfo?.fullName || "—"}</TableCell>
                        <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                        <TableCell className="font-mono">${b.totalAmountUsd}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No bookings recorded for this tour yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
