import { z } from "zod";
import { POLITICAL_SELF_EFFICACY_VALUES } from "@/lib/feedback/politicalActivation";

export const OUTCOME_ENTRY_CHOICES = ["yes", "no", "not_sent"] as const;
export type OutcomeEntryChoice = (typeof OUTCOME_ENTRY_CHOICES)[number];

export const LETTER_SENT_VALUES = ["handwritten", "typed", "not_sent"] as const;
export const NOT_SENT_REASON_VALUES = ["no_time", "postage_or_address", "doubt", "forgot", "other"] as const;
export const REPLY_CHANNEL_VALUES = ["letter", "email", "phone", "callback", "meeting", "acknowledgement", "none"] as const;
export const REPLY_ADDRESSED_VALUES = ["concrete", "partly", "generic"] as const;
export const REPLY_FEELING_VALUES = ["positive_surprise", "glad_someone_answered", "as_expected", "disappointing"] as const;
export const ISSUE_SCOPE_VALUES = ["local", "big"] as const;
export const EXPECTATION_VALUES = ["answer", "read", "said_it", "nothing_specific"] as const;
export const WRITE_AGAIN_VALUES = ["already_did", "yes", "maybe", "rather_not"] as const;

export const outcomeAnswersSchema = z.object({
  letterSent: z.enum(LETTER_SENT_VALUES).nullable().default(null),
  notSentReason: z.enum(NOT_SENT_REASON_VALUES).nullable().default(null),
  replyChannels: z.array(z.enum(REPLY_CHANNEL_VALUES)).max(7).default([]),
  replyAddressed: z.enum(REPLY_ADDRESSED_VALUES).nullable().default(null),
  replyFeeling: z.enum(REPLY_FEELING_VALUES).nullable().default(null),
  issueScope: z.enum(ISSUE_SCOPE_VALUES).nullable().default(null),
  expectation: z.enum(EXPECTATION_VALUES).nullable().default(null),
  politicalSelfEfficacy: z.enum(POLITICAL_SELF_EFFICACY_VALUES).nullable().default(null),
  writeAgain: z.enum(WRITE_AGAIN_VALUES).nullable().default(null),
});
export type OutcomeAnswers = z.infer<typeof outcomeAnswersSchema>;
