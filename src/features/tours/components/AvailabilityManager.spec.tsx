import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvailabilityManager } from "./AvailabilityManager";
import type { Tour } from "../types";

const mocks = vi.hoisted(() => ({ createSlot: vi.fn() }));

vi.mock("../hooks/useTours", () => ({
  useTourAvailabilities: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useCreateTourAvailability: () => ({ mutate: mocks.createSlot, isPending: false }),
  useCreateBatchTourAvailability: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTourAvailability: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTourAvailability: () => ({ mutate: vi.fn(), isPending: false }),
}));

const tour = {
  id: "tour-1", slug: "nile-cruise", titleJsonb: { en: "Nile" },
  basePriceUsd: "0", currency: "USD", isActive: true, status: "DRAFT", isFeatured: false,
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
} as Tour;

describe("AvailabilityManager", () => {
  beforeEach(() => mocks.createSlot.mockClear());

  it("renders an honest empty state instead of a fabricated capacity", () => {
    render(<AvailabilityManager tour={tour} locale="en" />);
    expect(screen.getByText("No dated departures have been created for this tour.")).toBeInTheDocument();
    expect(screen.getByLabelText("New departure capacity")).toHaveValue("");
  });

  it("sends the explicit selected date, capacity, and status to the canonical mutation", () => {
    render(<AvailabilityManager tour={tour} locale="en" />);
    fireEvent.change(screen.getByLabelText("New departure date"), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText("New departure capacity"), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("button", { name: /add departure/i }));

    expect(mocks.createSlot).toHaveBeenCalledWith(
      { tourId: "tour-1", data: { date: "2026-12-01", totalCapacity: 42, status: "AVAILABLE" } },
      expect.any(Object),
    );
  });
});
