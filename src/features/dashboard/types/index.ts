export interface FailedNotification {
  id: string;
  recipient: string;
  subject: string;
  originEvent: string;
  originReferenceCode: string;
  failureReason: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalBookings: number;
  bookingsThisMonth: number;
  totalInquiries: number;
  openInquiries: number;
  totalContactSubmissions: number;
  unreadContactSubmissions: number;
  totalNotificationsSent: number;
  totalNotificationsFailed: number;
  recentFailedNotifications: FailedNotification[];
}
