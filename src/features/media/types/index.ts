export type MediaEntityType = 'TOUR' | 'HOTEL' | 'GENERAL';

export interface MediaAsset {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  providerName: string;
  format: string;
  mimeType: string;
  bytes: number;
  width?: number | null;
  height?: number | null;
  altText: string | null;
  entityType: MediaEntityType;
  entityId: string | null;
  provenance: string;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCategoryItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  color?: string;
  icon?: string;
  description?: string;
  isSystem?: boolean;
  count?: number;
}

export interface MediaQueryFilters {
  page?: number;
  limit?: number;
  entityType?: MediaEntityType;
  entityId?: string;
  category?: string;
  includeDeleted?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'bytes';
  sortOrder?: 'asc' | 'desc';
}

export interface UploadMediaPayload {
  file: File;
  entityType: MediaEntityType;
  entityId?: string;
  altText?: string;
  categorySlug?: string;
}

export interface UpdateMediaPayload {
  altText?: string;
  entityType?: MediaEntityType;
  entityId?: string | null;
  category?: string;
}

export interface BulkMoveMediaPayload {
  assetIds: string[];
  entityType: MediaEntityType;
  entityId?: string | null;
  categorySlug?: string;
}

export interface CreateMediaCategoryPayload {
  nameEn: string;
  nameAr: string;
  slug: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateMediaCategoryPayload {
  nameEn?: string;
  nameAr?: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface MediaSummary {
  total: number;
  bytes: number;
  byEntityType: Record<'TOUR' | 'HOTEL' | 'GENERAL', number>;
}
