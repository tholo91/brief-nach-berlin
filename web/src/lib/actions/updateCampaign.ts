"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CampaignRepositoryError,
  getCampaignById,
  publishCampaignEdits,
} from "@/lib/campaigns/repository";
import { CAMPAIGN_LOGO_BUCKET } from "@/lib/campaigns/logo";
import { campaignExternalUrlSchema } from "@/lib/campaigns/schema";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import { moderateText } from "@/lib/moderation/moderateText";
import { getServiceRoleClient } from "@/lib/supabase/server";

const MAX_LOGO_BYTES = 524288;
const logoMimeTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

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

async function uploadCampaignLogo(
  formData: FormData,
  slug: string
): Promise<{ logoPath?: string; error?: string }> {
  const logo = formData.get("logo");
  if (!(logo instanceof File) || logo.size === 0) return {};

  const extension = logoMimeTypes.get(logo.type);
  if (!extension) {
    return { error: "Bitte lade ein PNG-, JPG- oder WebP-Bild hoch." };
  }
  if (logo.size > MAX_LOGO_BYTES) {
    return { error: "Das Bild ist zu groß. Bitte nutze maximal 512 KB." };
  }

  const path = `${slug}/${crypto.randomUUID()}.${extension}`;
  const { error } = await getServiceRoleClient()
    .storage
    .from(CAMPAIGN_LOGO_BUCKET)
    .upload(path, Buffer.from(await logo.arrayBuffer()), {
      contentType: logo.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[updateCampaignAction] logo upload failed:", error);
    return {
      error:
        "Das Bild konnte gerade nicht hochgeladen werden. Bitte versuch es später erneut.",
    };
  }

  return { logoPath: path };
}

async function deleteCampaignLogo(path: string | null): Promise<void> {
  if (!path) return;
  const { error } = await getServiceRoleClient()
    .storage
    .from(CAMPAIGN_LOGO_BUCKET)
    .remove([path]);
  if (error) {
    console.error("[updateCampaignAction] logo cleanup failed:", error);
  }
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

  let campaign: Awaited<ReturnType<typeof getCampaignById>>;
  try {
    campaign = await getCampaignById(input.campaignId);
  } catch (error) {
    console.error("[updateCampaignAction] campaign lookup failed:", error);
    return {
      ok: false,
      message:
        "Die Kampagne konnte gerade nicht geladen werden. Bitte versuch es noch einmal.",
    };
  }

  if (!campaign) {
    return {
      ok: false,
      message: "Diese Kampagne wurde nicht gefunden.",
    };
  }

  const uploadedLogo = await uploadCampaignLogo(formData, campaign.slug);
  if (uploadedLogo.error) {
    return {
      ok: false,
      message: uploadedLogo.error,
      fieldErrors: { logo: uploadedLogo.error },
    };
  }

  try {
    const updated = await publishCampaignEdits(input.campaignId, {
      title: input.title,
      issueText: input.issueText,
      description: input.description,
      creatorName: input.creatorName,
      externalUrl: input.externalUrl,
      logoPath: uploadedLogo.logoPath,
    }, moderation.categories);
    if (uploadedLogo.logoPath && campaign.logoPath !== uploadedLogo.logoPath) {
      await deleteCampaignLogo(campaign.logoPath);
    }
    revalidatePath(`/kampagne/${updated.slug}`);
    revalidatePath("/kampagne/verwalten");

    return {
      ok: true,
      message: "Änderungen veröffentlicht. Die öffentliche Kampagnenseite nutzt jetzt deine neuen Angaben.",
    };
  } catch (error) {
    await deleteCampaignLogo(uploadedLogo.logoPath ?? null);
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
