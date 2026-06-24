import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/icons/icon.svg");
const svg = await readFile(svgPath);

async function writePng(outPath, size, extend = 0, extendColor = "#ffa6d2") {
  let pipeline = sharp(svg).resize(size, size);

  if (extend > 0) {
    pipeline = pipeline.extend({
      top: extend,
      bottom: extend,
      left: extend,
      right: extend,
      background: extendColor,
    });
  }

  await pipeline.png().toFile(outPath);
  console.log(`Wrote ${outPath.replace(`${root}\\`, "").replace(`${root}/`, "")}`);
}

await writePng(resolve(root, "public/icons/icon-192.png"), 192);
await writePng(resolve(root, "public/icons/icon-512.png"), 512);
await writePng(resolve(root, "public/icons/icon-512-maskable.png"), 512, 64);
await writePng(resolve(root, "app/icon.png"), 32);
await writePng(resolve(root, "app/apple-icon.png"), 180);
