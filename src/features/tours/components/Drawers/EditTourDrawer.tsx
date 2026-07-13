"use client";

import { useEffect } from "react";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  titleEn: z.string().min(2, "Title is required"),
  descriptionEn: z.string().min(10, "Description is required"),
  category: z.string().min(1),
  basePriceUsd: z.coerce.number().min(0),
  capacity: z.coerce.number().min(1),
  minParticipants: z.coerce.number().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  country: z.string(),
  city: z.string(),
});

interface EditTourDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTourDrawer({ tour, open, onOpenChange }: EditTourDrawerProps) {
  const { mutate: updateTour, isPending: isUpdating } = useUpdateTour();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      titleEn: "",
      descriptionEn: "",
      category: "ADVENTURE",
      basePriceUsd: 0,
      capacity: 10,
      minParticipants: 1,
      status: "DRAFT",
      isFeatured: false,
      country: "",
      city: "",
    },
  });

  useEffect(() => {
    if (tour && open) {
      form.reset({
        titleEn: tour.titleJsonb?.en || "",
        descriptionEn: tour.descriptionJsonb?.en || "",
        category: tour.category || "ADVENTURE",
        basePriceUsd: parseFloat(tour.basePriceUsd) || 0,
        capacity: tour.capacity || 10,
        minParticipants: tour.minParticipants || 1,
        status: tour.status,
        isFeatured: tour.isFeatured,
        country: tour.country || "",
        city: tour.city || "",
      });
    }
  }, [tour, open, form]);

  if (!tour) return null;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: UpdateTourPayload = {
      titleJsonb: { ...tour.titleJsonb, en: values.titleEn },
      descriptionJsonb: { ...tour.descriptionJsonb, en: values.descriptionEn },
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
        onOpenChange(false);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-hidden flex flex-col">
        <SheetHeader className="mb-4 shrink-0">
          <SheetTitle>Edit Tour: {tour.slug}</SheetTitle>
          <SheetDescription>Update the essential details for this tour package.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 pb-4">
                <FormField
                  control={form.control as any}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (EN)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pyramids Extravaganza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (EN)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tour description..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADVENTURE">Adventure</SelectItem>
                            <SelectItem value="CULTURE">Culture</SelectItem>
                            <SelectItem value="RELAXATION">Relaxation</SelectItem>
                            <SelectItem value="CRUISE">Cruise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="basePriceUsd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
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
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="minParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Participants</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-[72px]">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription className="text-xs">
                            Show on homepage
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
