"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateCustomerCrm } from "../hooks/useCustomers";
import { Customer, CustomerDetail } from "../types";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Crown,
  MapPin,
  Compass,
  FileText,
  Shield,
  Loader2,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface EditCustomerDialogProps {
  customer: Customer | CustomerDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditCustomerDialog({ customer, isOpen, onClose, onSuccess }: EditCustomerDialogProps) {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");
  const updateCrm = useUpdateCustomerCrm();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    gender: "",
    dateOfBirth: "",
    passportNumber: "",
    isVip: false,
    status: "ACTIVE",
    preferredLanguage: "en",
    preferredCurrency: "USD",
    preferredDestination: "",
    preferredTravelType: "",
    customerSource: "ADMIN",
    tagsString: "",
    segmentsString: "",
    addressStreet: "",
    addressCity: "",
    addressCountry: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRel: "",
  });

  useEffect(() => {
    if (customer) {
      const custAny = customer as any;
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        nationality: custAny.nationality || "",
        gender: custAny.gender || "",
        dateOfBirth: custAny.dateOfBirth ? custAny.dateOfBirth.split("T")[0] : "",
        passportNumber: custAny.passportNumber || "",
        isVip: Boolean(customer.isVip),
        status: customer.status || "ACTIVE",
        preferredLanguage: custAny.preferredLanguage || "en",
        preferredCurrency: custAny.preferredCurrency || "USD",
        preferredDestination: custAny.preferredDestination || "",
        preferredTravelType: custAny.preferredTravelType || "",
        customerSource: custAny.customerSource || "ADMIN",
        tagsString: Array.isArray(customer.tags) ? customer.tags.join(", ") : "",
        segmentsString: Array.isArray(customer.segments) ? customer.segments.join(", ") : "",
        addressStreet: custAny.address?.street || "",
        addressCity: custAny.address?.city || "",
        addressCountry: custAny.address?.country || "",
        emergencyName: custAny.emergencyContact?.name || "",
        emergencyPhone: custAny.emergencyContact?.phone || "",
        emergencyRel: custAny.emergencyContact?.relationship || "",
      });
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(tCommon("error") || "Name is required.");
      return;
    }

    try {
      const tags = formData.tagsString
        ? formData.tagsString.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const segments = formData.segmentsString
        ? formData.segmentsString.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      await updateCrm.mutateAsync({
        id: customer.id,
        data: {
          isVip: formData.isVip,
          status: formData.status,
          nationality: formData.nationality.trim() || undefined,
          gender: formData.gender.trim() || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          passportNumber: formData.passportNumber.trim() || undefined,
          preferredLanguage: formData.preferredLanguage,
          preferredCurrency: formData.preferredCurrency,
          preferredDestination: formData.preferredDestination.trim() || undefined,
          preferredTravelType: formData.preferredTravelType.trim() || undefined,
          customerSource: formData.customerSource,
          tags,
          segments,
          address: {
            street: formData.addressStreet,
            city: formData.addressCity,
            country: formData.addressCountry,
          },
          emergencyContact: {
            name: formData.emergencyName,
            phone: formData.emergencyPhone,
            relationship: formData.emergencyRel,
          },
        },
      });

      toast.success(tCommon("success") || "Customer updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tCommon("error") || "Failed to update customer.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 border-b border-border/70 pb-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2.5">
                <User className="h-5 w-5 text-amber-500" />
                <span>تعديل بيانات العميل: {customer.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                كود العميل: #{customer.customerNumber || customer.id.slice(0, 8)} • {customer.email}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {formData.isVip && (
                <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  <Crown className="h-3.5 w-3.5" /> VIP
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 h-10 p-1 bg-muted/60 rounded-xl mb-5">
              <TabsTrigger value="basic" className="text-xs font-bold rounded-lg">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs font-bold rounded-lg">تفضيلات السفر</TabsTrigger>
              <TabsTrigger value="identity" className="text-xs font-bold rounded-lg">الهوية والإقامة</TabsTrigger>
              <TabsTrigger value="tags" className="text-xs font-bold rounded-lg">التصنيفات والطوارئ</TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFO */}
            <TabsContent value="basic" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> الاسم الكامل
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> البريد الإلكتروني
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled
                    className="h-10 rounded-xl text-sm bg-muted/40 font-mono text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> رقم الهاتف
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 rounded-xl text-sm font-mono dir-ltr text-start"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" /> حالة الحساب
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">نشط (ACTIVE)</SelectItem>
                      <SelectItem value="INACTIVE">غير نشط (INACTIVE)</SelectItem>
                      <SelectItem value="SUSPENDED">موقوف (SUSPENDED)</SelectItem>
                      <SelectItem value="BLOCKED">محظور (BLOCKED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VIP Status Toggle Card */}
              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="space-y-0.5">
                  <div className="text-sm font-black text-foreground flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>عميل مميز (VIP Concierge Member)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    تفعيل الخدمات الاستثنائية والخصومات المخصصة لكبار الشخصيات.
                  </div>
                </div>
                <Switch
                  checked={formData.isVip}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVip: checked })}
                />
              </div>
            </TabsContent>

            {/* TAB 2: TRAVEL PREFERENCES */}
            <TabsContent value="preferences" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> اللغة المفضلة
                  </Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(val) => setFormData({ ...formData, preferredLanguage: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (الإنجليزية)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="es">Español (الإسبانية)</SelectItem>
                      <SelectItem value="it">Italiano (الإيطالية)</SelectItem>
                      <SelectItem value="pt">Português (البرتغالية)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> العملة المفضلة
                  </Label>
                  <Select
                    value={formData.preferredCurrency}
                    onValueChange={(val) => setFormData({ ...formData, preferredCurrency: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($) - دولار أمريكي</SelectItem>
                      <SelectItem value="EUR">EUR (€) - يورو</SelectItem>
                      <SelectItem value="GBP">GBP (£) - جنيه إسترليني</SelectItem>
                      <SelectItem value="SAR">SAR (ر.س) - ريال سعودي</SelectItem>
                      <SelectItem value="AED">AED (د.إ) - درهم إماراتي</SelectItem>
                      <SelectItem value="EGP">EGP (ج.م) - جنيه مصري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-muted-foreground" /> الوجهة المفضلة
                  </Label>
                  <Input
                    placeholder="مثال: الأقصر وأسوان، القاهرة، الغردقة"
                    value={formData.preferredDestination}
                    onChange={(e) => setFormData({ ...formData, preferredDestination: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-muted-foreground" /> نمط ونوع الرحلة المفضلة
                  </Label>
                  <Input
                    placeholder="مثال: رحلات نيلية فاخرة، سياحة أثرية، مغامرات سفاري"
                    value={formData.preferredTravelType}
                    onChange={(e) => setFormData({ ...formData, preferredTravelType: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: IDENTITY & ADDRESS */}
            <TabsContent value="identity" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" /> رقم جواز السفر
                  </Label>
                  <Input
                    placeholder="A12345678"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="h-10 rounded-xl text-sm font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> الجنسية / الدولة
                  </Label>
                  <Input
                    placeholder="مثال: Saudi Arabia, Spain, USA"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> تاريخ الميلاد
                  </Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" /> بيانات العنوان والإقامة
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="الشارع / العنوان"
                    value={formData.addressStreet}
                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder="المدينة"
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder="الدولة"
                    value={formData.addressCountry}
                    onChange={(e) => setFormData({ ...formData, addressCountry: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: TAGS & EMERGENCY */}
            <TabsContent value="tags" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">الوسوم (Tags - مفصولة بفواصل)</Label>
                  <Input
                    placeholder="VIP, RepeatTraveler, Honeymoon, LuxuryNile"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">شرائح العملاء (Segments)</Label>
                  <Input
                    placeholder="Luxury, Corporate, Family"
                    value={formData.segmentsString}
                    onChange={(e) => setFormData({ ...formData, segmentsString: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-rose-500" /> جهة الاتصال في حالات الطوارئ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="اسم جهة الاتصال"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder="رقم الهاتف"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                  <Input
                    placeholder="صلة القرابة (مثال: الزوج، الأخ)"
                    value={formData.emergencyRel}
                    onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t border-border/70 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-xs"
            >
              {tCommon("cancel")}
            </Button>

            <Button
              type="submit"
              disabled={updateCrm.isPending}
              variant="gold"
              className="rounded-xl font-black text-xs gap-2 px-5"
            >
              {updateCrm.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{tCommon("loading")}...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
