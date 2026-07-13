export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreatePromotionPayload {
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  isActive?: boolean;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {}
