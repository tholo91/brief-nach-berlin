import { formatSourceStand } from "@/lib/formatSourceStand";

describe("formatSourceStand", () => {
  it("wandelt ISO-Datum (YYYY-MM-DD) in DD.MM.YY um", () => {
    expect(formatSourceStand("2026-06-25")).toBe("25.06.26");
    expect(formatSourceStand("2026-09-10")).toBe("10.09.26");
  });

  it("kürzt bereits deutsches DD.MM.YYYY auf DD.MM.YY", () => {
    expect(formatSourceStand("31.01.2026")).toBe("31.01.26");
  });

  it("lässt unbekannte Formate unangetastet", () => {
    expect(formatSourceStand("unbekannt")).toBe("unbekannt");
  });
});