/**
 * Utility functions for generating public frontend website URLs from the dashboard.
 * 
 * Target Frontend during development/staging: https://dunastravel-frontend.vercel.app
 * Target Frontend on final domain go-live: https://dunastravel.com / https://www.dunastravel.com
 */

export const DEFAULT_STAGING_FRONTEND_URL = "https://dunastravel-frontend.vercel.app";

export function getFrontendBaseUrl(): string {
  // 1. Explicit environment variable
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL.replace(/\/$/, "");
  }

  // 2. Browser runtime determination
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    // Local development environment
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5173";
    }
    // Vercel deployment / staging environments -> point directly to the live frontend
    if (hostname.includes("vercel.app") || hostname.includes("dunastravel-dashbord")) {
      return DEFAULT_STAGING_FRONTEND_URL;
    }
    // Custom domain production (e.g. dashboard.dunastravel.com or admin.dunastravel.com)
    if (hostname.includes("dunastravel.com")) {
      return origin.replace(/^(https?:\/\/)(dashboard|admin)\./i, "$1www.");
    }
  }

  return DEFAULT_STAGING_FRONTEND_URL;
}

/**
 * Returns the public frontend URL for a given tour by slug.
 */
export function getFrontendTourUrl(slug: string): string {
  if (!slug) return getFrontendBaseUrl();
  const baseUrl = getFrontendBaseUrl();
  const cleanSlug = encodeURIComponent(slug.trim());
  return `${baseUrl}/tours/${cleanSlug}`;
}
