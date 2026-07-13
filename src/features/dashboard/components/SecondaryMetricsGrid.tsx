"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Wallet, DollarSign, Activity, Globe, Send, CheckCircle2, Clock } from "lucide-react";


export function SecondaryMetricsGrid() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      {/* CRM & Customers */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">CRM Overview</CardTitle>
          <Users className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.crm?.totalCustomers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">New</span>
              <span className="font-medium">{data?.crm?.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Returning</span>
              <span className="font-medium">{data?.crm?.returningCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIPs</span>
              <span className="font-medium text-primary">{data?.crm?.vipCustomers || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies / B2B */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">B2B Partners</CardTitle>
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.companies?.totalCompanies || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total Companies</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Agencies</span>
              <span className="font-medium">{data?.companies?.activeAgencies || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Corporate</span>
              <span className="font-medium">{data?.companies?.activeCorporate || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-medium text-destructive">
                ${data?.companies?.totalOutstandingBalance || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Company Wallets</CardTitle>
          <Wallet className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.wallets?.totalCompanyWallets || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Active Wallets</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Liabilities</span>
              <span className="font-medium text-destructive">
                ${data?.wallets?.totalLiabilitiesUsd || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance - Commissions */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Commissions</CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            ${data?.commissions?.totalApprovedUsd || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Approved (USD)</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending USD
              </span>
              <span className="font-medium">${data?.commissions?.totalPendingUsd || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" /> Pending Count
              </span>
              <span className="font-medium">{data?.commissions?.pendingCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Communications</CardTitle>
          <Send className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.communications?.totalSent || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total Sent</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Success Rate
              </span>
              <span className="font-medium">{data?.communications?.successRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Pending
              </span>
              <span className="font-medium">{data?.communications?.totalPending || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Rates */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Exchange Rates</CardTitle>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.currencies?.base || 'USD'} Base</div>
          <p className="text-xs text-muted-foreground mt-1">Active Currencies</p>
          <div className="mt-4 space-y-2 text-sm">
            {data?.currencies?.rates ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EUR</span>
                  <span className="font-medium">{data.currencies.rates['EUR'] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GBP</span>
                  <span className="font-medium">{data.currencies.rates['GBP'] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EGP</span>
                  <span className="font-medium">{data.currencies.rates['EGP'] || 0}</span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground text-xs">No rates available</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
