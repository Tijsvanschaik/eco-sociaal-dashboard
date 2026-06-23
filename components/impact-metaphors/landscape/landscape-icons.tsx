import type { ReactNode } from "react";

function LandscapeIconFrame({
  children,
  instanceId,
}: {
  children: ReactNode;
  instanceId: string;
}) {
  const safeId = instanceId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg aria-hidden role="presentation" viewBox="0 0 56 56" width="100%" height="100%">
      <defs>
        <linearGradient id={`${safeId}-trunk`} x1="25" x2="31" y1="36" y2="50">
          <stop offset="0%" stopColor="#8b5e3c" />
          <stop offset="100%" stopColor="#6b4428" />
        </linearGradient>
        <radialGradient id={`${safeId}-canopy`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--tertiary-container) 90%, white)" />
          <stop offset="100%" stopColor="var(--tertiary)" />
        </radialGradient>
        <filter id={`${safeId}-shadow`} x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" floodColor="#36322d" floodOpacity="0.18" stdDeviation="1.5" />
        </filter>
      </defs>
      <g filter={`url(#${safeId}-shadow)`}>{children}</g>
    </svg>
  );
}

/** Layered round-canopy tree for the landscape sandbox. */
export function LandscapeTreeIcon({ instanceId }: { instanceId: string }) {
  const safeId = instanceId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <LandscapeIconFrame instanceId={instanceId}>
      <ellipse cx="28" cy="50" fill="#36322d" opacity="0.12" rx="9" ry="2.2" />
      <rect
        fill={`url(#${safeId}-trunk)`}
        height="14"
        rx="1.5"
        stroke="#5c3d22"
        strokeWidth="1"
        width="6"
        x="25"
        y="36"
      />
      <ellipse cx="28" cy="30" fill={`url(#${safeId}-canopy)`} rx="16" ry="14" />
      <ellipse
        cx="22"
        cy="26"
        fill="color-mix(in srgb, var(--tertiary) 75%, #1a2600)"
        opacity="0.85"
        rx="10"
        ry="9"
      />
      <ellipse
        cx="34"
        cy="27"
        fill="color-mix(in srgb, var(--tertiary-container) 70%, var(--tertiary))"
        opacity="0.9"
        rx="9"
        ry="8"
      />
      <ellipse
        cx="26"
        cy="20"
        fill="color-mix(in srgb, var(--tertiary-container) 55%, white)"
        rx="7"
        ry="6"
      />
    </LandscapeIconFrame>
  );
}

function personAccentFromSeed(instanceId: string): string {
  let hash = 0;
  for (let index = 0; index < instanceId.length; index++) {
    hash = (hash << 5) - hash + instanceId.charCodeAt(index);
    hash |= 0;
  }
  const variants = [
    "var(--primary)",
    "color-mix(in srgb, var(--primary) 88%, #780052)",
    "color-mix(in srgb, var(--primary) 92%, #af1e7b)",
  ];
  return variants[Math.abs(hash) % variants.length] as string;
}

/** Rounded person silhouette for the landscape sandbox. */
export function LandscapePersonIcon({ instanceId }: { instanceId: string }) {
  const fill = personAccentFromSeed(instanceId);
  const stroke = "color-mix(in srgb, var(--primary) 65%, #36322d)";

  return (
    <LandscapeIconFrame instanceId={instanceId}>
      <ellipse cx="28" cy="50" fill="#36322d" opacity="0.1" rx="8" ry="2" />
      <circle cx="28" cy="16" fill={fill} r="8" stroke={stroke} strokeWidth="1.25" />
      <circle cx="30.5" cy="14" fill="white" opacity="0.35" r="2.5" />
      <path
        d="M28 25c-9.5 0-15.5 6-15.5 13.5V44c0 1.4 1.1 2.5 2.5 2.5h26c1.4 0 2.5-1.1 2.5-2.5V38.5C43.5 31 37.5 25 28 25z"
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
      <path
        d="M14 36c2.5-2 5-3 7.5-3M42 36c-2.5-2-5-3-7.5-3"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </LandscapeIconFrame>
  );
}
