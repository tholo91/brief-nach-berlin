"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CampaignRepositoryError,
  publishCampaignEdits,
} from "@/lib/campaigns/repository";
import { campaignExternalUrlSchema } from "@/lib/campaigns/schema";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import { moderateText } from "@/lib/moderation/moderateText";

const updateCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  issueText: z.string().trim().min(20).max(4000),
  description: z.string().trim().max(400).optional(),
  creatorName: z.string().trim().max(120).optional(),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(campaignExternalUrlSchema.optional()),
});

export type UpdateCampaignResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function value(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function validationErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])
  );
}

async function moderatePublicText(issueText: string, description?: string) {
  const checks = [await moderateText(issueText)];
  if (description) checks.push(await moderateText(description));
  const categories = [...new Set(checks.flatMap((check) => check.categories))];
  return { flagged: checks.some((check) => check.flagged), categories };
}

export async function updateCampaignAction(
  formData: FormData
): Promise<UpdateCampaignResult> {
  const session = await getCampaignManagementSession();
  if (!session) {
    return {
      ok: false,
      message: "Der Verwaltungszugriff ist abgelaufen. Bitte öffne den Link aus der E-Mail erneut.",
    };
  }

  const parsed = updateCampaignSchema.safeParse({
    campaignId: value(formData, "campaignId"),
    title: value(formData, "title"),
    issueText: value(formData, "issueText"),
    description: value(formData, "description") || undefined,
    creatorName: value(formData, "creatorName") || undefined,
    externalUrl: value(formData, "externalUrl") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const input = parsed.data;
  if (input.campaignId !== session.campaignId) {
    return {
      ok: false,
      message: "Dieser Verwaltungslink gehört nicht zu dieser Kampagne.",
    };
  }

  const moderation = await moderatePublicText(input.issueText, input.description);
  if (moderation.flagged) {
    return {
      ok: false,
      message:
        "Diese Änderung wurde nicht veröffentlicht. Der bisherige öffentliche Text bleibt aktiv. Bitte überarbeite den Text und versuch es erneut.",
    };
  }

  try {
    const updated = await publishCampaignEdits(input.campaignId, {
      title: input.title,
      issueText: input.issueText,
      description: input.description,
      creatorName: input.creatorName,
      externalUrl: input.externalUrl,
    }, moderation.categories);
    revalidatePath(`/kampagne/${updated.slug}`);
    revalidatePath("/kampagne/verwalten");

    return {
      ok: true,
      message: "Änderungen veröffentlicht. Die öffentliche Kampagnenseite nutzt jetzt diesen Text.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message:
          "Diese Kampagne kann in ihrem aktuellen Status nicht bearbeitet werden.",
      };
    }
    console.error("[updateCampaignAction] failed:", error);
    return {
      ok: false,
      message:
        "Die Änderungen konnten gerade nicht gespeichert werden. Bitte versuch es noch einmal.",
    };
  }
}
