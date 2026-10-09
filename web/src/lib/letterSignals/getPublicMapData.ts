import "server-only";

import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { getPlzMapPoint } from "./plzMapPoint";
import type { LetterMapData, LetterMapPoint } from "./mapTypes";

const postcodeRowSchema = z.object({
  plz: z.string().regex(/^\d{5}$/),
  contribution_count: z.coerce.number().int().positive(),
});

const PAGE_SIZE = 1000;
const LETTER_MAP_TAG = "letter-map";

async function readPostcodeCounts(): Promise<unknown[]> {
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await getServiceRoleClient()
      .rpc("get_letter_signal_postcode_counts")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

async function buildPublicLetterMapData(): Promise<LetterMapData> {
  const rows = await readPostcodeCounts();

  const postcodePoints: LetterMapPoint[] = rows.flatMap(
    (value: unknown): LetterMapPoint[] => {
      const row = postcodeRowSchema.safeParse(value);
      if (!row.success) return [];
      const mapPoint = getPlzMapPoint(row.data.plz);
      if (!mapPoint) return [];
      return [
        {
          x: mapPoint[0],
          y: mapPoint[1],
          count: row.data.contribution_count,
        },
      ];
    },
  );
  const points = Array.from(
    postcodePoints.reduce<Map<string, LetterMapPoint>>((merged, point) => {
      const key = `${point.x}:${point.y}`;
      const existing = merged.get(key);
      merged.set(
        key,
        existing ? { ...existing, count: existing.count + point.count } : point,
      );
      return merged;
    }, new Map()).values(),
  );

  return {
    points,
    totalContributions: points.reduce((sum, point) => sum + point.count, 0),
    postcodeAreas: postcodePoints.length,
  };
}

export const getPublicLetterMapData = unstable_cache(
  buildPublicLetterMapData,
  [LETTER_MAP_TAG],
  { revalidate: 3600, tags: [LETTER_MAP_TAG] },
);
