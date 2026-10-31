import { render, screen } from '@testing-library/react';
import { PopularToursSection } from '../PopularToursSection';
import { describe, it, expect } from 'vitest';
import { TourPerformanceItem } from '../../types';

describe('PopularToursSection', () => {
  const mockTours: TourPerformanceItem[] = [
    {
      id: 'tour-1',
      slug: 'pyramids-deluxe',
      titleJsonb: { en: 'Pyramids Deluxe Tour' },
      country: 'Egypt',
      displayPriceUsd: 1200,
      confirmedBookings: 15,
      occupancyRate: 85,
      grossRevenue: 18000,
      collectedRevenue: 18000,
      viewsCount: 500,
      conversionRate: 3.0,
      averagePartySize: 2.5,
    },
  ];

  it('renders ranked tours with real server performance data', () => {
    render(<PopularToursSection tours={mockTours} isLoading={false} />);

    expect(screen.getByText('Most Popular Tours')).toBeInTheDocument();
    expect(screen.getByText('Pyramids Deluxe Tour')).toBeInTheDocument();
    expect(screen.getByText(/15 confirmed bookings/)).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('renders empty message when no qualifying tours are returned', () => {
    render(<PopularToursSection tours={[]} isLoading={false} />);

    expect(
      screen.getByText(/No qualifying tours exist for the selected period/),
    ).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(<PopularToursSection isLoading={true} />);

    expect(screen.getByText(/Loading ranked tours/)).toBeInTheDocument();
  });
});
