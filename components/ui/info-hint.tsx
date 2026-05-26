"use client";

import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import type { MetricsHelpContent } from "@/lib/copy/eco-social-metrics-help";
import { cn } from "@/lib/utils";
import { Popover } from "radix-ui";

type InfoHintProps = {
  align?: "center" | "end" | "start";
  children?: ReactNode;
  className?: string;
  content?: MetricsHelpContent;
  label: string;
  side?: "bottom" | "left" | "right" | "top";
  size?: "md" | "sm";
};

export function InfoHint({
  align = "start",
  children,
  className,
  content,
  label,
  side = "top",
  size = "sm",
}: InfoHintProps) {
  const body = children ?? (content ? <MetricsHelpBody content={content} /> : null);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-container-high hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            className,
          )}
        >
          <Icon name="info" className={size === "sm" ? "text-sm" : "text-base"} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          className="z-50 max-w-[18rem] rounded-xl border border-border/60 bg-card p-4 shadow-lg sm:max-w-xs sm:p-5"
          collisionPadding={16}
          side={side}
          sideOffset={8}
        >
          {body}
          <Popover.Arrow className="fill-card stroke-border/60" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function MetricsHelpBody({ content }: { content: MetricsHelpContent }) {
  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
      <p className="font-semibold text-foreground">{content.title}</p>
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {content.sections?.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="font-semibold text-foreground">{section.title}</p>
          <p>{section.body}</p>
        </div>
      ))}
      {content.footer ? <p className="font-medium text-foreground">{content.footer}</p> : null}
    </div>
  );
}
