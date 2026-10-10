import { extractConstituencyOffices } from "../../scripts/fetch-constituency-offices";

function page(...lines: string[]) {
  return `<html><body>${lines.map((line) => `<p>${line}</p>`).join("")}</body></html>`;
}

const FOOTER = [
  "Startseite",
  "Barrierefreiheit",
  "(Externer Link, Link öffnet ein neues Fenster)",
  "https://www.bundestag.de/abgeordnete/biografien/A/x-1",
  "Stand: 09.10.2026",
];

describe("extractConstituencyOffices", () => {
  it("parses a normal single office", () => {
    const offices = extractConstituencyOffices(
      page("Wahlkreisbüro", "Kontakt (E-Mail)", "Untere Allee 3", "66424 Homburg", "Biografie", "Foo")
    );
    expect(offices).toHaveLength(1);
    expect(offices[0].rawLines).toEqual(["Untere Allee 3", "66424 Homburg"]);
    expect(offices[0].postalCode).toBe("66424");
    expect(offices[0].city).toBe("Homburg");
  });

  it("stops at the page footer when the office is the last section", () => {
    const offices = extractConstituencyOffices(
      page("Wahlkreisbüro", "Untere Allee 3", "66424 Homburg", ...FOOTER)
    );
    expect(offices).toHaveLength(1);
    expect(offices[0].rawLines).toEqual(["Untere Allee 3", "66424 Homburg"]);
    expect(offices[0].postalAddress).not.toMatch(/Startseite|Externer Link|Stand:/);
  });

  it("splits prefixed headings into separate offices", () => {
    const offices = extractConstituencyOffices(
      page(
        "Wahlkreisbüro",
        "AfD Wahlkreisbüro Eichsfeld",
        "Marktstraße 1",
        "37308 Heiligenstadt",
        "AfD Wahlkreisbüro Nordhausen",
        "Bahnhofstraße 2",
        "99734 Nordhausen",
        ...FOOTER
      )
    );
    expect(offices.map((o) => o.postalCode)).toEqual(["37308", "99734"]);
    expect(offices[0].rawLines[0]).toBe("AfD Wahlkreisbüro Eichsfeld");
    expect(offices[1].rawLines).toEqual(["AfD Wahlkreisbüro Nordhausen", "Bahnhofstraße 2", "99734 Nordhausen"]);
  });

  it("splits unlabeled addresses and keeps a Postfach with its office", () => {
    const offices = extractConstituencyOffices(
      page(
        "Wahlkreisbüro",
        "Goethestraße 16",
        "31224 Peine",
        "Postfach 12",
        "31201 Peine",
        "Steinweig 11",
        "38518 Gifhorn"
      )
    );
    expect(offices).toHaveLength(2);
    expect(offices[0].rawLines).toEqual(["Goethestraße 16", "31224 Peine", "Postfach 12", "31201 Peine"]);
    expect(offices[1].postalCode).toBe("38518");
  });
});
