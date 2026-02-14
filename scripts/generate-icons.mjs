import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const publicDir = resolve(root, "src", "presentation", "web", "public");
const source = resolve(publicDir, "favicon.svg");

const sizes = [16, 32, 180, 512];

mkdirSync(publicDir, { recursive: true });

const pngBuffers = [];

for (const size of sizes) {
  const output = resolve(publicDir, `icon-${size}.png`);
  const buffer = await sharp(source).resize(size, size).png().toBuffer();
  writeFileSync(output, buffer);
  pngBuffers.push({ size, buffer });
}

const ico = await pngToIco(pngBuffers.filter((item) => item.size === 16 || item.size === 32).map((item) => item.buffer));
writeFileSync(resolve(publicDir, "favicon.ico"), ico);
