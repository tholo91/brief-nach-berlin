import { buildCallScript } from "@/components/BpaCallScript";

describe("buildCallScript", () => {
  it("ohne Daten bleiben Platzhalter", () => {
    const t = buildCallScript();
    expect(t).toContain("Ich wohne in [Ort] und");
    expect(t).toContain("[Name Ihres MdB]");
  });

  it("mit PLZ, Wahlkreis und Name vorbefüllt", () => {
    const t = buildCallScript("28195", "Anna Müller", "Bremen I");
    expect(t).toContain("[Ort] (PLZ 28195, Wahlkreis Bremen I)");
    expect(t).toContain("dass Anna Müller Bürgerinnen");
  });

  it("nur PLZ", () => {
    expect(buildCallScript("28195")).toContain("[Ort] (PLZ 28195)");
  });
});
