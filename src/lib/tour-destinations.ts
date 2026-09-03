import type { Tour } from "@/features/tours/types";

export const DESTINATIONS_LIST = [
  { id: "ALL", nameEn: "All Destinations", nameAr: "جميع الواجهات الـ 8", flag: "🌐", code: "ALL" },
  { id: "Egypt", nameEn: "Egypt", nameAr: "مصر", flag: "🇪🇬", code: "EG" },
  { id: "Turkey", nameEn: "Turkey", nameAr: "تركيا", flag: "🇹🇷", code: "TR" },
  { id: "Jordan", nameEn: "Jordan", nameAr: "الأردن", flag: "🇯🇴", code: "JO" },
  { id: "Morocco", nameEn: "Morocco", nameAr: "المغرب", flag: "🇲🇦", code: "MA" },
  { id: "Dubai", nameEn: "Dubai & UAE", nameAr: "دبي والإمارات", flag: "🇦🇪", code: "AE" },
  { id: "Tunisia", nameEn: "Tunisia", nameAr: "تونس", flag: "🇹🇳", code: "TN" },
  { id: "Greece", nameEn: "Greece", nameAr: "اليونان", flag: "🇬🇷", code: "GR" },
  { id: "Multi-Country", nameEn: "Multi-Country", nameAr: "مشترك", flag: "🌍", code: "MC" },
  { id: "Religious", nameEn: "Religious", nameAr: "دينية", flag: "🕊️", code: "RL" },
] as const;

const CANONICAL_DESTINATION_LABELS: Record<string, string> = {
  egypt: "Egypt",
  turkey: "Turkey",
  jordan: "Jordan",
  morocco: "Morocco",
  dubai: "Dubai",
  tunisia: "Tunisia",
  greece: "Greece",
  "multi-country": "Multi-Country",
  religious: "Religious",
};

export const DEST_FLAGS: Record<string, string> = {
  egypt: "🇪🇬",
  turkey: "🇹🇷",
  jordan: "🇯🇴",
  morocco: "🇲🇦",
  dubai: "🇦🇪",
  tunisia: "🇹🇳",
  greece: "🇬🇷",
  religious: "🕊️",
  holyland: "🕊️",
  "multi-country": "🌍",
  all: "🌐",
};

export const DEST_GRADIENTS: Record<string, string> = {
  egypt: "from-amber-500/20 to-amber-600/10",
  turkey: "from-red-500/20 to-red-600/10",
  jordan: "from-emerald-500/20 to-emerald-600/10",
  morocco: "from-rose-500/20 to-rose-600/10",
  greece: "from-blue-500/20 to-blue-600/10",
  dubai: "from-yellow-500/20 to-yellow-600/10",
  tunisia: "from-orange-500/20 to-orange-600/10",
  religious: "from-purple-500/20 to-purple-600/10",
  holyland: "from-purple-500/20 to-purple-600/10",
  "multi-country": "from-indigo-500/20 to-indigo-600/10",
};

export function destinationForCountry(country: string | null | undefined): string {
  const normalized = country?.trim().toLowerCase() || "";
  return (
    {
      "united arab emirates": "dubai",
      "multi country": "multi-country",
      "multi-country": "multi-country",
    }[normalized] || normalized
  );
}

export function resolveTourDestination(tour: Tour): string {
  if (!tour) return "Egypt";

  const relatedDestination = tour.landingPages?.find((relation: any) => relation?.type === "DESTINATION")?.slug;
  const canonical = String(relatedDestination || "").trim().toLowerCase();
  const canonicalLabels: Record<string, string> = {
    egypt: "Egypt",
    turkey: "Turkey",
    jordan: "Jordan",
    morocco: "Morocco",
    dubai: "Dubai",
    tunisia: "Tunisia",
    greece: "Greece",
    "multi-country": "Multi-Country",
    religious: "Religious",
  };
  if (canonical && canonicalLabels[canonical]) return canonicalLabels[canonical];

  const country = String(tour.country || "").trim().toLowerCase();
  const countryCanonical =
    country === "united arab emirates"
      ? "dubai"
      : country === "multi country"
      ? "multi-country"
      : country;
  if (countryCanonical && canonicalLabels[countryCanonical]) return canonicalLabels[countryCanonical];

  const c = country;
  const cat = (tour.category || "").trim().toLowerCase();
  const slug = (tour.slug || "").trim().toLowerCase();
  const titleEn = ((tour.titleJsonb?.en as string) || "").toLowerCase();
  const titleAr = ((tour.titleJsonb?.ar as string) || "").toLowerCase();

  // Multi-Country check first
  if (
    c.includes("multi") ||
    cat.includes("multi") ||
    slug.includes("and-") ||
    slug.includes("stars-of-the-middle-east") ||
    slug.includes("estrellas-medio-oriente") ||
    slug.includes("jewels-of-egypt-and-jordan") ||
    slug.includes("spices-of-egypt-and-morocco") ||
    slug.includes("egypt-and-dubai") ||
    slug.includes("treasures-of-egypt-and-tunisia") ||
    slug.includes("marvels-of-dubai-and-turkey") ||
    slug.includes("essences-of-egypt-and-turkey") ||
    slug.includes("cairo-and-athens") ||
    titleEn.includes("&") ||
    titleEn.includes("and") ||
    (titleAr.includes("و") &&
      ((titleAr.includes("مصر") && titleAr.includes("الأردن")) ||
        (titleAr.includes("دبي") && titleAr.includes("مصر")) ||
        (titleAr.includes("تونس") && titleAr.includes("مصر")) ||
        (titleAr.includes("تركيا") && titleAr.includes("دبي"))))
  ) {
    return "Multi-Country";
  }

  if (
    c.includes("egypt") ||
    cat.includes("egypt") ||
    cat.includes("egito") ||
    cat.includes("egipto") ||
    cat.includes("cruzeiro") ||
    slug.includes("egypt") ||
    slug.includes("cairo") ||
    slug.includes("sharm") ||
    slug.includes("hurghada") ||
    slug.includes("nile") ||
    slug.includes("ramses") ||
    slug.includes("egito") ||
    slug.includes("tesouros") ||
    slug.includes("grande-ramses") ||
    slug.includes("wonders-of-egypt") ||
    titleEn.includes("egypt") ||
    titleAr.includes("مصر") ||
    titleAr.includes("القاهرة") ||
    titleAr.includes("شرم") ||
    titleAr.includes("الغردقة") ||
    titleAr.includes("النيل")
  ) {
    return "Egypt";
  }

  if (
    c.includes("turkey") ||
    c.includes("türkiye") ||
    cat.includes("turkey") ||
    cat.includes("turquía") ||
    cat.includes("turquia") ||
    cat.includes("turchia") ||
    slug.includes("turkey") ||
    slug.includes("turquia") ||
    slug.includes("turquia-legendaria") ||
    slug.includes("istanbul") ||
    slug.includes("cappadocia") ||
    slug.includes("antalya") ||
    slug.includes("ist-") ||
    slug.includes("reg-01") ||
    slug.includes("reg-03") ||
    slug.includes("reg-04") ||
    slug.includes("reg-05") ||
    slug.includes("reg-06") ||
    slug.includes("reg-07") ||
    slug.includes("reg-08") ||
    slug.includes("reg-09") ||
    slug.includes("reg-10") ||
    slug.includes("reg-11") ||
    slug.includes("reg-12") ||
    slug.includes("reg-13") ||
    slug.includes("reg-14") ||
    slug.includes("passion-of-turkey") ||
    titleEn.includes("turkey") ||
    titleAr.includes("تركيا") ||
    titleAr.includes("إسطنبول") ||
    titleAr.includes("كابادوكيا") ||
    titleAr.includes("أنطاليا")
  ) {
    return "Turkey";
  }

  if (
    c.includes("jordan") ||
    cat.includes("jordan") ||
    cat.includes("jordania") ||
    slug.includes("jordan") ||
    slug.includes("jewels-of-jordan") ||
    slug.includes("reg-15") ||
    slug.includes("reg-16") ||
    slug.includes("reg-17") ||
    slug.includes("reg-18") ||
    slug.includes("reg-19") ||
    slug.includes("reg-20") ||
    slug.includes("reg-21") ||
    titleEn.includes("jordan") ||
    titleAr.includes("الأردن") ||
    titleAr.includes("البتراء")
  ) {
    return "Jordan";
  }

  if (
    c.includes("morocco") ||
    cat.includes("morocco") ||
    cat.includes("marruecos") ||
    slug.includes("morocco") ||
    slug.includes("spices-of-morocco") ||
    slug.includes("mrc-") ||
    titleEn.includes("morocco") ||
    titleAr.includes("المغرب")
  ) {
    return "Morocco";
  }

  if (
    c.includes("emirates") ||
    c.includes("dubai") ||
    c.includes("uae") ||
    cat.includes("emirates") ||
    cat.includes("dubai") ||
    cat.includes("honeymoon") ||
    slug.includes("dubai") ||
    slug.includes("emirates") ||
    slug.includes("abu-dhabi") ||
    slug.includes("hm001") ||
    slug.includes("hm002") ||
    slug.includes("reg-22") ||
    slug.includes("reg-23") ||
    slug.includes("reg-24") ||
    slug.includes("reg-25") ||
    slug.includes("reg-26") ||
    slug.includes("reg-27") ||
    slug.includes("reg-28") ||
    titleEn.includes("dubai") ||
    titleAr.includes("دبي") ||
    titleAr.includes("الإمارات") ||
    titleAr.includes("أبوظبي")
  ) {
    return "Dubai";
  }

  if (
    c.includes("tunisia") ||
    cat.includes("tunisia") ||
    cat.includes("túnez") ||
    slug.includes("tunisia") ||
    titleEn.includes("tunisia") ||
    titleAr.includes("تونس")
  ) {
    return "Tunisia";
  }

  if (
    c.includes("greece") ||
    cat.includes("greece") ||
    cat.includes("grecia") ||
    slug.includes("greece") ||
    slug.includes("grecia") ||
    slug.includes("lo-mejor-de-grecia") ||
    titleEn.includes("greece") ||
    titleAr.includes("اليونان") ||
    titleAr.includes("أثينا")
  ) {
    return "Greece";
  }

  return "Egypt";
}

/**
 * A tour is public only when the tour and at least one destination relation
 * satisfy the same publication requirements used by the customer catalog.
 * Country/title/slug fallbacks are intentionally forbidden here: they are
 * useful for diagnosing old admin records, not for deciding website display.
 */
export function publicDestinationLabelsForTour(tour: Tour): string[] {
  if (tour.status !== "PUBLISHED" || !tour.isActive) return [];

  return [...new Set(
    (tour.landingPages || [])
      .filter((relation) =>
        relation.type === "DESTINATION" &&
        relation.isVisible === true &&
        relation.status === "PUBLISHED" &&
        relation.isActive === true,
      )
      .map((relation) => CANONICAL_DESTINATION_LABELS[relation.slug.trim().toLowerCase()])
      .filter((label): label is string => Boolean(label)),
  )];
}

export function isTourVisibleOnWebsite(tour: Tour): boolean {
  if (!tour) return false;
  return (
    tour.status === "PUBLISHED" &&
    Boolean(tour.isActive) &&
    publicDestinationLabelsForTour(tour).length > 0
  );
}
