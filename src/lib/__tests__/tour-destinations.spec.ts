import { describe, expect, it } from "vitest";
import {
  isTourVisibleOnWebsite,
  publicDestinationLabelsForTour,
} from "../tour-destinations";
import type { Tour } from "@/features/tours/types";

function tour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "tour-1",
    slug: "tour-1",
    titleJsonb: { en: "Tour" },
    basePriceUsd: "100.00",
    currency: "USD",
    isActive: true,
    status: "PUBLISHED",
    isFeatured: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("public website tour visibility", () => {
  it("uses the visible, published destination relation instead of country", () => {
    const value = tour({
      country: "United Arab Emirates",
      landingPages: [{
        id: "landing-dubai",
        slug: "dubai",
        type: "DESTINATION",
        isVisible: true,
        status: "PUBLISHED",
        isActive: true,
      }],
    });

    expect(isTourVisibleOnWebsite(value)).toBe(true);
    expect(publicDestinationLabelsForTour(value)).toEqual(["Dubai"]);
  });

  it("excludes a published tour when its destination relation is hidden or inactive", () => {
    const value = tour({
      landingPages: [{
        id: "landing-egypt",
        slug: "egypt",
        type: "DESTINATION",
        isVisible: false,
        status: "PUBLISHED",
        isActive: true,
      }],
    });

    expect(isTourVisibleOnWebsite(value)).toBe(false);
    expect(publicDestinationLabelsForTour(value)).toEqual([]);
  });

  it("handles multi-country and religious destination relations correctly", () => {
    const multi = tour({
      slug: "stars-of-the-middle-east-16-days",
      landingPages: [{
        id: "landing-mc",
        slug: "multi-country",
        type: "DESTINATION",
        isVisible: true,
        status: "PUBLISHED",
        isActive: true,
      }],
    });
    expect(isTourVisibleOnWebsite(multi)).toBe(true);
    expect(publicDestinationLabelsForTour(multi)).toEqual(["Multi-Country"]);

    const holyFamily = tour({
      slug: "journey-of-the-holy-family-10-days",
      landingPages: [
        {
          id: "landing-egypt",
          slug: "egypt",
          type: "DESTINATION",
          isVisible: true,
          status: "PUBLISHED",
          isActive: true,
        },
        {
          id: "landing-rel",
          slug: "religious",
          type: "DESTINATION",
          isVisible: true,
          status: "PUBLISHED",
          isActive: true,
        },
      ],
    });
    expect(isTourVisibleOnWebsite(holyFamily)).toBe(true);
    expect(publicDestinationLabelsForTour(holyFamily)).toEqual(["Egypt", "Religious"]);
  });
});
