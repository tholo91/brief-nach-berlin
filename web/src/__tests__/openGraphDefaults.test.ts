import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import sharp from "sharp";

import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";

// Next merged Metadata flach: eine Seite mit eigenem openGraph-Block verliert das Bild
// aus dem Root-Layout. Dieser Wächter hält fest, dass jede solche Seite ein Bild hat.
const APP_DIR = join(__dirname, "..", "app");

function findPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findPages(full);
    return entry.name === "page.tsx" ? [full] : [];
  });
}

function hasSiblingOgImage(pagePath: string): boolean {
  return readdirSync(dirname(pagePath)).some((name) => name.startsWith("opengraph-image."));
}

describe("openGraph-Bild auf öffentlichen Seiten", () => {
  it("jede Seite mit openGraph hat images oder eine opengraph-image-Datei im Segment", () => {
    const offenders = findPages(APP_DIR)
      .filter((page) => /\bopenGraph\b/.test(readFileSync(page, "utf8")))
      .filter((page) => !/\bimages\s*:/.test(readFileSync(page, "utf8")))
      .filter((page) => !hasSiblingOgImage(page))
      .map((page) => page.slice(APP_DIR.length + 1));

    expect(offenders).toEqual([]);
  });

  it("DEFAULT_OG_IMAGES passt zur Bilddatei und zum Alt-Text in src/app", async () => {
    const [image] = DEFAULT_OG_IMAGES;
    const file = join(APP_DIR, "opengraph-image.jpg");
    const meta = await sharp(file).metadata();
    const alt = readFileSync(join(APP_DIR, "opengraph-image.alt.txt"), "utf8").trim();

    expect(image.url).toBe(`${APP_URL}/opengraph-image.jpg`);
    expect(image.type).toBe("image/jpeg");
    expect(image.width).toBe(meta.width);
    expect(image.height).toBe(meta.height);
    expect(image.alt).toBe(alt);
  });

  it("/schule hat ein eigenes Bild mit Maßen, Größe und Alt-Text", async () => {
    const dir = join(APP_DIR, "(site)", "schule");
    const file = join(dir, "opengraph-image.jpg");
    const meta = await sharp(file).metadata();

    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
    expect(statSync(file).size).toBeLessThan(300000);
    expect(readFileSync(join(dir, "opengraph-image.alt.txt"), "utf8").trim()).not.toBe("");
    // Setzt die Seite selbst images, unterdrückt das die Datei.
    expect(existsSync(join(dir, "page.tsx"))).toBe(true);
    expect(readFileSync(join(dir, "page.tsx"), "utf8")).not.toMatch(/\bimages\s*:/);
  });
});
