export type UserRole = "ADMIN" | "SUPER_ADMIN" | "USER" | "GUEST" | "COMPANY" | "AGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status?: string;
  isVerified?: boolean;
  phoneVerified?: boolean;
  isVip?: boolean;
  customerNumber?: string | null;
  nationality?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  preferredCurrency?: string | null;
  preferredLanguage?: string | null;
  preferredDestination?: string | null;
  preferredTravelType?: string | null;
  referralSource?: string | null;
  tags?: string[];
  segments?: string[];
  address?: any;
  emergencyContact?: any;
  familyMembers?: any;
  travelCompanions?: any;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    referenceCode?: string;
    companyType?: string;
  } | null;
  suspendedAt?: string | null;
  suspendReason?: string | null;
  sessionVersion?: number;
  lastLoginIp?: string | null;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
  bookingsCount?: number;
  reviewsCount?: number;
  inquiriesCount?: number;
}

export interface UserQueryFilters {
  search?: string;
  role?: UserRole | "ALL";
  companyId?: string | null;
  status?: string;
  isVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UserMonitoringMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  vipUsers: number;
  newUsers: {
    today: number;
    last7Days: number;
    last30Days: number;
  };
  rolesDistribution: Record<string, number>;
  activityMetrics: {
    past24HoursEvents: number;
    past24HoursLogins: number;
  };
}

export interface UserActivityTimelineItem {
  id: string;
  type: "AUTH" | "BOOKING" | "INQUIRY" | "REVIEW" | "FAVORITE" | "ADMIN_ACTION" | "NAVIGATION";
  action: string;
  title: string;
  description?: string;
  timestamp: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  status?: string;
}

export interface UserMonitoringDetail {
  user: User;
  metrics: {
    totalBookings: number;
    completedBookings: number;
    totalSpent: number;
    totalInquiries: number;
    totalReviews: number;
    totalFavorites: number;
    notesCount: number;
    documentsCount: number;
  };
  activityTimeline: UserActivityTimelineItem[];
  bookings: Array<{
    id: string;
    bookingReference: string;
    status: string;
    totalPrice: number;
    currency: string;
    tourId?: string;
    tourTitle?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
  }>;
  inquiries: Array<{
    id: string;
    referenceCode?: string;
    destination?: string;
    status: string;
    budget?: number;
    currency?: string;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    tourId?: string;
    rating: number;
    reviewText?: string;
    status: string;
    createdAt: string;
  }>;
  notes: Array<{
    id: string;
    noteType: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    user?: { id: string; name: string; email: string };
  }>;
}

export interface LiveActivityItem {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  actor?: { id: string; name: string; email: string; role: string } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  createdAt: string;
}
