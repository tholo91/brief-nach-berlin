"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import {
  creatorSurveyAnswersChanged,
  creatorSurveyInputSchema,
  isCreatorSurveyEligible,
  normalizeCreatorSurvey,
  resolveConsentQuoteAt,
} from "@/lib/campaigns/creatorSurvey";
import {
  getCreatorSurvey,
  upsertCreatorSurvey,
} from "@/lib/campaigns/creatorSurveyRepository";
import { sendCreatorSurveyAdminEmail } from "@/lib/email/sendCreatorSurveyAdminEmail";

export type SubmitCreatorSurveyResult =
  | { ok: true }
  | {
      ok: false;
      code: "session_expired" | "invalid" | "forbidden" | "error";
      message: string;
    };

export async function submitCreatorSurveyAction(
  campaignId: string,
  input: unknown,
): Promise<SubmitCreatorSurveyResult> {
  const session = await getCampaignManagementSession();
  if (!session) {
    return {
      ok: false,
      code: "session_expired",
      message:
        "Dein Zugang ist abgelaufen. Öffne den Link aus deiner Mail in einem neuen Tab und tippe dann hier noch einmal auf „Feedback senden“. Deine Antworten bleiben stehen.",
    };
  }

  const parsed = creatorSurveyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Bitte prüf deine Angaben noch einmal." };
  }
  const answers = normalizeCreatorSurvey(parsed.data);

  if (campaignId !== session.campaignId) {
    return {
      ok: false,
      code: "forbidden",
      message: "Dieser Verwaltungslink gehört nicht zu dieser Kampagne.",
    };
  }

  try {
    const campaign = await getCampaignById(campaignId);
    if (
      !campaign ||
      campaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase()
    ) {
      return {
        ok: false,
        code: "forbidden",
        message: "Dieser Verwaltungslink ist nicht mehr gültig.",
      };
    }
    // Deliberately no ended-campaign rejection: feedback is most useful after the end.
    if (!isCreatorSurveyEligible(campaign, new Date())) {
      return {
        ok: false,
        code: "forbidden",
        message: "Das Feedback-Formular ist für diese Kampagne gerade nicht offen.",
      };
    }

    const previous = await getCreatorSurvey(campaignId);
    const consentQuoteAt = resolveConsentQuoteAt(previous, answers, new Date());
    await upsertCreatorSurvey(campaignId, answers, consentQuoteAt);

    if (creatorSurveyAnswersChanged(previous, answers)) {
      const mailParams = {
        campaign: {
          slug: campaign.slug,
          title: campaign.title,
          creatorName: campaign.creatorName,
          creatorEmail: campaign.creatorEmail,
        },
        answers,
        isUpdate: previous !== null,
      };
      after(async () => {
        try {
          const result = await sendCreatorSurveyAdminEmail(mailParams);
          if (!result.success) {
            console.error("[submitCreatorSurveyAction] admin mail not sent");
          }
        } catch (error) {
          console.error(
            "[submitCreatorSurveyAction] admin mail failed:",
            error instanceof Error ? error.message : String(error),
          );
        }
      });
    }

    revalidatePath("/kampagne/verwalten");
    revalidatePath("/kampagne/verwalten/feedback");
    return { ok: true };
  } catch (error) {
    console.error(
      "[submitCreatorSurveyAction] failed:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      ok: false,
      code: "error",
      message: "Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal.",
    };
  }
}
