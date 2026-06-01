// Allowlist of feedback-tag slugs.
// Server validates submissions against this list (z.enum); client renders chips.
// Adding a slug here is enough to make it available in both places — the
// const-assertion preserves literal types so z.enum picks them up.

export const NEGATIVE_FEEDBACK_TAGS = [
  { slug: "zu_lang", label: "Zu lang" },
  { slug: "zu_kurz", label: "Zu kurz" },
  { slug: "falscher_ton", label: "Falscher Ton" },
  { slug: "zu_generisch", label: "Zu generisch" },
  { slug: "klingt_nicht_nach_mir", label: "Klingt nicht nach mir" },
  { slug: "mdb_passt_nicht", label: "MdB passt nicht" },
  { slug: "wiederholt_sich", label: "Wiederholt sich" },
] as const;

export const POSITIVE_FEEDBACK_TAGS = [
  { slug: "tonfall_passt", label: "Tonfall passt" },
  { slug: "top_formuliert", label: "Top formuliert" },
  { slug: "argumente_stark", label: "Argumente stark" },
  { slug: "sofort_verschickbar", label: "Sofort verschickbar" },
  { slug: "mdb_gut_gewaehlt", label: "MdB gut gewählt" },
] as const;

// Fact-check tags surface on BOTH polarities. A 5★ letter can still have a
// fabricated detail worth flagging; pulling these out of the polarity buckets
// lets us catch that signal without forcing a downgrade.
export const FACT_CHECK_FEEDBACK_TAGS = [
  { slug: "details_erfunden", label: "Details über mich erfunden" },
  { slug: "anliegen_verfehlt", label: "Anliegen falsch verstanden" },
  { slug: "fakten_erfunden", label: "Fakten erfunden" },
] as const;

export type FeedbackTagSlug =
  | (typeof NEGATIVE_FEEDBACK_TAGS)[number]["slug"]
  | (typeof POSITIVE_FEEDBACK_TAGS)[number]["slug"]
  | (typeof FACT_CHECK_FEEDBACK_TAGS)[number]["slug"];

// Flat allowlist used by the Zod schema on the server.
export const FEEDBACK_TAG_SLUGS: readonly FeedbackTagSlug[] = [
  ...NEGATIVE_FEEDBACK_TAGS.map((t) => t.slug),
  ...POSITIVE_FEEDBACK_TAGS.map((t) => t.slug),
  ...FACT_CHECK_FEEDBACK_TAGS.map((t) => t.slug),
];

export const FACT_CHECK_TAG_SLUGS: ReadonlySet<FeedbackTagSlug> = new Set(
  FACT_CHECK_FEEDBACK_TAGS.map((t) => t.slug)
);
