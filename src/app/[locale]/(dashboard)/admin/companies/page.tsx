"use client";

import { useState } from "react";
import { CompanyMetricsBanner } from "@/features/companies/components/CompanyMetricsBanner";
import { CompaniesTable } from "@/features/companies/components/CompaniesTable";
import { CompanyProfileDrawer } from "@/features/companies/components/CompanyProfileDrawer";
import { CreateCompanyDialog } from "@/features/companies/components/CreateCompanyDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { Company, CompanyQueryFilters } from "@/features/companies/types";

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyQueryFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, refetch } = useCompanies(filters);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Executive Header */}
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary">B2B Partners & Agencies</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage corporate accounts, travel agencies, contracts, and commission ledgers.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Live Statistics */}
      <CompanyMetricsBanner />

      {/* Main Data Table */}
      <CompaniesTable 
        data={Array.isArray(data) ? data : (data?.data || [])} 
        total={Array.isArray(data) ? data.length : (data?.meta?.total || 0)}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        onViewCompany={setSelectedCompany}
      />

      {/* 360° Profile Drawer */}
      <CompanyProfileDrawer 
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />

      <CreateCompanyDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => refetch()} 
      />
    </div>
  );
}
