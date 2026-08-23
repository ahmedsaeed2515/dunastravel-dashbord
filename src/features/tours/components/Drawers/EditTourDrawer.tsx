"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tour, UpdateTourPayload } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateTour } from "../../hooks/useTours";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  titleEn: z.string().min(1, "English title is required"),
  titleAr: z.string().optional(),
  titleEs: z.string().optional(),
  titlePt: z.string().optional(),
  titleIt: z.string().optional(),

  overviewEn: z.string().optional(),
  overviewAr: z.string().optional(),
  overviewEs: z.string().optional(),
  overviewPt: z.string().optional(),
  overviewIt: z.string().optional(),

  category: z.string().min(1),
  basePriceUsd: z.coerce.number().min(0, "Base price must be 0 or greater"),
  capacity: z.coerce.number().min(1),
  minParticipants: z.coerce.number().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  country: z.string().optional(),
  city: z.string().optional(),
});

interface EditTourDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTourDrawer({ tour, open, onOpenChange }: EditTourDrawerProps) {
  const { mutate: updateTour, isPending: isUpdating } = useUpdateTour();
  const [activeLangTab, setActiveLangTab] = useState<string>("en");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      titleEn: "",
      titleAr: "",
      titleEs: "",
      titlePt: "",
      titleIt: "",
      overviewEn: "",
      overviewAr: "",
      overviewEs: "",
      overviewPt: "",
      overviewIt: "",
      category: "Multi-Country",
      basePriceUsd: 0,
      capacity: 30,
      minParticipants: 1,
      status: "PUBLISHED",
      isFeatured: false,
      country: "",
      city: "",
    },
  });

  useEffect(() => {
    if (tour && open) {
      const titles = tour.titleJsonb || {};
      const overviews = tour.overviewJsonb || tour.descriptionJsonb || {};

      form.reset({
        titleEn: titles.en || "",
        titleAr: titles.ar || "",
        titleEs: titles.es || "",
        titlePt: titles.pt || "",
        titleIt: titles.it || "",

        overviewEn: overviews.en || "",
        overviewAr: overviews.ar || "",
        overviewEs: overviews.es || "",
        overviewPt: overviews.pt || "",
        overviewIt: overviews.it || "",

        category: tour.category || "Multi-Country",
        basePriceUsd: parseFloat(tour.basePriceUsd || "0"),
        capacity: tour.capacity ?? 0,
        minParticipants: tour.minParticipants ?? 0,
        status: tour.status || "PUBLISHED",
        isFeatured: tour.isFeatured || false,
        country: tour.country || "",
        city: tour.city || "",
      });
    }
  }, [tour, open, form]);

  if (!tour) return null;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: UpdateTourPayload = {
      titleJsonb: {
        en: values.titleEn,
        ar: values.titleAr || values.titleEn,
        es: values.titleEs || values.titleEn,
        pt: values.titlePt || values.titleEn,
        it: values.titleIt || values.titleEn,
      },
      overviewJsonb: {
        en: values.overviewEn || "",
        ar: values.overviewAr || values.overviewEn || "",
        es: values.overviewEs || values.overviewEn || "",
        pt: values.overviewPt || values.overviewEn || "",
        it: values.overviewIt || values.overviewEn || "",
      },
      category: values.category,
      basePriceUsd: values.basePriceUsd,
      capacity: values.capacity,
      minParticipants: values.minParticipants,
      status: values.status,
      isActive: values.status === "PUBLISHED",
      isFeatured: values.isFeatured,
      country: values.country,
      city: values.city,
    };

    updateTour({ slug: tour.slug, data: payload }, {
      onSuccess: () => {
        toast.success(`Tour ${tour.slug} updated successfully across all 5 languages`);
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(`Failed to update tour: ${err?.message || "Server error"}`);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[650px] overflow-hidden flex flex-col">
        <SheetHeader className="mb-4 shrink-0">
          <SheetTitle>Edit Tour Package</SheetTitle>
          <SheetDescription className="font-mono text-xs text-muted-foreground">
            SLUG: {tour.slug}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-6 pb-4">
                
                {/* 5-Language Localized Editing Tabs */}
                <div className="border rounded-xl p-4 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary" /> Localized Content (5 Languages)
                    </span>
                  </div>

                  <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
                    <TabsList className="grid grid-cols-5 w-full h-9 bg-muted/50 p-1">
                      <TabsTrigger value="en" className="text-xs font-bold">EN</TabsTrigger>
                      <TabsTrigger value="ar" className="text-xs font-bold">AR (عربي)</TabsTrigger>
                      <TabsTrigger value="es" className="text-xs font-bold">ES</TabsTrigger>
                      <TabsTrigger value="pt" className="text-xs font-bold">PT</TabsTrigger>
                      <TabsTrigger value="it" className="text-xs font-bold">IT</TabsTrigger>
                    </TabsList>

                    {/* EN TAB */}
                    <TabsContent value="en" className="space-y-3 pt-3">
                      <FormField
                        control={form.control as any}
                        name="titleEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Title (English)</FormLabel>
                            <FormControl><Input placeholder="English title..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="overviewEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Overview (English)</FormLabel>
                            <FormControl><Textarea placeholder="English overview..." className="min-h-[90px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* AR TAB */}
                    <TabsContent value="ar" className="space-y-3 pt-3" dir="rtl">
                      <FormField
                        control={form.control as any}
                        name="titleAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">العنوان (العربية)</FormLabel>
                            <FormControl><Input placeholder="العنوان بالعربية..." dir="rtl" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="overviewAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">الوصف (العربية)</FormLabel>
                            <FormControl><Textarea placeholder="الوصف بالعربية..." dir="rtl" className="min-h-[90px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* ES TAB */}
                    <TabsContent value="es" className="space-y-3 pt-3">
                      <FormField
                        control={form.control as any}
                        name="titleEs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Título (Español)</FormLabel>
                            <FormControl><Input placeholder="Título en español..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="overviewEs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Resumen (Español)</FormLabel>
                            <FormControl><Textarea placeholder="Resumen en español..." className="min-h-[90px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* PT TAB */}
                    <TabsContent value="pt" className="space-y-3 pt-3">
                      <FormField
                        control={form.control as any}
                        name="titlePt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Título (Português)</FormLabel>
                            <FormControl><Input placeholder="Título em português..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="overviewPt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Visão Geral (Português)</FormLabel>
                            <FormControl><Textarea placeholder="Visão geral em português..." className="min-h-[90px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* IT TAB */}
                    <TabsContent value="it" className="space-y-3 pt-3">
                      <FormField
                        control={form.control as any}
                        name="titleIt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Titolo (Italiano)</FormLabel>
                            <FormControl><Input placeholder="Titolo in italiano..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="overviewIt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Panoramica (Italiano)</FormLabel>
                            <FormControl><Textarea placeholder="Panoramica in italiano..." className="min-h-[90px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Core Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Category</FormLabel>
                        <FormControl><Input placeholder="e.g. Multi-Country" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="basePriceUsd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Base Price (USD)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Country</FormLabel>
                        <FormControl><Input placeholder="e.g. Egypt" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">City</FormLabel>
                        <FormControl><Input placeholder="e.g. Cairo" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Capacity (Seats)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="minParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Min Participants</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-[60px] self-end">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs font-semibold">Featured</FormLabel>
                          <FormDescription className="text-[10px]">
                            Highlight product
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="pt-4 pb-2 shrink-0 border-t flex justify-end gap-3 bg-background mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save 5-Language Tour
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
