"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Company } from "../types";
import { useCompany, useUpdateCompany } from "../hooks/useCompanies";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { format } from "date-fns";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  UserCircle,
  Percent,
  Wallet,
  Users,
  Briefcase,
  FileText,
  Loader2,
  CalendarDays,
  ExternalLink
} from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";

interface CompanyProfileDrawerProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyProfileDrawer({ company, isOpen, onClose }: CompanyProfileDrawerProps) {
  const tCompanies = useTranslations("companies");
  const tCommon = useTranslations("common");
  const tFinance = useTranslations("finance");
  const tNav = useTranslations("navigation");
  const tAgents = useTranslations("agents");

  const { data: detail, isLoading } = useCompany(company?.id as string, { enabled: !!company?.id && isOpen });
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

  if (!company) return null;

  const isCorporate = company.companyType === 'CORPORATE';
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl border-s border-gray-100 dark:border-gray-800 p-0 sm:p-0 flex flex-col bg-white dark:bg-[#0A1628] overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 sm:p-8 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 end-0 p-8 opacity-10">
            {isCorporate ? <Building2 className="w-32 h-32" /> : <Briefcase className="w-32 h-32" />}
          </div>
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-3 text-[10px] tracking-wider uppercase">
                {company.companyType}
              </Badge>
              <h2 className="text-2xl font-playfair font-bold text-white mb-1 tracking-wide">{company.name}</h2>
              <div className="flex items-center gap-3 text-blue-100 text-xs">
                <span className="font-mono dir-ltr inline-block">{company.referenceCode}</span>
                {company.taxId && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-blue-300/50"></span>
                    <span className="font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold">
                      IATA: {company.taxId}
                    </span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-blue-300/50"></span>
                <span>{(() => {
                  if (!company.createdAt) return "N/A";
                  const d = new Date(company.createdAt);
                  return isNaN(d.getTime()) ? "N/A" : format(d, "yyyy");
                })()}</span>
              </div>
            </div>
            <StatusBadge status={company.status} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-transparent">
          {isLoading || !detail ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
              <div className="px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A1628] sticky top-0 z-20">
                <TabsList className="bg-transparent border-none w-full justify-start h-12 p-0 space-x-6">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 h-full text-xs font-medium uppercase tracking-wider">{tCommon("overview")}</TabsTrigger>
                  <TabsTrigger value="agents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 h-full text-xs font-medium uppercase tracking-wider">{tNav("agents")}</TabsTrigger>
                  <TabsTrigger value="bookings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 h-full text-xs font-medium uppercase tracking-wider">{tNav("bookings")}</TabsTrigger>
                  <TabsTrigger value="financials" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 h-full text-xs font-medium uppercase tracking-wider">{tNav("finance")}</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* 1. OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5 text-muted-foreground" /> {tCommon("name")}
                      </h3>
                      {detail.primaryContact ? (
                        <div className="space-y-1.5 text-sm">
                          <p className="font-medium">{detail.primaryContact.name} <span className="text-muted-foreground text-xs ms-1 font-normal">({detail.primaryContact.role})</span></p>
                          <p className="text-muted-foreground flex items-center gap-2 text-xs dir-ltr text-start"><Mail className="h-3 w-3" /> {detail.primaryContact.email}</p>
                          <p className="text-muted-foreground flex items-center gap-2 text-xs dir-ltr text-start"><Phone className="h-3 w-3" /> {detail.primaryContact.phone}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">—</p>
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {tCompanies("companyType")}
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        {detail.email && <p className="text-muted-foreground flex items-center gap-2 text-xs dir-ltr text-start"><Mail className="h-3 w-3" /> {detail.email}</p>}
                        {detail.phone && <p className="text-muted-foreground flex items-center gap-2 text-xs dir-ltr text-start"><Phone className="h-3 w-3" /> {detail.phone}</p>}
                        {detail.website && <p className="text-muted-foreground flex items-center gap-2 text-xs dir-ltr text-start"><Globe className="h-3 w-3" /> <a href={detail.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{detail.website.replace(/^https?:\/\//, '')}</a></p>}
                        {detail.address?.city && <p className="text-muted-foreground flex items-center gap-2 text-xs"><MapPin className="h-3 w-3" /> {detail.address.city}{detail.address.country ? `, ${detail.address.country}` : ''}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {tFinance("commissionsTitle")}
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{tFinance("rate")}</span>
                        <div className="flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-white dir-ltr inline-flex">
                          <Percent className="h-4 w-4 text-amber-500" />
                          {detail.commissionRate}%
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{tCommon("type")}</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {detail.paymentTerms?.replace('_', ' ') || 'STANDARD'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{tCommon("date")}</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white mt-1.5">
                          {(() => {
                            if (!detail.contractEndDate) return '—';
                            const d = new Date(detail.contractEndDate);
                            return isNaN(d.getTime()) ? '—' : format(d, "MMM yyyy");
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. AGENTS TAB */}
                <TabsContent value="agents" className="space-y-4 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tNav("agents")}</h3>
                  </div>
                  <div className="space-y-2">
                    {detail.users && detail.users.length > 0 ? (
                      detail.users.map((u: any) => (
                        <div key={u.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold text-xs">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {u.name} {u.isVip && <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500">VIP</Badge>}
                              </p>
                              <p className="text-xs text-muted-foreground dir-ltr text-start">{u.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] uppercase">{u.role}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        {tAgents("noAgents")}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 3. BOOKINGS TAB */}
                <TabsContent value="bookings" className="space-y-4 m-0">
                  {detail.bookings && detail.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {detail.bookings.map((b: any) => (
                        <div key={b.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 flex items-center justify-between hover:border-amber-500/50 transition-colors cursor-pointer group">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-medium text-primary group-hover:text-amber-500 transition-colors dir-ltr inline-block">{b.referenceCode}</span>
                              <StatusBadge status={b.status} />
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span><CalendarDays className="inline h-3 w-3 me-1" />{(() => {
                                if (!b.createdAt) return '—';
                                const bd = new Date(b.createdAt);
                                return isNaN(bd.getTime()) ? '—' : format(bd, "MMM do, yyyy");
                              })()}</span>
                              {b.user && <span>• {b.user.name}</span>}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="font-bold text-gray-900 dark:text-white dir-ltr inline-block">
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(b.totalAmountUsd || "0"))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      {tNav("bookings")}
                    </div>
                  )}
                </TabsContent>

                {/* 4. FINANCIALS TAB */}
                <TabsContent value="financials" className="space-y-6 m-0">
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                        <Wallet className="h-4 w-4 text-amber-500" /> {tFinance("outstandingBalance")}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold font-playfair text-gray-900 dark:text-white dir-ltr inline-block">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(detail.currentBalance)}
                    </div>
                  </div>

                  <div className="mt-8">
                    <WalletLedger ownerType="COMPANY" ownerId={company.id} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
