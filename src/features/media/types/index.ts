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
  altText: string | null;
  entityType: MediaEntityType;
  entityId: string | null;
  provenance: string;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaQueryFilters {
  page?: number;
  limit?: number;
  entityType?: MediaEntityType;
  entityId?: string;
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
}

export interface MediaSummary {
  total: number;
  bytes: number;
  byEntityType: Record<'TOUR' | 'HOTEL' | 'GENERAL', number>;
}
