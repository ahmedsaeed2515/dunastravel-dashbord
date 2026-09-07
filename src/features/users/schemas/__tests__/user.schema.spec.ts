import { describe, it, expect } from "vitest";
import { userFormSchema, updateUserFormSchema } from "../user.schema";

describe("user.schema", () => {
  it("validates valid user creation data with matching password", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+12345678900",
      role: "ADMIN",
      password: "Secret#2026!Ok",
      confirmPassword: "Secret#2026!Ok",
    };

    const result = userFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails validation when password is less than 12 characters", () => {
    const invalidData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+12345678900",
      role: "USER",
      password: "Short123!",
      confirmPassword: "Short123!",
    };

    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("12");
    }
  });

  it("fails validation when passwords do not match", () => {
    const invalidData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+12345678900",
      role: "USER",
      password: "Secret#2026!Ok",
      confirmPassword: "Secret#2026!Mismatch",
    };

    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("كلمتا المرور غير متطابقتين");
    }
  });

  it("allows blank password on user update", () => {
    const validUpdate = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+19876543210",
      role: "COMPANY",
      password: "",
      confirmPassword: "",
    };

    const result = updateUserFormSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});
