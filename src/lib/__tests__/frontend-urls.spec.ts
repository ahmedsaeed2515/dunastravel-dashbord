import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_STAGING_FRONTEND_URL,
  getFrontendBaseUrl,
  getFrontendTourUrl,
} from "../frontend-urls";

describe("frontend-urls utility", () => {
  const originalEnv = process.env.NEXT_PUBLIC_FRONTEND_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FRONTEND_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_FRONTEND_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_FRONTEND_URL;
    }
  });

  it("returns default staging frontend URL when hostname is a vercel deployment", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: new URL("https://dunastravel-dashboard.vercel.app/ar/admin/tours"),
    });
    expect(getFrontendBaseUrl()).toBe(DEFAULT_STAGING_FRONTEND_URL);
  });

  it("returns localhost url when running in local development without explicit env", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: new URL("http://localhost:3000/ar/admin/tours"),
    });
    expect(getFrontendBaseUrl()).toBe("http://localhost:5173");
  });

  it("ignores legacy luxury-project environment variable and falls back safely on vercel", () => {
    process.env.NEXT_PUBLIC_FRONTEND_URL = "https://luxury-project-lzss.vercel.app/";
    Object.defineProperty(window, "location", {
      writable: true,
      value: new URL("https://dunastravel-dashboard.vercel.app/ar/admin/tours"),
    });
    expect(getFrontendBaseUrl()).toBe(DEFAULT_STAGING_FRONTEND_URL);
  });

  it("uses valid explicit NEXT_PUBLIC_FRONTEND_URL if provided", () => {
    process.env.NEXT_PUBLIC_FRONTEND_URL = "https://dunastravel-frontend.vercel.app/";
    expect(getFrontendBaseUrl()).toBe("https://dunastravel-frontend.vercel.app");
  });

  it("generates correct tour URL when slug is provided", () => {
    process.env.NEXT_PUBLIC_FRONTEND_URL = "https://dunastravel-frontend.vercel.app";
    expect(getFrontendTourUrl("siwa-oasis-alexandria")).toBe(
      "https://dunastravel-frontend.vercel.app/tours/siwa-oasis-alexandria"
    );
  });

  it("returns base url when slug is empty or undefined", () => {
    process.env.NEXT_PUBLIC_FRONTEND_URL = "https://dunastravel-frontend.vercel.app";
    expect(getFrontendTourUrl("")).toBe("https://dunastravel-frontend.vercel.app");
    expect(getFrontendTourUrl(undefined)).toBe("https://dunastravel-frontend.vercel.app");
  });
});
