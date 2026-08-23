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
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { usePermissions } from "@/hooks/usePermissions";

export default function CompaniesPage() {
  const tCompanies = useTranslations("companies");
  const tCommon = useTranslations("common");
  const { isSuperAdmin } = usePermissions();

  const [filters, setFilters] = useState<CompanyQueryFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useCompanies(filters);

  if (isError) {
    return <QueryErrorState message="تعذر تحميل الشركات الشريكة من الباك إند." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tCompanies("title")}
        description={tCompanies("description")}
        actions={isSuperAdmin ?
          <Button onClick={() => setIsCreateOpen(true)} size="sm" variant="gold" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{tCommon("create")}</span>
          </Button> : undefined
        }
      />

      {/* Live Statistics */}
      <CompanyMetricsBanner />

      {/* Main Data Table Container */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <CompaniesTable 
          data={Array.isArray(data) ? data : (data?.data || [])} 
          total={Array.isArray(data) ? data.length : (data?.meta?.total || 0)}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={setFilters}
          onViewCompany={setSelectedCompany}
          canManage={isSuperAdmin}
        />
      </div>

      {/* 360° Profile Drawer */}
      <CompanyProfileDrawer 
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />

      {isSuperAdmin && <CreateCompanyDialog
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => refetch()} 
      />}
    </div>
  );
}
