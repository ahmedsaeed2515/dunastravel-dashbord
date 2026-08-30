/**
 * Utility functions for generating public frontend website URLs from the dashboard.
 */

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
    // Production/Staging: if dashboard is hosted on a subdomain (e.g. dashboard.dunastravel.com)
    return origin.replace("dashboard.", "").replace(":3000", ":5173");
  }

  return "http://localhost:5173";
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
