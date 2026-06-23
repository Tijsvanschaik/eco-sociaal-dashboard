import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/icons/icon.svg");
const svg = await readFile(svgPath);

async function writePng(size, filename, extend = 0) {
  const outPath = resolve(root, "public/icons", filename);
  let pipeline = sharp(svg).resize(size, size);

  if (extend > 0) {
    pipeline = pipeline.extend({
      top: extend,
      bottom: extend,
      left: extend,
      right: extend,
      background: "#af1e7b",
    });
  }

  await pipeline.png().toFile(outPath);
  console.log(`Wrote ${filename}`);
}

await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");
await writePng(512, "icon-512-maskable.png", 64);
