// Dev tool: renders the milestone creator mail (50 and 500 letters) and the
// management mail through the real HTML builder, optionally with screenshots.
// It never imports the Brevo sender, so nothing is sent.
//
// The header image comes from the running dev server (dev-only `vorschau`
// param of the image route, no database access). Static assets under /images
// are pointed at the same dev server so files not yet deployed show up.
//
// Run with the dev server up:
//   cd web && npx tsx scripts/render-milestone-email-preview.ts \
//     --out ../.planning/quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/preview \
//     --base http://localhost:3000 --screenshots
//
// Screenshots use the installed Google Chrome through playwright (channel
// "chrome"); no browser download is needed.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildCampaignCreatorEmailHtml } from "../src/lib/email/buildCampaignCreatorEmailHtml";
import { DEFAULT_CAMPAIGN_MILESTONES } from "../src/lib/campaigns/milestones";
import { APP_URL } from "../src/lib/config";
import { campaignPublicUrl } from "../src/lib/share";

const SAMPLE = {
  title: "Mehr Busse für Bremen-Nord",
  slug: "mehr-busse-bremen-nord",
  creatorName: "Lena",
};
const WIDTHS = [640, 375] as const;

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const outArg = arg("out");
if (!outArg) {
  console.error("Usage: --out <dir> [--base <url>] [--screenshots]");
  process.exit(1);
}
const outDir = resolve(outArg);
const base = (arg("base") ?? "http://localhost:3000").replace(/\/$/, "");
const withScreenshots = process.argv.includes("--screenshots");

function milestoneHtml(count: number): string {
  const imageUrl =
    `${base}/kampagne/${SAMPLE.slug}/meilenstein/${count}/bild` +
    `?vorschau=${encodeURIComponent(SAMPLE.title)}`;
  return buildCampaignCreatorEmailHtml({
    kind: "milestone",
    campaignTitle: SAMPLE.title,
    slug: SAMPLE.slug,
    campaignUrl: campaignPublicUrl(SAMPLE.slug),
    actionUrl: `${APP_URL}/kampagne/verwalten?token=vorschau`,
    creatorName: SAMPLE.creatorName,
    milestone: {
      count,
      milestones: [...DEFAULT_CAMPAIGN_MILESTONES],
      imageUrl,
      downloadUrl: `${imageUrl}&download=1`,
    },
  });
}

function managementHtml(): string {
  return buildCampaignCreatorEmailHtml({
    kind: "management",
    campaignTitle: SAMPLE.title,
    slug: SAMPLE.slug,
    campaignUrl: campaignPublicUrl(SAMPLE.slug),
    actionUrl: `${APP_URL}/kampagne/verwalten?token=vorschau`,
    creatorName: SAMPLE.creatorName,
    campaignStatus: "active",
  });
}

const pages: Array<{ name: string; html: string }> = [
  { name: "milestone-50", html: milestoneHtml(50) },
  { name: "milestone-500", html: milestoneHtml(500) },
  { name: "management-active", html: managementHtml() },
].map((page) => ({
  ...page,
  html: page.html.split(`${APP_URL}/images/`).join(`${base}/images/`),
}));

async function main() {
  mkdirSync(outDir, { recursive: true });
  for (const page of pages) {
    writeFileSync(resolve(outDir, `${page.name}.html`), page.html, "utf8");
    console.log(`wrote ${page.name}.html`);
  }
  if (!withScreenshots) return;

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const page of pages) {
      for (const width of WIDTHS) {
        const tab = await browser.newPage({ viewport: { width, height: 900 } });
        await tab.goto(pathToFileURL(resolve(outDir, `${page.name}.html`)).href, {
          waitUntil: "networkidle",
        });
        await tab.evaluate(async () => {
          await Promise.all(
            Array.from(document.images).map((image) =>
              image.complete
                ? Promise.resolve()
                : new Promise((done) => {
                    image.addEventListener("load", done, { once: true });
                    image.addEventListener("error", done, { once: true });
                  }),
            ),
          );
        });
        await tab.screenshot({
          path: resolve(outDir, `${page.name}-${width}.png`),
          fullPage: true,
        });
        await tab.close();
        console.log(`wrote ${page.name}-${width}.png`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
