export interface ContentBlock {
  id?: string;
  key: string;
  type?: string;
  content: any;
  lastUpdatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  version?: number;
}

export interface UpdateContentBlockDto {
  content: any;
  status?: 'DRAFT' | 'PUBLISHED';
  expectedVersion?: number;
}

export interface ContentBlocksPage {
  data: ContentBlock[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
