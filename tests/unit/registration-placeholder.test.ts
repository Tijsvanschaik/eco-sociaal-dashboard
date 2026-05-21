import { describe, expect, it } from "vitest";

import { registrationPlaceholderPhotoUrl } from "@/components/dashboard/registration-placeholder";

describe("registrationPlaceholderPhotoUrl", () => {
  it("returns a stable picsum URL for a registration id", () => {
    expect(registrationPlaceholderPhotoUrl("abc-123")).toBe(
      "https://picsum.photos/seed/abc-123/800/480",
    );
    expect(registrationPlaceholderPhotoUrl("abc-123")).toBe(
      registrationPlaceholderPhotoUrl("abc-123"),
    );
  });

  it("falls back when the id has no usable characters", () => {
    expect(registrationPlaceholderPhotoUrl("!!!")).toBe(
      "https://picsum.photos/seed/registration/800/480",
    );
  });
});
