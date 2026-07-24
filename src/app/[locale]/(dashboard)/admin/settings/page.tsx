"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, Settings2, RefreshCw, Save, Lock } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { useExchangeRates } from "@/features/currency/hooks/useCurrency";
import { useSetting, useUpdateSetting } from "@/features/settings/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  const { data: ratesData, isLoading: isLoadingRates } = useExchangeRates();
  const { data: requireAuthSetting, isLoading: isLoadingAuthSetting } = useSetting('AUTH_REQUIRE_EMAIL_VERIFICATION', true);
  const { mutate: updateSetting, isPending: isUpdatingAuthSetting } = useUpdateSetting();
  
  return (
    <RequirePermission action="manage" resource="settings">
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        <PageHeader
          title="Platform Settings"
          description="Global configuration for 5-language localization, exchange rates, security parameters, and authentication rules."
        />

        <Tabs defaultValue="localization" className="space-y-6">
          <TabsList className="bg-muted/60 p-1 border border-border/60">
            <TabsTrigger value="localization" className="gap-2 text-xs font-semibold">
              <Globe className="h-3.5 w-3.5" /> Localization & Translations
            </TabsTrigger>
            <TabsTrigger value="currencies" className="gap-2 text-xs font-semibold">
              <DollarSign className="h-3.5 w-3.5" /> Currencies & Rates
            </TabsTrigger>
            <TabsTrigger value="authentication" className="gap-2 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5" /> Authentication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="localization" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Supported Project Languages</CardTitle>
                <CardDescription className="text-xs">System locale configurations for Dunas Travel platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "English (en)", info: "Default system language (LTR)" },
                  { name: "Arabic (ar)", info: "RTL orientation enabled" },
                  { name: "Spanish (es)", info: "Español multi-country dictionary" },
                  { name: "Portuguese (pt)", info: "Português do Brasil & Europa" },
                  { name: "Italian (it)", info: "Italiano turismo e cultura" },
                ].map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 border border-border/70 rounded-lg bg-muted/20">
                    <div>
                      <h4 className="font-semibold text-sm">{lang.name}</h4>
                      <p className="text-xs text-muted-foreground">{lang.info}</p>
                    </div>
                    <Button variant="outline" size="xs">Active</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currencies" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-semibold">Exchange Rates</CardTitle>
                    <CardDescription className="text-xs">Base currency is USD. Daily live currency rates.</CardDescription>
                  </div>
                  <Button variant="outline" size="xs" className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Rates
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">USD (Base)</label>
                    <Input value="1.0000" disabled />
                  </div>
                  {isLoadingRates ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm">Loading rates...</div>
                  ) : ratesData?.rates ? (
                    Object.entries(ratesData.rates).map(([currency, rate]) => (
                      <div key={currency} className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">{currency}</label>
                        <Input value={rate as number} disabled />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm">No live rates returned.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Authentication & Access Control</CardTitle>
                <CardDescription className="text-xs">Configure security policy rules for admin users and agents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/70 rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm">Require Email Verification</h4>
                    <p className="text-xs text-muted-foreground">
                      Users must verify their email before gaining access to active booking accounts.
                    </p>
                  </div>
                  <Switch 
                    checked={requireAuthSetting}
                    disabled={isLoadingAuthSetting || isUpdatingAuthSetting}
                    onCheckedChange={(checked) => updateSetting({ key: 'AUTH_REQUIRE_EMAIL_VERIFICATION', value: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequirePermission>
  );
}
