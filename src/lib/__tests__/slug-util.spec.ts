import { describe, it, expect } from 'vitest';
import {
  slugify,
  isValidSlug,
  transliterateArabic,
  generateTourSlug,
  generateTripHotelSlug,
  generateRoomSlug,
} from '../slug-util';

describe('slug-util', () => {
  describe('slugify', () => {
    it('formats basic latin text cleanly', () => {
      expect(slugify('Cairo Express & Pyramids 4 Days')).toBe('cairo-express-pyramids-4-days');
      expect(slugify('  Luxury Nile Cruise -- 5 Stars!  ')).toBe('luxury-nile-cruise-5-stars');
    });

    it('transliterates Arabic titles into valid slugs', () => {
      const slug = slugify('رحلة الأقصر وأسوان 4 أيام');
      expect(slug).toBe('tour-luxor-w-aswan-4-days');
      expect(isValidSlug(slug)).toBe(true);
    });

    it('handles Arabic hotel names correctly', () => {
      const slug = slugify('فندق شتايجنبرجر الأقصر');
      expect(slug).toContain('hotel');
      expect(slug).toContain('luxor');
      expect(isValidSlug(slug)).toBe(true);
    });

    it('strips url prefixes', () => {
      expect(slugify('https://dunastravel.com/tours/classic-egypt/')).toBe('classic-egypt');
      expect(slugify('/tours/hurghada-relax')).toBe('hurghada-relax');
    });

    it('handles accents and diacritics', () => {
      expect(slugify('Excursión en El Cairo')).toBe('excursion-en-el-cairo');
      expect(slugify('Viagem ao Egito & Pirâmides')).toBe('viagem-ao-egito-piramides');
    });

    it('limits length and strips trailing hyphens', () => {
      const longText = 'a'.repeat(120);
      const slug = slugify(longText, 50);
      expect(slug.length).toBe(50);
      expect(slug.endsWith('-')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('validates strictly against regex', () => {
      expect(isValidSlug('cairo-express-4d')).toBe(true);
      expect(isValidSlug('tour-1')).toBe(true);
      expect(isValidSlug('a')).toBe(false); // min length 2
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('-invalid-')).toBe(false);
      expect(isValidSlug('double--hyphen')).toBe(false);
      expect(isValidSlug('has space')).toBe(false);
      expect(isValidSlug('Capital-Letters')).toBe(false);
      expect(isValidSlug('special@characters')).toBe(false);
      expect(isValidSlug('عربي')).toBe(false); // Arabic raw is invalid as slug
    });
  });

  describe('generateTourSlug', () => {
    it('prioritizes valid user slug', () => {
      expect(generateTourSlug('custom-user-slug', 'English Title', 'عنوان عربي')).toBe('custom-user-slug');
    });

    it('prefers English title when user slug is empty', () => {
      expect(generateTourSlug('', 'Grand Pyramids Odyssey', 'رحلة الأهرامات الكبرى')).toBe('grand-pyramids-odyssey');
    });

    it('falls back to transliterated Arabic if English title is empty', () => {
      const slug = generateTourSlug('', '', 'رحلة الأهرامات الكبرى');
      expect(slug).toContain('tour');
      expect(slug).toContain('pyramids');
      expect(isValidSlug(slug)).toBe(true);
    });

    it('uses fallback tour slug if provided', () => {
      expect(generateTourSlug('', '', '', 'existing-tour-slug')).toBe('existing-tour-slug');
    });
  });

  describe('generateTripHotelSlug & generateRoomSlug', () => {
    it('generates trip hotel slug correctly', () => {
      expect(generateTripHotelSlug('cairo-4d', 'Steigenberger')).toBe('trip-cairo-4d-steigenberger');
      expect(generateTripHotelSlug('cairo-4d', '')).toBe('trip-cairo-4d-hotel');
    });

    it('generates room slug correctly', () => {
      expect(generateRoomSlug('Deluxe Suite')).toBe('deluxe-suite');
      expect(generateRoomSlug('', 3)).toBe('room-3');
    });
  });
});
