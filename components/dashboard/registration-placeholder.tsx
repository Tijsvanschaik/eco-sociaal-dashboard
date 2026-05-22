import { cn } from "@/lib/utils";

/** Stable picsum seed per registration so cards keep the same photo on re-render. */
export function registrationPlaceholderPhotoUrl(id: string): string {
  const seed = encodeURIComponent(id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || "registration");
  return `https://picsum.photos/seed/${seed}/800/480`;
}

/**
 * Stock-style placeholder when a registration has no uploaded photo. Uses a
 * deterministic external image per `id` so the grid stays varied but stable.
 */
export function RegistrationPlaceholder({
  className,
  id,
}: {
  className?: string;
  /** @deprecated Category color is shown on the badge; kept for call-site compat. */
  color?: string | null;
  id: string;
}) {
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-surface-container-low", className)}
    >
      <img
        alt=""
        aria-hidden
        className="h-full w-full object-cover"
        decoding="async"
        loading="lazy"
        src={registrationPlaceholderPhotoUrl(id)}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10"
      />
    </div>
  );
}
