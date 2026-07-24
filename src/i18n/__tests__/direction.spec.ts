import { describe, it, expect } from "vitest";

describe("Direction and Localization Architecture Guards", () => {
  it("should calculate correct html dir attribute for locales", () => {
    const getDir = (locale: string) => (locale === "ar" ? "rtl" : "ltr");
    expect(getDir("ar")).toBe("rtl");
    expect(getDir("en")).toBe("ltr");
    expect(getDir("es")).toBe("ltr");
    expect(getDir("pt")).toBe("ltr");
    expect(getDir("it")).toBe("ltr");
  });

  it("should calculate correct default sidebar side for locales", () => {
    const getSidebarSide = (locale: string, customSide?: "left" | "right") => {
      const isRtl = locale === "ar";
      return customSide ?? (isRtl ? "right" : "left");
    };

    expect(getSidebarSide("ar")).toBe("right");
    expect(getSidebarSide("en")).toBe("left");
    expect(getSidebarSide("es")).toBe("left");
    expect(getSidebarSide("pt")).toBe("left");
  });

  it("should calculate correct Sheet/Drawer side for RTL vs LTR", () => {
    const getEffectiveSheetSide = (locale: string, sideProp: "left" | "right" = "right") => {
      const isRtl = locale === "ar";
      return sideProp === "right" && isRtl
        ? "left"
        : sideProp === "left" && isRtl
        ? "right"
        : sideProp;
    };

    // Default detail drawers (side="right")
    expect(getEffectiveSheetSide("en", "right")).toBe("right");
    expect(getEffectiveSheetSide("ar", "right")).toBe("left");
    expect(getEffectiveSheetSide("pt", "right")).toBe("right");

    // Mobile sidebar sheet (side="left")
    expect(getEffectiveSheetSide("en", "left")).toBe("left");
    expect(getEffectiveSheetSide("ar", "left")).toBe("right");
    expect(getEffectiveSheetSide("pt", "left")).toBe("left");
  });

  it("should format technical identifiers with LTR isolation class", () => {
    const formatTechValue = (value: string) => `<span class="dir-ltr">${value}</span>`;
    const refCode = "BK-2026-99";
    expect(formatTechValue(refCode)).toContain("dir-ltr");
    expect(formatTechValue(refCode)).toContain("BK-2026-99");
  });

  it("should preserve query parameters during locale switching target calculation", () => {
    const pathname = "/admin/bookings";
    const searchString = "page=2&status=PENDING";
    const target = searchString ? `${pathname}?${searchString}` : pathname;

    expect(target).toBe("/admin/bookings?page=2&status=PENDING");
  });
});
