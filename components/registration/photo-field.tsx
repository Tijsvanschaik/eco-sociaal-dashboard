"use client";

import { useRef } from "react";

import { SectionLabel } from "@/components/registration/registration-section";
import type { PhotoState } from "@/components/registration/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PHOTO_UPLOAD_ACCEPT } from "@/lib/registrations/schema";

type PhotoFieldProps = {
  onChange: (file: File | null) => void;
  onRemove: () => void;
  state: PhotoState;
};

export function PhotoField({ onChange, onRemove, state }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasPreview = state.status === "uploading" || state.status === "ready";

  return (
    <div className="space-y-2">
      <SectionLabel>
        Foto <span className="font-normal text-muted-foreground">(optioneel)</span>
      </SectionLabel>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Laat de community zien wat je hebt bereikt.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      {hasPreview ? (
        <div className="relative overflow-hidden rounded-[1.25rem] bg-card shadow-[0_12px_30px_rgba(54,50,45,0.06)]">
          <img
            alt="Voorbeeld van je foto"
            src={state.previewUrl}
            className="h-56 w-full object-cover"
          />
          {state.status === "uploading" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Icon name="progress_activity" className="animate-spin text-base" />
                Uploaden…
              </div>
            </div>
          ) : (
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
                onClick={() => inputRef.current?.click()}
              >
                <Icon name="cached" className="text-base" />
                Andere foto
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full shadow-sm"
                onClick={onRemove}
              >
                <Icon name="close" className="text-base" />
                <span className="sr-only">Foto verwijderen</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed border-border/70 bg-card px-4 py-8 text-center shadow-sm transition-colors hover:border-primary/50 hover:bg-primary-container/20"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-primary shadow-sm">
            <Icon name="photo_camera" filled className="text-2xl" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Klik om een foto te uploaden
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG of WEBP · max 5 MB</span>
        </button>
      )}
      {state.status === "error" ? (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="error" className="text-base" filled />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
