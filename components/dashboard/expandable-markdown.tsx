"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { SafeMarkdown } from "@/components/ui/safe-markdown";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const lineClampClassName: Record<number, string> = {
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

export type ExpandableMarkdownProps = {
  className?: string;
  collapseLabel?: string;
  content: string;
  expandLabel?: string;
  maxLines?: number;
};

/**
 * Renders markdown with a line clamp; shows "Lees meer" when content overflows.
 */
export function ExpandableMarkdown({
  className,
  collapseLabel = "Toon minder",
  content,
  expandLabel = "Lees meer",
  maxLines = 3,
}: ExpandableMarkdownProps) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const clampClassName = lineClampClassName[maxLines] ?? "line-clamp-3";

  useLayoutEffect(() => {
    function measureOverflow() {
      const node = contentRef.current;
      if (!node) return;

      if (expanded) {
        setCanExpand(true);
        return;
      }
      setCanExpand(node.scrollHeight > node.clientHeight + 1);
    }

    measureOverflow();
    window.addEventListener("resize", measureOverflow);
    return () => window.removeEventListener("resize", measureOverflow);
  }, [content, expanded]);

  return (
    <div className="space-y-2">
      <div
        ref={contentRef}
        className={cn(!expanded && clampClassName, !expanded && "overflow-hidden")}
      >
        <SafeMarkdown className={className} content={content} />
      </div>
      {canExpand ? (
        <button
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          <Icon name={expanded ? "expand_less" : "expand_more"} className="text-base" />
          {expanded ? collapseLabel : expandLabel}
        </button>
      ) : null}
    </div>
  );
}
