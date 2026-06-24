import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const iconsFile = resolve(root, "lib/material-symbol-icons.ts");
const fontsDir = resolve(root, "public/fonts");
const cssOut = resolve(fontsDir, "material-symbols-outlined.css");
const woff2Out = resolve(fontsDir, "material-symbols-outlined.woff2");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function readIconNamesFromSource() {
  const source = await readFile(iconsFile, "utf8");
  const match = source.match(/export const MATERIAL_SYMBOL_ICONS = \[([\s\S]*?)\] as const;/);
  if (!match) {
    throw new Error("Could not parse MATERIAL_SYMBOL_ICONS from lib/material-symbol-icons.ts");
  }

  const icons = [...match[1].matchAll(/"([a-z0-9_]+)"/g)].map((entry) => entry[1]);
  if (icons.length === 0) {
    throw new Error("No icons found in MATERIAL_SYMBOL_ICONS");
  }

  return icons.sort((a, b) => a.localeCompare(b));
}

function buildGoogleFontsCssUrl(iconNames) {
  const iconParam = encodeURIComponent(iconNames.join(","));
  return `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names=${iconParam}&display=swap`;
}

function extractWoff2Url(css) {
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)\s*format\('woff2'\)/);
  if (!match?.[1]) {
    throw new Error("Could not find woff2 URL in Google Fonts CSS response");
  }
  return match[1];
}

async function main() {
  const iconNames = await readIconNamesFromSource();
  const cssUrl = buildGoogleFontsCssUrl(iconNames);
  console.log(`Fetching subset for ${iconNames.length} icons…`);

  const cssResponse = await fetch(cssUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!cssResponse.ok) {
    const body = await cssResponse.text();
    throw new Error(`Google Fonts CSS failed (${cssResponse.status}): ${body.slice(0, 300)}`);
  }

  const remoteCss = await cssResponse.text();
  const woff2Url = extractWoff2Url(remoteCss);

  const fontResponse = await fetch(woff2Url, { headers: { "User-Agent": USER_AGENT } });
  if (!fontResponse.ok) {
    throw new Error(`woff2 download failed (${fontResponse.status})`);
  }

  const woff2Buffer = Buffer.from(await fontResponse.arrayBuffer());
  await mkdir(fontsDir, { recursive: true });
  await writeFile(woff2Out, woff2Buffer);

  const localCss = `@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/material-symbols-outlined.woff2") format("woff2");
}
`;

  await writeFile(cssOut, localCss);
  console.log(
    `Wrote public/fonts/material-symbols-outlined.woff2 (${(woff2Buffer.length / 1024).toFixed(1)} KB)`,
  );
  console.log("Wrote public/fonts/material-symbols-outlined.css");
}

await main();
