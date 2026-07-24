"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companiesApi } from "../api/companiesApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  const tAuth = useTranslations("auth");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    email: "",
    phone: "",
    companyType: "AGENCY",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error(tCommon("error"));
      return;
    }
    
    setIsSubmitting(true);
    try {
      await companiesApi.createCompany({
        name: formData.name,
        taxId: formData.taxId,
        email: formData.email,
        phone: formData.phone,
        companyType: formData.companyType as any,
      } as any);
      toast.success(tCommon("success"));
      onSuccess();
      onClose();
      setFormData({ name: "", taxId: "", email: "", phone: "", companyType: "AGENCY" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tCompanies("addCompany")}</DialogTitle>
          <DialogDescription>
            {tCompanies("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tCompanies("companyName")} *</Label>
            <Input 
              id="name" 
              placeholder={tCompanies("companyName")} 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">{tCompanies("taxId")}</Label>
            <Input 
              id="taxId" 
              placeholder="123456789" 
              className="dir-ltr text-start"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tCommon("email")}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contact@company.com" 
                className="dir-ltr text-start"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{tCommon("phone")}</Label>
              <Input 
                id="phone" 
                placeholder="+1 234 567 890" 
                className="dir-ltr text-start"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{tCompanies("companyType")}</Label>
            <Select 
              value={formData.companyType} 
              onValueChange={(val) => setFormData({ ...formData, companyType: val || 'AGENCY' })}
            >
              <SelectTrigger>
                <SelectValue placeholder={tCommon("selectOption")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AGENCY">{tCompanies("travelAgencies")}</SelectItem>
                <SelectItem value="CORPORATE">{tCompanies("corporateAccounts")}</SelectItem>
                <SelectItem value="AFFILIATE">Affiliate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {tCommon("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
