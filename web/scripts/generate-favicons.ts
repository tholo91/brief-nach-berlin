import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// icon1.png is the master (airmail border + Reichstag silhouette, 192x192).
// All smaller raster icons are derived from it.
const APP_DIR = join(process.cwd(), "src", "app");
const SOURCE_PATH = join(APP_DIR, "icon1.png");
const source = readFileSync(SOURCE_PATH);

async function makePng(size: number, out: string) {
  await sharp(source)
    .resize(size, size, { kernel: "lanczos3" })
    .png()
    .toFile(join(APP_DIR, out));
  console.log(`✓ ${out} (${size}x${size})`);
}

async function makeIco() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(source).resize(s, s, { kernel: "lanczos3" }).png().toBuffer(),
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
  await makePng(32, "icon.png");
  await makeIco();
}

main();
