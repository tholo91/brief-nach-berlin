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
    ["Als Bürgerin dieses Landes erwarte ich, dass das geprüft wird.", "Bürgerin"],
    ["Ich schreibe Ihnen als engagierte Anwohnerin.", "Anwohnerin"],
    ["Ich bin Rentnerin und fahre täglich Bus.", "Rentnerin"],
    ["Als Mutter mache ich mir Sorgen.", "Mutter"],
  ])("findet erfundenes Geschlecht: %s", (sentence, word) => {
    expect(findRuleViolations(sentence, "Die Busse fahren zu selten.")).toEqual([{ sentence, word }]);
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
    // Bewusst kein Auslöser: handgeschrieben fällt die Konstruktion kaum auf (Entscheidung 19.10.2026)
    "Das ist nicht nur ärgerlich, sondern gefährlich.",
  ])("meldet keinen Fehlalarm: %s", (sentence) => {
    expect(findRuleViolations(sentence, "")).toEqual([]);
  });
});

describe("ruleRetryDirective", () => {
  const violations = findRuleViolations(
    "Als Bürgerin dieses Landes erwarte ich das. Der Bus fährt zu selten.",
    ""
  );

  it("nennt nur die gefundenen Stellen", () => {
    const directive = ruleRetryDirective(violations, false);
    expect(directive).toContain('"Bürgerin"');
    expect(directive).toContain('"Als Bürgerin dieses Landes erwarte ich das."');
    expect(directive).not.toContain("Der Bus fährt zu selten.");
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
