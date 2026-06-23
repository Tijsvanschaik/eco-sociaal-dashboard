export const LANDSCAPE_VIEWBOX = { width: 400, height: 240 } as const;

export type HillId = "left" | "right";

export type HillSlot = {
  hill: HillId;
  scale: number;
  x: number;
  y: number;
};

const SLOTS_PER_HILL = 18;

/** Parabolic hill surface — kept in sync with landscape-background SVG paths. */
export function hillSurfaceY(hill: HillId, x: number): number {
  if (hill === "left") {
    const peakX = 95;
    const normalized = (x - peakX) / 78;
    return 208 - 98 * Math.max(0, 1 - normalized * normalized);
  }

  const peakX = 305;
  const normalized = (x - peakX) / 78;
  return 208 - 92 * Math.max(0, 1 - normalized * normalized);
}

function generateHillSlots(hill: HillId): HillSlot[] {
  const xMin = hill === "left" ? 28 : 228;
  const xMax = hill === "left" ? 182 : 372;
  const slots: HillSlot[] = [];

  for (let index = 0; index < SLOTS_PER_HILL; index++) {
    const t = (index + 0.5) / SLOTS_PER_HILL;
    const x = xMin + t * (xMax - xMin);
    const y = hillSurfaceY(hill, x);
    const depth = (y - 108) / 100;
    slots.push({
      hill,
      x,
      y,
      scale: 0.72 + 0.28 * (1 - Math.min(1, Math.max(0, depth))),
    });
  }

  return slots;
}

let cachedSlots: HillSlot[] | null = null;

export function getAllHillSlots(): HillSlot[] {
  if (!cachedSlots) {
    cachedSlots = [...generateHillSlots("left"), ...generateHillSlots("right")];
  }
  return cachedSlots;
}

/** Evenly sample slots across both hills for a given icon count. */
export function pickHillSlotsForCount(count: number): HillSlot[] {
  if (count <= 0) return [];

  const all = getAllHillSlots();
  if (count >= all.length) return all;

  const step = all.length / count;
  return Array.from({ length: count }, (_, index) => {
    const slotIndex = Math.min(all.length - 1, Math.floor(index * step));
    return all[slotIndex] as HillSlot;
  });
}

export function slotToPercent(slot: HillSlot): { left: string; top: string } {
  return {
    left: `${(slot.x / LANDSCAPE_VIEWBOX.width) * 100}%`,
    top: `${(slot.y / LANDSCAPE_VIEWBOX.height) * 100}%`,
  };
}
