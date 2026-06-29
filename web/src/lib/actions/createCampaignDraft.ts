"use server";

import { z } from "zod";
import {
  CampaignRepositoryError,
  createCampaign,
  deleteCampaign,
  markPaid,
  setCampaignModeration,
} from "@/lib/campaigns/repository";
import { createCampaignToken } from "@/lib/campaigns/tokens";
import {
  campaignExternalUrlSchema,
  isReservedCampaignSlug,
  isValidCampaignSlug,
  normalizeCampaignSlug,
} from "@/lib/campaigns/schema";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { CAMPAIGN_LOGO_BUCKET } from "@/lib/campaigns/logo";

const MAX_LOGO_BYTES = 524288;
const logoMimeTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

const createCampaignDraftSchema = z.object({
  creatorEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Bitte gib eine gültige E-Mail-Adresse ein.")
    .max(200, "Die E-Mail-Adresse ist zu lang."),
  title: z
    .string()
    .trim()
    .min(3, "Bitte gib einen Kampagnentitel ein.")
    .max(120, "Der Titel ist zu lang."),
  issueText: z
    .string()
    .trim()
    .min(20, "Bitte beschreibe das Anliegen etwas konkreter.")
    .max(4000, "Das Anliegen ist zu lang."),
  creatorName: z.string().trim().max(120).optional(),
  description: z
    .string()
    .trim()
    .max(400, "Die Beschreibung ist zu lang.")
    .optional(),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(campaignExternalUrlSchema.optional()),
  slug: z
    .string()
    .trim()
    .min(3, "Bitte wähle eine Kurzadresse.")
    .max(80, "Die Kurzadresse ist zu lang.")
    .transform(normalizeCampaignSlug)
    .refine(
      isValidCampaignSlug,
      "Bitte nutze 3-80 Zeichen: Kleinbuchstaben, Zahlen und Bindestriche."
    )
    .refine(
      (value) => !isReservedCampaignSlug(value),
      "Diese Kurzadresse ist reserviert. Bitte wähle eine andere."
    ),
  responsibilityAccepted: z
    .string()
    .optional()
    .refine((value) => value === "on", "Bitte bestätige die Verantwortung für die Kampagneninhalte."),
  creationConfirmed: z
    .string()
    .optional()
    .refine((value) => value === "yes", "Bitte bestätige die Kampagnendaten vor dem Anlegen."),
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
      issue.message,
    ])
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
): Promise<{ logoPath: string | null; error?: string }> {
  const logo = formData.get("logo");
  if (!(logo instanceof File) || logo.size === 0) return { logoPath: null };

  const extension = logoMimeTypes.get(logo.type);
  if (!extension) {
    return { logoPath: null, error: "Bitte lade ein PNG-, JPG- oder WebP-Bild hoch." };
  }
  if (logo.size > MAX_LOGO_BYTES) {
    return { logoPath: null, error: "Das Logo ist zu groß. Bitte nutze maximal 512 KB." };
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
    console.error("[createCampaignDraftAction] logo upload failed:", error);
    return {
      logoPath: null,
      error: "Das Logo konnte gerade nicht hochgeladen werden. Bitte versuch es ohne Logo oder später erneut.",
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
    console.error("[createCampaignDraftAction] logo cleanup failed:", error);
  }
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
    responsibilityAccepted: value(formData, "responsibilityAccepted"),
    creationConfirmed: value(formData, "creationConfirmed"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const uploadedLogo = await uploadCampaignLogo(formData, input.slug);
  if (uploadedLogo.error) {
    return {
      ok: false,
      message: uploadedLogo.error,
      fieldErrors: { logo: uploadedLogo.error },
    };
  }

  const moderation = await moderatePublicText(input.issueText, input.description);
  if (moderation.flagged) {
    await deleteCampaignLogo(uploadedLogo.logoPath);
    return {
      ok: false,
      message:
        "Dieser Kampagnentext kann so nicht veröffentlicht werden. Bitte entferne beleidigende, gefährliche oder personenbezogen problematische Inhalte.",
    };
  }

  let campaignId: string | null = null;
  try {
    const campaign = await createCampaign({
      ...input,
      logoPath: uploadedLogo.logoPath,
      moderationStatus: "approved",
      moderationCategories: moderation.categories,
    });
    campaignId = campaign.id;
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
      await deleteCampaign(campaign.id);
      await deleteCampaignLogo(uploadedLogo.logoPath);
      return {
        ok: false,
        message:
          "Die Bestätigungs-E-Mail konnte gerade nicht verschickt werden. Bitte versuch es später noch einmal.",
      };
    }

    return {
      ok: true,
      slug: awaitingCampaign.slug,
      message:
        "Fast fertig: Wir haben dir eine E-Mail geschickt. Bitte bestätige den Link darin, dann wird die Kampagne öffentlich.",
    };
  } catch (error) {
    if (campaignId) {
      try {
        await deleteCampaign(campaignId);
      } catch (cleanupError) {
        console.error("[createCampaignDraftAction] campaign cleanup failed:", cleanupError);
      }
    }
    await deleteCampaignLogo(uploadedLogo.logoPath);
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
