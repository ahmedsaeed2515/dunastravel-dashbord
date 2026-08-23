"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, RefreshCw, Lock } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { useExchangeRates } from "@/features/currency/hooks/useCurrency";
import { useSetting, useUpdateSetting } from "@/features/settings/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { usePermissions } from "@/hooks/usePermissions";

export default function SettingsPage() {
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");

  const ratesQuery = useExchangeRates();
  const settingQuery = useSetting('AUTH_REQUIRE_EMAIL_VERIFICATION', true);
  const { data: ratesData, isLoading: isLoadingRates, isFetching: isRefreshingRates } = ratesQuery;
  const { data: requireAuthSetting, isLoading: isLoadingAuthSetting } = settingQuery;
  const { mutate: updateSetting, isPending: isUpdatingAuthSetting } = useUpdateSetting();
  const { isSuperAdmin } = usePermissions();

  if (ratesQuery.isError || settingQuery.isError) {
    return <QueryErrorState message="تعذر تحميل إعدادات النظام من الباك إند." onRetry={() => void Promise.all([ratesQuery.refetch(), settingQuery.refetch()])} />;
  }
  
  return (
    <RequirePermission action="manage" resource="settings">
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        <PageHeader
          title={tSettings("title")}
          description={tSettings("description")}
        />

        <Tabs defaultValue="localization" className="space-y-6">
          <TabsList className="bg-muted/60 p-1 border border-border/60">
            <TabsTrigger value="localization" className="gap-2 text-xs font-semibold">
              <Globe className="h-3.5 w-3.5" /> Language & Localization
            </TabsTrigger>
            <TabsTrigger value="currencies" className="gap-2 text-xs font-semibold">
              <DollarSign className="h-3.5 w-3.5" /> Currencies
            </TabsTrigger>
            <TabsTrigger value="authentication" className="gap-2 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="localization" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Supported Locales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "English (en)", info: "Default (LTR)" },
                  { name: "Arabic (ar)", info: "العربية (RTL)" },
                  { name: "Spanish (es)", info: "Español" },
                  { name: "Portuguese (pt)", info: "Português" },
                  { name: "Italian (it)", info: "Italiano" },
                ].map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 border border-border/70 rounded-lg bg-muted/20">
                    <div>
                      <h4 className="font-semibold text-sm">{lang.name}</h4>
                      <p className="text-xs text-muted-foreground">{lang.info}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
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
                  </div>
                  <Button variant="outline" size="xs" className="gap-1.5" onClick={() => void ratesQuery.refetch()} disabled={isRefreshingRates}>
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingRates ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">USD (Base)</label>
                    <Input value="1.0000" disabled className="dir-ltr text-start font-mono" />
                  </div>
                  {isLoadingRates ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm">{tCommon("loading")}</div>
                  ) : ratesData?.rates ? (
                    Object.entries(ratesData.rates).map(([currency, rate]) => (
                      <div key={currency} className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">{currency}</label>
                        <Input value={rate as number} disabled className="dir-ltr text-start font-mono" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm">—</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Security Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/70 rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm">Require Email Verification</h4>
                  </div>
                  <Switch 
                    checked={requireAuthSetting}
                    disabled={!isSuperAdmin || isLoadingAuthSetting || isUpdatingAuthSetting}
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
