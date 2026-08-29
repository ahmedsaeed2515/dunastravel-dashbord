"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companiesApi } from "../api/companiesApi";
import { toast } from "sonner";
import { Loader2, Building2, Percent, CreditCard, Globe, Mail, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCompanyDialog({ isOpen, onClose, onSuccess }: CreateCompanyDialogProps) {
  const tCompanies = useTranslations("companies");
  const tCommon = useTranslations("common");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    email: "",
    phone: "",
    website: "",
    companyType: "AGENCY",
    commissionRate: 10,
    paymentTerms: "NET_30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(tCommon("error") || "Company name is required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await companiesApi.createCompany({
        name: formData.name.trim(),
        taxId: formData.taxId.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        companyType: formData.companyType as any,
        commissionRate: Number(formData.commissionRate) || 0,
        paymentTerms: formData.paymentTerms,
      });
      toast.success(tCommon("success") || "Company registered successfully!");
      onSuccess();
      onClose();
      setFormData({
        name: "",
        taxId: "",
        email: "",
        phone: "",
        website: "",
        companyType: "AGENCY",
        commissionRate: 10,
        paymentTerms: "NET_30",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tCommon("error") || "Failed to create company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {tCompanies("addCompany") || "Register New B2B Partner / Company"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a Travel Agency, Corporate Account, or Wholesaler partner in Dunas Travel.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3 text-xs">
          {/* Company Name */}
          <div className="space-y-1.5">
            <Label htmlFor="company-name" className="font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3 text-primary" /> {tCompanies("companyName") || "Company Name (اسم الشركة)"} *
            </Label>
            <Input 
              id="company-name" 
              placeholder="e.g. Dunas International Travel Agency" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
              className="text-xs font-semibold"
            />
          </div>

          {/* Company Type & Tax ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="font-semibold text-muted-foreground">
                {tCompanies("companyType") || "Partner Type (نوع الشريك)"}
              </Label>
              <Select 
                value={formData.companyType} 
                onValueChange={(val) => setFormData({ ...formData, companyType: val || 'AGENCY' })}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder={tCommon("selectOption")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENCY">✈️ Travel Agency (وكالة سياحة)</SelectItem>
                  <SelectItem value="CORPORATE">🏢 Corporate Client (شركة / مؤسسة)</SelectItem>
                  <SelectItem value="AFFILIATE">🤝 Affiliate Partner (مسوق معتمد)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taxId" className="font-semibold text-muted-foreground">
                {tCompanies("taxId") || "Tax ID / Commercial Reg. (السجل التجاري)"}
              </Label>
              <Input 
                id="taxId" 
                placeholder="TR-123456789" 
                className="dir-ltr text-start text-xs font-mono"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary" /> {tCommon("email") || "Email"}
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contact@agency.com" 
                className="dir-ltr text-start text-xs"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-semibold text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-primary" /> {tCommon("phone") || "Phone"}
              </Label>
              <Input 
                id="phone" 
                placeholder="+20 100 123 4567" 
                className="dir-ltr text-start text-xs"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="font-semibold text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3 text-primary" /> Website (الموقع الإلكتروني)
            </Label>
            <Input 
              id="website" 
              placeholder="https://www.agency.com" 
              className="dir-ltr text-start text-xs"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          {/* Financial Settings: Commission Rate & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="space-y-1.5">
              <Label htmlFor="comm-rate" className="font-semibold text-foreground flex items-center gap-1">
                <Percent className="h-3.5 w-3.5 text-amber-500" /> Default Commission (نسبة العمولة %)
              </Label>
              <Input 
                id="comm-rate" 
                type="number"
                min={0}
                max={50}
                step={0.5}
                placeholder="10" 
                className="dir-ltr text-start text-xs font-mono font-bold"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">
                Automatic commission percentage earned on bookings.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Payment Terms (شروط الدفع)
              </Label>
              <Select 
                value={formData.paymentTerms} 
                onValueChange={(val) => setFormData({ ...formData, paymentTerms: val || 'NET_30' })}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Payment Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NET_30">Net 30 (فاتورة شهرية)</SelectItem>
                  <SelectItem value="NET_15">Net 15 (15 يوماً)</SelectItem>
                  <SelectItem value="PREPAID">Prepaid (دفع مسبق من المحفظة)</SelectItem>
                  <SelectItem value="CREDIT_LIMIT">Credit Limit (حد ائتماني)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Invoicing settlement schedule for this partner.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={isSubmitting} className="font-bold gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{tCommon("saving") || "Saving..."}</span>
                </>
              ) : (
                <span>{tCommon("saveChanges") || "Register Partner"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
