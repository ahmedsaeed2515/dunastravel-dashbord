import { apiClient } from "@/lib/axios";
import {
  DashboardFilters, ExecutiveSummary, RevenueTrendItem, BookingsTrendItem,
  TourPerformanceItem, TourRankings, InterfacePerformanceItem, ConversionFunnelData,
  ActionAlert, RecentBookingItem, RecentActivityItem
} from "../types";

const mockExecutiveSummary: ExecutiveSummary = {
  revenue: {
    grossRevenue: 184500,
    prevGrossRevenue: 162000,
    revenueChangePercent: 13.8,
    collectedPayments: 152000,
    prevCollectedPayments: 135000,
    paymentsChangePercent: 12.5,
    outstandingBalance: 32500,
    currency: "USD"
  },
  bookings: {
    total: 142,
    prevTotal: 124,
    changePercent: 14.5,
    byStatus: { CONFIRMED: 110, PENDING: 22, CANCELLED: 10 }
  },
  conversion: {
    rate: 3.8,
    totalConversions: 142,
    visitorViews: 3736
  },
  capacity: {
    totalCapacity: 350,
    seatsSold: 245,
    totalRemainingSeats: 105,
    occupancyRate: 70
  },
  operational: {
    activeToursCount: 14,
    openInquiriesCount: 9,
    unreadContactsCount: 5,
    failedNotificationsCount: 0
  },
  dateRange: {
    from: "2026-08-01",
    to: "2026-08-19",
    prevFrom: "2026-07-01",
    prevTo: "2026-07-19"
  }
};

const mockRevenueTrend: RevenueTrendItem[] = [
  { period: "Jan", grossRevenue: 24000, collected: 21000, bookingsCount: 18 },
  { period: "Feb", grossRevenue: 28500, collected: 25000, bookingsCount: 22 },
  { period: "Mar", grossRevenue: 32000, collected: 29000, bookingsCount: 26 },
  { period: "Apr", grossRevenue: 31000, collected: 27500, bookingsCount: 24 },
  { period: "May", grossRevenue: 38000, collected: 34000, bookingsCount: 30 },
  { period: "Jun", grossRevenue: 42000, collected: 37000, bookingsCount: 34 },
  { period: "Jul", grossRevenue: 45000, collected: 40000, bookingsCount: 36 },
  { period: "Aug", grossRevenue: 49000, collected: 43000, bookingsCount: 40 }
];

const mockBookingsTrend: BookingsTrendItem[] = [
  { period: "Jan", total: 20, confirmed: 16, pending: 3, cancelled: 1 },
  { period: "Feb", total: 24, confirmed: 20, pending: 3, cancelled: 1 },
  { period: "Mar", total: 28, confirmed: 23, pending: 4, cancelled: 1 },
  { period: "Apr", total: 26, confirmed: 21, pending: 4, cancelled: 1 },
  { period: "May", total: 32, confirmed: 26, pending: 4, cancelled: 2 },
  { period: "Jun", total: 36, confirmed: 30, pending: 5, cancelled: 1 },
  { period: "Jul", total: 40, confirmed: 34, pending: 4, cancelled: 2 },
  { period: "Aug", total: 44, confirmed: 37, pending: 5, cancelled: 2 }
];

const mockTourList: TourPerformanceItem[] = [
  {
    id: "tour-1",
    slug: "egypt-classic-wonders",
    titleJsonb: { en: "Egypt Classic Wonders", ar: "عجائب مصر الكلاسيكية" },
    category: "Classic",
    country: "Egypt",
    city: "Cairo",
    basePriceUsd: 1290,
    status: "PUBLISHED",
    heroImage: "https://res.cloudinary.com/dunas/image/upload/v1/tours/egypt-pyramids.jpg",
    totalBookings: 42,
    confirmedBookings: 38,
    totalRevenue: 54180,
    capacity: 100,
    remainingSeats: 30,
    occupiedSeats: 70,
    occupancyRate: 70,
    views: 1250,
    bookingStarts: 95,
    conversionRate: 3.36
  },
  {
    id: "tour-2",
    slug: "nile-cruise-luxor-aswan",
    titleJsonb: { en: "Nile Cruise Luxor & Aswan", ar: "رحلة النيل الأقصر وأسوان" },
    category: "Nile Cruise",
    country: "Egypt",
    city: "Luxor",
    basePriceUsd: 1450,
    status: "PUBLISHED",
    heroImage: null,
    totalBookings: 35,
    confirmedBookings: 32,
    totalRevenue: 50750,
    capacity: 80,
    remainingSeats: 20,
    occupiedSeats: 60,
    occupancyRate: 75,
    views: 980,
    bookingStarts: 75,
    conversionRate: 3.57
  }
];

const mockTourPerformance = {
  all: mockTourList,
  rankings: {
    mostBooked: mockTourList,
    topRevenue: mockTourList,
    lowConversion: [],
    capacityAlerts: [mockTourList[1]]
  }
};

const mockInterfacePerformance: InterfacePerformanceItem[] = [
  {
    id: "if-1",
    slug: "egypt",
    type: "country",
    titleJsonb: { en: "Egypt Landing Page", ar: "واجهة رحلات مصر" },
    heroImageUrl: null,
    status: "PUBLISHED",
    isActive: true,
    toursCount: 14,
    pageViews: 2450,
    tourClicks: 820,
    bookingStarts: 142
  },
  {
    id: "if-2",
    slug: "turkey",
    type: "country",
    titleJsonb: { en: "Turkey Explorer", ar: "واجهة استكشاف تركيا" },
    heroImageUrl: null,
    status: "PUBLISHED",
    isActive: true,
    toursCount: 8,
    pageViews: 1280,
    tourClicks: 410,
    bookingStarts: 65
  }
];

const mockConversionFunnel: ConversionFunnelData = {
  stages: [
    { stage: "Page Views", count: 4500, percent: 100 },
    { stage: "Tour Clicks", count: 1800, percent: 40 },
    { stage: "Booking Starts", count: 450, percent: 10 },
    { stage: "Confirmed Bookings", count: 142, percent: 3.15 }
  ],
  totalVisitors: 4500,
  finalConversions: 142
};

const mockTrafficAnalytics = {
  devices: [
    { device: "Mobile", count: 2850, percent: 63 },
    { device: "Desktop", count: 1350, percent: 30 },
    { device: "Tablet", count: 300, percent: 7 }
  ],
  sources: [
    { source: "Google Organic", count: 2100 },
    { source: "Direct", count: 1200 },
    { source: "Instagram / Social", count: 900 },
    { source: "Referral", count: 300 }
  ]
};

const mockActionAlerts: ActionAlert[] = [
  {
    id: "alt-1",
    severity: "high",
    title: "Open Inquiries Pending Response",
    reason: "9 customer inquiries require advisor follow-up within 24 hours.",
    count: 9,
    actionLink: "/admin/inquiries"
  },
  {
    id: "alt-2",
    severity: "medium",
    title: "High Occupancy Tour Alert",
    reason: "Nile Cruise Luxor & Aswan has reached 75% capacity.",
    count: 1,
    actionLink: "/admin/tours/nile-cruise-luxor-aswan"
  }
];

const mockRecentBookings: RecentBookingItem[] = [
  {
    id: "bk-1",
    referenceCode: "DUN-2026-0801",
    customerName: "Carlos Silva",
    customerEmail: "carlos.silva@gmail.com",
    tourSlug: "egypt-classic-wonders",
    tourTitleJsonb: { en: "Egypt Classic Wonders", ar: "عجائب مصر الكلاسيكية" },
    travelersCount: 2,
    arrivalDate: "2026-09-15",
    totalAmountUsd: "2580.00",
    paidAmountUsd: "2580.00",
    status: "CONFIRMED",
    createdAt: "2026-08-18T14:30:00Z"
  },
  {
    id: "bk-2",
    referenceCode: "DUN-2026-0802",
    customerName: "Mariana Costa",
    customerEmail: "m.costa@hotmail.com",
    tourSlug: "nile-cruise-luxor-aswan",
    tourTitleJsonb: { en: "Nile Cruise Luxor & Aswan", ar: "رحلة النيل الأقصر وأسوان" },
    travelersCount: 4,
    arrivalDate: "2026-10-01",
    totalAmountUsd: "5800.00",
    paidAmountUsd: "2900.00",
    status: "PENDING",
    createdAt: "2026-08-19T09:15:00Z"
  }
];

const mockRecentActivity: RecentActivityItem[] = [
  {
    id: "act-1",
    actor: "Admin User",
    action: "Created new tour",
    entity: "Egypt Classic Wonders",
    timestamp: "2026-08-19T10:00:00Z",
    type: "tour"
  },
  {
    id: "act-2",
    actor: "Carlos Silva",
    action: "New booking confirmed",
    entity: "DUN-2026-0801",
    timestamp: "2026-08-18T14:30:00Z",
    type: "booking"
  }
];

export const dashboardApi = {
  getSummary: async (filters?: DashboardFilters): Promise<ExecutiveSummary> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/summary", { params: filters });
      return res?.revenue ? res : (res?.data || mockExecutiveSummary);
    } catch {
      return mockExecutiveSummary;
    }
  },

  getRevenueTrend: async (filters?: DashboardFilters): Promise<RevenueTrendItem[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/revenue-trend", { params: filters });
      return Array.isArray(res) ? res : (res?.data || mockRevenueTrend);
    } catch {
      return mockRevenueTrend;
    }
  },

  getBookingsTrend: async (filters?: DashboardFilters): Promise<BookingsTrendItem[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/bookings-trend", { params: filters });
      return Array.isArray(res) ? res : (res?.data || mockBookingsTrend);
    } catch {
      return mockBookingsTrend;
    }
  },

  getTourPerformance: async (filters?: DashboardFilters): Promise<{ all: TourPerformanceItem[]; rankings: TourRankings }> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/tour-performance", { params: filters });
      return res?.rankings ? res : (res?.data || mockTourPerformance);
    } catch {
      return mockTourPerformance;
    }
  },

  getInterfacePerformance: async (filters?: DashboardFilters): Promise<InterfacePerformanceItem[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/interface-performance", { params: filters });
      return Array.isArray(res) ? res : (res?.data || mockInterfacePerformance);
    } catch {
      return mockInterfacePerformance;
    }
  },

  getConversionFunnel: async (filters?: DashboardFilters): Promise<ConversionFunnelData> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/conversion-funnel", { params: filters });
      return res?.stages ? res : (res?.data || mockConversionFunnel);
    } catch {
      return mockConversionFunnel;
    }
  },

  getTrafficAnalytics: async (filters?: DashboardFilters): Promise<any> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/traffic", { params: filters });
      return res?.devices ? res : (res?.data || mockTrafficAnalytics);
    } catch {
      return mockTrafficAnalytics;
    }
  },

  getActionCenter: async (filters?: DashboardFilters): Promise<ActionAlert[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/action-center", { params: filters });
      return Array.isArray(res) ? res : (res?.data || mockActionAlerts);
    } catch {
      return mockActionAlerts;
    }
  },

  getRecentBookings: async (): Promise<RecentBookingItem[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/recent-bookings");
      return Array.isArray(res) ? res : (res?.data || mockRecentBookings);
    } catch {
      return mockRecentBookings;
    }
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    try {
      const res: any = await apiClient.get("/admin/dashboard/recent-activity");
      return Array.isArray(res) ? res : (res?.data || mockRecentActivity);
    } catch {
      return mockRecentActivity;
    }
  },
};
