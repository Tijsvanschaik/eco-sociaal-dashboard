import type { ReactNode } from "react";

export type MetaphorIconTone = "primary" | "tertiary" | "water";

type Palette = {
  fill: string;
  stroke: string;
};

const toneStyles: Record<MetaphorIconTone, Palette> = {
  primary: {
    fill: "var(--primary)",
    stroke: "color-mix(in srgb, var(--primary) 72%, #36322d)",
  },
  tertiary: {
    fill: "var(--tertiary)",
    stroke: "color-mix(in srgb, var(--tertiary) 72%, #36322d)",
  },
  water: {
    fill: "#4a9fd9",
    stroke: "#2d6a96",
  },
};

function MetaphorIconFrame({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden role="presentation" viewBox="0 0 48 48" width={46} height={46}>
      {children}
    </svg>
  );
}

export function TreeMetaphorIcon({ instanceId: _instanceId }: { instanceId: string }) {
  const palette = toneStyles.tertiary;

  return (
    <MetaphorIconFrame>
      <rect
        fill="#7a5230"
        height="7"
        rx="1"
        stroke="#5c3d22"
        strokeWidth="1.25"
        width="5"
        x="21.5"
        y="36"
      />
      <path
        d="M24 8 10 34h28L24 8z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M24 14 16 30h16L24 14z"
        fill="color-mix(in srgb, var(--tertiary) 82%, white)"
        stroke="none"
      />
    </MetaphorIconFrame>
  );
}

export function PersonMetaphorIcon({ instanceId: _instanceId }: { instanceId: string }) {
  const palette = toneStyles.primary;

  return (
    <MetaphorIconFrame>
      <circle cx="24" cy="14" fill={palette.fill} r="7" stroke={palette.stroke} strokeWidth="1.5" />
      <path
        d="M24 22c-8 0-13 5.5-13 12.5v3.5c0 1.2 1 2 2.2 2h21.6c1.2 0 2.2-.8 2.2-2v-3.5C37 27.5 32 22 24 22z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16 38c2.5 2 5.5 3 8 3s5.5-1 8-3"
        fill="none"
        opacity="0.35"
        stroke={palette.stroke}
        strokeLinecap="round"
        strokeWidth="1.25"
      />
    </MetaphorIconFrame>
  );
}

export function HeartMetaphorIcon({ instanceId: _instanceId }: { instanceId: string }) {
  const palette = toneStyles.primary;

  return (
    <MetaphorIconFrame>
      <path
        d="M24 40S8 30 8 18.5C8 12.5 12.5 8 18 8c3 0 5.6 1.4 7.3 3.6C26.9 9.4 29.5 8 32.5 8 38 8 42.5 12.5 42.5 18.5 42.5 30 24 40 24 40z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </MetaphorIconFrame>
  );
}

export function WaterMetaphorIcon({
  clipIdSuffix,
  fillPct = 0.72,
  instanceId: _instanceId,
}: {
  clipIdSuffix: string;
  fillPct?: number;
  instanceId: string;
}) {
  const palette = toneStyles.water;
  const clipId = `metaphor-water-${clipIdSuffix}`;
  const liquidTop = 38 - 24 * fillPct;

  return (
    <MetaphorIconFrame>
      <defs>
        <clipPath id={clipId}>
          <rect height={38 - liquidTop} rx="0.5" width="16" x="16" y={liquidTop} />
        </clipPath>
      </defs>
      <path
        d="M17 10h14l2.5 26a3 3 0 0 1-2.9 2.7H17.4A3 3 0 0 1 14.5 36L17 10z"
        fill="color-mix(in srgb, #4a9fd9 12%, white)"
        stroke={palette.stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        clipPath={`url(#${clipId})`}
        d="M17 10h14l2.5 26a3 3 0 0 1-2.9 2.7H17.4A3 3 0 0 1 14.5 36L17 10z"
        fill={palette.fill}
        stroke="none"
      />
      <path
        d="M20 15.5h8"
        fill="none"
        opacity="0.55"
        stroke={palette.stroke}
        strokeLinecap="round"
        strokeWidth="1.25"
      />
    </MetaphorIconFrame>
  );
}

export function MealMetaphorIcon({ instanceId: _instanceId }: { instanceId: string }) {
  const palette = toneStyles.primary;

  return (
    <MetaphorIconFrame>
      <path
        d="M8 26c0-8 7-13 16-13s16 5 16 13"
        fill="none"
        stroke={palette.stroke}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M8 26c0 7.5 7 12 16 12s16-4.5 16-12H8z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16 24c2-1.5 4.5-1.5 6.5 0s4.5 1.5 6.5 0"
        fill="none"
        opacity="0.45"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M21 11c0-1.5 1-2.5 2-3M24 9.5c0-1.8 1.2-2.8 2.2-3.5"
        fill="none"
        opacity="0.5"
        stroke={palette.stroke}
        strokeLinecap="round"
        strokeWidth="1.25"
      />
    </MetaphorIconFrame>
  );
}
