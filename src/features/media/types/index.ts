export interface MediaAsset {
  id: string;
  url: string;
  altText: string | null;
  entityType: 'TOUR' | 'GENERAL';
  entityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaQueryFilters {
  page?: number;
  limit?: number;
  entityType?: 'TOUR' | 'GENERAL';
  entityId?: string;
  includeDeleted?: boolean;
}

export interface UploadMediaPayload {
  file: File;
  entityType: 'TOUR' | 'GENERAL';
  entityId?: string;
  altText?: string;
}
