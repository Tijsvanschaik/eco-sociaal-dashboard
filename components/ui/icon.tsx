import type * as React from "react";

import { cn } from "@/lib/utils";

type IconProps = Omit<React.ComponentProps<"span">, "children"> & {
  name: string;
  filled?: boolean;
};

/**
 * Material Symbols Outlined icon. Het font wordt via <link> geladen in
 * app/layout.tsx. Geef `filled` mee om de gevulde variant te tonen.
 */
export function Icon({ name, filled, className, "aria-label": ariaLabel, ...rest }: IconProps) {
  return (
    <span
      data-slot="icon"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      className={cn("material-symbols-outlined", filled && "is-filled", className)}
      {...rest}
    >
      {name}
    </span>
  );
}
