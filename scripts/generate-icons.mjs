// One-off icon generator for the PWA manifest + favicon. Run with:
//   node scripts/generate-icons.mjs
// Not part of the app runtime — just produces public/icon-*.png and
// src/app/favicon.ico from a single SVG source of the brand mark used in
// Header.tsx, so the app icon and the in-app mark stay the same shape.
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// Maroon background, paper-colored shield emblem (same path as
// Header.tsx's brand mark), sized within a safe zone for maskable icons.
function svg(size) {
  const stroke = size * 0.045;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#5C1A1A" />
  <g transform="translate(${size / 2}, ${size / 2}) scale(${size / 22}) translate(-8, -8.2)">
    <path d="M8 1.5L3 4v4c0 3.4 2.1 5.9 5 6.5 2.9-.6 5-3.1 5-6.5V4l-5-2.5z"
      fill="none" stroke="#F2EFE6" stroke-width="${stroke * (22 / size)}" stroke-linejoin="round" />
  </g>
</svg>`;
}

mkdirSync(path.join(root, "public"), { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  const buf = Buffer.from(svg(size));
  await sharp(buf).png().toFile(path.join(root, "public", `icon-${size}.png`));
  console.log(`wrote public/icon-${size}.png`);
}

// Maskable variant (512) — same art, manifest marks it "maskable" so
// platforms know the background already fills the safe zone.
await sharp(Buffer.from(svg(512))).png().toFile(path.join(root, "public", "icon-512-maskable.png"));
console.log("wrote public/icon-512-maskable.png");

// favicon.ico (multi-size ICO via PNG frames at 16/32/48)
const icoSizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  icoSizes.map((s) => sharp(Buffer.from(svg(s))).png().toBuffer())
);
writeFileSync(path.join(root, "src", "app", "favicon.ico"), toIco(pngBuffers, icoSizes));
console.log("wrote src/app/favicon.ico");

function toIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * count;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const imageBuffers = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const png = pngBuffers[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    dirEntries.push(entry);
    imageBuffers.push(png);
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}
