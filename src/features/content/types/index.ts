export interface ContentBlock {
  id?: string;
  key: string;
  type?: string;
  content: any;
  lastUpdatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateContentBlockDto {
  content: any;
}
