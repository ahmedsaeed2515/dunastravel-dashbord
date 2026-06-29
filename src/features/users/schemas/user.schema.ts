import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "GUEST", "COMPANY"], {
    message: "Please select a role.",
  }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
