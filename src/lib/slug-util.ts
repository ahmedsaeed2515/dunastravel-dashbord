/**
 * Robust Slug Generation & Validation Utilities
 * Specifically tailored for bilingual (Arabic / English / Multi-language) Travel Catalog entities.
 */

const COMMON_ARABIC_TERMS: [RegExp, string][] = [
  [/رحلة/g, 'tour'],
  [/جولة/g, 'tour'],
  [/برنامج/g, 'program'],
  [/القاهرة/g, 'cairo'],
  [/الأقصر|الاقصر/g, 'luxor'],
  [/أسوان|اسوان/g, 'aswan'],
  [/الغردقة/g, 'hurghada'],
  [/شرم الشيخ/g, 'sharm-el-sheikh'],
  [/الإسكندرية|الاسكندرية/g, 'alexandria'],
  [/الأهرامات|الاهرامات/g, 'pyramids'],
  [/النيل/g, 'nile'],
  [/المتحف/g, 'museum'],
  [/دهبية/g, 'dahabiya'],
  [/فندق/g, 'hotel'],
  [/منتجع/g, 'resort'],
  [/غرفة/g, 'room'],
  [/جناح/g, 'suite'],
  [/أيام|ايام/g, 'days'],
  [/يوم/g, 'day'],
  [/ليالي|ليال/g, 'nights'],
  [/ليلة/g, 'night'],
];

const ARABIC_CHAR_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ء': '', 'ئ': 'y', 'ؤ': 'w',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates whether a slug matches the backend strict format:
 * - Lowercase alphanumeric and hyphens only
 * - No consecutive hyphens
 * - No leading or trailing hyphens
 * - Between 2 and 100 characters
 */
export function isValidSlug(slug?: string | null): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  return SAFE_SLUG_REGEX.test(trimmed);
}

/**
 * Transliterates Arabic text to Latin characters.
 */
export function transliterateArabic(input: string): string {
  if (!input) return '';
  let str = input;

  // 1. Substitute common travel terms with clean English keywords
  for (const [regex, replacement] of COMMON_ARABIC_TERMS) {
    str = str.replace(regex, ` ${replacement} `);
  }

  // 2. Character-by-character transliteration for remaining Arabic letters
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    // Strip Arabic diacritics (Harakat)
    if (char >= '\u064B' && char <= '\u065F') continue;
    if (char in ARABIC_CHAR_MAP) {
      result += ARABIC_CHAR_MAP[char];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Generates a clean, normalized URL slug compliant with backend regex:
 * /^[a-z0-9]+(?:-[a-z0-9]+)*$/
 * Max length: 100 characters.
 */
export function slugify(input?: string | null, maxLen = 100): string {
  if (!input || typeof input !== 'string') return '';

  let text = input.trim();
  if (!text) return '';

  // Strip URL prefixes if full URL was pasted
  text = text.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/?tours\//, '').replace(/^\//, '');

  // If contains Arabic characters, transliterate first
  if (/[\u0600-\u06FF]/.test(text)) {
    text = transliterateArabic(text);
  }

  // Normalize diacritics (accents in Spanish/Portuguese/Italian/French)
  text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // Lowercase and convert non-alphanumeric to hyphens
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Truncate to maxLen safely without ending on a hyphen
  if (slug.length > maxLen) {
    slug = slug.slice(0, maxLen).replace(/-+$/, '');
  }

  return slug;
}

/**
 * Derives a canonical tour slug prioritizing:
 * 1. Valid existing slug or user-entered slug
 * 2. English title (produces cleanest URLs for international SEO)
 * 3. Arabic title (via transliteration)
 * 4. Fallback timestamp
 */
export function generateTourSlug(
  userSlug?: string | null,
  englishTitle?: string | null,
  arabicTitle?: string | null,
  fallbackSlug?: string | null,
): string {
  // If user provided a custom slug, format it
  const cleanUserSlug = slugify(userSlug);
  if (isValidSlug(cleanUserSlug)) return cleanUserSlug;

  // Try English title first
  const cleanEn = slugify(englishTitle);
  if (isValidSlug(cleanEn)) return cleanEn;

  // Try Arabic title
  const cleanAr = slugify(arabicTitle);
  if (isValidSlug(cleanAr)) return cleanAr;

  // Try existing tour slug fallback
  const cleanFallback = slugify(fallbackSlug);
  if (isValidSlug(cleanFallback)) return cleanFallback;

  // Absolute fail-safe
  return `tour-${Date.now()}`;
}

/**
 * Derives a valid hotel slug attached to a tour.
 */
export function generateTripHotelSlug(tourSlug: string, hotelName?: string | null): string {
  const cleanTour = slugify(tourSlug, 40) || 'tour';
  const cleanName = slugify(hotelName, 40);
  if (cleanName) {
    return slugify(`trip-${cleanTour}-${cleanName}`, 95);
  }
  return slugify(`trip-${cleanTour}-hotel`, 95);
}

/**
 * Derives a valid room slug.
 */
export function generateRoomSlug(roomName?: string | null, index = 1): string {
  const cleanName = slugify(roomName, 40);
  if (isValidSlug(cleanName)) return cleanName;
  return `room-${index}`;
}
