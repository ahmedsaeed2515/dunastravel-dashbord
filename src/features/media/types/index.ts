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
  title?: string | null;
  description?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO';
  cloudinaryResourceType?: string | null;
  thumbnailUrl?: string | null;
  optimizedUrl?: string | null;
  duration?: number | null;
  isShowcase?: boolean;
  showcaseSection?: 'PHOTO' | 'VIDEO' | null;
  showcasePosition?: number;
  isActive?: boolean;
  isPublished?: boolean;
  metadata?: Record<string, unknown> | null;
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
  format?: string;
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

export interface UploadBulkMediaPayload {
  files: File[];
  entityType: MediaEntityType;
  entityId?: string;
  categorySlug?: string;
  altText?: string;
  altTextsMap?: Record<string, string>;
}

export interface MediaUrlItem {
  url: string;
  altText?: string;
}

export interface ImportMediaUrlsPayload {
  items: MediaUrlItem[];
  entityType: MediaEntityType;
  entityId?: string;
  categorySlug?: string;
  defaultAltText?: string;
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

export interface ShowcaseResponse {
  photos: MediaAsset[];
  videos: MediaAsset[];
}

export interface AssignShowcasePayload {
  mediaId: string;
  section: 'PHOTO' | 'VIDEO';
  position?: number;
  title?: string;
  description?: string;
  altText?: string;
}

export interface UpdateShowcaseItemPayload {
  title?: string;
  description?: string;
  altText?: string;
  position?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface ReorderShowcasePayload {
  section: 'PHOTO' | 'VIDEO';
  items: Array<{ id: string; position: number }>;
}

export interface UploadVideoPayload {
  file: File;
  title?: string;
  description?: string;
  altText?: string;
  addToShowcase?: boolean;
}

export interface OptimizeAssetPayload {
  format?: 'webp' | 'avif' | 'auto';
  quality?: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface MediaUsageItem {
  entityType: string;
  entityId: string;
  title?: string;
  field: string;
}

export interface MediaUsageResponse {
  isUsed: boolean;
  count: number;
  usages: MediaUsageItem[];
}

