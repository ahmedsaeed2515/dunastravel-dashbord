import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, clearCsrfToken, setCsrfToken } from "@/lib/axios";
import { authApi } from "../auth";

vi.mock("@/lib/axios", () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  clearCsrfToken: vi.fn(),
  setCsrfToken: vi.fn(),
}));

const user = {
  id: "user-1",
  email: "admin@example.com",
  name: "Admin",
  role: "ADMIN" as const,
};

describe("authApi.login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes the flat backend login response", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ...user, csrfToken: "1234567890abcdef" });

    await expect(authApi.login({ email: user.email, password: "secret" })).resolves.toEqual({
      user,
      csrfToken: "1234567890abcdef",
    });
    expect(clearCsrfToken).toHaveBeenCalledOnce();
    expect(setCsrfToken).toHaveBeenCalledWith("1234567890abcdef");
  });

  it("keeps compatibility with a nested user response", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ user, csrfToken: "abcdef1234567890" });

    await expect(authApi.login({ email: user.email, password: "secret" })).resolves.toEqual({
      user,
      csrfToken: "abcdef1234567890",
    });
  });
});
