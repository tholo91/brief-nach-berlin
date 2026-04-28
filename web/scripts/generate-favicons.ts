import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = join(process.cwd(), "src", "app");
const SVG_PATH = join(APP_DIR, "icon.svg");
const svg = readFileSync(SVG_PATH);

async function makePng(size: number, out: string) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(APP_DIR, out));
  console.log(`✓ ${out} (${size}x${size})`);
}

async function makeIco() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(svg, { density: 384 }).resize(s, s).png().toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);

  const entries: Buffer[] = [];
  let offset = 6 + 16 * sizes.length;
  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(16);
    const s = sizes[i] === 256 ? 0 : sizes[i];
    entry.writeUInt8(s, 0);
    entry.writeUInt8(s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngs[i].length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    entries.push(entry);
  }

  const ico = Buffer.concat([header, ...entries, ...pngs]);
  writeFileSync(join(APP_DIR, "favicon.ico"), ico);
  console.log(`✓ favicon.ico (${sizes.join(", ")})`);
}

async function main() {
  await makePng(180, "apple-icon.png");
  await makePng(512, "icon.png");
  await makeIco();
}

main();
