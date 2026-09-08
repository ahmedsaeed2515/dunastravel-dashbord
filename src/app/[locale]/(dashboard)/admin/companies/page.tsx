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

export default function CompaniesPage() {
  const tCompanies = useTranslations("companies");
  const tCommon = useTranslations("common");

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="شركاء B2B ووكالات السفر — إدارة الشركات الشريكة وعمولاتهم وحجوزاتهم المرتبطة."
        title={tCompanies("title")}
        description={tCompanies("description")}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm" variant="gold" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{tCommon("create")}</span>
          </Button>
        }
      />

      {/* Live Statistics */}
      <CompanyMetricsBanner />

      {/* Main Data Table Container */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <CompaniesTable 
          data={data?.data ?? []} 
          total={data?.meta?.total ?? 0}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={setFilters}
          onViewCompany={setSelectedCompany}
        />
      </div>

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
