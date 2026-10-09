import { z } from "zod";
import { APP_URL } from "@/lib/config";
import { isCampaignEnded } from "./endDate";
import { DEFAULT_CAMPAIGN_MILESTONES, normalizeMilestones } from "./milestones";
import type { Campaign } from "./schema";

// Allowlists for the creator feedback form. The server validates against these
// (z.enum), the client renders chips from them, migration 029 mirrors the slugs.
// Labels are drafts that Thomas signs off.

export const CREATOR_SURVEY_REASONS = [
  { slug: "kostenlos_ohne_account", label: "Kostenlos und ohne Account" },
  { slug: "persoenlicher_kontakt", label: "Persönlicher Kontakt zu Thomas" },
  { slug: "handschrift", label: "Handschrift statt Klick-Petition" },
  { slug: "empfehlung", label: "Empfehlung von anderen" },
  { slug: "presse_podcast", label: "Presse oder Podcast" },
  { slug: "einfach_fuer_community", label: "Einfach für unsere Community" },
  { slug: "neues_ausprobieren", label: "Mal was Neues ausprobieren" },
] as const;

export const CREATOR_SURVEY_NO_CONCERN = "keine" as const;

export const CREATOR_SURVEY_CONCERNS = [
  { slug: "ki_spam", label: "Klingt nach KI-Spam" },
  { slug: "aufwand", label: "Zu viel Aufwand für Unterstützer:innen" },
  { slug: "wirkung", label: "Bringt das was?" },
  { slug: "kontrolle", label: "Kontrolle über die Botschaft" },
  { slug: CREATOR_SURVEY_NO_CONCERN, label: "Keine" },
] as const;

export const CREATOR_SURVEY_STATEMENTS = [
  {
    key: "einfacherEinstieg",
    column: "statement_einfacher_einstieg",
    label: "Brief nach Berlin ist eine einfache Möglichkeit, politisch aktiv zu werden.",
  },
  {
    key: "handschriftWirkt",
    column: "statement_handschrift_wirkt",
    label: "Die Handschrift hat bei den Leuten etwas bewegt.",
  },
  {
    key: "schnellEingerichtet",
    column: "statement_schnell_eingerichtet",
    label: "Die Einrichtung ging schnell.",
  },
  {
    key: "wiederKampagne",
    column: "statement_wieder_kampagne",
    label: "Wir würden wieder eine Kampagne starten.",
  },
] as const;

export const CREATOR_SURVEY_STATEMENT_ANSWERS = [
  { slug: "stimmt", label: "Stimmt" },
  { slug: "teils", label: "Teils" },
  { slug: "stimmt_nicht", label: "Stimmt nicht" },
  { slug: "weiss_nicht", label: "Weiß nicht" },
] as const;

export const CREATOR_SURVEY_HELP_OFFERS = [
  { slug: "gemeinsamer_post", label: "Einen gemeinsamen Post oder ein Reel machen" },
  {
    slug: "medien_kontakt",
    label: "Mich einem Podcast, einer Redaktion oder einer Journalistin vorstellen",
  },
  { slug: "initiative_vorstellen", label: "Mich einer Initiative vorstellen, für die das passt" },
  {
    slug: "austausch",
    label: "15 Minuten Austausch: Ich probiere gerade neue Wege aus, wie Menschen ins Handeln kommen",
  },
] as const;

export const CREATOR_SURVEY_QUOTE_MAX = 300;
export const CREATOR_SURVEY_MIN_LETTERS = 500;
export const CREATOR_SURVEY_MIN_LETTERS_ENDED = 50;

// Banner for the feedback block in the mails. Set once Thomas has a PNG/JPG.
export const CREATOR_SURVEY_BANNER_PATH: string | null = null;

export type CreatorSurveyReasonSlug = (typeof CREATOR_SURVEY_REASONS)[number]["slug"];
export type CreatorSurveyConcernSlug = (typeof CREATOR_SURVEY_CONCERNS)[number]["slug"];
export type CreatorSurveyStatementKey = (typeof CREATOR_SURVEY_STATEMENTS)[number]["key"];
export type CreatorSurveyStatementAnswer =
  (typeof CREATOR_SURVEY_STATEMENT_ANSWERS)[number]["slug"];
export type CreatorSurveyHelpOfferSlug = (typeof CREATOR_SURVEY_HELP_OFFERS)[number]["slug"];

export type CreatorSurveyAnswers = {
  reasons: CreatorSurveyReasonSlug[];
  concerns: CreatorSurveyConcernSlug[];
  statements: Record<CreatorSurveyStatementKey, CreatorSurveyStatementAnswer | null>;
  quote: string | null;
  consentQuote: boolean;
  consentAggregate: boolean;
  helpOffers: CreatorSurveyHelpOfferSlug[];
};

export type CreatorSurveyStatus = "open" | "submitted" | "unavailable";

const reasonSchema = z.enum(
  CREATOR_SURVEY_REASONS.map((option) => option.slug) as [
    CreatorSurveyReasonSlug,
    ...CreatorSurveyReasonSlug[],
  ],
);
const concernSchema = z.enum(
  CREATOR_SURVEY_CONCERNS.map((option) => option.slug) as [
    CreatorSurveyConcernSlug,
    ...CreatorSurveyConcernSlug[],
  ],
);
const statementAnswerSchema = z.enum(
  CREATOR_SURVEY_STATEMENT_ANSWERS.map((option) => option.slug) as [
    CreatorSurveyStatementAnswer,
    ...CreatorSurveyStatementAnswer[],
  ],
);
const helpOfferSchema = z.enum(
  CREATOR_SURVEY_HELP_OFFERS.map((option) => option.slug) as [
    CreatorSurveyHelpOfferSlug,
    ...CreatorSurveyHelpOfferSlug[],
  ],
);

// No "at least one answer" rule on purpose: clearing all answers must stay possible.
export const creatorSurveyInputSchema = z
  .object({
    reasons: z.array(reasonSchema).max(CREATOR_SURVEY_REASONS.length),
    concerns: z.array(concernSchema).max(CREATOR_SURVEY_CONCERNS.length),
    statements: z.object({
      einfacherEinstieg: statementAnswerSchema.nullable(),
      handschriftWirkt: statementAnswerSchema.nullable(),
      schnellEingerichtet: statementAnswerSchema.nullable(),
      wiederKampagne: statementAnswerSchema.nullable(),
    }),
    quote: z.string().trim().max(CREATOR_SURVEY_QUOTE_MAX).nullish(),
    consentQuote: z.boolean(),
    consentAggregate: z.boolean(),
    helpOffers: z.array(helpOfferSchema).max(CREATOR_SURVEY_HELP_OFFERS.length),
  })
  .refine(
    (value) =>
      !value.concerns.includes(CREATOR_SURVEY_NO_CONCERN) || value.concerns.length === 1,
    { message: "keine schließt andere Bedenken aus", path: ["concerns"] },
  );

export type CreatorSurveyInput = z.infer<typeof creatorSurveyInputSchema>;

function inListOrder<T extends string>(
  options: readonly { slug: T }[],
  selected: readonly T[],
): T[] {
  const chosen = new Set(selected);
  return options.map((option) => option.slug).filter((slug) => chosen.has(slug));
}

export function normalizeCreatorSurvey(parsed: CreatorSurveyInput): CreatorSurveyAnswers {
  const quote = parsed.quote?.trim() ? parsed.quote.trim() : null;
  return {
    reasons: inListOrder(CREATOR_SURVEY_REASONS, parsed.reasons),
    concerns: inListOrder(CREATOR_SURVEY_CONCERNS, parsed.concerns),
    statements: {
      einfacherEinstieg: parsed.statements.einfacherEinstieg,
      handschriftWirkt: parsed.statements.handschriftWirkt,
      schnellEingerichtet: parsed.statements.schnellEingerichtet,
      wiederKampagne: parsed.statements.wiederKampagne,
    },
    quote,
    consentQuote: parsed.consentQuote && quote !== null,
    consentAggregate: parsed.consentAggregate,
    helpOffers: inListOrder(CREATOR_SURVEY_HELP_OFFERS, parsed.helpOffers),
  };
}

export function toggleConcern(
  current: readonly CreatorSurveyConcernSlug[],
  slug: CreatorSurveyConcernSlug,
): CreatorSurveyConcernSlug[] {
  if (current.includes(slug)) return current.filter((entry) => entry !== slug);
  if (slug === CREATOR_SURVEY_NO_CONCERN) return [CREATOR_SURVEY_NO_CONCERN];
  return [...current.filter((entry) => entry !== CREATOR_SURVEY_NO_CONCERN), slug];
}

export function creatorSurveyAnswersChanged(
  previous: CreatorSurveyAnswers | null,
  next: CreatorSurveyAnswers,
): boolean {
  if (!previous) return true;
  const pick = (value: CreatorSurveyAnswers) =>
    JSON.stringify([
      value.reasons,
      value.concerns,
      CREATOR_SURVEY_STATEMENTS.map((statement) => value.statements[statement.key]),
      value.quote,
      value.consentQuote,
      value.consentAggregate,
      value.helpOffers,
    ]);
  return pick(previous) !== pick(next);
}

export function resolveConsentQuoteAt(
  previous: (CreatorSurveyAnswers & { consentQuoteAt: string | null }) | null,
  next: CreatorSurveyAnswers,
  now: Date,
): string | null {
  if (!next.consentQuote) return null;
  if (
    previous &&
    previous.consentQuote &&
    previous.quote === next.quote &&
    previous.consentQuoteAt
  ) {
    return previous.consentQuoteAt;
  }
  return now.toISOString();
}

export function isCreatorSurveyEligible(
  campaign: Pick<Campaign, "status" | "letterCount" | "endsAt">,
  now: Date,
): boolean {
  if (campaign.status === "blocked") return false;
  if (isCampaignEnded(campaign, now) && campaign.letterCount >= CREATOR_SURVEY_MIN_LETTERS_ENDED) {
    return true;
  }
  return campaign.letterCount >= CREATOR_SURVEY_MIN_LETTERS;
}

// True exactly once: when the survey threshold (smallest step >= 500) lies
// between the last notified step and the step reached now. The third parameter
// lets a jump (e.g. 100 straight to 1000) still trigger.
export function isCreatorSurveyMilestone(
  milestones: readonly unknown[] | null | undefined,
  stufe: number,
  alreadyNotified: number,
): boolean {
  const normalized = normalizeMilestones(milestones);
  const steps = normalized.length > 0 ? normalized : [...DEFAULT_CAMPAIGN_MILESTONES];
  const threshold = steps.find((step) => step >= CREATOR_SURVEY_MIN_LETTERS);
  if (threshold === undefined) return false;
  return alreadyNotified < threshold && threshold <= stufe;
}

// Fresh manage token plus a jump target (no new token kind).
export function creatorSurveyUrl(token: string): string {
  return `${APP_URL}/kampagne/verwalten?token=${encodeURIComponent(token)}&ziel=feedback`;
}

export const MANAGE_JUMP_TARGETS = {
  feedback: "/kampagne/verwalten/feedback",
} as const;

export type ManageJumpTarget = keyof typeof MANAGE_JUMP_TARGETS;

export function isManageJumpTarget(value: string | null | undefined): value is ManageJumpTarget {
  return typeof value === "string" && Object.hasOwn(MANAGE_JUMP_TARGETS, value);
}

export function resolveManageJumpPath(value: string | null | undefined): string {
  return isManageJumpTarget(value) ? MANAGE_JUMP_TARGETS[value] : "/kampagne/verwalten";
}
