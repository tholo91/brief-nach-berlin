import { z } from "zod";

export const localeSchema = z.enum(["de", "en", "tr"]);

export const ISSUE_TEXT_MIN = 10;
export const ISSUE_TEXT_MAX = 5000;

export function firstZodIssueMessage(error: z.ZodError, fallback = "Ungültige Eingabe."): string {
  return error.issues[0]?.message ?? fallback;
}

export const toneLevelSchema = z.number().int().min(1).max(5).optional();

export const step1Schema = z.object({
  plz: z.string()
    .regex(/^\d{5}$/, { message: "Bitte gib eine gültige 5-stellige Postleitzahl ein." })
    .refine((v) => parseInt(v, 10) >= 1001, { message: "Ungültige Postleitzahl" }),
  email: z.string()
    .email({ message: "Bitte gib eine gültige E-Mail-Adresse ein." }),
});

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

export type Step1Data = z.infer<typeof step1Schema>;
export type Step1bData = z.infer<typeof step1bSchema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type LetterVariantData = z.infer<typeof letterVariantSchema>;
