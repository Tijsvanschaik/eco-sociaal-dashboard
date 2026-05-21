"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ModalSize = "md" | "lg" | "xl";

type ModalProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  size?: ModalSize;
  title: string;
};

const sizeClassName: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  children,
  className,
  description,
  footer,
  onClose,
  open,
  size = "lg",
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
      />
      <div
        ref={panelRef}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[min(90dvh,760px)] w-full flex-col overflow-hidden rounded-[2rem] border border-border/40 bg-card shadow-[0_24px_48px_rgba(54,50,45,0.14)] outline-none",
          sizeClassName[size],
          className,
        )}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/40 px-6 py-5 sm:px-8">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground transition hover:border-border hover:text-foreground"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-border/40 px-6 py-4 sm:px-8">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}

export function ModalActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>{children}</div>
  );
}
