export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  titleJsonb?: Record<string, string>;
  excerpt?: string;
  excerptJsonb?: Record<string, string>;
  content: string;
  contentJsonb?: Record<string, string>;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[];
  status?: string;
  isPublished?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogDraft = {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
  coverImage: string;
  author: string;
  category: string;
  status: string;
  isPublished: boolean;
};

export type BlogsListResponse = {
  data: BlogArticle[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
