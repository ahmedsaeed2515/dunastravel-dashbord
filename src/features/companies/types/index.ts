export type CompanyType = 'AGENCY' | 'CORPORATE' | 'AFFILIATE';
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export interface Company {
  id: string;
  referenceCode: string;
  name: string;
  companyType: CompanyType;
  status: CompanyStatus;
  taxId?: string;
  tier?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Record<string, any>;
  primaryContact?: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  commissionRate: number;
  currentBalance: number;
  paymentTerms?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  tags: string[];
  segments: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    bookings: number;
  };
}

export interface CompanyDetail extends Company {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isVip: boolean;
    status: string;
  }>;
  bookings: Array<{
    id: string;
    referenceCode: string;
    status: string;
    totalAmountUsd: string;
    createdAt: string;
    user?: { name: string; email: string };
    payments: Array<{
      id: string;
      amount: string;
      status: string;
      isRefund: boolean;
    }>;
  }>;
}

export interface CompanyMetrics {
  totalCompanies: number;
  activeAgencies: number;
  activeCorporate: number;
  totalOutstandingBalance: number;
  topPartners: Array<{
    id: string;
    name: string;
    referenceCode: string;
    companyType: string;
    currentBalance: string;
    _count: { bookings: number };
  }>;
}

export interface CompanyQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  companyType?: CompanyType;
  status?: CompanyStatus;
  tag?: string;
  segment?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCompanyPayload {
  name: string;
  taxId?: string;
  companyType?: CompanyType;
  email?: string;
  phone?: string;
  website?: string;
  address?: Record<string, any>;
  primaryContact?: Record<string, any>;
  commissionRate?: number;
  paymentTerms?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  tags?: string[];
  segments?: string[];
}

export interface UpdateCompanyPayload extends Partial<CreateCompanyPayload> {
  status?: CompanyStatus;
  currentBalance?: number;
}
