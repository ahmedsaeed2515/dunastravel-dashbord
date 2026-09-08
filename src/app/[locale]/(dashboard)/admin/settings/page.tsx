"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Lock } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { useSetting, useUpdateSetting } from "@/features/settings/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const tSettings = useTranslations("settings");

  const { data: requireAuthSetting, isLoading: isLoadingAuthSetting } = useSetting('AUTH_REQUIRE_EMAIL_VERIFICATION', false);
  const { data: rawActiveLocales, isLoading: isLoadingLocales } = useSetting('ACTIVE_LOCALES', {
    en: true,
    ar: true,
    es: true,
    pt: true,
    it: true,
  });
  const { mutate: updateSetting, isPending: isUpdatingSetting } = useUpdateSetting();

  const requireEmailVerification = typeof requireAuthSetting === 'boolean'
    ? requireAuthSetting
    : false;

  // Normalize active locales map
  const activeLocales: Record<string, boolean> = (() => {
    if (rawActiveLocales && typeof rawActiveLocales === 'object' && !Array.isArray(rawActiveLocales)) {
      return {
        en: rawActiveLocales.en ?? true,
        ar: rawActiveLocales.ar ?? true,
        es: rawActiveLocales.es ?? true,
        pt: rawActiveLocales.pt ?? true,
        it: rawActiveLocales.it ?? true,
      };
    }
    if (Array.isArray(rawActiveLocales)) {
      return {
        en: rawActiveLocales.includes('en'),
        ar: rawActiveLocales.includes('ar'),
        es: rawActiveLocales.includes('es'),
        pt: rawActiveLocales.includes('pt'),
        it: rawActiveLocales.includes('it'),
      };
    }
    return { en: true, ar: true, es: true, pt: true, it: true };
  })();

  const activeCount = Object.values(activeLocales).filter(Boolean).length;

  const handleToggleLocale = (code: string, checked: boolean) => {
    if (!checked && activeCount <= 1 && activeLocales[code]) {
      return; // Cannot disable the last remaining active language
    }
    const updated = {
      ...activeLocales,
      [code]: checked,
    };
    updateSetting({ key: 'ACTIVE_LOCALES', value: updated });
  };
  
  return (
    <RequirePermission action="manage" resource="settings">
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        <PageHeader
          helpTooltip="إعدادات النظام — تخصيص الإعدادات العامة للمنصة، العملات، والسياسات."
        title={tSettings("title")}
          description={tSettings("description")}
        />

        <Tabs defaultValue="localization" className="space-y-6">
          <TabsList className="bg-muted/60 p-1 border border-border/60 font-bold">
            <TabsTrigger value="localization" className="gap-2 text-xs font-bold">
              <Globe className="h-3.5 w-3.5" /> اللغات والترجمة (Localization)
            </TabsTrigger>
            <TabsTrigger value="authentication" className="gap-2 text-xs font-bold">
              <Lock className="h-3.5 w-3.5" /> الأمان وسياسة الدخول (Security)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="localization" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold">اللغات المدعومة في النظام والموقع</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      تفعيل وتعطيل اللغات المتاحة عبر الموقع والداشبورد. يجب إبقاء لغة واحدة على الأقل مفعلة دائماً.
                    </CardDescription>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {activeCount} / 5 مفعل
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { code: "ar", name: "العربية (Arabic)", info: "العربية (RTL - الأساسية)", flag: "🇪🇬" },
                  { code: "en", name: "English (en)", info: "الإنجليزية (LTR)", flag: "🇬🇧" },
                  { code: "es", name: "Spanish (es)", info: "الإسبانية Español", flag: "🇪🇸" },
                  { code: "pt", name: "Portuguese (pt)", info: "البرتغالية Português", flag: "🇧🇷" },
                  { code: "it", name: "Italian (it)", info: "الإيطالية Italiano", flag: "🇮🇹" },
                ].map((lang) => {
                  const isLocaleActive = activeLocales[lang.code] ?? true;
                  const isOnlyActive = isLocaleActive && activeCount <= 1;

                  return (
                    <div
                      key={lang.code}
                      className={`flex justify-between items-center p-3.5 border rounded-xl transition-colors ${
                        isLocaleActive
                          ? "border-border/80 bg-muted/20"
                          : "border-border/40 bg-muted/5 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">{lang.name}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isLocaleActive
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30"
                              }`}
                            >
                              {isLocaleActive ? "مفعل" : "معطل"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">{lang.info}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isLocaleActive}
                          disabled={isLoadingLocales || isUpdatingSetting || isOnlyActive}
                          onCheckedChange={(checked) => handleToggleLocale(lang.code, checked)}
                          title={isOnlyActive ? "يجب إبقاء لغة واحدة على الأقل مفعلة" : undefined}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="m-0">
            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold">سياسات الأمان والحماية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/70 rounded-xl bg-muted/20">
                  <div className="space-y-1 pe-6">
                    <h4 className="font-bold text-sm">اشتراط تأكيد البريد الإلكتروني للتسجيل</h4>
                    <p className="text-xs text-muted-foreground">
                      {requireEmailVerification
                        ? 'يجب على الحسابات الجديدة تأكيد بريدهم الإلكتروني قبل تسجيل الدخول.'
                        : 'يتم تفعيل الحسابات الجديدة فورياً بدون انتظار رابط التحقق.'}
                    </p>
                  </div>
                  <Switch 
                    checked={requireEmailVerification}
                    disabled={isLoadingAuthSetting || isUpdatingSetting}
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
