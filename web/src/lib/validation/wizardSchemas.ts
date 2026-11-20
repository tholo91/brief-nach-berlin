import { z } from "zod";
import { RESSORT_CODES } from "@/lib/lookup/ressorts";

export const localeSchema = z.enum(["de", "en", "tr"]);

export const ISSUE_TEXT_MIN = 10;
export const ISSUE_TEXT_MAX = 5000;

export function firstZodIssueMessage(error: z.ZodError, fallback = "Ungültige Eingabe."): string {
  return error.issues[0]?.message ?? fallback;
}

export const toneLevelSchema = z.number().int().min(1).max(5).optional();

export const recipientSelectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mdb"), selectedPoliticianId: z.number().int() }).strict(),
  z.object({ kind: z.literal("mdl"), selectedPoliticianId: z.number().int() }).strict(),
  z.object({ kind: z.literal("mdb_later") }).strict(),
  z.object({ kind: z.literal("bundeskanzler") }).strict(),
  z.object({ kind: z.literal("campaign_fixed") }).strict(),
  z.object({ kind: z.literal("landesregierung"), addressee: z.enum(["institution", "head"]).optional() }).strict(),
  z.object({ kind: z.literal("landesminister"), ressort: z.enum(RESSORT_CODES) }).strict(),
  z.object({ kind: z.literal("rathaus") }).strict(),
]);

const plzField = z.string()
  .regex(/^\d{5}$/, { message: "Bitte gib eine gültige 5-stellige Postleitzahl ein." })
  .refine((v) => parseInt(v, 10) >= 1001, { message: "Ungültige Postleitzahl" });

export const step1Schema = z.object({
  plz: plzField,
  email: z.string()
    .email({ message: "Bitte gib eine gültige E-Mail-Adresse ein." }),
});

// PDF-Modus (Klassenlink "PDF statt E-Mail"): nur die Postleitzahl.
export const step1PlzSchema = z.object({ plz: plzField });

export const PERSONAL_NOTE_MAX = 400;

/** Optionaler Satz zur eigenen Betroffenheit (Kampagnenmodus). Wird nirgends gespeichert. */
export const personalNoteSchema = z.string().trim().max(PERSONAL_NOTE_MAX).optional();

export const step1bSchema = z.object({
  party: z.string().trim().max(80, { message: "Partei darf maximal 80 Zeichen lang sein." }).optional(),
  ngo: z.string().trim().max(100, { message: "Organisation darf maximal 100 Zeichen lang sein." }).optional(),
  letterLength: z.enum(["1", "1.5", "2"]),
});

export const step2Schema = z.object({
  issueText: z.string()
    .trim()
    .min(ISSUE_TEXT_MIN, { message: "Bitte beschreibe dein Anliegen (mindestens 10 Zeichen)." })
    .max(ISSUE_TEXT_MAX, { message: "Dein Anliegen ist zu lang. Bitte kürze es." }),
  toneLevel: toneLevelSchema,
});

export const letterVariantSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Bitte gib eine gültige E-Mail-Adresse ein." }),
  originalLetter: z.string()
    .trim()
    .min(500, { message: "Bitte füge den ganzen Briefentwurf aus der E-Mail ein." })
    .max(10000, { message: "Der Brieftext ist zu lang. Bitte kürze ihn auf den eigentlichen Brief." }),
  toneLevel: toneLevelSchema,
  originalToneLevel: toneLevelSchema,
  letterLength: z.enum(["1", "1.5", "2"]).optional(),
  changeRequest: z.string()
    .trim()
    .max(1000, { message: "Bitte fasse deinen Änderungswunsch etwas kürzer." })
    .optional(),
});

export const youthLetterVariantSchema = z.object({
  mode: z.literal("youth"),
  originalLetter: z.string()
    .trim()
    .min(200, { message: "Der Brief ist zu kurz zum Verbessern." })
    .max(6000),
  changeRequest: z.string()
    .trim()
    .min(5, { message: "Schreib kurz, was anders werden soll." })
    .max(1000),
  classToken: z.string().max(2000).optional(),
});

export type YouthLetterVariantData = z.infer<typeof youthLetterVariantSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step1bData = z.infer<typeof step1bSchema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type LetterVariantData = z.infer<typeof letterVariantSchema>;
