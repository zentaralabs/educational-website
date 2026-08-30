// Raster brand assets for directory / Product Hunt submissions, rendered from
// src/app/icon.svg. Run: node scripts/export_brand_assets.mjs
// Output: scripts/brand-assets/*.png

import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "scripts", "brand-assets");
const SRC = join(ROOT, "src", "app", "icon.svg");

// The 32px source is too small to rasterise crisply; inline it at a large
// viewBox so the serif "W" and the dashed ring stay sharp at any export size.
const BIG_SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="256" fill="#1B2A4A"/>
  <circle cx="512" cy="512" r="336" fill="none" stroke="#FFFFFF" stroke-width="45" stroke-dasharray="77 70"/>
  <text x="512" y="688" font-family="Georgia, 'Times New Roman', serif" font-size="480" font-weight="700" fill="#FFFFFF" text-anchor="middle">W</text>
</svg>`;

const SIZES = [
  { name: "logo-1024.png", size: 1024 },
  { name: "logo-512.png", size: 512 },   // Crunchbase / F6S / BetaList / IH
  { name: "logo-400.png", size: 400 },   // common minimum for launch directories
  { name: "ph-thumbnail-240.png", size: 240 }, // Product Hunt thumbnail
];

// LinkedIn Page cover: displays at 1128x191, logo overlaps the bottom-left,
// so the text block is nudged right of that corner and vertically centred.
// Rendered at 3x for a crisp upload. Colours from src/app/globals.css.
const COVER_W = 1128;
const COVER_H = 191;
const COVER_SVG = `
<svg width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${COVER_W}" height="${COVER_H}" fill="#16233f"/>
  <g opacity="0.14">
    <circle cx="1050" cy="96" r="150" fill="none" stroke="#9db3c9" stroke-width="16" stroke-dasharray="26 24"/>
  </g>
  <rect x="245" y="66" width="52" height="6" fill="#3f6b4f"/>
  <text x="245" y="112" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" fill="#ffffff">Where To Apply</text>
  <text x="245" y="146" font-family="Georgia, 'Times New Roman', serif" font-size="19" fill="#9db3c9">Australian universities, courses, fees and student visas. Sourced, dated, independent.</text>
</svg>`;

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  await readFile(SRC); // fail loudly if the source icon moved

  const master = await sharp(Buffer.from(BIG_SVG), { density: 384 })
    .png()
    .toBuffer();

  for (const { name, size } of SIZES) {
    await sharp(master).resize(size, size).png().toFile(join(OUT_DIR, name));
    console.log(`  ${name}  (${size}x${size})`);
  }

  await sharp(Buffer.from(COVER_SVG), { density: 216 })
    .resize(COVER_W * 3, COVER_H * 3)
    .png()
    .toFile(join(OUT_DIR, "linkedin-cover-1128x191.png"));
  console.log(`  linkedin-cover-1128x191.png  (${COVER_W * 3}x${COVER_H * 3}, 3x)`);

  console.log(`\nDone. Files in ${OUT_DIR}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
