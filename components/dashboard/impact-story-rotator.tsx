"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import type { ImpactStory } from "@/lib/impact-stories";
import { cn } from "@/lib/utils";

const ROTATION_MS = 8000;

const storyVisualClassName =
  "relative inline-flex aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl shadow-sm sm:aspect-square sm:h-full sm:min-h-16 sm:w-auto sm:max-h-[9.5rem] sm:self-stretch";

function StoryVisual({ story }: { story: ImpactStory }) {
  if (story.imageUrl) {
    return (
      <span className={storyVisualClassName}>
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          loading="lazy"
          src={story.imageUrl}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        storyVisualClassName,
        "items-center justify-center",
        story.iconTone === "tertiary"
          ? "bg-tertiary-container text-tertiary"
          : "bg-primary-container text-primary",
      )}
    >
      <Icon aria-hidden name={story.icon} filled className="text-6xl sm:text-7xl" />
    </span>
  );
}

export function ImpactStoryRotator({ stories }: { stories: ImpactStory[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const storiesKey = stories.map((story) => story.id).join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset carousel when stories change
  useEffect(() => {
    setActiveIndex(0);
  }, [storiesKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: restart rotation when stories change
  useEffect(() => {
    if (stories.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % stories.length);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [stories.length, storiesKey]);

  if (stories.length === 0) return null;

  const activeStory = stories[activeIndex];
  if (!activeStory) return null;

  return (
    <div aria-live="polite" className="pt-6 sm:pt-8">
      <div className="grid sm:min-h-[9.5rem]">
        {stories.map((story, index) => (
          <article
            key={story.id}
            aria-hidden={index !== activeIndex}
            className={cn(
              "col-start-1 row-start-1 flex flex-col justify-start transition-opacity duration-700 ease-in-out sm:justify-center",
              index === activeIndex ? "z-10 opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
              <StoryVisual story={story} />
              <div className="min-w-0 space-y-2">
                <h2
                  className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0"
                  {...(index === activeIndex ? { id: "impact-overview-heading" } : {})}
                >
                  <span className="text-[2.75rem] font-extrabold leading-none tracking-tight text-primary sm:text-[4.31rem]">
                    {story.formattedValue}
                  </span>
                  <span className="text-lg font-bold leading-snug text-foreground sm:text-[1.44rem]">
                    {story.title}
                  </span>
                </h2>
                <p className="max-w-lg text-base leading-relaxed text-foreground/75 sm:text-[1.15rem]">
                  {story.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {stories.length > 1 ? (
        <div
          aria-label="Impactverhalen"
          className="mt-5 flex items-center justify-center gap-2 sm:mt-6"
          role="tablist"
        >
          {stories.map((story, index) => (
            <button
              key={story.id}
              aria-label={`${story.title} (${story.formattedValue})`}
              aria-selected={index === activeIndex}
              className={cn(
                "rounded-full transition-all duration-300",
                index === activeIndex
                  ? "h-1.5 w-8 bg-primary"
                  : "h-1 w-5 bg-primary/25 hover:bg-primary/40",
              )}
              onClick={() => setActiveIndex(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
