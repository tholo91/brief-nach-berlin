import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  CREATOR_SURVEY_STATEMENTS,
  type CreatorSurveyAnswers,
  type CreatorSurveyConcernSlug,
  type CreatorSurveyExpectationSlug,
  type CreatorSurveyHelpOfferSlug,
  type CreatorSurveyOutcomeSlug,
  type CreatorSurveyQuoteMode,
  type CreatorSurveyReasonSlug,
  type CreatorSurveyStatementAnswer,
  type CreatorSurveyStatus,
} from "./creatorSurvey";

type RepositoryClient = SupabaseClient;

const TABLE = "campaign_creator_surveys";

type CreatorSurveyRow = {
  reasons: CreatorSurveyReasonSlug[] | null;
  concerns: CreatorSurveyConcernSlug[] | null;
  help_offers: CreatorSurveyHelpOfferSlug[] | null;
  statement_einfacher_einstieg: CreatorSurveyStatementAnswer | null;
  statement_handschrift_wirkt: CreatorSurveyStatementAnswer | null;
  statement_schnell_eingerichtet: CreatorSurveyStatementAnswer | null;
  statement_wieder_kampagne: CreatorSurveyStatementAnswer | null;
  statement_todo_handeln: CreatorSurveyStatementAnswer | null;
  expectation: CreatorSurveyExpectationSlug | null;
  outcomes: CreatorSurveyOutcomeSlug[] | null;
  outcomes_note: string | null;
  quote_mode: CreatorSurveyQuoteMode | null;
  anonymous_label: string | null;
  quote: string | null;
  consent_quote: boolean;
  consent_quote_at: string | null;
  consent_aggregate: boolean;
  created_at: string;
  updated_at: string;
};

export type CreatorSurveyRecord = CreatorSurveyAnswers & {
  consentQuoteAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export class CreatorSurveyRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreatorSurveyRepositoryError";
  }
}

function client(db?: RepositoryClient): RepositoryClient {
  return db ?? getServiceRoleClient();
}

function mapRow(row: CreatorSurveyRow): CreatorSurveyRecord {
  return {
    reasons: row.reasons ?? [],
    concerns: row.concerns ?? [],
    statements: {
      einfacherEinstieg: row.statement_einfacher_einstieg,
      handschriftWirkt: row.statement_handschrift_wirkt,
      schnellEingerichtet: row.statement_schnell_eingerichtet,
      wiederKampagne: row.statement_wieder_kampagne,
      todoHandeln: row.statement_todo_handeln,
    },
    quote: row.quote,
    consentQuote: row.consent_quote,
    consentAggregate: row.consent_aggregate,
    helpOffers: row.help_offers ?? [],
    expectation: row.expectation,
    outcomes: row.outcomes ?? [],
    outcomesNote: row.outcomes_note,
    quoteMode: row.quote_mode,
    anonymousLabel: row.anonymous_label,
    consentQuoteAt: row.consent_quote_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCreatorSurvey(
  campaignId: string,
  db?: RepositoryClient,
): Promise<CreatorSurveyRecord | null> {
  const { data, error } = await client(db)
    .from(TABLE)
    .select("*")
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (error) {
    throw new CreatorSurveyRepositoryError(`Creator survey lookup failed: ${error.message}`);
  }
  return data ? mapRow(data as CreatorSurveyRow) : null;
}

// Never throws: a missing table (migration 029 not applied), a missing column
// (migration 034 not applied, probed via quote_mode) or any other error keeps
// the whole feature dark.
export async function getCreatorSurveyStatus(
  campaignId: string,
  db?: RepositoryClient,
): Promise<CreatorSurveyStatus> {
  try {
    const { data, error } = await client(db)
      .from(TABLE)
      .select("id, quote_mode")
      .eq("campaign_id", campaignId)
      .maybeSingle();
    if (error) {
      console.error(
        "[creatorSurvey] status lookup failed:",
        error.code ?? "",
        error.message,
      );
      return "unavailable";
    }
    return data ? "submitted" : "open";
  } catch (error) {
    console.error(
      "[creatorSurvey] status lookup failed:",
      error instanceof Error ? error.message : String(error),
    );
    return "unavailable";
  }
}

export async function upsertCreatorSurvey(
  campaignId: string,
  answers: CreatorSurveyAnswers,
  consentQuoteAt: string | null,
  db?: RepositoryClient,
): Promise<void> {
  const statementColumns = Object.fromEntries(
    CREATOR_SURVEY_STATEMENTS.map((statement) => [
      statement.column,
      answers.statements[statement.key],
    ]),
  );

  // created_at is never sent, so the insert default stays and updates keep it.
  const { error } = await client(db)
    .from(TABLE)
    .upsert(
      {
        campaign_id: campaignId,
        reasons: answers.reasons,
        concerns: answers.concerns,
        help_offers: answers.helpOffers,
        expectation: answers.expectation,
        outcomes: answers.outcomes,
        outcomes_note: answers.outcomesNote,
        quote_mode: answers.quoteMode,
        anonymous_label: answers.anonymousLabel,
        ...statementColumns,
        quote: answers.quote,
        consent_quote: answers.consentQuote,
        consent_quote_at: consentQuoteAt,
        consent_aggregate: answers.consentAggregate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campaign_id" },
    );

  if (error) {
    throw new CreatorSurveyRepositoryError(`Creator survey save failed: ${error.message}`);
  }
}

// Reads campaigns.created_by_founder (migration 034). Deliberately separate from
// the main campaign select in repository.ts: that query must keep working before
// 034 is applied. Never throws, any error counts as false.
export async function getCampaignCreatedByFounder(
  campaignId: string,
  db?: RepositoryClient,
): Promise<boolean> {
  try {
    const { data, error } = await client(db)
      .from("campaigns")
      .select("created_by_founder")
      .eq("id", campaignId)
      .maybeSingle();
    if (error) {
      console.error(
        "[creatorSurvey] founder flag lookup failed:",
        error.code ?? "",
        error.message,
      );
      return false;
    }
    return (data as { created_by_founder?: boolean | null } | null)?.created_by_founder === true;
  } catch (error) {
    console.error(
      "[creatorSurvey] founder flag lookup failed:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}
