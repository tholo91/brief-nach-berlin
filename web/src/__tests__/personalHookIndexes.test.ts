import { findPersonalHookIndexes } from "@/lib/campaigns/issueVariants";

describe("findPersonalHookIndexes", () => {
  const de = ["Ich bin selbst betroffen:", "Meine Familie ist betroffen:"];
  const en = ["I am affected myself:", "My family is affected:"];

  it("findet die Position des gewählten Satzanfangs", () => {
    expect(findPersonalHookIndexes("Meine Familie ist betroffen: Oma pflegt.", [de])).toEqual([1]);
  });

  it("liefert eine leere Liste bei nur eigenem Text", () => {
    expect(findPersonalHookIndexes("Ich pendle jeden Tag.", [de])).toEqual([]);
  });

  it("erkennt Sprachfassungen und mehrere Satzanfänge", () => {
    const note = "I am affected myself: x. My family is affected: y.";
    expect(findPersonalHookIndexes(note, [de, en])).toEqual([0, 1]);
  });
});
