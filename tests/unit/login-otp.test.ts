import { describe, expect, it } from "vitest";

import { LOGIN_OTP_LENGTH, loginOtpTokenSchema, sanitizeLoginOtpInput } from "@/lib/auth/login-otp";

describe("loginOtpTokenSchema", () => {
  it("accepts an 8-digit Supabase OTP", () => {
    expect(loginOtpTokenSchema.parse("67109300")).toBe("67109300");
  });

  it("rejects 6-digit codes", () => {
    expect(loginOtpTokenSchema.safeParse("123456").success).toBe(false);
  });
});

describe("sanitizeLoginOtpInput", () => {
  it("keeps only digits up to LOGIN_OTP_LENGTH", () => {
    expect(sanitizeLoginOtpInput("67 10 9300")).toBe("67109300");
    expect(sanitizeLoginOtpInput("671093001234").length).toBe(LOGIN_OTP_LENGTH);
  });
});
