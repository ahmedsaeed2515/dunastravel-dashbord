 
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  tourId: string;
  userId?: string | null;
  bookingId?: string | null;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  adminReply?: string | null;
  status: ReviewStatus;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  tour?: {
    id?: string;
    slug?: string;
    titleJsonb?: Record<string, string>;
    title?: string;
  };
  user?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
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
  page?: number;
  limit?: number;
  tourId?: string;
  status?: ReviewStatus | 'ALL';
  isPublished?: boolean;
  rating?: number;
  search?: string;
}

export interface CreateReviewDraft {
  tourId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  adminReply?: string;
  status?: ReviewStatus;
  isPublished?: boolean;
}

export interface UpdateReviewDraft {
  id: string;
  tourId?: string;
  reviewerName?: string;
  rating?: number;
  comment?: string;
  adminReply?: string;
  status?: ReviewStatus;
  isPublished?: boolean;
}

