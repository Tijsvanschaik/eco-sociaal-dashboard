"use client";

import { type ReactNode, useMemo, useState } from "react";

import { ImpactIslandStage } from "@/components/impact-metaphors/island/impact-island-stage";
import { LandscapeMetaphorStage } from "@/components/impact-metaphors/landscape/landscape-metaphor-stage";
import type { LandscapeViewport } from "@/components/impact-metaphors/landscape/landscape-spawn-layer";
import { buildMetaphorUnits } from "@/lib/impact-metaphors";
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

export function ImpactVisualPlayground() {
  const [co2Kg, setCo2Kg] = useState(44);
  const [socialScore, setSocialScore] = useState(12);
  const [viewport, setViewport] = useState<LandscapeViewport>("mobile");
  const [mode, setMode] = useState<PrototypeMode>("island");
  const [islandMetric, setIslandMetric] = useState<IslandMetric>("eco");
  const [paused, setPaused] = useState(false);
  const [stageKey, setStageKey] = useState(0);

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

  const restartAnimation = () => setStageKey((value) => value + 1);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Sandbox · dev only
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Impact-visualisatie prototypes
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Vergelijk heuvel-scene vs. isometrisch eiland (Forest-achtig grid). Het eiland schaalt
          mee: 4×4 → 8×8 → 16×16 … met vaste tegel-posities en squash-&amp;-stretch landing.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <ModeToggle active={mode === "heuvels"} onClick={() => setMode("heuvels")}>
          Heuvels
        </ModeToggle>
        <ModeToggle active={mode === "island"} onClick={() => setMode("island")}>
          Isometrisch eiland
        </ModeToggle>
      </div>

      {mode === "island" ? (
        <div className="flex flex-wrap gap-2">
          <ModeToggle
            active={islandMetric === "eco"}
            onClick={() => {
              setIslandMetric("eco");
              restartAnimation();
            }}
          >
            Eco · bomen
          </ModeToggle>
          <ModeToggle
            active={islandMetric === "social"}
            onClick={() => {
              setIslandMetric("social");
              restartAnimation();
            }}
          >
            Sociaal · poppetjes
          </ModeToggle>
        </div>
      ) : null}

      <div
        className={cn(
          "mx-auto w-full transition-[max-width]",
          viewport === "tv" ? "max-w-5xl" : "max-w-md",
          mode === "island" && viewport === "tv" && "max-w-5xl",
        )}
      >
        {mode === "heuvels" ? (
          <LandscapeMetaphorStage
            key={stageKey}
            paused={paused}
            units={units}
            viewport={viewport}
          />
        ) : activeIslandUnit ? (
          <ImpactIslandStage
            key={`${islandSeed}-${activeIslandUnit.id}`}
            animateSpawn={!paused}
            entityType={islandMetric === "eco" ? "tree" : "person"}
            formattedValue={activeIslandUnit.formattedValue}
            iconCount={activeIslandUnit.iconCount}
            seed={islandSeed}
            title={activeIslandUnit.title}
            unitsPerIcon={activeIslandUnit.unitsPerIcon}
            viewport={viewport}
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-[2rem] bg-[#163816] text-sm text-white/70">
            Geen data voor deze metric — pas de sliders aan.
          </div>
        )}
      </div>

      <div className="grid gap-6 rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] lg:grid-cols-2">
        <fieldset className="space-y-5">
          <legend className="text-sm font-bold text-foreground">Data</legend>

          <label className="block space-y-2">
            <span className="flex items-center justify-between text-sm font-medium">
              Eco score (kg CO₂)
              <span className="tabular-nums text-muted-foreground">{co2Kg}</span>
            </span>
            <input
              className="w-full accent-tertiary"
              max={500}
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

        <fieldset className="space-y-5">
          <legend className="text-sm font-bold text-foreground">Weergave</legend>

          <div className="flex flex-wrap gap-2">
            <ViewportToggle active={viewport === "mobile"} onClick={() => setViewport("mobile")}>
              Mobiel
            </ViewportToggle>
            <ViewportToggle active={viewport === "tv"} onClick={() => setViewport("tv")}>
              TV / kiosk
            </ViewportToggle>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              onClick={() => setPaused((value) => !value)}
              type="button"
            >
              {paused ? "Hervat animatie" : "Pauzeer"}
            </button>
            <button
              className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
              onClick={restartAnimation}
              type="button"
            >
              Opnieuw afspelen
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Bomen (eq.)" value={treeUnit?.numericValue ?? 0} />
            <Stat label="Mensen (eq.)" value={peopleUnit?.numericValue ?? 0} />
            <Stat label="Iconen eco" value={treeUnit?.iconCount ?? 0} />
            <Stat label="Iconen sociaal" value={peopleUnit?.iconCount ?? 0} />
            {mode === "island" && activeIslandUnit ? (
              <Stat
                label="Grid"
                value={
                  activeIslandUnit.iconCount <= 16
                    ? 4
                    : activeIslandUnit.iconCount <= 64
                      ? 8
                      : activeIslandUnit.iconCount <= 256
                        ? 16
                        : 32
                }
              />
            ) : null}
          </dl>
        </fieldset>
      </div>

      {units.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Geen units — zet minstens één slider boven 0.
        </p>
      ) : null}
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
        "rounded-full px-4 py-2 text-sm font-semibold transition",
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
        "rounded-full px-4 py-2 text-sm font-semibold transition",
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-bold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
