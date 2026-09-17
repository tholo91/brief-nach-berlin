import {
  suggestEmailCorrection,
  WEBMAIL_PROVIDERS,
} from "@/lib/email/emailProviders";

describe("suggestEmailCorrection", () => {
  it.each([
    ["name@gmail.vom", "name@gmail.com"],
    ["name@gamil.com", "name@gmail.com"],
    ["name@web.ed", "name@web.de"],
    ["name@posteo.ed", "name@posteo.de"],
    ["name@proton.em", "name@proton.me"],
  ])("suggests an unambiguous common-provider correction for %s", (email, expected) => {
    expect(suggestEmailCorrection(email)).toBe(expected);
  });

  it("suggests a common top-level-domain correction for an unknown domain", () => {
    expect(suggestEmailCorrection("email@test.con")).toBe("email@test.com");
  });

  it.each([
    "name@gmail.com",
    "name@gmx.de",
    "name@posteo.net",
    "name@proton.me",
    "name@mail.com",
    "name@company.org",
  ])("does not interfere with a valid or unknown domain: %s", (email) => {
    expect(suggestEmailCorrection(email)).toBeNull();
  });

  it("does not guess when multiple provider corrections are equally close", () => {
    expect(suggestEmailCorrection("name@gmx.ne")).toBeNull();
  });

  it("does not invent a domain for a known provider with multiple valid endings", () => {
    expect(suggestEmailCorrection("name@posteo.con")).toBeNull();
  });

  it("keeps the existing webmail destinations available from the shared registry", () => {
    expect(WEBMAIL_PROVIDERS["gmail.com"]).toEqual({
      label: "Gmail öffnen",
      url: "https://mail.google.com/",
    });
  });
});
