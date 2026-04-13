import { z } from "zod";

export const step1Schema = z.object({
  plz: z.string()
    .regex(/^\d{5}$/, { message: "Bitte gib eine gueltige 5-stellige Postleitzahl ein." })
    .refine((v) => parseInt(v, 10) >= 1001, { message: "Ungueltige Postleitzahl" }),
  email: z.string()
    .email({ message: "Bitte gib eine gueltige E-Mail-Adresse ein." }),
  name: z.string().optional(),
  party: z.string().optional(),
  ngo: z.string().optional(),
});

export const step2Schema = z.object({
  issueText: z.string()
    .min(1, { message: "Bitte beschreibe dein Anliegen." })
    .max(5000, { message: "Dein Anliegen ist zu lang. Bitte kuerze es." }),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
