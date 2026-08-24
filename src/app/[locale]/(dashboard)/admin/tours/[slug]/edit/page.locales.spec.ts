import { describe, expect, it } from "vitest";
import { TOUR_EDITOR_LOCALES } from "./page";

describe("tour editor locale contract", () => {
  it("keeps every supported locale explicit and Arabic content RTL", () => {
    expect(TOUR_EDITOR_LOCALES.map((locale) => locale.code)).toEqual(['en', 'ar', 'es', 'pt', 'it']);
    expect(TOUR_EDITOR_LOCALES.find((locale) => locale.code === 'ar')).toMatchObject({ dir: 'rtl' });
    expect(TOUR_EDITOR_LOCALES.filter((locale) => locale.code !== 'ar').every((locale) => locale.dir === 'ltr')).toBe(true);
  });
});
