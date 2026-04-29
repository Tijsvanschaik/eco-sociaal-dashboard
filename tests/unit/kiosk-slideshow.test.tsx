import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KioskSlideshow } from "@/components/public/kiosk-slideshow";

afterEach(() => {
  vi.useRealTimers();
});

describe("<KioskSlideshow />", () => {
  it("rotates the active slide every interval tick", () => {
    vi.useFakeTimers();

    render(
      <KioskSlideshow
        intervalMs={5000}
        slides={[
          { id: "a", node: <div>Slide A</div> },
          { id: "b", node: <div>Slide B</div> },
          { id: "c", node: <div>Slide C</div> },
        ]}
      />,
    );

    const initial = screen.getByTestId("kiosk-slide-a");
    expect(initial.dataset.active).toBe("true");
    expect(screen.getByTestId("kiosk-slide-b").dataset.active).toBe("false");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("kiosk-slide-b").dataset.active).toBe("true");
    expect(screen.getByTestId("kiosk-slide-a").dataset.active).toBe("false");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("kiosk-slide-c").dataset.active).toBe("true");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("kiosk-slide-a").dataset.active).toBe("true");
  });

  it("does not rotate when only a single slide is provided", () => {
    vi.useFakeTimers();

    render(<KioskSlideshow slides={[{ id: "only", node: <div>Solo</div> }]} />);

    expect(screen.queryByTestId("kiosk-slideshow-indicators")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId("kiosk-slide-only").dataset.active).toBe("true");
  });
});
