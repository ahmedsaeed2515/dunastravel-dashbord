import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "GUEST", "COMPANY", "AGENT"], {
    message: "Please select a role.",
  }),
  password: z.string().min(12, "Password must be at least 12 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateUserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "GUEST", "COMPANY", "AGENT"], {
    message: "Please select a role.",
  }),
  password: z.string().refine((value) => !value || value.length >= 12, "Password must be at least 12 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;
