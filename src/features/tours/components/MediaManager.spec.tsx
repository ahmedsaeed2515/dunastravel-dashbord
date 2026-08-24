import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaManager } from "./MediaManager";
import type { Tour } from "../types";

const mocks = vi.hoisted(() => ({ uploadMedia: vi.fn(), reorderImage: vi.fn() }));

vi.mock("../hooks/useTours", () => ({
  useRemoveTourImage: () => ({ mutate: vi.fn(), isPending: false }),
  useReorderTourImage: () => ({ mutate: mocks.reorderImage, isPending: false }),
  useSetTourHeroImage: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/media/hooks/useMedia", () => ({
  useUploadMedia: () => ({ mutate: mocks.uploadMedia, isPending: false }),
}));

const tour = {
  id: "tour-1",
  slug: "nile-cruise",
  titleJsonb: { en: "Nile" },
  images: [{ id: "image-1", imageUrl: "https://cdn.example.test/nile.webp", altText: "Nile", sortOrder: 1, isHero: true }],
} as Tour;

function renderManager() {
  return render(<QueryClientProvider client={new QueryClient()}><MediaManager tour={tour} /></QueryClientProvider>);
}

describe("MediaManager", () => {
  beforeEach(() => {
    mocks.uploadMedia.mockClear();
    mocks.reorderImage.mockClear();
  });

  it("uploads a selected real file through the media boundary", () => {
    renderManager();
    fireEvent.click(screen.getByRole("button", { name: /upload image/i }));
    const file = new File(["image"], "nile.webp", { type: "image/webp" });
    fireEvent.change(screen.getByLabelText("Image file"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /^upload image$/i }));

    expect(mocks.uploadMedia).toHaveBeenCalledWith(
      expect.objectContaining({ file, entityType: "TOUR", entityId: "tour-1" }),
      expect.any(Object),
    );
  });

  it("persists image ordering through the server mutation rather than local state", () => {
    renderManager();
    fireEvent.change(screen.getByLabelText("Sort order for image 1"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save image order" }));
    expect(mocks.reorderImage).toHaveBeenCalledWith({ slug: "nile-cruise", imageId: "image-1", data: { sortOrder: 3 } });
  });

  it("does not turn an invalid upload into a successful media mutation", () => {
    renderManager();
    fireEvent.click(screen.getByRole("button", { name: /upload image/i }));
    const file = new File(["not an image"], "tour.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Image file"), { target: { files: [file] } });

    expect(mocks.uploadMedia).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^upload image$/i })).toBeDisabled();
  });
});
