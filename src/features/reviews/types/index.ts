export interface Review {
  id: string;
  tourId: string;
  userId: string | null;
  reviewerName: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tour?: { titleJsonb: any; slug: string };
  user?: { name: string; email: string };
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
  isPublished?: boolean;
  page?: number;
  limit?: number;
}
