import { buildLastcallHtml } from "../lib/email/buildLastcallHtml";

describe("Last-Call-Mail", () => {
  it("offers the three saved one-click choices in HTML and plain text", () => {
    const message = buildLastcallHtml({
      answerBaseUrl: "https://brief-nach-berlin.de/rueckmeldung?t=signed-token",
      deleteUrl: "https://brief-nach-berlin.de/datenloeschen?t=delete-token",
    });
    for (const choice of ["ja", "nein", "nicht"]) {
      expect(message.html).toContain(`a=${choice}`);
      expect(message.text).toContain(`a=${choice}`);
    }
    expect(message.html).toContain("Dein Klick wird mit deiner E-Mail-Adresse gespeichert");
    expect(message.text).toContain("Dein Brief bleibt aber geheim");
  });

  it("keeps the requested photo address and quiet story links", () => {
    const message = buildLastcallHtml();
    expect(message.html).toContain("mailto:Brief-nach-Berlin@posteo.de");
    expect(message.text).toContain("Brief-nach-Berlin@posteo.de");
    expect(message.html).toContain("heyspeak.io");
    expect(message.html).toContain("mailto:");
    expect(message.html).toContain("Gespeicherte Daten löschen");
    expect(message.html).toContain("Datenschutz");
  });

  it("keeps copy concise and free from em dashes", () => {
    const message = buildLastcallHtml();
    expect(message.text).not.toMatch(/[—–]/);
    expect(message.text).toContain("Das ist meine letzte automatische Mail");
  });
});
