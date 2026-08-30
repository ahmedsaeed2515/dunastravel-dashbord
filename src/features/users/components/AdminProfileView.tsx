"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { apiClient } from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Globe, 
  CreditCard, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  LogOut,
  Save,
  KeyRound
} from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminProfileView() {
  const { user, refetchSession, logout } = useAuth();
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");

  // Profile Edit State
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [passportNumber, setPassportNumber] = useState(user?.passportNumber || "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || "en");
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || "USD");

  // Change Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync state if user loads later
  if (user && name === "" && user.name) {
    setName(user.name);
    setPhone(user.phone || "");
    setNationality(user.nationality || "");
    setPassportNumber(user.passportNumber || "");
    setPreferredLanguage(user.preferredLanguage || "en");
    setPreferredCurrency(user.preferredCurrency || "USD");
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await apiClient.patch("/auth/profile", {
        name,
        phone: phone || null,
        nationality: nationality || null,
        passportNumber: passportNumber || null,
        preferredLanguage,
        preferredCurrency,
      });
      toast.success("Profile updated successfully!");
      refetchSession();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile details.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      const first = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean)[0] : 'ar';
      const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(first) ? first : 'ar';
      window.location.href = `/${validLocale}/login`;
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <Card className="overflow-hidden border shadow-md bg-gradient-to-r from-card via-card to-primary/5">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-amber-500/10 p-6 flex items-end justify-between border-b border-border/50 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-xs text-primary border-primary/30 font-semibold px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {user?.role ?? "—"}
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {user?.status || "ACTIVE"}
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg ring-2 ring-primary/20">
              <AvatarImage src="" alt={user?.name || "Admin"} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 pb-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {user?.name || "Super Admin"}
                {user?.isVip && (
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                )}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {user?.email || "admin@dunastravel.com"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pb-1">
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-xl">
              <LogOut className="w-4 h-4 mr-1.5" />
              {tNav("logOut")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/60">
          <TabsTrigger value="details" className="gap-2 font-bold">
            <User className="w-4 h-4" /> البيانات الشخصية
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 font-bold">
            <Lock className="w-4 h-4" /> الأمان وكلمة المرور
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Details Form */}
        <TabsContent value="details" className="mt-6 space-y-6">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> معلومات الملف الشخصي
              </CardTitle>
              <CardDescription>
                تحديث بيانات الحساب الشخصي ومعلومات الاتصال وتفضيلات النظام.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">الاسم بالكامل</Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الاسم ثلاثي"
                        className="pl-9 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold">البريد الإلكتروني (للقراءة فقط)</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="pl-9 bg-muted/50 cursor-not-allowed rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 100 000 0000"
                        className="pl-9 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-bold">الجنسية</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="nationality"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="مثال: مصري، سعودي، إسباني"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber" className="text-sm font-bold">رقم جواز السفر</Label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="passportNumber"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        placeholder="A12345678"
                        className="pl-9 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage" className="text-sm font-bold">اللغة المفضلة للنظام</Label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <select
                        id="preferredLanguage"
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="ar">العربية (Arabic)</option>
                        <option value="en">English (US)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="pt">Português (Portuguese)</option>
                        <option value="it">Italiano (Italian)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCurrency" className="text-sm font-bold">العملة المفضلة</Label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <select
                        id="preferredCurrency"
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="USD">USD ($ - دولار أمريكي)</option>
                        <option value="EUR">EUR (€ - يورو)</option>
                        <option value="EGP">EGP (ج.م - جنيه مصري)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">تاريخ إنشاء الحساب</Label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        disabled
                        className="pl-9 bg-muted/50 cursor-not-allowed text-xs font-mono rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingProfile} className="gap-2 font-bold rounded-xl">
                    <Save className="w-4 h-4" />
                    {isUpdatingProfile ? "جاري الحفظ..." : "حفظ بيانات الملف الشخصي"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" /> تغيير كلمة المرور
              </CardTitle>
              <CardDescription>
                تأكد من استخدام كلمة مرور قوية وغير مكررة لحماية حسابك وصلاحياتك الإدارية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-bold">كلمة المرور الحالية</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-bold">كلمة المرور الجديدة</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="rounded-xl font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground font-semibold">على الأقل 8 أحرف وأرقام مدمجة.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold">تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="rounded-xl font-mono"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword} className="gap-2 font-bold rounded-xl">
                    <Lock className="w-4 h-4" />
                    {isChangingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
