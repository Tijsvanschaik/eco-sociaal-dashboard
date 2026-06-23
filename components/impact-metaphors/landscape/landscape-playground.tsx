"use client";

import { type ReactNode, useMemo, useState } from "react";

import { ImpactHeroSandboxFrame } from "@/components/dashboard/impact-hero-sandbox-frame";
import type { ImpactHeroSandboxViewport } from "@/components/dashboard/impact-hero-sandbox-frame";
import { ImpactHeroSection } from "@/components/dashboard/impact-hero-section";
import { ImpactIslandStage } from "@/components/impact-metaphors/island/impact-island-stage";
import { IslandFinetunePanel } from "@/components/impact-metaphors/island/island-finetune-panel";
import { LandscapeMetaphorStage } from "@/components/impact-metaphors/landscape/landscape-metaphor-stage";
import type { LandscapeViewport } from "@/components/impact-metaphors/landscape/landscape-spawn-layer";
import { buildMetaphorUnits } from "@/lib/impact-metaphors";
import { gridDimensionForCount } from "@/lib/impact-metaphors/island-grid";
import { islandCellCapacity } from "@/lib/impact-metaphors/island-shape";
import {
  DEFAULT_ISLAND_TUNING,
  type IslandTuning,
  cloneIslandTuning,
} from "@/lib/impact-metaphors/island-tuning";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Start (weinig data)", co2: 44, social: 12 },
  { label: "Groeiend", co2: 132, social: 48 },
  { label: "Veel impact", co2: 440, social: 120 },
  { label: "Alleen eco", co2: 88, social: 0 },
  { label: "Alleen sociaal", co2: 0, social: 24 },
] as const;

type PrototypeMode = "heuvels" | "island";
type IslandMetric = "eco" | "social";
type IslandPreviewMode = "finetune" | "productie";
type SandboxViewport = ImpactHeroSandboxViewport;

export function ImpactVisualPlayground() {
  const [co2Kg, setCo2Kg] = useState(44);
  const [socialScore, setSocialScore] = useState(12);
  const [viewport, setViewport] = useState<SandboxViewport>("mobile");
  const [mode, setMode] = useState<PrototypeMode>("island");
  const [islandMetric, setIslandMetric] = useState<IslandMetric>("eco");
  const [islandPreviewMode, setIslandPreviewMode] = useState<IslandPreviewMode>("productie");
  const [paused, setPaused] = useState(false);
  const [stageKey, setStageKey] = useState(0);
  const [islandTuning, setIslandTuning] = useState<IslandTuning>(() =>
    cloneIslandTuning(DEFAULT_ISLAND_TUNING),
  );

  const units = useMemo(
    () =>
      buildMetaphorUnits({ totalCo2Kg: co2Kg, totalSocialScore: socialScore }).map((unit) =>
        unit.id === "people"
          ? {
              ...unit,
              title: "mensen bereikt",
              description:
                "Zoveel keer maakte jullie inzet verschil voor inwoners, buren of vrijwilligers.",
            }
          : unit,
      ),
    [co2Kg, socialScore],
  );

  const treeUnit = units.find((unit) => unit.id === "trees");
  const peopleUnit = units.find((unit) => unit.id === "people");
  const activeIslandUnit = islandMetric === "eco" ? treeUnit : peopleUnit;
  const islandSeed = `${stageKey}-${co2Kg}-${socialScore}-${islandMetric}`;
  const carouselSeedPrefix = `${stageKey}-${co2Kg}-${socialScore}`;
  const landscapeViewport: LandscapeViewport = viewport === "tv" ? "tv" : "mobile";

  const restartAnimation = () => setStageKey((value) => value + 1);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border/60 bg-background px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Sandbox · dev only
            </p>
            <h1 className="truncate text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
              Impact-visualisatie prototypes
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModeToggle active={mode === "heuvels"} onClick={() => setMode("heuvels")}>
              Heuvels
            </ModeToggle>
            <ModeToggle active={mode === "island"} onClick={() => setMode("island")}>
              Eiland
            </ModeToggle>

            {mode === "island" && islandPreviewMode === "finetune" ? (
              <>
                <span className="hidden h-6 w-px bg-border sm:block" />
                <ModeToggle
                  active={islandMetric === "eco"}
                  onClick={() => {
                    setIslandMetric("eco");
                    restartAnimation();
                  }}
                >
                  Eco
                </ModeToggle>
                <ModeToggle
                  active={islandMetric === "social"}
                  onClick={() => {
                    setIslandMetric("social");
                    restartAnimation();
                  }}
                >
                  Sociaal
                </ModeToggle>
              </>
            ) : null}

            <span className="hidden h-6 w-px bg-border sm:block" />
            <ViewportToggle active={viewport === "mobile"} onClick={() => setViewport("mobile")}>
              Mobiel
            </ViewportToggle>
            {mode === "island" ? (
              <ViewportToggle
                active={viewport === "desktop"}
                onClick={() => setViewport("desktop")}
              >
                Desktop
              </ViewportToggle>
            ) : null}
            <ViewportToggle active={viewport === "tv"} onClick={() => setViewport("tv")}>
              TV
            </ViewportToggle>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className={cn(
            "relative flex min-w-0 flex-1 justify-center p-4 sm:p-6",
            mode === "island" && islandPreviewMode === "productie"
              ? "items-start overflow-y-auto lg:items-center"
              : "min-h-[40dvh] items-center lg:min-h-0",
          )}
        >
          {mode === "heuvels" ? (
            <div
              className={cn("h-full w-full", landscapeViewport === "tv" ? "max-w-5xl" : "max-w-lg")}
            >
              <LandscapeMetaphorStage
                key={stageKey}
                className="h-full max-h-full"
                paused={paused}
                units={units}
                viewport={landscapeViewport}
              />
            </div>
          ) : islandPreviewMode === "productie" ? (
            <ImpactHeroSandboxFrame viewport={viewport}>
              <ImpactHeroSection
                carouselPaused={paused}
                carouselSeedPrefix={carouselSeedPrefix}
                fitToContainer={viewport === "tv"}
                islandTuning={islandTuning}
                totalCo2Kg={co2Kg}
                totalSocialScore={socialScore}
              />
            </ImpactHeroSandboxFrame>
          ) : (
            <div className={cn("h-full w-full", viewport === "tv" ? "max-w-5xl" : "max-w-lg")}>
              <ImpactIslandStage
                key={islandSeed}
                animateSpawn={!paused && (activeIslandUnit?.iconCount ?? 0) > 0}
                className="h-full max-h-full"
                entityType={islandMetric === "eco" ? "tree" : "person"}
                fillContainer
                formattedValue={activeIslandUnit?.formattedValue ?? "0"}
                iconCount={activeIslandUnit?.iconCount ?? 0}
                phase="idle"
                seed={islandSeed}
                title={
                  activeIslandUnit?.title ??
                  (islandMetric === "eco" ? "bomen geplant" : "mensen bereikt")
                }
                tuning={islandTuning}
                unitsPerIcon={activeIslandUnit?.unitsPerIcon ?? 1}
                viewport={viewport === "tv" ? "tv" : "mobile"}
              />
            </div>
          )}
        </section>

        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-border/60 bg-card/40 p-4 sm:p-5 lg:w-[min(420px,38vw)] lg:border-l lg:border-t-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-foreground">Data</legend>

              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-medium">
                  Eco score (kg CO₂)
                  <span className="tabular-nums text-muted-foreground">{co2Kg}</span>
                </span>
                <input
                  className="w-full accent-tertiary"
                  max={2000}
                  min={0}
                  onChange={(event) => setCo2Kg(Number(event.target.value))}
                  step={1}
                  type="range"
                  value={co2Kg}
                />
              </label>

              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-medium">
                  Sociale score (punten)
                  <span className="tabular-nums text-muted-foreground">{socialScore}</span>
                </span>
                <input
                  className="w-full accent-primary"
                  max={200}
                  min={0}
                  onChange={(event) => setSocialScore(Number(event.target.value))}
                  step={1}
                  type="range"
                  value={socialScore}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent"
                    onClick={() => {
                      setCo2Kg(preset.co2);
                      setSocialScore(preset.social);
                      restartAnimation();
                    }}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-foreground">Weergave</legend>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  onClick={() => setPaused((value) => !value)}
                  type="button"
                >
                  {paused ? "Hervat" : "Pauzeer"}
                </button>
                <button
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
                  onClick={restartAnimation}
                  type="button"
                >
                  Opnieuw
                </button>
              </div>

              {mode === "island" ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Sandbox-weergave</p>
                  <div className="flex flex-wrap gap-2">
                    <PreviewModeToggle
                      active={islandPreviewMode === "productie"}
                      onClick={() => setIslandPreviewMode("productie")}
                    >
                      Productie hero
                    </PreviewModeToggle>
                    <PreviewModeToggle
                      active={islandPreviewMode === "finetune"}
                      onClick={() => setIslandPreviewMode("finetune")}
                    >
                      Finetune eiland
                    </PreviewModeToggle>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Productie hero is 1:1 het dashboard-blok (badge, carrousel, score-tegels).
                    Finetune is alleen het eiland voor sprite-sliders. Logica/layout wijzig je in
                    productie hero; defaults test je in finetune.
                  </p>
                </div>
              ) : null}

              <dl className="grid grid-cols-2 gap-2 text-sm">
                <Stat label="Bomen (eq.)" value={treeUnit?.numericValue ?? 0} />
                <Stat label="Mensen (eq.)" value={peopleUnit?.numericValue ?? 0} />
                <Stat label="Iconen eco" value={treeUnit?.iconCount ?? 0} />
                <Stat label="Iconen sociaal" value={peopleUnit?.iconCount ?? 0} />
                {mode === "island" && islandPreviewMode === "finetune" && activeIslandUnit ? (
                  <>
                    <Stat
                      label="Grid"
                      value={gridDimensionForCount(
                        activeIslandUnit.iconCount,
                        islandTuning.islandShape,
                        islandTuning.maxGridSize,
                      )}
                    />
                    <Stat
                      label="Tegels"
                      value={islandCellCapacity(
                        gridDimensionForCount(
                          activeIslandUnit.iconCount,
                          islandTuning.islandShape,
                          islandTuning.maxGridSize,
                        ),
                        islandTuning.islandShape,
                      )}
                    />
                  </>
                ) : null}
              </dl>
            </fieldset>
          </div>

          {mode === "island" ? (
            <IslandFinetunePanel onChange={setIslandTuning} tuning={islandTuning} />
          ) : null}

          {units.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Geen units — zet minstens één slider boven 0.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function ModeToggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4 sm:py-2",
        active
          ? "bg-tertiary text-tertiary-foreground"
          : "bg-secondary text-foreground hover:bg-accent",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ViewportToggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4 sm:py-2",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-foreground hover:bg-accent",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PreviewModeToggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-semibold transition",
        active
          ? "bg-tertiary text-tertiary-foreground"
          : "bg-secondary text-foreground hover:bg-accent",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-bold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
