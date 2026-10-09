import { lowercaseAfterSalutation } from "@/lib/generation/lowercaseAfterSalutation";

describe("lowercaseAfterSalutation", () => {
  it("lowercases Ich after the salutation", () => {
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nIch schreibe Ihnen.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nich schreibe Ihnen."
    );
  });

  it("lowercases Mit and Unsere", () => {
    expect(lowercaseAfterSalutation("Sehr geehrte Frau Meier,\nMit Sorge sehe ich das.")).toBe(
      "Sehr geehrte Frau Meier,\nmit Sorge sehe ich das."
    );
    expect(lowercaseAfterSalutation("Guten Tag,\n\nUnsere Straße ist kaputt.")).toBe(
      "Guten Tag,\n\nunsere Straße ist kaputt."
    );
  });

  it("keeps formal address", () => {
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nSie sind zuständig.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nSie sind zuständig."
    );
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nIhnen schreibe ich.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nIhnen schreibe ich."
    );
  });

  it("keeps nouns and names", () => {
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nStraßen sind kaputt.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nStraßen sind kaputt."
    );
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nBürger leiden.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nBürger leiden."
    );
  });

  it("keeps text without salutation", () => {
    expect(lowercaseAfterSalutation("Ich schreibe Ihnen.")).toBe("Ich schreibe Ihnen.");
    expect(lowercaseAfterSalutation("")).toBe("");
  });

  it("handles Damen und Herren and Liebe/Lieber", () => {
    expect(lowercaseAfterSalutation("Sehr geehrte Damen und Herren,\n\nWir wohnen hier.")).toBe(
      "Sehr geehrte Damen und Herren,\n\nwir wohnen hier."
    );
    expect(lowercaseAfterSalutation("Lieber Herr Brandl,\n\nDas ist wichtig.")).toBe(
      "Lieber Herr Brandl,\n\ndas ist wichtig."
    );
  });

  it("handles multiple empty lines between salutation and body", () => {
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\n\n  Ich schreibe.")).toBe(
      "Sehr geehrter Herr Brandl,\n\n\n  ich schreibe."
    );
  });

  it("changes only the first body word", () => {
    expect(lowercaseAfterSalutation("Sehr geehrter Herr Brandl,\n\nIch bin da. Ich bleibe.")).toBe(
      "Sehr geehrter Herr Brandl,\n\nich bin da. Ich bleibe."
    );
  });
});
