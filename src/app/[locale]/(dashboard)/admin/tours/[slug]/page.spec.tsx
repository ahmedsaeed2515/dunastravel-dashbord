import { Suspense } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  tour: undefined as unknown,
  loading: false,
  error: null as unknown,
}));

vi.mock("@/features/tours/hooks/useTours", () => ({
  useTour: () => ({ data: state.tour, isLoading: state.loading, error: state.error }),
  useUpdateTour: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/trips/TripEditorModal", () => ({ TripEditorModal: () => null }));

import TourDetailsPage from "./page";

const params = Promise.resolve({ slug: "classic-program", locale: "ar" });

const canonicalTour = {
  id: "tour-classic-program",
  slug: "classic-program",
  titleJsonb: { ar: "البرنامج الكلاسيكي", en: "Classic Egypt Programme" },
  overviewJsonb: { ar: "نبذة", en: "Overview" },
  durationJsonb: { ar: "8 أيام", en: "8 days" },
  basePriceUsd: "1200.00",
  currency: "USD",
  category: "CULTURE",
  country: "Egypt",
  city: "Cairo",
  status: "PUBLISHED",
  isFeatured: false,
  itineraries: [],
  images: [],
  landingPages: [],
  bookings: [],
  hotelInfoJsonb: {
    hotelCategory: "5-Star Luxury",
    notes: "5-Star Luxury Hotels",
    hotels: {},
    accommodation: [
      {
        id: "acc-0",
        nights: 1,
        regime: "BB",
        destination: "الجيزة",
        cityJsonb: { ar: "الجيزة" },
        nameJsonb: { ar: "ستاراوتيل" },
        categoryTier: "4",
        doubleRoomPriceUsd: 100,
        singleRoomPriceUsd: 50,
        seasonSupplementUsd: 25,
      },
    ],
  },
};

const renderPage = async () => {
  await act(async () => {
    render(
      <Suspense fallback={<span>Suspended</span>}>
        <TourDetailsPage params={params} />
      </Suspense>,
    );
    await params;
  });
};

describe("Tour detail hotel rate sheet", () => {
  afterEach(() => {
    cleanup();
    state.tour = undefined;
    state.loading = false;
    state.error = null;
  });

  it("shows the trip-specific hotel rate sheet on the overview tab", async () => {
    state.tour = canonicalTour;
    await renderPage();

    expect(await screen.findByText("الإقامة والفنادق المعتمدة 🏨")).toBeInTheDocument();
    expect(screen.getByText("ستاراوتيل")).toBeInTheDocument();
    expect(screen.getByText("الجيزة")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("+$25")).toBeInTheDocument();
  });

  it("hides the hotel rate sheet when there is no trip-specific hotel", async () => {
    state.tour = { ...canonicalTour, hotelInfoJsonb: { notes: "x", hotels: {}, accommodation: [] } };
    await renderPage();

    expect(await screen.findByText("البرنامج الكلاسيكي")).toBeInTheDocument();
    expect(screen.queryByText("الإقامة والفنادق المعتمدة 🏨")).not.toBeInTheDocument();
  });
});
