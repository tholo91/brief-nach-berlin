import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LESSON_45,
  LESSON_90_EXTRAS,
  PRECHECK_ITEMS,
  formatMinuteRange,
} from "@/lib/schule/lessonPlan";
import { classLinkFileName, formatValidUntil } from "@/components/schule/classLinkHelpers";
import { FOUNDER_EMAIL } from "@/lib/config";
import { CampaignQrDownload } from "@/components/campaigns/CampaignQrDownload";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
jest.mock("@/lib/actions/createClassLink", () => ({ createClassLinkAction: jest.fn() }));

describe("lessonPlan", () => {
  it("covers minutes 0 to 45 without gaps", () => {
    expect(LESSON_45[0].from).toBe(0);
    expect(LESSON_45[LESSON_45.length - 1].to).toBe(45);
    for (let i = 1; i < LESSON_45.length; i += 1) {
      expect(LESSON_45[i].from).toBe(LESSON_45[i - 1].to);
    }
    LESSON_45.forEach((row) => expect(row.to).toBeGreaterThan(row.from));
  });

  it("formats ranges with an en dash and has content lists", () => {
    expect(formatMinuteRange(LESSON_45[0])).toBe("0–5");
    expect(PRECHECK_ITEMS).toHaveLength(4);
    expect(LESSON_90_EXTRAS).toHaveLength(6);
  });
});

describe("class link helpers", () => {
  it("builds the download file name", () => {
    expect(classLinkFileName(9)).toBe("brief-nach-berlin-klassenlink-klasse-9-qr.png");
  });

  it("formats the expiry date in German", () => {
    expect(formatValidUntil("2026-11-08T10:00:00.000Z")).toBe("8. November 2026");
  });
});

describe("CampaignQrDownload", () => {
  it("keeps its default markup without the new props", () => {
    const html = renderToStaticMarkup(createElement(CampaignQrDownload, { url: "https://x.de", slug: "abc" }));
    expect(html).toContain('aria-label="QR-Code zum Kampagnenlink"');
    expect(html).toContain("öffentlichen Kampagnenseite gelangen.");
  });
});

describe("/unterricht page", () => {
  it("renders sections in plan order with binding copy", async () => {
    const { default: UnterrichtPage, metadata } = await import("@/app/(site)/unterricht/page");
    expect(metadata.alternates?.canonical).toBe("https://www.brief-nach-berlin.de/unterricht");
    const html = renderToStaticMarkup(createElement(UnterrichtPage));
    const order = [
      "Deine Klasse schreibt an die Politik.",
      'href="#klassenlink"',
      'href="#ablauf"',
      "Hilfe bei der Planung? Ich unterstütze dich gern.",
      "Thomas schreiben",
      'id="klassenlink"',
      "Vorher kurz prüfen",
      'id="ablauf"',
      "Ablauf der Stunde",
      LESSON_45[0].phase,
      "Zusätzlich zum Ablauf oben:",
      LESSON_90_EXTRAS[0],
      "/unterricht/ablauf",
      "Warum das wirkt",
      "Warum Handschrift?",
      'id="schulleitung"',
      'id="schule-leitung"',
      'href="/eltern#sicher"',
      "projekttag-demokratie",
      "Häufige Fragen",
    ];
    let last = -1;
    for (const needle of order) {
      const index = html.indexOf(needle);
      expect(index).toBeGreaterThan(last);
      last = index;
    }
    expect(html).toContain(
      "Ein kurzer Unterrichtsentwurf: Deine Schüler:innen schreiben in einer Stunde Briefe für ihre Zukunft an ihre Abgeordneten.",
    );
    expect(html).not.toContain("Los geht es per QR");
    expect(html.split("Klassenlink erstellen")).toHaveLength(2);
    expect(html).toContain('id="klassenlink-hero"');
    expect(html).toContain("Dein Klassenlink");
    expect(html).toContain("Link erstellen");
    expect(html).not.toContain("geht es hier los");
    const body = encodeURIComponent(
      "Hallo Thomas,\n\nich möchte Brief-nach-Berlin mit meiner Klasse ausprobieren.\n\nSchule und Ort: \nKlassenstufe: \nGeplanter Termin: \nDabei hätte ich gern Hilfe: \n\nViele Grüße\n",
    );
    expect(html).toContain(`mailto:${FOUNDER_EMAIL}?subject=Brief-nach-Berlin%20im%20Unterricht&amp;body=${body}`);
    expect(html).toContain("application/ld+json");
    expect(html).toMatch(/aria-pressed="true"[^>]*>45 Min/);
    expect(html).toMatch(/<div[^>]*hidden=""[^>]*id="schule-90-extras"|<div[^>]*id="schule-90-extras"[^>]*hidden=""/);
    expect(html).toContain(
      "Der Klassenlink enthält nur Klassenstufe, Schul-Postleitzahl und den Zeitpunkt der Erstellung, keine Namen. Er gilt 14 Tage.",
    );
    expect(html).not.toContain("<table");
    expect(html).not.toContain("font-handwriting");
    expect(html).not.toContain("—");
    expect(html).not.toContain(" – ");
  });
});
