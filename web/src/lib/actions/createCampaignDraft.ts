"use server";

import { z } from "zod";
import {
  CampaignRepositoryError,
  createCampaign,
  markPaid,
  setCampaignModeration,
} from "@/lib/campaigns/repository";
import { createCampaignToken } from "@/lib/campaigns/tokens";
import { normalizeCampaignSlug } from "@/lib/campaigns/schema";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const createCampaignDraftSchema = z.object({
  creatorEmail: z.string().trim().toLowerCase().email().max(200),
  title: z.string().trim().min(3).max(120),
  issueText: z.string().trim().min(20).max(4000),
  creatorName: z.string().trim().max(120).optional(),
  description: z.string().trim().max(400).optional(),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().url().max(500).optional()),
  slug: z.string().trim().min(3).max(80).transform(normalizeCampaignSlug),
});

export type CreateCampaignDraftResult =
  | { ok: true; slug: string; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function value(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function validationErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      String(issue.path[0] ?? "form"),
      issue.message === "Invalid email address"
        ? "Bitte gib eine gültige E-Mail-Adresse ein."
        : issue.message,
    ])
  );
}

async function moderatePublicText(issueText: string, description?: string) {
  const checks = [await moderateText(issueText)];
  if (description) checks.push(await moderateText(description));
  const categories = [...new Set(checks.flatMap((check) => check.categories))];
  return { flagged: checks.some((check) => check.flagged), categories };
}

export async function createCampaignDraftAction(
  formData: FormData
): Promise<CreateCampaignDraftResult> {
  const parsed = createCampaignDraftSchema.safeParse({
    creatorEmail: value(formData, "creatorEmail"),
    title: value(formData, "title"),
    issueText: value(formData, "issueText"),
    creatorName: value(formData, "creatorName") || undefined,
    description: value(formData, "description") || undefined,
    externalUrl: value(formData, "externalUrl") || undefined,
    slug: value(formData, "slug"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const moderation = await moderatePublicText(input.issueText, input.description);
  if (moderation.flagged) {
    return {
      ok: false,
      message:
        "Dieser Kampagnentext kann so nicht veröffentlicht werden. Bitte entferne beleidigende, gefährliche oder personenbezogen problematische Inhalte.",
    };
  }

  try {
    const campaign = await createCampaign({
      ...input,
      moderationStatus: "approved",
      moderationCategories: moderation.categories,
    });
    await setCampaignModeration(campaign.id, "approved", moderation.categories);
    const awaitingCampaign = await markPaid(campaign.id);
    const { token } = await createCampaignToken(awaitingCampaign.id, "verify_email");

    const sent = await sendCampaignCreatorEmail({
      kind: "verify_email",
      recipientEmail: awaitingCampaign.creatorEmail,
      campaignTitle: awaitingCampaign.title,
      slug: awaitingCampaign.slug,
      token,
    });

    if (!sent.success) {
      return {
        ok: false,
        message:
          "Die Kampagne wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht verschickt werden. Bitte versuch es später noch einmal.",
      };
    }

    return {
      ok: true,
      slug: awaitingCampaign.slug,
      message:
        "Fast fertig: Bitte bestätige deine E-Mail-Adresse. Erst danach wird die Kampagne öffentlich.",
    };
  } catch (error) {
    if (
      error instanceof CampaignRepositoryError &&
      error.message.toLowerCase().includes("duplicate")
    ) {
      return {
        ok: false,
        message: "Diese Kurzadresse ist schon vergeben. Bitte wähle eine andere.",
        fieldErrors: { slug: "Schon vergeben." },
      };
    }
    console.error("[createCampaignDraftAction] failed:", error);
    return {
      ok: false,
      message:
        "Die Kampagne konnte gerade nicht gespeichert werden. Bitte versuch es noch einmal.",
    };
  }
}
