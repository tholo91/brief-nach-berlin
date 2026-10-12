// No Next.js server guard import here: scripts/delete-letter-data-by-email.ts runs this under tsx.
// The Supabase client is injected for the same reason; callers pass getServiceRoleClient().
import type { SupabaseClient } from "@supabase/supabase-js";
import { createLetterSignalEmailHash, normalizeLetterSignalEmail } from "@/lib/letterSignals/emailHash";
import { MIN_PUBLIC_REVIEW_DATE } from "@/lib/reviews/types";

export type StoredReview = { createdAt: string; rating: number; isPublic: boolean };
export type StoredMapEntry = { createdAt: string; plzPrefix: string };
export type StoredWaitlistEntry = { createdAt: string; ebene: string };

export type StoredUserData = {
  reviews: StoredReview[];
  mapEntries: StoredMapEntry[];
  waitlist: StoredWaitlistEntry[];
};

export type DeletedCounts = { reviews: number; mapEntries: number; waitlist: number };

type ReviewRow = {
  id: string;
  created_at: string;
  rating: number;
  letter_id: string | null;
  consent: boolean | null;
  body: string | null;
};
type SignalRow = { id: string; created_at: string; plz_prefix: string };
type WaitlistRow = { id: string; created_at: string; ebene: string };

type Collected = {
  email: string;
  reviews: ReviewRow[];
  signals: SignalRow[];
  waitlist: WaitlistRow[];
};

type DbError = { code?: string | null } | null;

// Same rule as /stimmen: consent, a non-empty body, created after the cutoff, 3+ stars.
export function isReviewPubliclyVisible(row: {
  consent: boolean | null;
  body: string | null;
  created_at: string;
  rating: number;
}): boolean {
  return (
    row.consent === true &&
    typeof row.body === "string" &&
    row.body.trim().length > 0 &&
    new Date(row.created_at).getTime() >= new Date(MIN_PUBLIC_REVIEW_DATE).getTime() &&
    row.rating >= 3
  );
}

// Fixed text only: PostgREST messages can echo the filtered email address.
function assertNoError(error: DbError, table: string, step: string): void {
  if (error) {
    throw new Error(`data deletion: ${step} on ${table} failed (code ${error.code ?? "unknown"})`);
  }
}

async function collect(client: SupabaseClient, rawEmail: string): Promise<Collected> {
  const email = normalizeLetterSignalEmail(rawEmail);
  const hashSecret = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
  if (!hashSecret) throw new Error("LETTER_SIGNAL_EMAIL_HASH_SECRET is not set");
  const lookupHash = createLetterSignalEmailHash(email, hashSecret);

  const [reviewsResult, hashSignalsResult, emailSignalsResult, waitlistResult] = await Promise.all([
    client.from("reviews").select("id, created_at, rating, letter_id, consent, body").eq("email", email),
    client.from("letter_signals").select("id, created_at, plz_prefix").eq("email_lookup_hash", lookupHash),
    client.from("letter_signals").select("id, created_at, plz_prefix").eq("email_normalized", email),
    client.from("roadmap_signups").select("id, created_at, ebene").eq("email", email),
  ]);
  assertNoError(reviewsResult.error, "reviews", "select");
  assertNoError(hashSignalsResult.error, "letter_signals", "select by hash");
  assertNoError(emailSignalsResult.error, "letter_signals", "select by email");
  assertNoError(waitlistResult.error, "roadmap_signups", "select");

  const reviews = (reviewsResult.data ?? []) as ReviewRow[];
  const linkedLetterIds = Array.from(
    new Set(reviews.map((review) => review.letter_id).filter((value): value is string => typeof value === "string")),
  );
  let linkedSignals: SignalRow[] = [];
  if (linkedLetterIds.length > 0) {
    const linkedResult = await client
      .from("letter_signals")
      .select("id, created_at, plz_prefix")
      .in("letter_id", linkedLetterIds);
    assertNoError(linkedResult.error, "letter_signals", "select by letter");
    linkedSignals = (linkedResult.data ?? []) as SignalRow[];
  }

  const signals = Array.from(
    new Map(
      [...((hashSignalsResult.data ?? []) as SignalRow[]), ...((emailSignalsResult.data ?? []) as SignalRow[]), ...linkedSignals]
        .map((signal) => [signal.id, signal] as const),
    ).values(),
  );

  return { email, reviews, signals, waitlist: (waitlistResult.data ?? []) as WaitlistRow[] };
}

export async function lookupUserDataByEmail(client: SupabaseClient, email: string): Promise<StoredUserData> {
  const collected = await collect(client, email);
  return {
    reviews: collected.reviews.map((review) => ({
      createdAt: review.created_at,
      rating: review.rating,
      isPublic: isReviewPubliclyVisible(review),
    })),
    mapEntries: collected.signals.map((signal) => ({
      createdAt: signal.created_at,
      plzPrefix: signal.plz_prefix,
    })),
    waitlist: collected.waitlist.map((entry) => ({ createdAt: entry.created_at, ebene: entry.ebene })),
  };
}

export async function deleteUserDataByEmail(client: SupabaseClient, email: string): Promise<DeletedCounts> {
  // Collect first: the review rows carry the letter ids that link to map entries.
  const collected = await collect(client, email);
  const signalIds = collected.signals.map((signal) => signal.id);

  const [reviewDelete, signalDelete, waitlistDelete] = await Promise.all([
    client.from("reviews").delete({ count: "exact" }).eq("email", collected.email),
    signalIds.length > 0
      ? client.from("letter_signals").delete({ count: "exact" }).in("id", signalIds)
      : Promise.resolve({ count: 0, error: null as DbError }),
    client.from("roadmap_signups").delete({ count: "exact" }).eq("email", collected.email),
  ]);
  assertNoError(reviewDelete.error, "reviews", "delete");
  assertNoError(signalDelete.error, "letter_signals", "delete");
  assertNoError(waitlistDelete.error, "roadmap_signups", "delete");

  return {
    reviews: reviewDelete.count ?? collected.reviews.length,
    mapEntries: signalDelete.count ?? signalIds.length,
    waitlist: waitlistDelete.count ?? collected.waitlist.length,
  };
}
