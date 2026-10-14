import { CREATOR_SURVEY_MIN_LETTERS_ENDED } from "./creatorSurvey";
import {
  CREATOR_STATS_MIN_RESPONSES,
  type CampaignCreatorStatsView,
} from "./creatorStatsView";
import { isCampaignEnded } from "./endDate";

// Pure helpers for scripts/send-campaign-ended-mail.ts. No server-only import and
// no Supabase access, so tsx and Jest can load them.

export type EndedMailCandidate = {
  status: string;
  letterCount: number;
  endsAt: string | null;
  // undefined = the column could not be read (migration 034 missing).
  endedNotifiedAt?: string | null;
};

export type EndedMailSendStat = { percent: number; responses: number };

export type EndedMailMode = "file" | "preview_to_me" | "send";

export type EndedMailSendDecision =
  | { ok: true; markNotified: boolean }
  | { ok: false; reason: string };

function isEligibleEnded(candidate: EndedMailCandidate, now: Date): boolean {
  return (
    candidate.status !== "blocked" &&
    isCampaignEnded({ endsAt: candidate.endsAt }, now) &&
    candidate.letterCount >= CREATOR_SURVEY_MIN_LETTERS_ENDED
  );
}

// The --list selection: ended, 10+ letters, not blocked, closing mail not sent yet.
export function isAwaitingEndedMail(candidate: EndedMailCandidate, now: Date): boolean {
  return isEligibleEnded(candidate, now) && !candidate.endedNotifiedAt;
}

// Send rate for the mail, only when the stats view shows it (>= 10 answers).
export function endedMailSendStat(view: CampaignCreatorStatsView): EndedMailSendStat | null {
  if (view.feedback.status !== "ready") return null;
  const { sendRate } = view.feedback;
  if (sendRate.status !== "shown") return null;
  if (sendRate.responses < CREATOR_STATS_MIN_RESPONSES) return null;
  return { percent: sendRate.value, responses: sendRate.responses };
}

export function resolveEndedMailSend({
  mode,
  note,
  candidate,
  surveyAvailable,
  recipientOverridden,
  now,
}: {
  mode: EndedMailMode;
  note: string | null | undefined;
  candidate: EndedMailCandidate;
  surveyAvailable: boolean;
  recipientOverridden: boolean;
  now: Date;
}): EndedMailSendDecision {
  if (mode !== "send") return { ok: true, markNotified: false };

  if (!note || note.trim() === "") {
    return { ok: false, reason: "Ohne --note kein Versand. Erst --preview-to-me, dann --note." };
  }
  if (candidate.status === "blocked") {
    return { ok: false, reason: "Die Kampagne ist gesperrt. Kein Versand." };
  }
  if (!isCampaignEnded({ endsAt: candidate.endsAt }, now)) {
    return { ok: false, reason: "Die Kampagne ist noch nicht beendet. Kein Versand." };
  }
  if (candidate.letterCount < CREATOR_SURVEY_MIN_LETTERS_ENDED) {
    return {
      ok: false,
      reason: `Unter ${CREATOR_SURVEY_MIN_LETTERS_ENDED} Briefen ist keine Abschluss-Mail vorgesehen.`,
    };
  }
  if (!surveyAvailable) {
    return {
      ok: false,
      reason:
        "Das Feedback-Formular ist noch nicht verfügbar (Migration 029 und 034 fehlen). Der Button in der Mail würde ins Leere führen.",
    };
  }
  if (candidate.endedNotifiedAt === undefined) {
    return {
      ok: false,
      reason: "Migration 034 fehlt (ended_notified_at nicht lesbar). Kein Versandschutz, kein Versand.",
    };
  }
  if (candidate.endedNotifiedAt && !recipientOverridden) {
    return {
      ok: false,
      reason: `Die Abschluss-Mail wurde schon verschickt (${candidate.endedNotifiedAt}). Für einen Testversand --to nutzen.`,
    };
  }
  return { ok: true, markNotified: !recipientOverridden };
}
