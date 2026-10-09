import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  CREATOR_SURVEY_STATEMENTS,
  type CreatorSurveyAnswers,
  type CreatorSurveyConcernSlug,
  type CreatorSurveyHelpOfferSlug,
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
    },
    quote: row.quote,
    consentQuote: row.consent_quote,
    consentAggregate: row.consent_aggregate,
    helpOffers: row.help_offers ?? [],
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

// Never throws: a missing table (migration 029 not applied) or any other error
// keeps the whole feature dark.
export async function getCreatorSurveyStatus(
  campaignId: string,
  db?: RepositoryClient,
): Promise<CreatorSurveyStatus> {
  try {
    const { data, error } = await client(db)
      .from(TABLE)
      .select("id")
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
