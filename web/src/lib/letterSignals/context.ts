import "server-only";

import type { WizardData } from "@/lib/types/wizard";
import type { Recipient } from "@/lib/lookup/rathausRecipient";
import { lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import { ROUTING_FALLBACK_TOPIC, type TopicSignal } from "@/lib/topics/topicTaxonomy";
import { bindLetterSignalIssue, createLetterSignalContext, hashLetterSignalEmail } from "./token";
import type { LetterSignalContext } from "./types";

export function buildLetterSignalContext(args: {
  data: WizardData;
  recipient: Recipient;
  letterId: string;
  topic: TopicSignal | null | undefined;
  campaignSlug: string | null;
}): { context: LetterSignalContext; token: string } | null {
  const { bundeslandKey } = lookupPLZWithLevel(args.data.plz);
  if (!bundeslandKey) return null;
  try {
    const topic = args.topic ?? ROUTING_FALLBACK_TOPIC;
    const context: LetterSignalContext = {
      letterId: args.letterId,
      plz: args.data.plz,
      bundeslandKey,
      politicalLevel: args.recipient.level,
      recipientKind: args.recipient.kind,
      issueBinding: bindLetterSignalIssue(args.data.issueText),
      ...topic,
      campaignSlug: args.campaignSlug,
      emailLookupHash: hashLetterSignalEmail(args.data.email),
    };
    return { context, token: createLetterSignalContext(context) };
  } catch {
    console.error("[letter-signals] context unavailable");
    return null;
  }
}

export function doesLetterSignalContextMatch(args: {
  context: LetterSignalContext;
  data: WizardData;
  recipient: Recipient;
  campaignSlug: string | null;
}): boolean {
  const { bundeslandKey } = lookupPLZWithLevel(args.data.plz);
  try {
    return (
      args.context.plz === args.data.plz &&
      args.context.bundeslandKey === bundeslandKey &&
      args.context.politicalLevel === args.recipient.level &&
      args.context.recipientKind === args.recipient.kind &&
      args.context.issueBinding === bindLetterSignalIssue(args.data.issueText) &&
      args.context.campaignSlug === args.campaignSlug &&
      args.context.emailLookupHash === hashLetterSignalEmail(args.data.email)
    );
  } catch {
    return false;
  }
}
