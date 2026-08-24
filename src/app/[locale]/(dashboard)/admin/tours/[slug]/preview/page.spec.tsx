import { Suspense } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  preview: undefined as unknown,
  previewLoading: false,
  previewError: null as unknown,
  departures: [] as unknown[],
  departuresLoading: false,
  departuresError: null as unknown,
}));

vi.mock("@/features/tours/hooks/useTours", () => ({
  useTourPreview: () => ({ data: state.preview, isLoading: state.previewLoading, error: state.previewError }),
  useTourAvailabilities: () => ({ data: state.departures, isLoading: state.departuresLoading, error: state.departuresError }),
}));

import VisitorTourPreviewPage, { TOUR_PREVIEW_LOCALES } from "./page";

const canonicalPreview = {
  id: "tour-1",
  slug: "nile-journey",
  title: "Nile Journey",
  category: "CULTURE",
  basePriceUsd: "0.00",
  currency: "USD",
  duration: "3 days",
  overview: "A real overview.",
  cancellationPolicy: null,
  includedServices: [],
  excludedServices: [],
  hotelInfo: null,
  seasonPricing: null,
  tags: [],
  difficultyLevel: null,
  meetingPoint: null,
  country: "Egypt",
  languages: ["en", "ar", "es", "pt", "it"],
  isFeatured: false,
  itinerary: [],
  images: [],
  preview: { status: "DRAFT", isActive: true, isPublic: false },
};

const previewParams = Promise.resolve({ slug: "nile-journey", locale: "en" });

const renderPreview = async () => {
  let view: ReturnType<typeof render> | undefined;
  await act(async () => {
    view = render(
      <Suspense fallback={<span>Suspended</span>}>
        <VisitorTourPreviewPage params={previewParams} />
      </Suspense>,
    );
    await previewParams;
  });
  return view!;
};

describe("Tour visitor preview", () => {
  afterEach(() => {
    cleanup();
    state.preview = undefined;
    state.previewLoading = false;
    state.previewError = null;
    state.departures = [];
    state.departuresLoading = false;
    state.departuresError = null;
  });

  it("declares the five supported locales with Arabic RTL", () => {
    expect(TOUR_PREVIEW_LOCALES.map((locale) => locale.code)).toEqual(["en", "ar", "es", "pt", "it"]);
    expect(TOUR_PREVIEW_LOCALES.find((locale) => locale.code === "ar")?.dir).toBe("rtl");
  });

  it.each(TOUR_PREVIEW_LOCALES)("renders %s as a selectable preview locale", async (locale) => {
    state.preview = canonicalPreview;
    await renderPreview();
    const user = userEvent.setup();

    await screen.findByText("Nile Journey");
    await user.click(screen.getByRole("button", { name: locale.code }));
    expect(screen.getByRole("button", { name: locale.code })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("article")).toHaveAttribute("dir", locale.dir);
  });

  it("renders canonical fields, explicit missing states, zero price, and sold-out departures", async () => {
    state.preview = canonicalPreview;
    state.departures = [{ id: "departure-1", remainingSeats: 0, status: "SOLD_OUT" }];
    await renderPreview();

    expect(await screen.findByText("Nile Journey")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText("No hero media has been recorded for this tour.")).toBeInTheDocument();
    expect(screen.getByText("No included services have been recorded.")).toBeInTheDocument();
    expect(screen.getByText("No cancellation policy has been recorded.")).toBeInTheDocument();
    expect(screen.getByText("0 bookable / 1 sold out")).toBeInTheDocument();
    expect(screen.getByText("draft - not public")).toBeInTheDocument();
  });

  it("keeps the sticky controls keyboard-accessible and switches the rendered mobile viewport", async () => {
    state.preview = canonicalPreview;
    await renderPreview();
    const user = userEvent.setup();

    await screen.findByText("Nile Journey");
    const arabic = screen.getByRole("button", { name: "ar" });
    expect(arabic).toHaveAttribute("aria-pressed", "false");
    arabic.focus();
    await user.keyboard("{Enter}");
    expect(arabic).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("article")).toHaveAttribute("dir", "rtl");

    await user.click(screen.getByRole("button", { name: "Mobile View" }));
    expect(screen.getByRole("article").className).toContain("w-[375px]");
    expect(screen.getByText("Visitor Preview").closest(".sticky")?.className).toContain("top-0");
  });

  it.each(["PUBLISHED", "DRAFT", "ARCHIVED"])("labels %s preview visibility without using the public endpoint", async (status) => {
    state.preview = { ...canonicalPreview, preview: { status, isActive: status !== "ARCHIVED", isPublic: status === "PUBLISHED" } };
    await renderPreview();
    await screen.findByText("Nile Journey");
    if (status === "PUBLISHED") {
      expect(screen.queryByText(/not public/)).not.toBeInTheDocument();
    } else {
      expect(screen.getByText(`${status.toLowerCase()} - not public`)).toBeInTheDocument();
    }
  });
});
