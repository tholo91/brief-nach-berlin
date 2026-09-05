import { z } from "zod";
import { TopicSignalWithMetadataSchema } from "@/lib/topics/topicTaxonomy";

export const letterSignalContextSchema = TopicSignalWithMetadataSchema.extend({
  letterId: z.string().uuid(),
  plz: z.string().regex(/^\d{5}$/),
  bundeslandKey: z.string().regex(/^[A-Z]{2}$/),
  politicalLevel: z.enum(["Bund", "Land", "Kommune"]),
  recipientKind: z.enum(["mdb", "mdl", "landesregierung", "rathaus"]),
  issueBinding: z.string().regex(/^[a-f0-9]{64}$/),
  campaignSlug: z.string().trim().min(1).max(120).nullable(),
  emailLookupHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export type LetterSignalContext = z.infer<typeof letterSignalContextSchema>;

export const letterSignalInputSchema = z.object({
  contextToken: z.string().min(20).max(4096),
  email: z.string().trim().email().max(254),
  generationProof: z.string().min(20).max(4096).optional(),
});

export const generationProofInputSchema = z.object({
  generationProof: z.string().min(20).max(4096),
});
