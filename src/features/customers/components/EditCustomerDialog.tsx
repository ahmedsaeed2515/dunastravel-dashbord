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

interface FormState {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  gender: string;
  dateOfBirth: string;
  passportNumber: string;
  isVip: boolean;
  status: string;
  preferredLanguage: string;
  preferredCurrency: string;
  preferredDestination: string;
  preferredTravelType: string;
  customerSource: string;
  tagsString: string;
  segmentsString: string;
  addressStreet: string;
  addressCity: string;
  addressCountry: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRel: string;
}

function getInitialFormData(customer: Customer | CustomerDetail | null): FormState {
  if (!customer) {
    return {
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
    };
  }

  const detail = customer as Partial<CustomerDetail>;
  return {
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    nationality: customer.nationality || detail.nationality || "",
    gender: detail.gender || "",
    dateOfBirth: detail.dateOfBirth ? detail.dateOfBirth.split("T")[0] : "",
    passportNumber: detail.passportNumber || "",
    isVip: Boolean(customer.isVip),
    status: customer.status || "ACTIVE",
    preferredLanguage: detail.preferredLanguage || "en",
    preferredCurrency: detail.preferredCurrency || "USD",
    preferredDestination: detail.preferredDestination || "",
    preferredTravelType: detail.preferredTravelType || "",
    customerSource: detail.customerSource || "ADMIN",
    tagsString: Array.isArray(customer.tags) ? customer.tags.join(", ") : "",
    segmentsString: Array.isArray(customer.segments) ? customer.segments.join(", ") : "",
    addressStreet: detail.address?.street || "",
    addressCity: detail.address?.city || "",
    addressCountry: detail.address?.country || "",
    emergencyName: detail.emergencyContact?.name || "",
    emergencyPhone: detail.emergencyContact?.phone || "",
    emergencyRel: detail.emergencyContact?.relationship || "",
  };
}

export function EditCustomerDialog({ customer, isOpen, onClose, onSuccess }: EditCustomerDialogProps) {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");
  const updateCrm = useUpdateCustomerCrm();

  const [formData, setFormData] = useState<FormState>(() => getInitialFormData(customer));

  useEffect(() => {
    if (customer) {
      setFormData(getInitialFormData(customer));
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

      const hasAddress = formData.addressStreet.trim() || formData.addressCity.trim() || formData.addressCountry.trim();
      const hasEmergency = formData.emergencyName.trim() && formData.emergencyPhone.trim();

      await updateCrm.mutateAsync({
        id: customer.id,
        data: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          isVip: formData.isVip,
          status: formData.status,
          nationality: formData.nationality.trim() || undefined,
          gender: formData.gender.trim() || undefined,
          dateOfBirth: formData.dateOfBirth.trim() || undefined,
          passportNumber: formData.passportNumber.trim() || undefined,
          preferredLanguage: formData.preferredLanguage,
          preferredCurrency: formData.preferredCurrency,
          preferredDestination: formData.preferredDestination.trim() || undefined,
          preferredTravelType: formData.preferredTravelType.trim() || undefined,
          customerSource: formData.customerSource,
          tags,
          segments,
          ...(hasAddress && {
            address: {
              ...(formData.addressStreet.trim() && { street: formData.addressStreet.trim() }),
              ...(formData.addressCity.trim() && { city: formData.addressCity.trim() }),
              ...(formData.addressCountry.trim() && { country: formData.addressCountry.trim() }),
            },
          }),
          ...(hasEmergency && {
            emergencyContact: {
              name: formData.emergencyName.trim(),
              phone: formData.emergencyPhone.trim(),
              ...(formData.emergencyRel.trim() && { relationship: formData.emergencyRel.trim() }),
            },
          }),
        },
      });

      toast.success(tCommon("success") || "Customer updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || tCommon("error") || "Failed to update customer.");
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
                <span>{tCustomers("editTitle", { name: customer.name })}</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                {tCustomers("customerCode")}: #{customer.customerNumber || customer.id.slice(0, 8)} • {customer.email}
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
              <TabsTrigger value="basic" className="text-xs font-bold rounded-lg">{tCustomers("tabBasic")}</TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs font-bold rounded-lg">{tCustomers("tabPreferences")}</TabsTrigger>
              <TabsTrigger value="identity" className="text-xs font-bold rounded-lg">{tCustomers("tabIdentity")}</TabsTrigger>
              <TabsTrigger value="tags" className="text-xs font-bold rounded-lg">{tCustomers("tabTags")}</TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFO */}
            <TabsContent value="basic" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("fullName")}
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
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("email")}
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 rounded-xl text-sm font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("phone")}
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 rounded-xl text-sm font-mono dir-ltr text-start"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("accountStatus")}
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue placeholder={tCustomers("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{tCustomers("statusActive")}</SelectItem>
                      <SelectItem value="INACTIVE">{tCustomers("statusInactive")}</SelectItem>
                      <SelectItem value="SUSPENDED">{tCustomers("statusSuspended")}</SelectItem>
                      <SelectItem value="BLOCKED">{tCustomers("statusBlocked")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VIP Status Toggle Card */}
              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="space-y-0.5">
                  <div className="text-sm font-black text-foreground flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>{tCustomers("vipMember")}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tCustomers("vipDesc")}
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
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("preferredLanguage")}
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
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("preferredCurrency")}
                  </Label>
                  <Select
                    value={formData.preferredCurrency}
                    onValueChange={(val) => setFormData({ ...formData, preferredCurrency: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                      <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                      <SelectItem value="SAR">SAR (ر.س) - Saudi Riyal</SelectItem>
                      <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                      <SelectItem value="EGP">EGP (ج.م) - Egyptian Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("preferredDestination")}
                  </Label>
                  <Input
                    placeholder={tCustomers("destinationPlaceholder")}
                    value={formData.preferredDestination}
                    onChange={(e) => setFormData({ ...formData, preferredDestination: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("preferredTravelType")}
                  </Label>
                  <Input
                    placeholder={tCustomers("travelTypePlaceholder")}
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
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("passportNumber")}
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
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("nationalityCountry")}
                  </Label>
                  <Input
                    placeholder={tCustomers("nationalityPlaceholder")}
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {tCustomers("dateOfBirth")}
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
                  <MapPin className="h-3.5 w-3.5 text-amber-500" /> {tCustomers("addressSection")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder={tCustomers("street")}
                    value={formData.addressStreet}
                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder={tCustomers("city")}
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder={tCustomers("country")}
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
                  <Label className="text-xs font-bold">{tCustomers("tagsLabel")}</Label>
                  <Input
                    placeholder="VIP, RepeatTraveler, Honeymoon, LuxuryNile"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{tCustomers("segmentsLabel")}</Label>
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
                  <Phone className="h-3.5 w-3.5 text-rose-500" /> {tCustomers("emergencyContact")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder={tCustomers("emergencyName")}
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Input
                    placeholder={tCustomers("emergencyPhone")}
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                  <Input
                    placeholder={tCustomers("emergencyRelationship")}
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
                  <span>{tCustomers("saveChanges")}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
