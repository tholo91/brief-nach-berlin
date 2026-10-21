import { fetchAllRows } from "@/lib/supabase/fetchAllRows";

type FakeError = { message: string };

function fakeBuilder(
  rows: number[],
  failOnCall?: number,
) {
  let calls = 0;
  const range = jest.fn(
    async (
      from: number,
      to: number,
    ): Promise<{ data: number[] | null; error: FakeError | null }> => {
      calls += 1;
      if (failOnCall === calls) {
        return { data: null, error: { message: "boom" } };
      }
      return { data: rows.slice(from, to + 1), error: null };
    },
  );
  return { range };
}

describe("fetchAllRows", () => {
  it("pages 2 full pages and 1 short page in order", async () => {
    const rows = Array.from({ length: 2500 }, (_, i) => i);
    const fake = fakeBuilder(rows);

    const result = await fetchAllRows((from, to) => fake.range(from, to));

    expect(fake.range.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
    expect(result).toEqual({ data: rows, error: null });
  });

  it("terminates on an empty page after an exact multiple of 1000", async () => {
    const rows = Array.from({ length: 2000 }, (_, i) => i);
    const fake = fakeBuilder(rows);

    const result = await fetchAllRows((from, to) => fake.range(from, to));

    expect(fake.range).toHaveBeenCalledTimes(3);
    expect(result.data).toHaveLength(2000);
    expect(result.error).toBeNull();
  });

  it("returns the error of a failing page and stops", async () => {
    const rows = Array.from({ length: 3000 }, (_, i) => i);
    const fake = fakeBuilder(rows, 2);

    const result = await fetchAllRows((from, to) => fake.range(from, to));

    expect(fake.range).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: null, error: { message: "boom" } });
  });
});
