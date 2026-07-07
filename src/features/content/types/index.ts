export interface ContentBlock {
  key: string;
  type: string;
  content: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateContentBlockDto {
  content: any;
}
