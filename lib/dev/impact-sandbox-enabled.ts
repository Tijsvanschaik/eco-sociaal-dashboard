/**
 * Impact-visualisatie sandbox (/dev/impact-landscape).
 * Standaard alleen buiten productie; zet ENABLE_IMPACT_SANDBOX=true op Vercel om tijdelijk live te tonen.
 */
export function isImpactSandboxEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_IMPACT_SANDBOX === "true";
}
