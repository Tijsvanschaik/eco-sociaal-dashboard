/**
 * Brief confetti burst after a successful activity save.
 * Respects prefers-reduced-motion.
 */
export async function fireActivityConfetti(): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "test") return;
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  try {
    const { default: confetti } = await import("canvas-confetti");
    confetti({
      particleCount: 80,
      spread: 62,
      origin: { y: 0.72 },
      colors: ["#af1e7b", "#3d6b00", "#befa7f", "#ffa6d2"],
      disableForReducedMotion: true,
    });
  } catch {
    // Canvas unavailable (SSR/tests) — skip silently.
  }
}
