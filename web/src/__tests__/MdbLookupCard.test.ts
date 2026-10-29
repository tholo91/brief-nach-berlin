import { resolveMdbContactQuery } from "@/lib/lookup/mdbContactQuery";

describe("resolveMdbContactQuery", () => {
  it("uses a valid PLZ before the MdB ID", () => {
    expect(resolveMdbContactQuery("?plz=28195&mdb=123")).toEqual({
      type: "plz",
      plz: "28195",
    });
  });

  it("keeps the MdB-ID lookup when the PLZ is invalid", () => {
    expect(resolveMdbContactQuery("?plz=2819&mdb=123")).toEqual({
      type: "mdb",
      mdbId: 123,
    });
  });

  it("keeps the MdB-ID lookup when the PLZ is missing", () => {
    expect(resolveMdbContactQuery("?mdb=123")).toEqual({
      type: "mdb",
      mdbId: 123,
    });
  });

  it.each(["?plz=abcde", "?plz=123456", "?mdb=abc", ""])(
    "returns no lookup for invalid or missing values: %s",
    (search) => {
      expect(resolveMdbContactQuery(search)).toBeNull();
    },
  );
});
