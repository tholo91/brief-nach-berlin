import sharp from "sharp";
import { createElement as h } from "react";
import { ImageResponse } from "next/og";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Erzeugt das OG-Bild für /schule: Klassenzimmer-Illustration plus Headline aus der H1.
// Start aus web/: npx tsx scripts/generate-schule-og.ts
// Ändert sich die Headline in (site)/schule/page.tsx, das Skript neu laufen lassen und die
// Alt-Text-Datei daneben anpassen. Die Schriften werden nur beim Lauf geladen, nicht ins Repo.
const SOURCE = join(process.cwd(), "public", "images", "img-schule-klasse.webp");
const OUT = join(process.cwd(), "src", "app", "(site)", "schule", "opengraph-image.jpg");

const WIDTH = 1200;
const HEIGHT = 630;
const CREAM = "#FAF8F5";
const HONEY = "#F4C95D";

const FONT_URLS = {
  courier:
    "https://fonts.gstatic.com/s/courierprime/v11/u-4k0q2lgwslOqpF_6gQ8kELY7pMf-c.ttf",
  caveat: "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjRV6SII.ttf",
};

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Schrift nicht ladbar: ${url} (${res.status})`);
  return res.arrayBuffer();
}

async function main() {
  const [courier, caveat] = await Promise.all([
    loadFont(FONT_URLS.courier),
    loadFont(FONT_URLS.caveat),
  ]);

  // next/og liest kein WebP: Zuschnitt auf 1200x630 als PNG-Data-URL.
  const cropped = await sharp(SOURCE)
    .extract({ left: 0, top: 40, width: WIDTH, height: HEIGHT })
    .png()
    .toBuffer();
  const dataUrl = `data:image/png;base64,${cropped.toString("base64")}`;

  const line = (text: string, size: number) =>
    h(
      "div",
      {
        style: {
          display: "flex",
          fontFamily: "Courier Prime",
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.12,
          color: CREAM,
        },
      },
      text,
    );

  const tree = h(
    "div",
    {
      style: {
        display: "flex",
        position: "relative",
        width: WIDTH,
        height: HEIGHT,
      },
    },
    h("img", {
      src: dataUrl,
      width: WIDTH,
      height: HEIGHT,
      style: { position: "absolute", left: 0, top: 0 },
    }),
    // Linkes Panel: Verlauf in Nachtgrün, damit der Text auf jeder Bildstelle trägt.
    h("div", {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 860,
        height: HEIGHT,
        backgroundImage: `linear-gradient(to right, rgba(16,35,29,0.94) 0%, rgba(16,35,29,0.86) 52%, rgba(16,35,29,0) 100%)`,
      },
    }),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 56,
          top: 70,
          display: "flex",
          flexDirection: "column",
        },
      },
      line("Wählen darfst du", 58),
      line("noch nicht.", 58),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            marginLeft: 6,
            fontFamily: "Caveat",
            fontWeight: 700,
            fontSize: 112,
            lineHeight: 0.95,
            color: HONEY,
            transform: "rotate(-3deg)",
          },
        },
        h("div", { style: { display: "flex" } }, "Schreiben"),
        h("div", { style: { display: "flex", marginLeft: 70 } }, "schon."),
      ),
    ),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 56,
          bottom: 40,
          display: "flex",
          fontFamily: "Courier Prime",
          fontWeight: 700,
          fontSize: 34,
          color: CREAM,
        },
      },
      "Brief-nach-Berlin",
    ),
  );

  const png = await new ImageResponse(tree, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Courier Prime", data: courier, weight: 700 as const, style: "normal" as const },
      { name: "Caveat", data: caveat, weight: 700 as const, style: "normal" as const },
    ],
  }).arrayBuffer();

  const jpeg = await sharp(Buffer.from(png))
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  writeFileSync(OUT, jpeg);
  console.log(`✓ ${OUT} (${WIDTH}x${HEIGHT}, ${Math.round(jpeg.length / 1024)} KB)`);
}

main();
