import { z } from "zod";
import { verifyFeedbackToken } from "@/lib/feedback/token";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";

const clickSchema = z.object({
  token: z.string().min(20).max(4000),
  rating: z.number().int().min(1).max(5),
  mailSeq: z.union([z.literal(1), z.literal(2)]).optional(),
});

function empty() {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = JSON.parse(await request.text());
  } catch {
    return empty();
  }

  const parsed = clickSchema.safeParse(input);
  if (!parsed.success) return empty();

  const { token, rating, mailSeq } = parsed.data;
  const payload = verifyFeedbackToken<LetterDebugPayload & { source?: string }>(
    token
  );
  if (!payload) return empty();

  try {
    const supabase = getServiceRoleClient();
    const { data: existing, error: selectError } = await supabase
      .from("reviews")
      .select("id")
      .eq("debug_token", token)
      .maybeSingle();

    if (selectError) {
      console.error("[review-improvement-click] select failed:", selectError);
      return empty();
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("reviews")
        .update({ improvement_prompt_clicked: true })
        .eq("id", existing.id);
      if (error) {
        console.error("[review-improvement-click] update failed:", error);
      }
      return empty();
    }

    const debugPayload =
      mailSeq != null ? { ...payload, mail_seq: mailSeq } : payload;
    const { error } = await supabase.from("reviews").insert({
      rating,
      consent: false,
      improvement_prompt_clicked: true,
      email: payload.userEmail ? payload.userEmail.toLowerCase() : null,
      politician_id:
        payload.politicianId != null ? String(payload.politicianId) : null,
      plz: payload.plz ?? null,
      letter_id: payload.letterId ?? null,
      debug_payload: debugPayload,
      debug_token: token,
    });

    if (error) {
      console.error("[review-improvement-click] insert failed:", error);
      const { error: updateError } = await supabase
        .from("reviews")
        .update({ improvement_prompt_clicked: true })
        .eq("debug_token", token);
      if (updateError) {
        console.error("[review-improvement-click] retry update failed:", updateError);
      }
    }
  } catch (err) {
    console.error("[review-improvement-click] unexpected error:", err);
  }

  return empty();
}
