import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstallHintBanner } from "@/components/pwa/install-hint-banner";

function stubMatchMedia(mobile = false, standalone = false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches:
        (query.includes("max-width") && mobile) ||
        (query.includes("display-mode: standalone") && standalone),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("<InstallHintBanner />", () => {
  beforeEach(() => {
    stubMatchMedia(false, false);
  });

  it("renders nothing before eligibility is computed", () => {
    const { container } = render(<InstallHintBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the banner after enough mobile visits", () => {
    stubMatchMedia(true, false);

    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    });

    storage.set("eco-pwa-install-visits", "1");

    render(<InstallHintBanner />);

    expect(screen.getByRole("region", { name: "App installeren" })).toBeInTheDocument();
    expect(screen.getByText(/Zet Eco-sociaal op je startscherm/i)).toBeInTheDocument();
  });
});
