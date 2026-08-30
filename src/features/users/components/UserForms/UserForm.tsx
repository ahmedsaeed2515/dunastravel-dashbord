"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, updateUserFormSchema, UserFormValues } from "../../schemas/user.schema";
import { BaseForm } from "@/components/shared/form/BaseForm";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from "../../types";
import { Eye, EyeOff } from "lucide-react";

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormValues) => void;
  isSubmitting?: boolean;
}

export function UserForm({ initialData, onSubmit, isSubmitting }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEdit = !!initialData;
  const schema = isEdit ? updateUserFormSchema : userFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      role: (initialData?.role as any) || "USER",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? "Save Changes" : "Create User"}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">الاسم بالكامل</FormLabel>
              <FormControl>
                <Input placeholder="الاسم ثلاثي أو ثنائي" {...field} className="rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@dunastravel.com" {...field} className="rounded-xl font-mono text-xs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">رقم الهاتف</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+20 100 000 0000" {...field} className="rounded-xl font-mono text-xs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">الدور والصلاحية</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl font-bold">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="font-bold">
                  <SelectItem value="ADMIN">مدير نظام (Administrator)</SelectItem>
                  <SelectItem value="USER">مستخدم عادي (Standard User)</SelectItem>
                  <SelectItem value="COMPANY">شركة سياحية (Company Partner)</SelectItem>
                  <SelectItem value="AGENT">وكيل سياحي (Travel Agent)</SelectItem>
                  <SelectItem value="GUEST">زائر (Guest)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">{isEdit ? "كلمة المرور (اتركها فارغة للإبقاء عليها)" : "كلمة المرور"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                    className="rounded-xl font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">تأكيد كلمة المرور</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                    className="rounded-xl font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </BaseForm>
  );
}
