import { findRuleViolations, replaceDashes, ruleRetryDirective } from "@/lib/generation/letterRules";

describe("replaceDashes", () => {
  it.each([
    // Fundstellen aus den Testbriefen vom 19.10.2026 (prueft-die-afd, Landesregierung BW)
    ["Das muss das höchste Gericht prüfen – unabhängig und ergebnisoffen.", "Das muss das höchste Gericht prüfen, unabhängig und ergebnisoffen."],
    ["Die Entscheidung muss das Gericht treffen – aber es braucht den politischen Willen.", "Die Entscheidung muss das Gericht treffen, aber es braucht den politischen Willen."],
    ["Das knüpft an Abstammung an — nicht an demokratische Werte.", "Das knüpft an Abstammung an, nicht an demokratische Werte."],
    ["Das ist wichtig—gerade jetzt.", "Das ist wichtig, gerade jetzt."],
  ])("ersetzt Gedankenstriche durch Komma: %s", (input, expected) => {
    expect(replaceDashes(input)).toBe(expected);
  });

  it("macht aus Zahlenbereichen und Wortpaaren einen Bindestrich", () => {
    expect(replaceDashes("In den Jahren 2020–2024 und auf der Nord–Süd-Achse")).toBe(
      "In den Jahren 2020-2024 und auf der Nord-Süd-Achse"
    );
  });

  it("erzeugt kein doppeltes Satzzeichen", () => {
    expect(replaceDashes("Ein Antrag muss gestellt werden – etwa durch den Bundesrat –.")).toBe(
      "Ein Antrag muss gestellt werden, etwa durch den Bundesrat."
    );
    expect(replaceDashes("Das Gericht, – so hoffe ich – entscheidet.")).toBe("Das Gericht, so hoffe ich, entscheidet.");
  });

  it("lässt Briefe ohne Gedankenstrich und normale Bindestriche unverändert", () => {
    const letter = "19.10.2026\n\nSehr geehrte Damen und Herren,\n\nich bitte um ein AfD-Verbotsverfahren.\n\nMit freundlichen Grüßen\n[Ihr Name]";
    expect(replaceDashes(letter)).toBe(letter);
  });
});

describe("findRuleViolations", () => {
  it.each([
    "Eine Partei kann nur verboten werden, wenn ihre Ziele nicht nur verfassungsfeindlich sind, sondern auch konkrete Aussicht auf Erfolg haben.",
    "Das Gutachten belegt, dass die AfD nicht nur verfassungsfeindliche Ziele verfolgt, sondern auch über Strukturen verfügt.",
    "Diese Forderungen richten sich nicht nur gegen Einzelne, sondern gegen das Prinzip der gleichen Rechte.",
    "Das betrifft nicht allein mich, sondern viele Familien.",
    "Das ist nicht bloß ärgerlich, sondern gefährlich.",
  ])("findet nicht nur ... sondern: %s", (sentence) => {
    expect(findRuleViolations(`Sehr geehrte Damen und Herren,\n\n${sentence}`, "")).toEqual([
      expect.objectContaining({ kind: "nicht_nur_sondern" }),
    ]);
  });

  it("ignoriert nicht nur ohne sondern im selben Satz", () => {
    expect(findRuleViolations("Das betrifft nicht nur mich. Sondern das ganze Viertel.", "")).toEqual([]);
  });

  it.each([
    ["Als Bürgerin dieses Landes erwarte ich, dass das geprüft wird.", "Bürgerin"],
    ["Ich schreibe Ihnen als engagierte Anwohnerin.", "Anwohnerin"],
    ["Ich bin Rentnerin und fahre täglich Bus.", "Rentnerin"],
    ["Als Mutter mache ich mir Sorgen.", "Mutter"],
  ])("findet erfundenes Geschlecht: %s", (sentence, word) => {
    expect(findRuleViolations(sentence, "Die Busse fahren zu selten.")).toEqual([
      { kind: "erfundenes_geschlecht", sentence, word },
    ]);
  });

  it("erlaubt Selbstbezeichnungen, die im Transkript stehen", () => {
    expect(findRuleViolations("Als Lehrerin sehe ich das jeden Tag.", "Ich bin Lehrerin an einer Grundschule.")).toEqual([]);
  });

  it.each([
    "Viele Bürgerinnen und Bürger sind besorgt.",
    "Gerade Sie als Ministerpräsidentin können das anstoßen.",
    "Ich bitte Sie als Bürgermeisterin, das zu prüfen.",
    "Ich sehe die Frist als Termin, den niemand einhält.",
    "Als Verein setzen wir uns dafür ein.",
    "Ich wohne in Berlin und sehe das als Bürger täglich.",
  ])("meldet keinen Fehlalarm: %s", (sentence) => {
    expect(findRuleViolations(sentence, "")).toEqual([]);
  });
});

describe("ruleRetryDirective", () => {
  const violations = findRuleViolations(
    "Als Bürgerin dieses Landes erwarte ich das. Das ist nicht nur ärgerlich, sondern gefährlich.",
    ""
  );

  it("nennt nur die gefundenen Stellen", () => {
    const directive = ruleRetryDirective(violations, false);
    expect(directive).toContain('"Bürgerin"');
    expect(directive).toContain('"Das ist nicht nur ärgerlich, sondern gefährlich."');
    expect(directive).toContain("Länge bleiben gleich");
    expect(directive).not.toMatch(/[–—]/);
  });

  it("passt die Überschrift an, wenn der Brief ohnehin neu geschrieben wird", () => {
    expect(ruleRetryDirective(violations, true)).toMatch(/^Ändere dabei außerdem diese Stellen:/);
  });

  it("liefert ohne Verstöße einen leeren Text", () => {
    expect(ruleRetryDirective([], false)).toBe("");
  });
});
