import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { YouthLetterDraft } from "@/components/wizard/YouthLetterDraft";
import { showYouthDraft } from "@/components/wizard/youthMode";

describe("showYouthDraft", () => {
  const youth = { audience: "jung" as const, klasse: 8 };

  it("is true for youth with ready letter and text", () => {
    expect(showYouthDraft(youth, true, "Sehr geehrte Frau X")).toBe(true);
  });

  it("is false for adults, not ready, or empty text", () => {
    expect(showYouthDraft({}, true, "Text")).toBe(false);
    expect(showYouthDraft(youth, false, "Text")).toBe(false);
    expect(showYouthDraft(youth, true, "")).toBe(false);
  });
});

describe("YouthLetterDraft", () => {
  const html = renderToStaticMarkup(
    createElement(YouthLetterDraft, { letterText: "Zeile eins\n\nZeile zwei" })
  );

  it("shows heading, instruction and the letter text with line breaks", () => {
    expect(html).toContain("Dein Entwurf");
    expect(html).toContain("Schreib ihn von Hand ab und ergänze ein eigenes Erlebnis.");
    expect(html).toContain("Zeile eins\n\nZeile zwei");
    expect(html).toContain("whitespace-pre-line");
  });

  it("contains no em dashes", () => {
    expect(html).not.toContain("—");
  });
});
