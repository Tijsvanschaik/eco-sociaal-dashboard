import { getAppUrl } from "@/lib/app-url";

/** Email-safe brand tokens aligned with `app/globals.css`. */
export const EMAIL_BRAND = {
  background: "#fff8f3",
  border: "#eae1d9",
  card: "#ffffff",
  fontFamily:
    "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  foreground: "#36322d",
  muted: "#f4ece6",
  mutedForeground: "#645e58",
  onPrimaryContainer: "#780052",
  primary: "#af1e7b",
  primaryContainer: "#ffa6d2",
  primaryDim: "#9f096e",
  primaryForeground: "#fff7f8",
  productName: "Eco-sociaal Dashboard",
  radiusLg: "32px",
  radiusMd: "24px",
  radiusFull: "9999px",
  shadow: "0 20px 40px rgba(54, 50, 45, 0.08)",
} as const;

/** PNG logo for transactional email — SVG is blocked by Gmail/Outlook. */
export function getEmailLogoUrl(): string {
  return `${getAppUrl()}/brand/cftf-logo-email.png`;
}
