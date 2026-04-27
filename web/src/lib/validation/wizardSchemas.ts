import { z } from "zod";

export const step1Schema = z.object({
  plz: z.string()
    .regex(/^\d{5}$/, { message: "Bitte gib eine gültige 5-stellige Postleitzahl ein." })
    .refine((v) => parseInt(v, 10) >= 1001, { message: "Ungültige Postleitzahl" }),
  email: z.string()
    .email({ message: "Bitte gib eine gültige E-Mail-Adresse ein." }),
});

export const step1bSchema = z.object({
  name: z.string().trim().max(100, { message: "Name darf maximal 100 Zeichen lang sein." }).optional(),
  party: z.string().trim().max(80, { message: "Partei darf maximal 80 Zeichen lang sein." }).optional(),
  ngo: z.string().trim().max(100, { message: "Organisation darf maximal 100 Zeichen lang sein." }).optional(),
  letterLength: z.enum(["1", "1.5", "2"]),
});

export const step2Schema = z.object({
  issueText: z.string()
    .min(1, { message: "Bitte beschreibe dein Anliegen." })
    .max(5000, { message: "Dein Anliegen ist zu lang. Bitte kürze es." }),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step1bData = z.infer<typeof step1bSchema>;
export type Step2Data = z.infer<typeof step2Schema>;
