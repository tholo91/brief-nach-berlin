"use server";

import { z } from "zod";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import {
  createCampaignTransferToken,
  revokeCampaignToken,
} from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const transferCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  recipientEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Bitte gib eine gültige E-Mail-Adresse ein.")
    .max(200, "Die E-Mail-Adresse ist zu lang."),
});

export type TransferCampaignResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function value(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

export async function transferCampaignAction(
  formData: FormData
): Promise<TransferCampaignResult> {
  const session = await getCampaignManagementSession();
  if (!session) {
    return {
      ok: false,
      message: "Der Verwaltungszugriff ist abgelaufen. Bitte öffne den Link aus der E-Mail erneut.",
    };
  }

  const parsed = transferCampaignSchema.safeParse({
    campaignId: value(formData, "campaignId"),
    recipientEmail: value(formData, "recipientEmail"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Bitte prüfe die neue E-Mail-Adresse.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])
      ),
    };
  }

  const campaign = await getCampaignById(parsed.data.campaignId);
  if (
    !campaign ||
    campaign.id !== session.campaignId ||
    campaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase()
  ) {
    return {
      ok: false,
      message: "Dieser Verwaltungslink ist nicht mehr gültig.",
    };
  }

  if (!["awaiting_approval", "active", "paused"].includes(campaign.status)) {
    return {
      ok: false,
      message: "Eine beendete oder noch nicht bestätigte Kampagne kann nicht übertragen werden.",
    };
  }

  if (parsed.data.recipientEmail === campaign.creatorEmail) {
    return {
      ok: false,
      message: "Bitte gib eine andere E-Mail-Adresse ein.",
      fieldErrors: { recipientEmail: "Das ist bereits die aktuelle Adresse." },
    };
  }

  let tokenRecordId: string | null = null;
  try {
    const { token, record } = await createCampaignTransferToken(
      campaign.id,
      parsed.data.recipientEmail
    );
    tokenRecordId = record.id;
    const sent = await sendCampaignCreatorEmail({
      kind: "transfer",
      recipientEmail: parsed.data.recipientEmail,
      campaignTitle: campaign.title,
      slug: campaign.slug,
      token,
      creatorName: campaign.creatorName,
      adminCopy: true,
    });

    if (!sent.success) {
      await revokeCampaignToken(record.id);
      return {
        ok: false,
        message: "Die Übernahme-E-Mail konnte gerade nicht verschickt werden. Bitte versuch es später erneut.",
      };
    }

    return {
      ok: true,
      message: "Die Übernahme-E-Mail wurde verschickt. Die neue Inhaberin muss den Link bestätigen.",
    };
  } catch (error) {
    if (tokenRecordId) {
      try {
        await revokeCampaignToken(tokenRecordId);
      } catch (cleanupError) {
        console.error("[transferCampaignAction] token cleanup failed:", cleanupError);
      }
    }
    console.error("[transferCampaignAction] failed:", error);
    return {
      ok: false,
      message: "Die Übergabe konnte gerade nicht gestartet werden. Bitte versuch es später erneut.",
    };
  }
}
