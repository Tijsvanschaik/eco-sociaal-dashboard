"use client";

import { useCallback, useState } from "react";

import { ISLAND_GRID_SIZES } from "@/lib/impact-metaphors/island-grid";
import { ISLAND_SHAPE_LABELS, type IslandShape } from "@/lib/impact-metaphors/island-shape";
import {
  DEFAULT_ISLAND_TUNING,
  type IslandTuning,
  cloneIslandTuning,
} from "@/lib/impact-metaphors/island-tuning";

type IslandFinetunePanelProps = {
  onChange: (tuning: IslandTuning) => void;
  tuning: IslandTuning;
};

type SliderSpec = {
  key: keyof IslandTuning;
  label: string;
  max: number;
  min: number;
  step: number;
  format?: (value: number) => string;
};

const ISLAND_SHAPES: IslandShape[] = ["oval", "square", "circle", "diamond"];

const SLIDERS: SliderSpec[] = [
  {
    key: "islandScale",
    label: "Eiland-grootte (boost)",
    min: 0.35,
    max: 5,
    step: 0.05,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  { key: "tileGap", label: "Ruimte tussen tegels", min: 0, max: 32, step: 1 },
  { key: "tileSpriteScale", label: "Tegel-grootte", min: 0.55, max: 1.05, step: 0.01 },
  { key: "tileWidth", label: "Grid-breedte (iso)", min: 48, max: 96, step: 1 },
  { key: "tileHeight", label: "Grid-diepte (iso)", min: 20, max: 48, step: 1 },
  {
    key: "baselineAlign",
    label: "Onderkant uitlijnen (sprite)",
    min: 0,
    max: 1,
    step: 0.05,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  { key: "tileAnchorY", label: "Tegel Y-anker", min: 0, max: 0.45, step: 0.01 },
  { key: "tileSpriteOffsetX", label: "Tegel offset X", min: -40, max: 40, step: 1 },
  { key: "tileSpriteOffsetY", label: "Tegel offset Y", min: -40, max: 40, step: 1 },
  { key: "treeScale", label: "Boom schaal", min: 0, max: 1, step: 0.01 },
  { key: "treeOffsetX", label: "Boom offset X", min: -40, max: 40, step: 1 },
  { key: "treeOffsetY", label: "Boom offset Y", min: -30, max: 30, step: 1 },
  { key: "treeAnchorY", label: "Boom Y-anker", min: 0.7, max: 1, step: 0.01 },
  { key: "personScale", label: "Poppetje schaal", min: 0, max: 1, step: 0.01 },
  { key: "personOffsetX", label: "Poppetje offset X", min: -40, max: 40, step: 1 },
  { key: "personOffsetY", label: "Poppetje offset Y", min: -50, max: 30, step: 1 },
  { key: "personAnchorY", label: "Poppetje Y-anker", min: 0.7, max: 1, step: 0.01 },
];

export function IslandFinetunePanel({ onChange, tuning }: IslandFinetunePanelProps) {
  const [copied, setCopied] = useState(false);

  const update = useCallback(
    (key: keyof IslandTuning, value: number | boolean) => {
      onChange({ ...tuning, [key]: value });
    },
    [onChange, tuning],
  );

  const reset = () => onChange(cloneIslandTuning(DEFAULT_ISLAND_TUNING));

  const copyJson = async () => {
    const json = JSON.stringify(tuning, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <fieldset className="space-y-3 rounded-[1.25rem] border border-dashed border-tertiary/40 bg-surface-container-low/60 p-4">
      <legend className="px-1 text-sm font-bold text-foreground">Eiland finetune (live)</legend>
      <p className="text-xs text-muted-foreground">
        Sleep sliders — het eiland update direct. Kopieer JSON als je waarden in code wilt zetten.
      </p>

      <div className="space-y-2">
        <p className="text-xs font-medium">Eilandvorm</p>
        <div className="flex flex-wrap gap-2">
          {ISLAND_SHAPES.map((shape) => (
            <button
              key={shape}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tuning.islandShape === shape
                  ? "bg-tertiary text-tertiary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
              onClick={() => onChange({ ...tuning, islandShape: shape })}
              type="button"
            >
              {ISLAND_SHAPE_LABELS[shape]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Max grid-grootte (performance)</p>
        <div className="flex flex-wrap gap-2">
          {ISLAND_GRID_SIZES.map((size) => (
            <button
              key={size}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tuning.maxGridSize === size
                  ? "bg-tertiary text-tertiary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
              onClick={() => onChange({ ...tuning, maxGridSize: size })}
              type="button"
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {SLIDERS.map((spec) => {
          const raw = tuning[spec.key];
          const value = typeof raw === "number" ? raw : 0;
          const display = spec.format ? spec.format(value) : String(value);

          return (
            <label key={spec.key} className="block space-y-1.5">
              <span className="flex items-center justify-between text-xs font-medium">
                {spec.label}
                <span className="tabular-nums text-muted-foreground">{display}</span>
              </span>
              <input
                className="w-full accent-tertiary"
                max={spec.max}
                min={spec.min}
                onChange={(event) => update(spec.key, Number(event.target.value))}
                step={spec.step}
                type="range"
                value={value}
              />
            </label>
          );
        })}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          checked={tuning.showCellOrigin}
          className="size-4 accent-tertiary"
          onChange={(event) => update("showCellOrigin", event.target.checked)}
          type="checkbox"
        />
        Toon cel-middelpunt (debug)
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
          onClick={reset}
          type="button"
        >
          Reset defaults
        </button>
        <button
          className="rounded-full bg-tertiary px-4 py-2 text-sm font-bold text-tertiary-foreground"
          onClick={() => void copyJson()}
          type="button"
        >
          {copied ? "Gekopieerd!" : "Kopieer JSON"}
        </button>
      </div>
    </fieldset>
  );
}
