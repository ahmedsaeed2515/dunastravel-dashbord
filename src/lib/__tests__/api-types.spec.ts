import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '../api-types';

describe('normalizeApiError validation messages', () => {
  it('surfaces the real field name for Nest "should not exist" errors', () => {
    const normalized = normalizeApiError({
      status: 400,
      data: {
        success: false,
        statusCode: 400,
        code: 'VALIDATION_FAILED',
        message: [
          'property priceDisplayMode should not exist',
          'property priceLabelJsonb should not exist',
        ],
      },
    });

    expect(normalized.errors).toEqual({
      priceDisplayMode: 'property priceDisplayMode should not exist',
      priceLabelJsonb: 'property priceLabelJsonb should not exist',
    });
    expect(normalized.message).toContain('يرجى مراجعة وتصحيح الحقول المحددة أدناه قبل الحفظ.');
    expect(normalized.message).toContain('• property priceDisplayMode should not exist');
    expect(normalized.message).toContain('• property priceLabelJsonb should not exist');
  });

  it('normalizes the legacy field aliases and deduplicates details', () => {
    const normalized = normalizeApiError({
      status: 400,
      data: {
        message: [
          'titleJsonb must be an object',
          'basePriceUsd must not be less than 0',
          'slug should not be empty',
          'slug should not be empty',
        ],
      },
    });

    expect(Object.keys(normalized.errors ?? {}).sort()).toEqual([
      'price',
      'slug',
      'title',
    ]);
    expect(normalized.message.match(/• /g)).toHaveLength(3);
  });

  it('reads field errors from an errors map when the message is not an array', () => {
    const normalized = normalizeApiError({
      status: 422,
      data: {
        message: 'Unprocessable Entity',
        errors: { website: ['website must be a URL address'] },
      },
    });

    expect(normalized.message).toBe('Unprocessable Entity');
    expect(normalized.errors).toEqual({
      website: 'website must be a URL address',
    });
  });

  it('keeps a plain string message untouched', () => {
    const normalized = normalizeApiError({
      status: 409,
      data: { message: 'A record with this value already exists.' },
    });

    expect(normalized.message).toBe('A record with this value already exists.');
    expect(normalized.errors).toBeUndefined();
  });

  it('falls back to joining unparsable message arrays', () => {
    const normalized = normalizeApiError({
      status: 400,
      data: { message: ['حدث خطأ غير متوقع', 'حاول مرة أخرى لاحقًا'] },
    });

    expect(normalized.message).toBe('حدث خطأ غير متوقع, حاول مرة أخرى لاحقًا');
    expect(normalized.errors).toBeUndefined();
  });
});
