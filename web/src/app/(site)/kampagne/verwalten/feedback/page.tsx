import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { CreatorSurveyForm } from "@/components/campaigns/CreatorSurveyForm";
import {
  isCreatorSurveyEligible,
  type CreatorSurveyAnswers,
} from "@/lib/campaigns/creatorSurvey";
import {
  getCreatorSurvey,
  getCreatorSurveyStatus,
} from "@/lib/campaigns/creatorSurveyRepository";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export const metadata: Metadata = {
  title: "Dein Feedback | Brief-nach-Berlin",
  robots: { index: false, follow: false },
};

const MANAGE_PATH = "/kampagne/verwalten";

export default async function CreatorSurveyPage() {
  const session = await getCampaignManagementSession();
  if (!session) redirect(MANAGE_PATH);

  const campaign = await getCampaignById(session.campaignId);
  if (
    !campaign ||
    campaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase() ||
    !isCreatorSurveyEligible(campaign, new Date())
  ) {
    redirect(MANAGE_PATH);
  }

  const status = await getCreatorSurveyStatus(campaign.id);
  if (status === "unavailable") redirect(MANAGE_PATH);

  let initial: CreatorSurveyAnswers | null = null;
  if (status === "submitted") {
    try {
      const record = await getCreatorSurvey(campaign.id);
      if (record) {
        initial = {
          reasons: record.reasons,
          concerns: record.concerns,
          statements: record.statements,
          quote: record.quote,
          consentQuote: record.consentQuote,
          consentAggregate: record.consentAggregate,
          helpOffers: record.helpOffers,
        };
      }
    } catch {
      redirect(MANAGE_PATH);
    }
  }

  return (
    <CampaignBackground>
      <section className="relative mx-auto w-full max-w-2xl px-6 py-10 md:py-14">
        <Link
          href={`${MANAGE_PATH}#creator-survey`}
          className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Zurück zur Kampagne
        </Link>
        <CreatorSurveyForm
          campaignId={campaign.id}
          displayName={campaign.creatorName?.trim() || campaign.title}
          logoPath={campaign.logoPath}
          initial={initial}
        />
      </section>
    </CampaignBackground>
  );
}
