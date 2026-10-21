import type { PublicReview } from "./types";

// Shown in the landing review strip when the Supabase query fails or returns nothing.
// All entries are consented, hero-featured reviews. If one of these people withdraws
// consent or asks for deletion, remove their entry here too.
export const FALLBACK_HERO_REVIEWS: PublicReview[] = [
  {
    id: "8e8a477b-a602-4ddb-bfaa-90c9b1f84833",
    created_at: "2026-09-21T12:31:03.506299+00:00",
    rating: 5,
    body: "Danke dir, das hat mir das Aktivwerden deutlich erleichtert. Ich habe den Brief noch weiter für mich angepasst und etwas verändert, doch er hat mir wunderbar geholfen, mein Anliegen vorzubringen.\nHerzlichen Dank und herzliche Grüße",
    display_name: "Solveig",
  },
  {
    id: "8f661b88-2057-4b51-82df-39f5f5f6ae59",
    created_at: "2026-10-01T15:24:07.560657+00:00",
    rating: 4,
    body: "Ich hatte zwei Versionen und habe daraus meinen eigenen Brief gemacht. Es war super als Fomulierungshilfe und hat mir viel Zeit gespart.",
    display_name: "Martina",
  },
  {
    id: "57a9b63b-7b14-4e8c-8041-2431ecf62411",
    created_at: "2026-09-17T17:29:36.816587+00:00",
    rating: 5,
    body: "Mir hat es sehr gut gefallen, dass mein Anliegen formuliert worden ist, weil ich mir da immer sehr unsicher bin, ob ich den richtigen Ton finde",
    display_name: "Ursula aus dem Ruhrgebiet",
  },
  {
    id: "953e2025-bf62-4690-8b81-e7b6aabceefa",
    created_at: "2026-07-03T18:51:51.922741+00:00",
    rating: 4,
    body: "Das ging schnell, mit simplen Stichpunkten und ganz wenigen Klicks habe ich einen versandfertigenBrief erstellen lassen.",
    display_name: "Janina aus Berlin",
  },
  {
    id: "3df6e456-16e9-4e57-801b-74e1f6aea2d3",
    created_at: "2026-05-22T10:15:01.304609+00:00",
    rating: 5,
    body: "Eine sehr hilfreiche Möglichkeit,  selbst aktiver zu werden. Lässt das Gefühl von Selbstwirksamkeit wachsen. Danke!",
    display_name: "Andy Köln",
  },
  {
    id: "3f794321-5424-4fbc-b400-4d4f927466dd",
    created_at: "2026-05-23T21:16:38.591881+00:00",
    rating: 4,
    body: "Super schnell, gut formuliert",
    display_name: "Anne aus Uelzen",
  },
];
