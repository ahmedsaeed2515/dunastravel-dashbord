"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Wallet, DollarSign, Activity, Globe, Send, CheckCircle2, Clock } from "lucide-react";
import { useParams } from "next/navigation";

export function SecondaryMetricsGrid() {
  const { data, isLoading } = useDashboardMetrics();
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      {/* CRM & Customers */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "ملخص العملاء والـ CRM" : "CRM Overview"}</CardTitle>
          <Users className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{data?.crm?.totalCustomers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "إجمالي العملاء" : "Total Customers"}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "جدد" : "New"}</span>
              <span className="font-bold">{data?.crm?.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "متكررون" : "Returning"}</span>
              <span className="font-bold">{data?.crm?.returningCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "عملاء VIP" : "VIPs"}</span>
              <span className="font-bold text-amber-500">{data?.crm?.vipCustomers || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies / B2B */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "شركاء B2B" : "B2B Partners"}</CardTitle>
          <Building2 className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{data?.companies?.totalCompanies || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "إجمالي الشركات" : "Total Companies"}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "وكالات نشطة" : "Active Agencies"}</span>
              <span className="font-bold">{data?.companies?.activeAgencies || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "شركات أعمال" : "Active Corporate"}</span>
              <span className="font-bold">{data?.companies?.activeCorporate || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "مستحقات معلقة" : "Outstanding"}</span>
              <span className="font-bold text-destructive font-mono">
                ${data?.companies?.totalOutstandingBalance || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "محافظ الشركات" : "Company Wallets"}</CardTitle>
          <Wallet className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{data?.wallets?.totalCompanyWallets || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "محافظ مفعلة" : "Active Wallets"}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{isAr ? "الالتزامات الكلية" : "Total Liabilities"}</span>
              <span className="font-bold text-destructive font-mono">
                ${data?.wallets?.totalLiabilitiesUsd || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance - Commissions */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "العمولات التشغيلية" : "Commissions"}</CardTitle>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ${data?.commissions?.totalApprovedUsd || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "معتمدة ومؤكدة ($)" : "Approved (USD)"}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {isAr ? "معلقة ($)" : "Pending USD"}
              </span>
              <span className="font-bold font-mono">${data?.commissions?.totalPendingUsd || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" /> {isAr ? "عدد المعلق" : "Pending Count"}
              </span>
              <span className="font-bold font-mono">{data?.commissions?.pendingCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "الرسائل والإشعارات" : "Communications"}</CardTitle>
          <Send className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{data?.communications?.totalSent || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "إجمالي المرسل" : "Total Sent"}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {isAr ? "نسبة النجاح" : "Success Rate"}
              </span>
              <span className="font-bold text-emerald-600 font-mono">{data?.communications?.successRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> {isAr ? "قيد الإرسال" : "Pending"}
              </span>
              <span className="font-bold font-mono">{data?.communications?.totalPending || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Rates */}
      <Card className="shadow-xs rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold">{isAr ? "أسعار الصرف" : "Exchange Rates"}</CardTitle>
          <Globe className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{data?.currencies?.base || 'USD'} <span className="text-xs text-muted-foreground font-normal">{isAr ? "أساس" : "Base"}</span></div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{isAr ? "العملات الحالية" : "Active Currencies"}</p>
          <div className="mt-4 space-y-2 text-xs">
            {data?.currencies?.rates ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EUR (€)</span>
                  <span className="font-bold font-mono">{data.currencies.rates['EUR'] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GBP (£)</span>
                  <span className="font-bold font-mono">{data.currencies.rates['GBP'] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EGP (ج.م)</span>
                  <span className="font-bold font-mono">{data.currencies.rates['EGP'] || 0}</span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground text-xs">{isAr ? "لا توجد أسعار متاحة" : "No rates available"}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
