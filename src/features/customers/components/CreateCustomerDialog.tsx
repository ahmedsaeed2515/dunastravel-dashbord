"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customersApi } from "../api/customersApi";
import { toast } from "sonner";
import { Loader2, Crown, Sparkles, User, Mail, Phone, Globe, DollarSign, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCustomerDialog({ isOpen, onClose, onSuccess }: CreateCustomerDialogProps) {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    isVip: false,
    preferredLanguage: "en",
    preferredCurrency: "USD",
    preferredDestination: "",
    preferredTravelType: "",
    customerSource: "ADMIN",
    initialNote: "",
    tagsString: "VIP, NewTraveler",
    passportNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(tCommon("error") || "Name and Email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = formData.tagsString
        ? formData.tagsString.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await customersApi.createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        nationality: formData.nationality.trim() || undefined,
        isVip: formData.isVip,
        preferredLanguage: formData.preferredLanguage,
        preferredCurrency: formData.preferredCurrency,
        preferredDestination: formData.preferredDestination.trim() || undefined,
        preferredTravelType: formData.preferredTravelType.trim() || undefined,
        customerSource: formData.customerSource,
        initialNote: formData.initialNote.trim() || undefined,
        tags,
        passportNumber: formData.passportNumber.trim() || undefined,
      });

      toast.success(tCommon("success") || "Customer created successfully in CRM!");
      onSuccess();
      onClose();
      setFormData({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        isVip: false,
        preferredLanguage: "en",
        preferredCurrency: "USD",
        preferredDestination: "",
        preferredTravelType: "",
        customerSource: "ADMIN",
        initialNote: "",
        tagsString: "VIP, NewTraveler",
        passportNumber: "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tCommon("error") || "Failed to create customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <User className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {tCustomers("addCustomer") || "Add New Customer (CRM)"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Register a luxury traveler, VIP client, or booking passenger in Dunas CRM.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3 text-xs">
          {/* VIP Status Highlight Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <Label htmlFor="vip-toggle" className="font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                  VIP Luxury Status (عميل VIP)
                </Label>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80">
                  Enables priority concierge handling, custom luxury itineraries, and VIP dashboard badges.
                </p>
              </div>
            </div>
            <Switch
              id="vip-toggle"
              checked={formData.isVip}
              onCheckedChange={(checked) => setFormData({ ...formData, isVip: checked })}
            />
          </div>

          {/* Basic Info: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name" className="font-semibold text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-primary" /> Full Name (الاسم الكامل) *
              </Label>
              <Input
                id="cust-name"
                placeholder="e.g. Lady Eleanor Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-email" className="font-semibold text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary" /> Email Address (البريد الإلكتروني) *
              </Label>
              <Input
                id="cust-email"
                type="email"
                placeholder="eleanor@luxurytravel.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="dir-ltr text-start text-xs font-semibold"
              />
            </div>
          </div>

          {/* Phone & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone" className="font-semibold text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-primary" /> Phone Number (رقم الهاتف)
              </Label>
              <Input
                id="cust-phone"
                placeholder="+44 20 7946 0912"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="dir-ltr text-start text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-nationality" className="font-semibold text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3 text-primary" /> Nationality (الجنسية)
              </Label>
              <Input
                id="cust-nationality"
                placeholder="e.g. British, Emirati, American, Spanish"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="text-xs font-semibold"
              />
            </div>
          </div>

          {/* Preferences: Currency & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label className="font-semibold text-muted-foreground">Language (اللغة)</Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={(val) => setFormData({ ...formData, preferredLanguage: val || 'en' })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English (en)</SelectItem>
                  <SelectItem value="ar">🇸🇦 Arabic (ar)</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish (es)</SelectItem>
                  <SelectItem value="pt">🇵🇹 Portuguese (pt)</SelectItem>
                  <SelectItem value="it">🇮🇹 Italian (it)</SelectItem>
                  <SelectItem value="de">🇩🇪 German (de)</SelectItem>
                  <SelectItem value="fr">🇫🇷 French (fr)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-muted-foreground">Currency (العملة)</Label>
              <Select
                value={formData.preferredCurrency}
                onValueChange={(val) => setFormData({ ...formData, preferredCurrency: val || 'USD' })}
              >
                <SelectTrigger className="text-xs font-mono font-bold">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-muted-foreground">مصدر استقطاب العميل (Source)</Label>
              <Select
                value={formData.customerSource}
                onValueChange={(val) => setFormData({ ...formData, customerSource: val || 'ADMIN' })}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="اختر المصدر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">إدارة النظام / VIP Concierge</SelectItem>
                  <SelectItem value="WEB">حجز مباشر من الموقع (Website Booking)</SelectItem>
                  <SelectItem value="REFERRAL">توصية وترشيح خاص (VIP Referral)</SelectItem>
                  <SelectItem value="PHONE">استفسار هاتفي / واتساب (Phone Inquiry)</SelectItem>
                  <SelectItem value="PARTNER">شريك سياحي (B2B Travel Partner)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cust-pref-dest" className="font-semibold text-muted-foreground">
                الوجهة المفضلة (Preferred Destination)
              </Label>
              <Input
                id="cust-pref-dest"
                placeholder="مثال: القاهرة، الأقصر، نايل كروز..."
                value={formData.preferredDestination}
                onChange={(e) => setFormData({ ...formData, preferredDestination: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-pref-type" className="font-semibold text-muted-foreground">
                نمط ونوع الرحلة (Travel Style)
              </Label>
              <Input
                id="cust-pref-type"
                placeholder="مثال: رحلات خاصة فاخرة، شهر عسل، تاريخي"
                value={formData.preferredTravelType}
                onChange={(e) => setFormData({ ...formData, preferredTravelType: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          {/* Tags & Passport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cust-tags" className="font-semibold text-muted-foreground">
                وسوم العميل في النظام CRM (مفصولة بفواصل)
              </Label>
              <Input
                id="cust-tags"
                placeholder="VIP, PrivateCharter, RepeatClient"
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-passport" className="font-semibold text-muted-foreground">
                رقم جواز السفر / الهوية (اختياري)
              </Label>
              <Input
                id="cust-passport"
                placeholder="GB12345678"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                className="dir-ltr text-start text-xs font-mono"
              />
            </div>
          </div>

          {/* Initial Sales Note */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-note" className="font-semibold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary" /> الملاحظات الأولية للعميل
            </Label>
            <Textarea
              id="cust-note"
              rows={3}
              placeholder="اكتب ملاحظات الاستقبال وتفضيلات العميل الخاصة هنا..."
              value={formData.initialNote}
              onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
              className="text-xs leading-relaxed"
            />
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={isSubmitting} className="gap-1.5 font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>جاري حفظ ملف العميل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>إنشاء وحفظ ملف العميل</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
