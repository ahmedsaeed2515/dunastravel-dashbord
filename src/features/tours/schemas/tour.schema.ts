import { z } from "zod";

export const itinerarySchema = z.object({
  id: z.string().optional(),
  dayLabel: z.string().optional(),
  descriptionJsonb: z.record(z.string(), z.any()),
  mealsJsonb: z.record(z.string(), z.any()).nullable().optional(),
  activitiesJsonb: z.record(z.string(), z.any()).nullable().optional(),
  hotelsJsonb: z.record(z.string(), z.any()).nullable().optional(),
  transportationJsonb: z.record(z.string(), z.any()).nullable().optional(),
  notesJsonb: z.record(z.string(), z.any()).nullable().optional(),
  sortOrder: z.number(),
});

export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  isHero: z.boolean().optional(),
  isVideo: z.boolean().optional(),
  videoUrl: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  sortOrder: z.number(),
});

export const tourFormSchema = z.object({
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100),
  titleJsonb: z.record(z.string(), z.any()),
  subtitleJsonb: z.record(z.string(), z.any()).nullable().optional(),
  descriptionJsonb: z.record(z.string(), z.any()),
  highlightJsonb: z.record(z.string(), z.any()).nullable().optional(),
  inclusionJsonb: z.record(z.string(), z.any()).nullable().optional(),
  exclusionJsonb: z.record(z.string(), z.any()).nullable().optional(),
  importantNotesJsonb: z.record(z.string(), z.any()).nullable().optional(),
  cancellationPolicyJsonb: z.record(z.string(), z.any()).nullable().optional(),
  category: z.string().nullable().optional(),
  basePriceUsd: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  operatingDaysJsonb: z.record(z.string(), z.any()).nullable().optional(),
  seasonPricingJsonb: z.record(z.string(), z.any()).nullable().optional(),
  minParticipants: z.number().min(1).default(1),
  maxParticipants: z.number().nullable().optional(),
  capacity: z.number().min(1).default(10),
  remainingSeats: z.number().min(0).default(10),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  itineraries: z.array(itinerarySchema).optional(),
  images: z.array(imageSchema).optional(),
});

export type TourFormValues = z.infer<typeof tourFormSchema>;
