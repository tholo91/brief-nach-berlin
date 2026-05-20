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
] as const;

export const POSITIVE_FEEDBACK_TAGS = [
  { slug: "tonfall_passt", label: "Tonfall passt" },
  { slug: "argumente_stark", label: "Argumente stark" },
  { slug: "sofort_verschickbar", label: "Sofort verschickbar" },
  { slug: "mdb_gut_gewaehlt", label: "MdB gut gewählt" },
] as const;

export type FeedbackTagSlug =
  | (typeof NEGATIVE_FEEDBACK_TAGS)[number]["slug"]
  | (typeof POSITIVE_FEEDBACK_TAGS)[number]["slug"];

// Flat allowlist used by the Zod schema on the server.
export const FEEDBACK_TAG_SLUGS: readonly FeedbackTagSlug[] = [
  ...NEGATIVE_FEEDBACK_TAGS.map((t) => t.slug),
  ...POSITIVE_FEEDBACK_TAGS.map((t) => t.slug),
];
