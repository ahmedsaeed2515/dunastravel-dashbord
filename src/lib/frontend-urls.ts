/**
 * Utility functions for generating public frontend website URLs from the dashboard.
 * 
 * Target Frontend during development/staging: https://dunastravel-frontend.vercel.app
 * Target Frontend on final domain go-live: https://dunastravel.com / https://www.dunastravel.com
 */

export const DEFAULT_STAGING_FRONTEND_URL = "https://dunastravel-frontend.vercel.app";

export function getFrontendBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();

  // 1. Explicit environment variable (ignore obsolete legacy domains)
  if (envUrl && !envUrl.includes("luxury-project") && !envUrl.includes("1z5s")) {
    return envUrl.replace(/\/$/, "");
  }

  // 2. Browser runtime determination
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    // Local development environment
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5173";
    }
    // Vercel deployment / staging environments -> point directly to the live frontend
    if (
      hostname.includes("vercel.app") ||
      hostname.includes("dunastravel-dashbord") ||
      hostname.includes("dunastravel-dashboard")
    ) {
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
 *
 * Every tour in the catalog is a first-class, addressable entity on the
 * frontend at `/tours/{slug}`. We therefore never rewrite a real tour slug
 * to a different program or listing page — doing so made the dashboard open
 * the wrong trip (or a listing instead of the trip). Program/package landing
 * pages are produced separately by `getFrontendPackageUrl`.
 */
export function getFrontendTourUrl(slug?: string): string {
  const baseUrl = getFrontendBaseUrl();
  if (!slug || !slug.trim()) return baseUrl;

  const cleanSlug = encodeURIComponent(slug.trim());
  return `${baseUrl}/tours/${cleanSlug}`;
}

/**
 * Returns the public frontend URL for one of the 5 Egypt VIP Packages.
 */
export function getFrontendPackageUrl(packageId: string): string {
  const baseUrl = getFrontendBaseUrl();
  switch (packageId) {
    case 'egypt-classic':
      return `${baseUrl}/programs/classic/classic-program`;
    case 'egypt-honeymoon':
      return `${baseUrl}/programs/honeymooners`;
    case 'egypt-religious':
      return `${baseUrl}/programs/religious`;
    case 'egypt-multi-country':
      return `${baseUrl}/programs/multi-country`;
    case 'egypt-extensions':
      return `${baseUrl}/programs/extension`;
    default:
      return `${baseUrl}/destinations/egypt`;
  }
}
