export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  tourId: string;
  userId: string | null;
  reviewerName: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  isPublished: boolean;
  publishedAt?: string | null;
  adminReply?: string | null;
  createdAt: string;
  updatedAt: string;
  tour?: { id?: string; titleJsonb?: any; slug?: string };
  user?: { id?: string; name?: string; email?: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewQueryFilters {
  status?: ReviewStatus;
  tourId?: string;
  page?: number;
  limit?: number;
}
