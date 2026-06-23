import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

const markdownClassName =
  "space-y-2 text-sm leading-relaxed text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc";

export function SafeMarkdown({
  className,
  content,
}: {
  className?: string;
  content: string;
}) {
  if (!content.trim()) return null;

  return (
    <div className={cn(markdownClassName, className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
