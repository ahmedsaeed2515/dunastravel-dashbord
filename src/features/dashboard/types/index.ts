export interface DashboardFilters {
  from?: string;
  to?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  interfaceSlug?: string;
  tourSlug?: string;
  currency?: string;
  locale?: 'en' | 'ar' | 'es' | 'pt' | 'it';
  timezone?: 'UTC' | 'Africa/Cairo';
  preset?: 'all' | '30d' | '90d' | '6m' | '12m' | '2026' | '2025' | (string & {});
  year?: string;
}

export interface ExecutiveSummary {
  revenue: {
    grossRevenue: number;
    prevGrossRevenue: number;
    revenueChangePercent: number;
    collectedPayments: number;
    prevCollectedPayments: number;
    paymentsChangePercent: number;
    outstandingBalance: number;
    currency: string;
  };
  bookings: {
    total: number;
    prevTotal: number;
    changePercent: number;
    byStatus: Record<string, number>;
  };
  conversion: {
    rate: number;
    totalConversions: number;
    visitorViews: number;
    activeVisitors?: number;
  };
  capacity: {
    totalCapacity: number;
    seatsSold: number;
    totalRemainingSeats: number;
    occupancyRate: number;
  };
  operational: {
    activeToursCount: number;
    totalToursCount?: number;
    openInquiriesCount: number;
    unreadContactsCount: number;
    failedNotificationsCount: number;
    activeVisitors?: number;
  };
  dateRange: {
    from: string;
    to: string;
    prevFrom: string;
    prevTo: string;
  };
}

export interface RevenueTrendItem {
  period: string;
  grossRevenue: number;
  collected: number;
  bookingsCount: number;
  month?: string;
  isPeak?: boolean;
}

export interface RevenueAnalytics {
  monthlySalesRate: number;
  monthlyGrowthPercent: number;
  averageBookingValue: number;
  topDestination: TopDestinationItem | null;
  bookingConversionRate: number;
  peakMonth: {
    period: string;
    label: string;
    labelAr?: string;
    amount: number;
  } | null;
}

export interface RevenueTrendResponse {
  trend: RevenueTrendItem[];
  analytics: RevenueAnalytics;
}

export interface BookingsTrendItem {
  period: string;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

export interface TourPerformanceItem {
  id: string;
  slug: string;
  titleJsonb: Record<string, any>;
  category: string;
  country: string;
  city: string;
  basePriceUsd: number;
  displayPriceUsd?: number;
  status: string;
  heroImage: string | null;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  capacity: number;
  remainingSeats: number;
  occupiedSeats: number;
  occupancyRate: number;
  views: number;
  bookingStarts: number;
  conversionRate: number;
}

export interface TourRankings {
  mostBooked: TourPerformanceItem[];
  topRevenue: TourPerformanceItem[];
  lowConversion: TourPerformanceItem[];
  capacityAlerts: TourPerformanceItem[];
}

export interface InterfacePerformanceItem {
  id: string;
  slug: string;
  type: string;
  titleJsonb: Record<string, any>;
  heroImageUrl: string | null;
  status: string;
  isActive: boolean;
  toursCount: number;
  pageViews: number;
  tourClicks: number;
  bookingStarts: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percent: number;
}

export interface ConversionFunnelData {
  stages: FunnelStage[];
  totalVisitors: number;
  finalConversions: number;
}

export interface ActionAlert {
  id: string;
  severity: 'high' | 'medium' | 'warning';
  title: string;
  reason: string;
  count: number;
  actionLink: string;
}

export interface RecentBookingItem {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  tourSlug: string;
  tourTitleJsonb: Record<string, any>;
  travelersCount: number;
  arrivalDate: string;
  totalAmountUsd: string;
  paidAmountUsd: string;
  status: string;
  createdAt: string;
}

export interface RecentActivityItem {
  id: string;
  actor: string;
  action: string;
  actionAr?: string;
  rawAction?: string;
  entity: string;
  timestamp: string;
  type: string;
}

export interface TopDestinationItem {
  name: string;
  nameAr: string;
  countryCode: string;
  bookingsCount: number;
  grossRevenue: number;
  collectedRevenue: number;
  sharePercent: number;
  color: string;
}
