import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SchuleAblaufPage, { metadata } from "@/app/schule/ablauf/page";
import { TAFELBILD, WORKSHEET_CHECKLIST } from "@/lib/schule/lessonPlan";

describe("worksheet data", () => {
  it("keeps the five checklist items exact", () => {
    expect(WORKSHEET_CHECKLIST).toEqual([
      "Anrede mit dem richtigen Namen",
      "Ein eigenes Erlebnis, das nur du erzählen kannst",
      "Eine konkrete Bitte: Was soll die Person tun?",
      "Die Bitte um eine Antwort",
      "Eine Einladung in unsere Klasse",
    ]);
    expect(TAFELBILD.map((c) => c.level)).toEqual(["Bund", "Land", "Kommune"]);
  });
});

describe("/schule/ablauf page", () => {
  it("renders three sheets without em dashes", () => {
    const html = renderToStaticMarkup(createElement(SchuleAblaufPage));
    expect(html.match(/class="lesson-sheet"/g)).toHaveLength(3);
    expect(html).toContain("Stundenablauf");
    expect(html).toContain("Arbeitsblatt: Mach den Brief zu deinem");
    expect(html).toContain("Tafelbild: Wer ist zuständig?");
    expect(html).toContain("Zurück zur Seite für Schulen");
    expect(html).toContain("Seite drucken");
    expect(html).toContain("Merksatz:");
    expect(html).not.toContain("—");
    expect(html.startsWith('<main class="lesson-print">')).toBe(true);
  });

  it("sets canonical and title", () => {
    expect(metadata.title).toBe("Ablauf und Arbeitsblatt für den Unterricht | Brief-nach-Berlin");
    expect(metadata.alternates?.canonical).toBe("https://www.brief-nach-berlin.de/schule/ablauf");
  });
});
