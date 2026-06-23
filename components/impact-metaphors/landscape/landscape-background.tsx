import { cn } from "@/lib/utils";

type FlowerSpec = {
  cx: number;
  cy: number;
  petal: string;
  stemY: number;
};

const FLOWERS: FlowerSpec[] = [
  { cx: 48, cy: 204, petal: "#ff8fb8", stemY: 212 },
  { cx: 72, cy: 208, petal: "#ffd166", stemY: 216 },
  { cx: 118, cy: 198, petal: "#ff9ec8", stemY: 206 },
  { cx: 152, cy: 210, petal: "#c4f082", stemY: 218 },
  { cx: 248, cy: 202, petal: "#ffd166", stemY: 210 },
  { cx: 284, cy: 210, petal: "#ff8fb8", stemY: 218 },
  { cx: 328, cy: 198, petal: "#c4f082", stemY: 206 },
  { cx: 362, cy: 206, petal: "#ff9ec8", stemY: 214 },
];

function Flower({ cx, cy, petal, stemY }: FlowerSpec) {
  const petals = [0, 72, 144, 216, 288].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      cx: cx + Math.cos(rad) * 3.2,
      cy: cy + Math.sin(rad) * 3.2,
    };
  });

  return (
    <g>
      <line
        stroke="color-mix(in srgb, var(--tertiary) 55%, #36322d)"
        strokeLinecap="round"
        strokeWidth="1.25"
        x1={cx}
        x2={cx}
        y1={stemY}
        y2={cy + 4}
      />
      <circle cx={cx} cy={cy + 5} fill="#ffd166" r="2" />
      {petals.map((point) => (
        <circle key={`${point.cx}-${point.cy}`} cx={point.cx} cy={point.cy} fill={petal} r="2.6" />
      ))}
      <circle cx={cx} cy={cy} fill="#fff8c8" r="2.2" />
    </g>
  );
}

type LandscapeBackgroundProps = {
  className?: string;
};

export function LandscapeBackground({ className }: LandscapeBackgroundProps) {
  return (
    <svg
      aria-hidden
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      viewBox="0 0 400 240"
    >
      <defs>
        <linearGradient id="landscape-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5eb8e8" />
          <stop offset="45%" stopColor="#a8daf5" />
          <stop offset="78%" stopColor="#dceefb" />
          <stop offset="100%" stopColor="#fff8f3" />
        </linearGradient>
        <radialGradient id="landscape-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ffd166" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="landscape-hill-far" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="color-mix(in srgb, var(--tertiary-container) 45%, #a8c878)"
          />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--tertiary) 18%, #8fb860)" />
        </linearGradient>
        <linearGradient id="landscape-hill-left" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--tertiary-container) 95%, white)" />
          <stop
            offset="100%"
            stopColor="color-mix(in srgb, var(--tertiary) 42%, var(--tertiary-container))"
          />
        </linearGradient>
        <linearGradient id="landscape-hill-right" x1="1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--tertiary-container) 88%, white)" />
          <stop
            offset="100%"
            stopColor="color-mix(in srgb, var(--tertiary) 38%, var(--tertiary-container))"
          />
        </linearGradient>
        <linearGradient id="landscape-grass-edge" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--tertiary) 25%, transparent)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <filter id="landscape-cloud-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <radialGradient id="landscape-vignette" cx="50%" cy="45%" r="68%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="#36322d" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      <rect fill="url(#landscape-sky)" height="240" width="400" />

      <circle cx="330" cy="38" fill="url(#landscape-sun-glow)" r="42" />
      <circle cx="330" cy="38" fill="#ffe08a" r="14" />
      <circle cx="326" cy="34" fill="white" opacity="0.45" r="4" />

      <path
        d="M0 240 L0 178 Q120 148 220 162 L220 240 Z"
        fill="url(#landscape-hill-far)"
        opacity="0.55"
      />
      <path
        d="M180 240 L180 168 Q280 142 400 176 L400 240 Z"
        fill="url(#landscape-hill-far)"
        opacity="0.45"
      />

      <g filter="url(#landscape-cloud-blur)" opacity="0.95">
        <ellipse cx="68" cy="44" fill="white" rx="36" ry="13" />
        <ellipse cx="96" cy="50" fill="white" rx="24" ry="10" />
        <ellipse cx="42" cy="52" fill="white" rx="20" ry="9" />
      </g>
      <g filter="url(#landscape-cloud-blur)" opacity="0.9">
        <ellipse cx="268" cy="36" fill="white" rx="40" ry="14" />
        <ellipse cx="302" cy="44" fill="white" rx="26" ry="10" />
      </g>
      <g opacity="0.7">
        <ellipse cx="168" cy="30" fill="white" rx="22" ry="8" />
      </g>

      <path
        d="M0 240 L0 165 Q95 95 200 132 L200 240 Z"
        fill="url(#landscape-hill-left)"
        stroke="color-mix(in srgb, var(--tertiary) 35%, transparent)"
        strokeWidth="1.25"
      />
      <path
        d="M200 240 L200 132 Q305 88 400 158 L400 240 Z"
        fill="url(#landscape-hill-right)"
        stroke="color-mix(in srgb, var(--tertiary) 30%, transparent)"
        strokeWidth="1.25"
      />

      <path
        d="M0 165 Q95 95 200 132 Q305 88 400 158"
        fill="none"
        opacity="0.35"
        stroke="color-mix(in srgb, white 70%, var(--tertiary-container))"
        strokeLinecap="round"
        strokeWidth="2"
      />

      <rect fill="url(#landscape-grass-edge)" height="28" width="400" y="212" />

      {FLOWERS.map((flower) => (
        <Flower key={`${flower.cx}-${flower.cy}`} {...flower} />
      ))}

      <rect fill="url(#landscape-vignette)" height="240" opacity="0.35" width="400" />
    </svg>
  );
}
