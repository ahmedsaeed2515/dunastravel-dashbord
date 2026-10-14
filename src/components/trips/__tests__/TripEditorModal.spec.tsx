import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TripEditorModal } from '../TripEditorModal';
import { toursApi } from '@/features/tours/api/toursApi';
import { tourToTripModel } from '@/features/tours/lib/tripEditorPayload';

vi.mock('@/context/DataContext', () => ({
  useDataContext: () => ({ egyptPackages: [] }),
}));

vi.mock('@/features/tours/hooks/useLandingPages', () => ({
  useLandingPages: () => ({ data: { data: [] } }),
}));

vi.mock('@/features/hotels/hooks/useHotels', () => ({
  useHotels: () => ({ data: [] }),
  useSeasons: () => ({ data: [] }),
}));

vi.mock('@/features/tours/api/toursApi', () => ({
  toursApi: {
    getTourBySlug: vi.fn(),
    getTourTripHotel: vi.fn(),
    upsertTourTripHotel: vi.fn(),
    deleteTourTripHotel: vi.fn(),
    updateTour: vi.fn(),
    createTour: vi.fn(),
  },
}));

/**
 * Mirrors the `classic-program` tour stored on the backend: its lodging lives
 * in `hotelInfoJsonb.accommodation` as a trip-specific rate-sheet row (hotel
 * name, city, double/single room rates, seasonal fee).
 */
const rateSheetTour: any = {
  id: 'tour-classic-program',
  slug: 'classic-program',
  titleJsonb: { ar: 'برنامج مصر الكلاسيكي', en: 'Classic Egypt Programme' },
  city: 'Giza',
  country: 'Egypt',
  basePriceUsd: '1500',
  currency: 'USD',
  hotelInfoJsonb: {
    hotelCategory: '4 Stars',
    accommodation: [
      {
        id: 'acc-0',
        nights: 1,
        destination: 'الجيزة',
        categoryTier: '4',
        nameJsonb: { ar: 'ستاراوتيل' },
        cityJsonb: { ar: 'الجيزة' },
        doubleRoomPriceUsd: 100,
        singleRoomPriceUsd: 50,
        seasonSupplementUsd: 25,
      },
    ],
  },
  itineraries: [],
  images: [],
};

function renderModal(trip: any) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TripEditorModal trip={trip} isOpen onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe('TripEditorModal lodging mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (toursApi.getTourBySlug as any).mockResolvedValue(rateSheetTour);
    (toursApi.getTourTripHotel as any).mockResolvedValue(null);
  });

  it('auto-opens the trip-specific rate sheet (Option B) so trip hotels added on the site are visible', async () => {
    renderModal(tourToTripModel(rateSheetTour));
    fireEvent.click(screen.getByRole('tab', { name: /الوصف والإقامة/ }));

    // The Option B rate-sheet columns only render in TRIP_SPECIFIC mode.
    await waitFor(() => {
      expect(screen.getByText('أسماء الأوتيلات وأسماء المدن')).toBeInTheDocument();
    });
    expect(screen.getByText('رسوم / زيادة الموسم ($)')).toBeInTheDocument();
    expect(screen.getByText('المراكب (اسم + سعر $)')).toBeInTheDocument();

    // The hotel name from `hotelInfoJsonb.accommodation` is displayed.
    expect(screen.getByDisplayValue('ستاراوتيل')).toBeInTheDocument();
  });

  it('supports several hotel names for one city (adding another hotel appends an input)', async () => {
    const multiHotelTour: any = {
      ...rateSheetTour,
      hotelInfoJsonb: {
        ...rateSheetTour.hotelInfoJsonb,
        accommodation: [
          {
            ...rateSheetTour.hotelInfoJsonb.accommodation[0],
            nameJsonb: { ar: 'فندق الأهرام\nفندق النيل' },
          },
        ],
      },
    };
    (toursApi.getTourBySlug as any).mockResolvedValue(multiHotelTour);

    renderModal(tourToTripModel(multiHotelTour));
    fireEvent.click(screen.getByRole('tab', { name: /الوصف والإقامة/ }));

    // Both stored hotel names render as separate inputs in the same city column.
    await waitFor(() => {
      expect(screen.getByDisplayValue('فندق الأهرام')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('فندق النيل')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/اسم فندق آخر/)).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /إضافة فندق آخر/ }));

    // A third, empty hotel-name input is appended.
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/اسم فندق آخر/)).toHaveLength(2);
    });
  });

  it('keeps Option A (global catalog) when no rate-sheet data exists', async () => {
    const plainTour: any = {
      id: 'tour-plain',
      slug: 'plain-tour',
      titleJsonb: { ar: 'رحلة بسيطة', en: 'Plain Tour' },
      city: 'Cairo',
      country: 'Egypt',
      basePriceUsd: '900',
      currency: 'USD',
      hotelInfoJsonb: null,
      itineraries: [],
      images: [],
    };
    (toursApi.getTourBySlug as any).mockResolvedValue(plainTour);

    renderModal(tourToTripModel(plainTour));
    fireEvent.click(screen.getByRole('tab', { name: /الوصف والإقامة/ }));

    await waitFor(() => {
      expect(screen.getByText('دليل الفنادق العامة المشتركة')).toBeInTheDocument();
    });
    expect(screen.queryByText('أسماء الأوتيلات وأسماء المدن')).not.toBeInTheDocument();
  });
});
