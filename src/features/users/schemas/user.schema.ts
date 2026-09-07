import { z } from "zod";

export const userRoleEnum = z.enum(["SUPER_ADMIN", "ADMIN", "USER", "GUEST", "COMPANY", "AGENT"], {
  message: "Please select a role.",
});

const BLOCKED_FRAGMENTS = [
  "password",
  "passw0rd",
  "qwerty",
  "admin",
  "dunas",
  "letmein",
  "welcome",
  "123456",
];

export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 12 || password.length > 128) {
    return { valid: false, error: "كلمة المرور يجب أن تكون بين 12 و 128 حرفاً (12-128 characters)" };
  }

  const normalized = password.toLowerCase();
  for (const fragment of BLOCKED_FRAGMENTS) {
    if (normalized.includes(fragment)) {
      return {
        valid: false,
        error: `كلمة المرور تحتوي على مقطع سهل التوقع محظور: "${fragment}"`,
      };
    }
  }

  const characterClasses = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (characterClasses < 3) {
    return {
      valid: false,
      error: "يجب أن تحتوي كلمة المرور على 3 أنواع مختلفة على الأقل (حروف كبيرة، حروف صغيرة، أرقام، رموز)",
    };
  }

  if (/(.)\1{4,}/.test(password)) {
    return { valid: false, error: "كلمة المرور تحتوي على تكرار غير آمن لنفس الحرف" };
  }

  return { valid: true };
}

export function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*_-";

  let pass = "";
  for (let i = 0; i < 3; i++) pass += upper[Math.floor(Math.random() * upper.length)];
  for (let i = 0; i < 5; i++) pass += lower[Math.floor(Math.random() * lower.length)];
  for (let i = 0; i < 3; i++) pass += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 2; i++) pass += symbols[Math.floor(Math.random() * symbols.length)];

  return pass
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

export const userFormSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().optional(),
    role: userRoleEnum,
    password: z.string().min(12, "كلمة المرور يجب أن تكون 12 حرفاً على الأقل"),
    confirmPassword: z.string().min(1, "يرجى تأكيد كلمة المرور"),
  })
  .superRefine((data, ctx) => {
    const check = validatePasswordStrength(data.password);
    if (!check.valid && check.error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: check.error,
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "كلمتا المرور غير متطابقتين",
        path: ["confirmPassword"],
      });
    }
  });

export const updateUserFormSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().optional(),
    role: userRoleEnum,
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPassword = !!data.password && data.password.trim().length > 0;
    const hasConfirm = !!data.confirmPassword && data.confirmPassword.trim().length > 0;

    if (hasPassword || hasConfirm) {
      if (!data.password || data.password.length < 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "كلمة المرور يجب أن تكون 12 حرفاً على الأقل",
          path: ["password"],
        });
      } else {
        const check = validatePasswordStrength(data.password);
        if (!check.valid && check.error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: check.error,
            path: ["password"],
          });
        }
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "كلمتا المرور غير متطابقتين",
          path: ["confirmPassword"],
        });
      }
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
