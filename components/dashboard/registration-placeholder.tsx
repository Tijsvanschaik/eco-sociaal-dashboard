import { cn } from "@/lib/utils";

/**
 * Abstracte SVG-placeholder voor registratie-foto's. Kleurt mee op de
 * categoriekleur en gebruikt zachte organische vormen zodat de kaarten visueel
 * rustig blijven — totdat er echte foto-uploads zijn.
 *
 * De `id` wordt gebruikt als suffix voor SVG-defs (gradient-ids moeten uniek
 * zijn wanneer meerdere placeholders op dezelfde pagina staan).
 */
export function RegistrationPlaceholder({
  className,
  color,
  id,
}: {
  className?: string;
  color: string | null;
  id: string;
}) {
  const fill = color ?? "#af1e7b";
  const gradId = `reg-ph-${id}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 260"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.72" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${gradId})`} />
      {/* Zachte witte blobs voor diepte */}
      <circle cx="330" cy="50" r="78" fill="white" fillOpacity="0.16" />
      <circle cx="60" cy="220" r="100" fill="white" fillOpacity="0.1" />
      <circle cx="200" cy="130" r="40" fill="white" fillOpacity="0.08" />
      {/* Organische lijn */}
      <path
        d="M-20,180 C90,120 200,230 420,140"
        stroke="white"
        strokeOpacity="0.28"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0,100 C80,60 200,140 300,80 L400,90 L400,0 L0,0 Z"
        fill="white"
        fillOpacity="0.08"
      />
    </svg>
  );
}
