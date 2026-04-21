import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

/**
 * Tijdelijke CFTF-tekstlogo. Wordt vervangen zodra het SVG-logo binnenkomt:
 * zet dan `public/brand/cftf-logo.svg` neer en render het hier met `<Image>`
 * of als inline SVG, met behoud van de `aria-label`.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      aria-label="CFTF - Eco-sociaal Dashboard"
      className={cn(
        "inline-flex items-baseline text-2xl font-extrabold tracking-tight text-primary",
        className,
      )}
    >
      CFTF
    </span>
  );
}
