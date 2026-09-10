import type { LetterMapData } from "./mapTypes";

const PUBLIC_MAP_CACHE_TTL_MS = 60_000;

let cachedResponse: { data: LetterMapData; expiresAt: number } | null = null;
let requestInFlight: Promise<LetterMapData> | null = null;

export function loadPublicLetterMapData(): Promise<LetterMapData> {
  const now = Date.now();
  if (cachedResponse && cachedResponse.expiresAt > now) {
    return Promise.resolve(cachedResponse.data);
  }
  if (requestInFlight) return requestInFlight;

  requestInFlight = fetch("/api/letter-signals/map")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<LetterMapData>;
    })
    .then((body) => {
      if (!Array.isArray(body.points)) throw new Error("Invalid map response");
      cachedResponse = {
        data: body,
        expiresAt: Date.now() + PUBLIC_MAP_CACHE_TTL_MS,
      };
      return body;
    })
    .finally(() => {
      requestInFlight = null;
    });

  return requestInFlight;
}
