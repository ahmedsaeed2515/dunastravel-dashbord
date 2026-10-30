import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1)
    .default(process.env.NEXT_PUBLIC_API_URL || 'https://api.dunas-travel.com/api'),
  INTERNAL_API_URL: z
    .string()
    .min(1)
    .default(process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dunas-travel.com/api'),
  NEXT_PUBLIC_FRONTEND_URL: z
    .string()
    .optional()
    .default(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://dunas-travel.com'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
});
