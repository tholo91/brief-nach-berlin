import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("success page experience", () => {
  const successSource = readFileSync(
    join(process.cwd(), "src/components/wizard/Step3Success.tsx"),
    "utf8",
  );
  const shellSource = readFileSync(
    join(process.cwd(), "src/components/wizard/WizardShell.tsx"),
    "utf8",
  );
  const mapSource = readFileSync(
    join(process.cwd(), "src/components/wizard/LetterSignalCard.tsx"),
    "utf8",
  );

  it("keeps the completion state lean and focused", () => {
    expect(successSource).toContain("Dein Brief ist fertig");
    expect(successSource).toContain("Brief und nächste Schritte kommen per E-Mail");
    expect(successSource).not.toContain("RathausAdresseButton");
    expect(successSource).not.toContain("germanLetterNotice");
    expect(successSource).not.toContain("mt-7 grid gap-2 font-body text-sm text-warmgrau sm:grid-cols-3");
  });

  it("uses a two-column desktop layout and an out-of-flow success illustration", () => {
    expect(successSource).toContain("md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]");
    expect(successSource).toContain("lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]");
    expect(shellSource).toContain('step === 3 || showWideCampaignPicker ? "max-w-5xl"');
    expect(shellSource).toContain('successBackground={step === 3}');
  });

  it("keeps the map secondary and places support below the inbox area on larger screens", () => {
    expect(successSource).toContain("md:col-start-1 md:row-start-2");
    expect(successSource).toContain("md:col-start-2 md:row-span-2 md:row-start-1");
    expect(successSource).toContain("md:pl-8 md:pt-12");
    expect(successSource).not.toContain("md:col-span-2");
    expect(successSource).toContain("SUPPORT_CONTENT.ctas.donate.href");
    expect(successSource).toContain("SUPPORT_CONTENT.ctas.learnMore.href");
    expect(successSource).toContain("SUPPORT_EMAIL_COPY.de.compactButton");
    expect(successSource).toContain("SUPPORT_EMAIL_COPY.de.infoButton");
    expect(successSource).toContain("SUPPORT_CONTENT.founder.portraitPath");
    expect(successSource).toContain("mt-4 flex items-start gap-4");
    expect(successSource).toContain('id="success-support-title" className="font-body text-lg');
    expect(successSource).not.toContain("Ehrenamtlich gebaut");
    expect(successSource).not.toContain("Projekt weiterempfehlen");
    expect(successSource).not.toContain("Feedback geben");
    expect(successSource).not.toContain("bg-creme/80");
    expect(mapSource).toContain("Zeig, woher dein Brief kommt");
    expect(mapSource).toContain("von wo aus Menschen ihre Briefe nach Berlin schreiben");
    expect(mapSource).toContain("Mein Anliegen auf die Karte setzen");
    expect(mapSource).toContain("PLZ, E-Mail-Adresse, Zeitpunkt und ein grobes Thema");
    expect(mapSource).toContain("Dein Brief wird nicht gespeichert");
    expect(mapSource).not.toContain("bg-white/45");
    expect(mapSource).toContain("Datenschutz");
    expect(mapSource).not.toContain("Details zum Datenschutz");
  });

  it("offers the voluntary map contribution before the asynchronous letter is ready", () => {
    expect(successSource).toContain("letterPending={!letterReady}");
    expect(mapSource).toContain("Du kannst dein Anliegen schon jetzt unabhängig vom Briefentwurf eintragen.");
    expect(mapSource).toContain("Dein Brief wird nicht gespeichert");
  });

  it("keeps the postbox action available across breakpoints and moves personalization into the accordion", () => {
    expect(successSource).toContain("Postfach öffnen");
    expect(successSource).not.toContain("E-Mail-App öffnen");
    expect(successSource).toContain("divide-x divide-warmgrau/20");
    expect(successSource).toContain('<span className="underline underline-offset-2">So geht es weiter</span>');
    expect(successSource).toContain('rounded-lg bg-warmgrau/5 p-4');
    expect(successSource).not.toContain("Die vollständige Anleitung findest du auch in deiner E-Mail.");
    expect(successSource.indexOf("Mach diesen Brief zu deinem Brief.")).toBeGreaterThan(
      successSource.indexOf("So geht es weiter"),
    );
  });

  it("uses a real projected Germany outline instead of the placeholder shape", () => {
    expect(mapSource).toContain("GermanyContributionMap");
    const geometrySource = readFileSync(
      join(process.cwd(), "src/lib/letterSignals/germanyMapGeometry.generated.ts"),
      "utf8",
    );
    expect(geometrySource).toContain("Natural Earth (Public Domain)");
    expect(geometrySource).toContain('GERMANY_MAP_VIEWBOX = "0 0 180 180"');
  });
});
