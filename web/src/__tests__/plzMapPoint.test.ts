import { getPlzMapPoint, PLZ_MAP_POINT_COUNT } from "@/lib/letterSignals/plzMapPoint";

describe("personal PLZ map point", () => {
  it("uses a distinct projected point for each five-digit postcode", () => {
    expect(getPlzMapPoint("28203")).not.toEqual(getPlzMapPoint("28195"));
    expect(getPlzMapPoint("28203")).not.toEqual(getPlzMapPoint("10115"));
  });

  it("covers every postcode accepted by the wizard data", () => {
    expect(PLZ_MAP_POINT_COUNT).toBe(10812);
  });

  it("rejects invalid or unknown PLZ values", () => {
    expect(getPlzMapPoint("abcde")).toBeNull();
    expect(getPlzMapPoint("00000")).toBeNull();
  });
});
